# Database Schema Design for DescuentosUY

Best practices and patterns for PostgreSQL database design in the DescuentosUY project.

## Current Schema Overview

```
stores (1) ──< (N) branches
  │
  └──< (N) store_promotions >──┐
                                 │
promotions (1) ──────────────────┘

branches (1) ──< (1) branch_details (cache)
```

## Normalization Principles

### First Normal Form (1NF)
- ✅ All columns contain atomic values
- ✅ Each column contains values of a single type
- ✅ Each column has a unique name
- ✅ Order doesn't matter

### Second Normal Form (2NF)
- ✅ Meets 1NF requirements
- ✅ All non-key columns depend on the entire primary key

### Third Normal Form (3NF)
- ✅ Meets 2NF requirements
- ✅ No transitive dependencies

## Table Design Patterns

### Core Entity: stores

```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stores_category ON stores(category);
CREATE INDEX idx_stores_name ON stores USING gin(to_tsvector('spanish', name));
```

**Design Decisions:**
- UUID for globally unique IDs (better for distributed systems)
- TEXT for flexible string storage (PostgreSQL optimizes automatically)
- Timestamps for audit trail
- GIN index for full-text search on name

### Related Entity: branches

```sql
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  google_place_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_branches_store_id ON branches(store_id);
CREATE INDEX idx_branches_google_place_id ON branches(google_place_id);
CREATE INDEX idx_branches_location ON branches USING GIST (
  ST_MakePoint(longitude, latitude)::geography
);
```

**Design Decisions:**
- Foreign key with CASCADE delete (if store deleted, delete branches)
- REAL for coordinates (sufficient precision, smaller storage than DOUBLE)
- GIST index for spatial queries (PostGIS)
- UNIQUE constraint on google_place_id (no duplicates)

### Many-to-Many: store_promotions

```sql
CREATE TABLE store_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure no duplicate promotion assignments
  UNIQUE(store_id, promotion_id)
);

-- Indexes
CREATE INDEX idx_store_promotions_store_id ON store_promotions(store_id);
CREATE INDEX idx_store_promotions_promotion_id ON store_promotions(promotion_id);
CREATE INDEX idx_store_promotions_active ON store_promotions(active) WHERE active = TRUE;
```

**Design Decisions:**
- Junction table for many-to-many relationship
- UNIQUE constraint prevents duplicate assignments
- Partial index on active=TRUE (most queries filter by this)
- Date range for time-limited promotions

### Cache Table: branch_details

```sql
CREATE TABLE branch_details (
  branch_id UUID PRIMARY KEY REFERENCES branches(id) ON DELETE CASCADE,
  phone TEXT,
  website TEXT,
  rating REAL,
  rating_count INTEGER,
  opening_hours JSONB,
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for stale data queries
CREATE INDEX idx_branch_details_stale ON branch_details(last_synced_at)
WHERE last_synced_at < NOW() - INTERVAL '3 months';
```

**Design Decisions:**
- Primary key is also foreign key (1:1 relationship)
- JSONB for flexible opening hours structure
- Partial index for finding stale cached data
- last_synced_at tracks freshness

## Index Strategy

### When to Create Indexes

**Always Index:**
- Primary keys (automatic)
- Foreign keys (manual, critical for JOINs)
- Columns used in WHERE clauses frequently
- Columns used in ORDER BY

**Consider Indexing:**
- Columns used in GROUP BY
- Columns with high cardinality (many unique values)
- Columns in JOIN conditions

**Avoid Indexing:**
- Small tables (< 1000 rows)
- Columns with low cardinality (e.g., boolean with even distribution)
- Columns that change frequently
- Wide columns (long text)

### Index Types

**B-Tree (default):**
```sql
CREATE INDEX idx_stores_name ON stores(name);
```
Use for: equality, range queries, sorting

