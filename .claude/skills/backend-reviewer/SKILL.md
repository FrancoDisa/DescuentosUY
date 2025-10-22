---
name: backend-reviewer
description: Reviews Supabase backend code including database schema, RPC functions, PostGIS queries, and API integrations. Uses Supabase MCP for direct database access.
---

# Backend Reviewer

Perform comprehensive backend code reviews for Supabase-based applications, focusing on database design, query performance, API patterns, and data integrity.

## When to Use This Skill

Invoke this skill when:
- Reviewing database schema changes or migrations
- Auditing RPC functions and PostGIS queries
- Investigating slow database queries
- Validating API route implementations
- Checking data integrity and relationships
- Before deploying database changes to production

## Review Workflow

### 1. Inspect Current Database State

Use Supabase MCP to gather current database information:

```
Use mcp__supabase__list_tables to get all tables and schemas
Use mcp__supabase__list_extensions to verify PostGIS and other extensions
Use mcp__supabase__list_migrations to review migration history
Use mcp__supabase__execute_sql to inspect specific tables, indexes, and constraints
```

Cross-reference the actual database state with the project's ARCHITECTURE.md and schema documentation.

### 2. Schema Design Review

Analyze database schema for best practices:

**Normalization:**
- Check for proper normalization (avoid data duplication)
- Verify foreign key relationships are defined
- Ensure junction tables for many-to-many relationships
- Review column data types for efficiency

**Indexes:**
- Verify indexes exist on foreign keys
- Check for indexes on frequently queried columns
- Identify missing indexes causing slow queries
- Look for unused indexes that waste space

**Constraints:**
- Verify NOT NULL constraints on required fields
- Check for proper UNIQUE constraints
- Review CHECK constraints for data validation
- Ensure foreign key constraints maintain referential integrity

**Reference:** See `references/schema-design.md` for normalization patterns.

### 3. PostGIS Query Performance

Review geospatial queries for performance:

**Spatial Indexes:**
```sql
-- Verify GIST indexes exist on geometry columns
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE indexdef LIKE '%USING gist%';
```

**Query Optimization:**
- Check for proper use of ST_DWithin vs ST_Distance
- Verify geography vs geometry type usage
- Look for opportunities to use bounding box queries
- Ensure spatial queries use indexes (check EXPLAIN ANALYZE)

**Common Issues:**
```sql
-- ❌ SLOW: Calculates distance for every row
SELECT * FROM branches
WHERE ST_Distance(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint($1, $2)::geography
) < 5000;

-- ✅ FAST: Uses spatial index with ST_DWithin
SELECT * FROM branches
WHERE ST_DWithin(
  ST_MakePoint(longitude, latitude)::geography,
  ST_MakePoint($1, $2)::geography,
  5000
);
```

**Reference:** See `references/postgis-optimization.md` for spatial query patterns.

### 4. RPC Function Review

Analyze Supabase RPC functions for correctness and performance:

**Function Structure:**
- Verify proper parameter typing
- Check for SQL injection vulnerabilities
- Ensure proper error handling
- Review return type consistency

**Performance:**
- Look for N+1 query patterns
- Check for unnecessary subqueries
- Verify efficient JOIN strategies
- Identify opportunities for CTEs (Common Table Expressions)

**Example Review:**
```sql
-- Review the search_stores function
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'search_stores';
```

Check for:
- Proper use of indexes
- Efficient filtering (WHERE before JOIN)
- Appropriate use of LIMIT/OFFSET
- Avoiding SELECT *

**Reference:** See `references/rpc-patterns.md` for function best practices.

### 5. Migration Quality

Review database migrations for safety and correctness:

**Migration Safety:**
- [ ] No destructive operations without backups
- [ ] No dropping columns with data
- [ ] No removing indexes during peak hours
- [ ] Reversible changes when possible

**Common Issues:**
```sql
-- ❌ DANGEROUS: Dropping column without backup
ALTER TABLE stores DROP COLUMN old_field;

-- ✅ SAFER: Rename first, monitor, then drop
ALTER TABLE stores RENAME COLUMN old_field TO old_field_deprecated;
-- Monitor for a few days, then drop if confirmed unused

-- ❌ BLOCKING: Adding NOT NULL without default
ALTER TABLE stores ADD COLUMN new_field TEXT NOT NULL;

-- ✅ NON-BLOCKING: Add nullable first, then backfill
ALTER TABLE stores ADD COLUMN new_field TEXT;
UPDATE stores SET new_field = 'default' WHERE new_field IS NULL;
ALTER TABLE stores ALTER COLUMN new_field SET NOT NULL;
```

Use `scripts/validate_migration.py` to check migration safety.

### 6. API Route Review

Analyze Next.js API routes that interact with Supabase:

**Authentication:**
- Verify proper use of service_role vs anon key
- Check for authenticated routes using createClient()
- Ensure public routes use createPublicClient()
- Review rate limiting and abuse prevention

