# RPC Function Patterns for DescuentosUY

Best practices for writing Supabase RPC (Remote Procedure Call) functions in PostgreSQL.

## Why Use RPC Functions?

**Benefits:**
- Complex queries that can't be expressed in Supabase query builder
- Encapsulate business logic in the database
- Better performance (single round-trip)
- Type-safe with generated TypeScript types
- Reusable across different clients

**When to Use:**
- Complex JOINs with multiple tables
- Aggregations and calculations
- Geospatial queries (PostGIS)
- Custom sorting/filtering logic

## Function Declaration

### Basic Structure

```sql
CREATE OR REPLACE FUNCTION function_name(
  param1 type1,
  param2 type2 DEFAULT default_value
)
RETURNS return_type
LANGUAGE plpgsql
STABLE  -- or VOLATILE, IMMUTABLE
SECURITY DEFINER  -- or SECURITY INVOKER
AS $$
DECLARE
  variable_name type;
BEGIN
  -- Function body
  RETURN result;
END;
$$;
```

### Volatility Categories

**IMMUTABLE:**
- Result never changes for same inputs
- Can be cached aggressively
- Example: `calculate_distance(lat1, lon1, lat2, lon2)`

```sql
CREATE FUNCTION calculate_distance(...)
RETURNS REAL
LANGUAGE plpgsql
IMMUTABLE  -- Safe to cache
AS $$...$$;
```

**STABLE:**
- Result doesn't change within a single query
- Can read from database but doesn't modify
- Example: `search_stores(query TEXT)`

```sql
CREATE FUNCTION search_stores(...)
RETURNS TABLE(...)
LANGUAGE plpgsql
STABLE  -- Most common for read-only functions
AS $$...$$;
```

**VOLATILE (default):**
- Result can change between calls
- Modifies database or uses non-deterministic values
- Example: `create_store(name TEXT)`

```sql
CREATE FUNCTION create_store(...)
RETURNS UUID
LANGUAGE plpgsql
VOLATILE  -- Modifies data
AS $$...$$;
```

### Security Context

**SECURITY DEFINER:**
- Runs with permissions of function creator
- Use for functions that need elevated permissions
- ⚠️ Be careful with SQL injection!

**SECURITY INVOKER (default):**
- Runs with permissions of function caller
- Safer, respects RLS policies
- Use for most functions

```sql
-- ✅ SECURITY INVOKER: respects RLS
CREATE FUNCTION get_my_stores()
RETURNS TABLE(...)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER  -- Uses caller's permissions
AS $$...$$;
```

## Return Types

### Returning a Single Value

```sql
CREATE FUNCTION get_store_count()
RETURNS BIGINT
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*) FROM stores;
$$;
```

### Returning a Row

```sql
CREATE FUNCTION get_store(store_id_param UUID)
RETURNS stores  -- Returns a row matching stores table
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  store_record stores%ROWTYPE;
BEGIN
  SELECT * INTO store_record
  FROM stores
  WHERE id = store_id_param;

  RETURN store_record;
END;
$$;
```

### Returning a Table

```sql
CREATE FUNCTION search_stores(query TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  branch_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    COUNT(b.id) as branch_count
  FROM stores s
  LEFT JOIN branches b ON s.id = b.store_id
  WHERE s.name ILIKE '%' || query || '%'
  GROUP BY s.id, s.name;
END;
$$;
```

### Returning JSONB

```sql
CREATE FUNCTION get_store_with_branches(store_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'store', row_to_json(s.*),
      'branches', COALESCE(
        json_agg(row_to_json(b.*)) FILTER (WHERE b.id IS NOT NULL),
        '[]'::json
      )
    )
    FROM stores s
    LEFT JOIN branches b ON s.id = b.store_id
    WHERE s.id = store_id_param
    GROUP BY s.id
  );
END;
$$;
```

## Parameter Handling

### Default Parameters

```sql
CREATE FUNCTION search_stores(
  search_query TEXT DEFAULT NULL,
  max_results INTEGER DEFAULT 20,
  include_inactive BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(...)
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM stores
  WHERE
    (search_query IS NULL OR name ILIKE '%' || search_query || '%')
    AND (include_inactive OR active = TRUE)
  LIMIT max_results;
END;
$$;
```

### Named Parameters

```sql
-- Call with named parameters
SELECT * FROM search_stores(
  search_query := 'pizza',
  max_results := 10
);

-- Or positional
SELECT * FROM search_stores('pizza', 10);
```

## SQL Injection Prevention

### ❌ DANGEROUS: String Concatenation

```sql
-- ❌ NEVER DO THIS: Vulnerable to SQL injection
CREATE FUNCTION dangerous_search(query TEXT)
RETURNS TABLE(...)
AS $$
BEGIN
  RETURN QUERY EXECUTE 'SELECT * FROM stores WHERE name = ''' || query || '''';
  -- If query = "'; DROP TABLE stores; --" = disaster!
END;
$$;
```

### ✅ SAFE: Parameterized Queries

```sql
-- ✅ CORRECT: Use parameters
CREATE FUNCTION safe_search(query TEXT)
RETURNS TABLE(...)
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM stores
  WHERE name = query;  -- Automatically escaped
END;
$$;

-- ✅ CORRECT: Use format with %L (literal)
CREATE FUNCTION safe_dynamic_search(query TEXT, table_name TEXT)
RETURNS TABLE(...)
AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT * FROM %I WHERE name = %L',
    table_name,  -- %I escapes identifier (table/column name)
    query        -- %L escapes literal (value)
  );
END;
$$;
```

## Error Handling