**GIN (Generalized Inverted Index):**
```sql
CREATE INDEX idx_stores_search ON stores USING gin(to_tsvector('spanish', name || ' ' || description));
```
Use for: full-text search, JSONB, arrays

**GIST (Generalized Search Tree):**
```sql
CREATE INDEX idx_branches_location ON branches USING gist(
  ST_MakePoint(longitude, latitude)::geography
);
```
Use for: PostGIS spatial queries, range types

**Partial Index:**
```sql
CREATE INDEX idx_active_promotions ON store_promotions(store_id, promotion_id)
WHERE active = TRUE AND end_date > CURRENT_DATE;
```
Use for: indexing subset of rows

### Composite Indexes

```sql
-- ✅ GOOD: Order matters (most selective first)
CREATE INDEX idx_stores_category_name ON stores(category, name);

-- Supports these queries efficiently:
-- WHERE category = 'restaurants'
-- WHERE category = 'restaurants' AND name = 'Pizza Hut'
-- WHERE category = 'restaurants' ORDER BY name

-- But NOT this one:
-- WHERE name = 'Pizza Hut' (doesn't use category)
```

## Constraints

### Primary Keys

```sql
-- ✅ CORRECT: UUID with default
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- ✅ CORRECT: Auto-increment integer (simpler for small apps)
id SERIAL PRIMARY KEY

-- ❌ AVOID: Natural keys (can change)
email TEXT PRIMARY KEY
```

### Foreign Keys

```sql
-- ✅ CORRECT: With cascade for dependent data
store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE

-- ✅ CORRECT: With restrict for important relationships
user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT

-- ✅ CORRECT: With set null for optional relationships
manager_id UUID REFERENCES users(id) ON DELETE SET NULL
```

### Check Constraints

```sql
-- ✅ Validate coordinate ranges
ALTER TABLE branches ADD CONSTRAINT valid_latitude
  CHECK (latitude >= -90 AND latitude <= 90);

ALTER TABLE branches ADD CONSTRAINT valid_longitude
  CHECK (longitude >= -180 AND longitude <= 180);

-- ✅ Validate percentage ranges
ALTER TABLE promotions ADD CONSTRAINT valid_percentage
  CHECK (percentage > 0 AND percentage <= 100);

-- ✅ Validate date logic
ALTER TABLE store_promotions ADD CONSTRAINT valid_date_range
  CHECK (end_date IS NULL OR end_date >= start_date);
```

### Unique Constraints

```sql
-- ✅ Single column
google_place_id TEXT UNIQUE

-- ✅ Composite (multiple columns)
UNIQUE(store_id, promotion_id)

-- ✅ Partial unique (conditional)
CREATE UNIQUE INDEX unique_active_email ON users(email)
WHERE deleted_at IS NULL;
```

## Data Types

### Choosing the Right Type

**Text:**
```sql
-- ✅ Use TEXT for most strings (PostgreSQL optimizes automatically)
name TEXT NOT NULL
description TEXT

-- ❌ Avoid arbitrary VARCHAR limits
name VARCHAR(255)  -- Why 255? Arbitrary and limiting
```

**Numbers:**
```sql
-- For coordinates
latitude REAL       -- 4 bytes, ~6 decimal places precision
longitude REAL

-- For money (avoid FLOAT due to rounding)
price NUMERIC(10,2) -- Exact precision

-- For counts
rating_count INTEGER
```

**Dates and Times:**
```sql
-- Always use TIMESTAMPTZ (timezone aware)
created_at TIMESTAMPTZ DEFAULT NOW()

-- Use DATE for date-only data
start_date DATE
end_date DATE
```

**JSONB:**
```sql
-- For flexible/dynamic data
opening_hours JSONB
metadata JSONB

-- ✅ Can query inside JSONB
SELECT * FROM branch_details
WHERE opening_hours->>'monday' IS NOT NULL;

-- ✅ Can index JSONB fields
CREATE INDEX idx_metadata_type ON stores((metadata->>'type'));
```

