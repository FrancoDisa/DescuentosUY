# PostGIS Query Optimization for DescuentosUY

Patterns and best practices for optimizing geospatial queries using PostGIS in the DescuentosUY application.

## Core Concepts

### Geography vs Geometry

**Geography (recommended for DescuentosUY):**
- Works on a sphere (Earth)
- Accurate for global calculations
- Units in meters
- Slower than geometry but more accurate

**Geometry:**
- Works on a flat plane
- Faster but less accurate for large areas
- Requires projection (SRID)

```sql
-- ✅ Use geography for accurate distance
ST_Distance(
  ST_MakePoint(lon1, lat1)::geography,
  ST_MakePoint(lon2, lat2)::geography
) -- Returns meters

-- ⚠️ Geometry is faster but less accurate
ST_Distance(
  ST_MakePoint(lon1, lat1)::geometry,
  ST_MakePoint(lon2, lat2)::geometry
) -- Returns degrees (not useful)
```

## Distance Queries

### ST_Distance vs ST_DWithin

```sql
-- ❌ SLOW: Calculates exact distance for all rows
SELECT * FROM branches
WHERE ST_Distance(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint($1, $2)::geography
) < 5000;

-- ✅ FAST: Uses spatial index, stops early
SELECT * FROM branches
WHERE ST_DWithin(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint($1, $2)::geography,
  5000
);
```

**Performance Difference:** ST_DWithin can be 10-100x faster for large datasets.

### Getting Distance After Filtering

```sql
-- ✅ OPTIMAL: Filter first with ST_DWithin, then calculate exact distance
SELECT
  *,
  ST_Distance(
    ST_MakePoint(longitude, latitude)::geography,
    ST_MakePoint($1, $2)::geography
  ) as distance_meters
FROM branches
WHERE ST_DWithin(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint($1, $2)::geography,
  10000  -- 10km radius
)
ORDER BY distance_meters
LIMIT 20;
```

## Spatial Indexes

### Creating Spatial Indexes

```sql
-- ✅ GIST index for geography queries
CREATE INDEX idx_branches_location ON branches USING gist(
  ST_MakePoint(longitude, latitude)::geography
);

-- For geometry (if using projected coordinates)
CREATE INDEX idx_branches_geom ON branches USING gist(geometry_column);
```

### Verifying Index Usage

```sql
-- Check if index is being used
EXPLAIN ANALYZE
SELECT * FROM branches
WHERE ST_DWithin(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint(-56.164531, -34.905504)::geography,
  5000
);

-- Look for "Index Scan" in the output
-- ✅ "Index Scan using idx_branches_location"
-- ❌ "Seq Scan on branches" (not using index!)
```

## DescuentosUY-Specific Patterns

### Current Implementation: get_nearest_branch_distance

```sql
CREATE OR REPLACE FUNCTION get_nearest_branch_distance(
  user_lat REAL,
  user_lon REAL,
  store_id_param UUID
) RETURNS REAL AS $$
DECLARE
  min_distance REAL;
BEGIN
  SELECT MIN(
    ST_Distance(
      ST_MakePoint(user_lon, user_lat)::geography,
      ST_MakePoint(longitude, latitude)::geography
    )
  ) / 1000.0 -- Convert to km
  INTO min_distance
  FROM branches
  WHERE store_id = store_id_param
    AND latitude IS NOT NULL
    AND longitude IS NOT NULL;

  RETURN COALESCE(min_distance, NULL);
END;
$$ LANGUAGE plpgsql STABLE;
```

**Optimization Opportunities:**
1. Add spatial index on branches
2. Consider materializing store-to-nearest-branch mapping
3. Cache results for common user locations

### search_stores Function Pattern

```sql
-- Simplified version showing PostGIS usage
CREATE OR REPLACE FUNCTION search_stores(
  search_query TEXT DEFAULT NULL,
  user_lat REAL DEFAULT NULL,
  user_lon REAL DEFAULT NULL,
  max_distance_km REAL DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  nearest_distance_km REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    CASE
      WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL THEN
        get_nearest_branch_distance(user_lat, user_lon, s.id)
      ELSE NULL
    END as nearest_distance_km
  FROM stores s
  WHERE
    -- Optional distance filter
    (max_distance_km IS NULL OR
     get_nearest_branch_distance(user_lat, user_lon, s.id) <= max_distance_km)
    AND
    -- Text search filter
    (search_query IS NULL OR
     s.name ILIKE '%' || search_query || '%')
  ORDER BY
    CASE sort_by
      WHEN 'distance' THEN get_nearest_branch_distance(user_lat, user_lon, s.id)
      ELSE NULL
    END ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Issues to Watch:**
- `get_nearest_branch_distance` called multiple times per store (WHERE, SELECT, ORDER BY)
- Can be optimized with CTEs or subqueries

### Optimized Version with CTE

```sql
CREATE OR REPLACE FUNCTION search_stores_optimized(
  search_query TEXT DEFAULT NULL,
  user_lat REAL DEFAULT NULL,
  user_lon REAL DEFAULT NULL,
  max_distance_km REAL DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  nearest_distance_km REAL
) AS $$
BEGIN
  RETURN QUERY
  WITH store_distances AS (
    SELECT
      s.id,
      s.name,
      CASE
        WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL THEN
          get_nearest_branch_distance(user_lat, user_lon, s.id)
        ELSE NULL
      END as distance_km
    FROM stores s
    WHERE
      search_query IS NULL OR
      s.name ILIKE '%' || search_query || '%'
  )
  SELECT
    id,
    name,
    distance_km as nearest_distance_km
  FROM store_distances
  WHERE
    max_distance_km IS NULL OR
    distance_km <= max_distance_km
  ORDER BY
    CASE sort_by
      WHEN 'distance' THEN distance_km
      ELSE NULL
    END ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Benefit:** Distance calculated once per store instead of multiple times.