```sql
CREATE FUNCTION create_store_safe(store_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  new_store_id UUID;
BEGIN
  -- Validate input
  IF store_name IS NULL OR LENGTH(TRIM(store_name)) = 0 THEN
    RAISE EXCEPTION 'Store name cannot be empty';
  END IF;

  -- Insert with error handling
  BEGIN
    INSERT INTO stores (name)
    VALUES (store_name)
    RETURNING id INTO new_store_id;

    RETURN new_store_id;
  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Store with name % already exists', store_name;
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Failed to create store: %', SQLERRM;
  END;
END;
$$;
```

## Performance Optimization

### Use CTEs for Clarity

```sql
CREATE FUNCTION get_popular_stores(min_rating REAL DEFAULT 4.0)
RETURNS TABLE(...)
AS $$
BEGIN
  RETURN QUERY
  WITH rated_stores AS (
    SELECT
      s.*,
      AVG(bd.rating) as avg_rating
    FROM stores s
    JOIN branches b ON s.id = b.store_id
    JOIN branch_details bd ON b.id = bd.branch_id
    GROUP BY s.id
    HAVING AVG(bd.rating) >= min_rating
  )
  SELECT * FROM rated_stores
  ORDER BY avg_rating DESC;
END;
$$;
```

### Avoid N+1 Patterns

```sql
-- ❌ BAD: N+1 queries
CREATE FUNCTION get_stores_with_branches_slow()
RETURNS TABLE(...)
AS $$
DECLARE
  store_record RECORD;
BEGIN
  FOR store_record IN SELECT * FROM stores LOOP
    -- This runs a query for EACH store!
    SELECT COUNT(*) INTO branch_count
    FROM branches
    WHERE store_id = store_record.id;

    -- Return row...
  END LOOP;
END;
$$;

-- ✅ GOOD: Single query with JOIN
CREATE FUNCTION get_stores_with_branches_fast()
RETURNS TABLE(...)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    COUNT(b.id) as branch_count
  FROM stores s
  LEFT JOIN branches b ON s.id = b.store_id
  GROUP BY s.id, s.name;
END;
$$;
```

### Index-Friendly Queries

```sql
-- ✅ Uses index on store_id
WHERE store_id = param

-- ❌ Can't use index (function on column)
WHERE LOWER(name) = LOWER(param)

-- ✅ Create functional index or use ILIKE
CREATE INDEX idx_stores_name_lower ON stores(LOWER(name));
WHERE LOWER(name) = LOWER(param)
```

## DescuentosUY Example: search_stores

```sql
CREATE OR REPLACE FUNCTION search_stores(
  search_query TEXT DEFAULT NULL,
  user_lat REAL DEFAULT NULL,
  user_lon REAL DEFAULT NULL,
  sort_by TEXT DEFAULT 'relevance',
  max_distance_km REAL DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  only_with_promotions BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  logo_url TEXT,
  category TEXT,
  branch_count BIGINT,
  nearest_distance_km REAL,
  best_promotion_percentage INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  WITH store_data AS (
    SELECT
      s.id,
      s.name,
      s.logo_url,
      s.category,
      COUNT(DISTINCT b.id) as branch_count,
      CASE
        WHEN user_lat IS NOT NULL AND user_lon IS NOT NULL THEN
          get_nearest_branch_distance(user_lat, user_lon, s.id)
        ELSE NULL
      END as distance_km,
      MAX(p.percentage) as best_percentage
    FROM stores s
    LEFT JOIN branches b ON s.id = b.store_id
    LEFT JOIN store_promotions sp ON s.id = sp.store_id AND sp.active = TRUE
    LEFT JOIN promotions p ON sp.promotion_id = p.id
    WHERE
      -- Text search filter
      (search_query IS NULL OR
       s.name ILIKE '%' || search_query || '%' OR
       s.description ILIKE '%' || search_query || '%')
      AND
      -- Category filter
      (category_filter IS NULL OR s.category = category_filter)
      AND
      -- Promotions filter
      (NOT only_with_promotions OR p.id IS NOT NULL)
    GROUP BY s.id, s.name, s.logo_url, s.category
  )
  SELECT
    id,
    name,
    logo_url,
    category,
    branch_count,
    distance_km as nearest_distance_km,
    best_percentage as best_promotion_percentage
  FROM store_data
  WHERE
    -- Distance filter (applied after calculation)
    (max_distance_km IS NULL OR distance_km <= max_distance_km)
  ORDER BY
    CASE sort_by
      WHEN 'distance' THEN distance_km
      WHEN 'discount' THEN -best_percentage  -- Negative for DESC
      ELSE NULL
    END ASC NULLS LAST,
    name ASC;  -- Secondary sort by name
END;
$$;
```

**Key Features:**
- Uses CTE to calculate distance once
- Multiple optional filters
- Flexible sorting
- Returns aggregated data
- STABLE + SECURITY INVOKER for safety

## Testing Functions

```sql
-- Test with various parameter combinations
SELECT * FROM search_stores();
SELECT * FROM search_stores('pizza');
SELECT * FROM search_stores(user_lat := -34.9, user_lon := -56.2);
SELECT * FROM search_stores(sort_by := 'distance', user_lat := -34.9, user_lon := -56.2);

-- Test performance
EXPLAIN ANALYZE
SELECT * FROM search_stores('restaurant', -34.9, -56.2);

-- Test edge cases
SELECT * FROM search_stores(NULL, NULL, NULL);  -- All NULLs
SELECT * FROM search_stores('nonexistent');     -- No results
SELECT * FROM search_stores(user_lat := 91);     -- Invalid lat
```

## Resources

- [PostgreSQL Functions Documentation](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [PL/pgSQL Guide](https://www.postgresql.org/docs/current/plpgsql.html)
- [Supabase RPC](https://supabase.com/docs/guides/database/functions)
- [SQL Injection Prevention](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-DOLLAR-QUOTING)