## PostGIS Specific

### Geometry vs Geography

```sql
-- Geography: lat/lon on sphere (accurate distances)
-- Use for global data and distance calculations
location GEOGRAPHY(Point, 4326)

-- Geometry: flat plane (faster, less accurate)
-- Use for local/small area data
location GEOMETRY(Point, 3857)
```

**For DescuentosUY (Montevideo only):**
- Use `geography` for accurate distance calculations
- Create points on-the-fly: `ST_MakePoint(longitude, latitude)::geography`

### Spatial Indexes

```sql
-- Required for efficient spatial queries
CREATE INDEX idx_branches_location ON branches USING gist(
  ST_MakePoint(longitude, latitude)::geography
);

-- Check if index is being used
EXPLAIN ANALYZE
SELECT * FROM branches
WHERE ST_DWithin(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint(-56.164531, -34.905504)::geography,
  5000
);
```

## Migration Best Practices

### Safe Schema Changes

```sql
-- ✅ SAFE: Add nullable column
ALTER TABLE stores ADD COLUMN new_field TEXT;

-- ✅ SAFE: Add column with default (PostgreSQL 11+)
ALTER TABLE stores ADD COLUMN new_field TEXT DEFAULT 'default_value';

-- ❌ BLOCKING: Add NOT NULL column without default
ALTER TABLE stores ADD COLUMN new_field TEXT NOT NULL;

-- ✅ SAFE: Multi-step approach
-- Step 1: Add nullable column
ALTER TABLE stores ADD COLUMN new_field TEXT;

-- Step 2: Backfill data
UPDATE stores SET new_field = 'default' WHERE new_field IS NULL;

-- Step 3: Add NOT NULL constraint
ALTER TABLE stores ALTER COLUMN new_field SET NOT NULL;
```

### Creating Indexes

```sql
-- ❌ BLOCKING: Regular index creation locks table
CREATE INDEX idx_stores_name ON stores(name);

-- ✅ NON-BLOCKING: Create concurrently (PostgreSQL doesn't lock)
CREATE INDEX CONCURRENTLY idx_stores_name ON stores(name);
```

### Renaming vs Dropping

```sql
-- ✅ SAFER: Rename first, monitor, then drop
ALTER TABLE stores RENAME COLUMN old_field TO old_field_deprecated;
-- Wait and monitor...
ALTER TABLE stores DROP COLUMN old_field_deprecated;

-- ❌ RISKY: Immediate drop
ALTER TABLE stores DROP COLUMN old_field;
```

## Performance Considerations

### Query Optimization

```sql
-- ❌ SLOW: SELECT *
SELECT * FROM stores;

-- ✅ FAST: Select only needed columns
SELECT id, name, logo_url FROM stores;

-- ❌ SLOW: Counting all rows
SELECT COUNT(*) FROM large_table;

-- ✅ FAST: Approximate count for large tables
SELECT reltuples::bigint AS estimate
FROM pg_class
WHERE relname = 'large_table';
```

### Pagination

```sql
-- ✅ CORRECT: Use LIMIT and OFFSET with ORDER BY
SELECT * FROM stores
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;

-- ✅ BETTER: Cursor-based pagination (more efficient)
SELECT * FROM stores
WHERE created_at < '2024-01-01'
ORDER BY created_at DESC
LIMIT 20;
```

### Avoid N+1 Queries

```sql
-- ❌ BAD: N+1 problem (fetch stores, then query branches for each)
SELECT * FROM stores;
-- Then for each store:
SELECT * FROM branches WHERE store_id = ?;

-- ✅ GOOD: Use JOIN or subquery
SELECT
  s.*,
  json_agg(b.*) as branches
FROM stores s
LEFT JOIN branches b ON b.store_id = s.id
GROUP BY s.id;
```

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Supabase Schema Design](https://supabase.com/docs/guides/database/tables)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