## Advanced Optimization Techniques

### Bounding Box Pre-Filter

For very large datasets, use bounding box to reduce candidates:

```sql
-- ✅ Fast bounding box filter before exact distance
WITH bbox AS (
  SELECT ST_MakeEnvelope(
    $1 - 0.1, $2 - 0.1,  -- Southwest corner
    $1 + 0.1, $2 + 0.1,  -- Northeast corner
    4326
  )::geography as box
)
SELECT * FROM branches, bbox
WHERE ST_MakePoint(longitude, latitude)::geography && bbox.box
  AND ST_DWithin(
    ST_MakePoint(longitude, latitude)::geography,
    ST_MakePoint($1, $2)::geography,
    10000
  );
```

### Clustering for Map Display

When showing many points on a map, cluster them:

```sql
-- Group nearby branches into clusters
SELECT
  ST_Centroid(ST_Collect(
    ST_MakePoint(longitude, latitude)::geometry
  )) as cluster_center,
  COUNT(*) as branch_count,
  array_agg(id) as branch_ids
FROM branches
WHERE ST_DWithin(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint($1, $2)::geography,
  50000  -- 50km radius
)
GROUP BY ST_SnapToGrid(
  ST_MakePoint(longitude, latitude)::geometry,
  0.01  -- ~1km grid
);
```

### Materialized Views for Performance

For frequently queried spatial data:

```sql
-- Cache pre-calculated distances from city center
CREATE MATERIALIZED VIEW branch_distances_from_center AS
SELECT
  id,
  store_id,
  ST_Distance(
    ST_MakePoint(longitude, latitude)::geography,
    ST_MakePoint(-56.164531, -34.905504)::geography  -- Montevideo center
  ) / 1000.0 as distance_from_center_km
FROM branches
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX idx_branch_distances ON branch_distances_from_center(distance_from_center_km);

-- Refresh periodically
REFRESH MATERIALIZED VIEW branch_distances_from_center;
```

## Common Pitfalls

### ❌ Pitfall 1: Wrong Coordinate Order

```sql
-- ❌ WRONG: lat, lon (common mistake)
ST_MakePoint(latitude, longitude)

-- ✅ CORRECT: lon, lat (PostGIS standard)
ST_MakePoint(longitude, latitude)
```

### ❌ Pitfall 2: Missing NULL Checks

```sql
-- ❌ Can cause errors if coordinates are NULL
ST_Distance(
  ST_MakePoint(longitude, latitude)::geography,
  ...
)

-- ✅ Filter out NULL coordinates first
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
```

### ❌ Pitfall 3: Not Using Index

```sql
-- ❌ Index not used (transformation in WHERE)
WHERE ST_Distance(...) < 5000

-- ✅ Index used (ST_DWithin uses index)
WHERE ST_DWithin(..., 5000)
```

## Performance Benchmarks

Typical performance for 10,000 branches:

| Query Type | Without Index | With GIST Index |
|------------|---------------|-----------------|
| ST_Distance scan | ~500ms | ~500ms |
| ST_DWithin | ~500ms | ~5ms |
| Nearest N | ~600ms | ~10ms |

**Key Takeaway:** Spatial indexes provide 50-100x speedup for proximity queries.

## Monitoring Query Performance

```sql
-- Enable timing
\timing

-- Analyze query plan
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM branches
WHERE ST_DWithin(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint(-56.164531, -34.905504)::geography,
  5000
);

-- Look for:
-- ✅ "Index Scan using idx_branches_location"
-- ✅ Low "actual time"
-- ❌ "Seq Scan" (sequential scan = slow)
-- ❌ High "Buffers: shared read" (disk access)
```

## Resources

- [PostGIS Documentation](https://postgis.net/docs/)
- [PostGIS Performance Tips](https://postgis.net/docs/performance_tips.html)
- [ST_DWithin vs ST_Distance](https://postgis.net/docs/ST_DWithin.html)
- [Spatial Indexing](https://postgis.net/docs/using_postgis_dbmanagement.html#gist_indexes)