**Error Handling:**
```typescript
// ✅ CORRECT: Proper error handling
export async function GET(request: Request) {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('stores')
      .select('*')

    if (error) {
      console.error('Database error:', error)
      return Response.json(
        { error: 'Failed to fetch stores' },
        { status: 500 }
      )
    }

    return Response.json(data)
  } catch (err) {
    console.error('Unexpected error:', err)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Data Validation:**
- Check input validation before database queries
- Verify proper TypeScript typing
- Ensure sanitization of user input
- Review query parameter handling

### 7. Caching Strategy

Review caching patterns for API and database calls:

**Supabase Caching:**
```typescript
// ✅ Cache stable data aggressively
const { data: categories } = await supabase
  .from('categories')
  .select('*')
// Mark route with: export const revalidate = 86400

// ✅ Short cache for semi-dynamic data
const { data: stores } = await supabase
  .from('stores')
  .select('*')
// Mark route with: export const revalidate = 3600

// ✅ No cache for real-time data
export const dynamic = 'force-dynamic'
```

**External API Caching:**
- Review Google Places API call frequency
- Check for cached responses in branch_details table
- Verify cache invalidation strategy (3-month cadence)
- Look for opportunities to batch API calls

### 8. Data Integrity Checks

Use Supabase MCP to run integrity checks:

```sql
-- Check for orphaned records
SELECT b.id, b.store_id
FROM branches b
LEFT JOIN stores s ON b.store_id = s.id
WHERE s.id IS NULL;

-- Check for missing required relationships
SELECT s.id, s.name, COUNT(b.id) as branch_count
FROM stores s
LEFT JOIN branches b ON s.id = b.store_id
GROUP BY s.id, s.name
HAVING COUNT(b.id) = 0;

-- Check for invalid coordinates
SELECT id, name, latitude, longitude
FROM branches
WHERE latitude IS NULL OR longitude IS NULL
OR latitude < -90 OR latitude > 90
OR longitude < -180 OR longitude > 180;
```

Use `scripts/check_data_integrity.py` for automated checks.

### 9. Performance Monitoring

Check for slow queries and performance issues:

**Query Analysis:**
```sql
-- Find slow queries (requires pg_stat_statements extension)
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

Use `mcp__supabase__get_logs` to review recent database errors.

### 10. Generate Review Report

Provide a structured review with:

1. **Summary:** Overall backend health and key findings
2. **Critical Issues:** Problems requiring immediate attention
3. **Performance Bottlenecks:** Slow queries and optimization opportunities
4. **Schema Issues:** Design problems or missing constraints
5. **Security Concerns:** Potential vulnerabilities or misconfigurations
6. **Migration Recommendations:** Safe migration patterns
7. **Actionable Steps:** Prioritized fixes with estimated impact

## Output Format

Structure the review as:

```markdown
## Backend Code Review

### Summary
[Overall assessment]

### Critical Issues
- [Issue 1: Description with SQL/code reference]
- [Issue 2: Description with SQL/code reference]

### Performance Analysis
**Slow Queries:**
- [Query 1: avg time, suggested optimization]
- [Query 2: avg time, suggested optimization]

**Missing Indexes:**
- [Table.column: impact estimate]

### Schema Issues
- [Issue: Normalization/constraint/type problem]

### Security Concerns
- [Concern: RLS policy, injection risk, etc.]

### Migration Safety
- [Recommendation for pending migrations]

### Code Examples
#### Issue: [Description]
**Current:**
```sql
[Current code]
```

**Improved:**
```sql
[Optimized code]
```

**Why:** [Explanation with performance impact]

### Action Items
1. [High priority: immediate fix needed]
2. [Medium priority: plan for next sprint]
3. [Low priority: technical debt]
```

## Integration with Project

This skill is designed specifically for DescuentosUY and understands:
- Supabase PostgreSQL + PostGIS architecture
- Tables: stores, branches, promotions, store_promotions, branch_details
- RPC function: search_stores, get_nearest_branch_distance
- Google Places API integration and caching strategy
- Migration patterns and schema evolution

## Tools and References

**MCP Integrations:**
- Supabase MCP: Direct database access for inspection and analysis
- Context7 (optional): For latest Supabase and PostgreSQL documentation

**Local References:**
- `references/schema-design.md`: Database design patterns
- `references/postgis-optimization.md`: Spatial query optimization
- `references/rpc-patterns.md`: RPC function best practices

**Scripts:**
- `scripts/validate_migration.py`: Check migration safety before applying
- `scripts/check_data_integrity.py`: Automated data integrity checks
- `scripts/analyze_queries.py`: Parse and analyze slow queries

## Example Usage

**User:** "Review the search_stores RPC function for performance"

**Workflow:**
1. Use mcp__supabase__execute_sql to get function definition
2. Analyze query structure and JOIN patterns
3. Check for proper index usage with EXPLAIN ANALYZE
4. Review parameter handling and type safety
5. Look for N+1 patterns or unnecessary subqueries
6. Generate report with specific optimization recommendations

**User:** "Check if my new migration is safe to deploy"

**Workflow:**
1. Read the migration file
2. Run scripts/validate_migration.py to check for common issues
3. Review for blocking operations
4. Check if indexes are created CONCURRENTLY
5. Verify backup strategy for destructive operations
6. Suggest improvements or safe alternatives
