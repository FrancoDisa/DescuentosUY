# Row Level Security (RLS) Best Practices

Complete guide to implementing secure RLS policies in Supabase/PostgreSQL for DescuentosUY.

## RLS Fundamentals

### Why RLS?

Row Level Security ensures that users can only access data they're authorized to see, enforced at the database level (not just application level).

**Without RLS:**
- Users with anon key can access ALL data
- Application logic is the only protection (can be bypassed)
- Direct database access bypasses application checks

**With RLS:**
- Database enforces access rules
- Even with API key, users only see authorized data
- Protection layer even if application is compromised

## Enabling RLS

```sql
-- ✅ Always enable RLS on tables with sensitive data
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_promotions ENABLE ROW LEVEL SECURITY;

-- ✅ For cache/public data, RLS may not be needed
-- but still recommended as defense in depth
ALTER TABLE branch_details ENABLE ROW LEVEL SECURITY;
```

## Policy Types

### SELECT Policies (Read)

```sql
-- Public read access (anyone can view)
CREATE POLICY "Public stores are viewable by everyone"
ON stores FOR SELECT
USING (TRUE);

-- Authenticated users only
CREATE POLICY "Stores viewable by authenticated users"
ON stores FOR SELECT
USING (auth.role() = 'authenticated');

-- Owner-only access
CREATE POLICY "Users can view their own stores"
ON stores FOR SELECT
USING (auth.uid() = owner_id);
```

### INSERT Policies (Create)

```sql
-- Anyone can insert (rare, be careful!)
CREATE POLICY "Anyone can create stores"
ON stores FOR INSERT
WITH CHECK (TRUE);

-- Authenticated users can insert
CREATE POLICY "Authenticated users can create stores"
ON stores FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Only insert with correct owner
CREATE POLICY "Users can only create stores for themselves"
ON stores FOR INSERT
WITH CHECK (auth.uid() = owner_id);
```

### UPDATE Policies (Modify)

```sql
-- Users can only update their own stores
CREATE POLICY "Users can update their own stores"
ON stores FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Admin can update any store
CREATE POLICY "Admins can update any store"
ON stores FOR UPDATE
USING (
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);
```

### DELETE Policies (Remove)

```sql
-- Users can delete their own stores
CREATE POLICY "Users can delete their own stores"
ON stores FOR DELETE
USING (auth.uid() = owner_id);

-- Prevent deletion (use soft delete instead)
CREATE POLICY "No one can delete stores"
ON stores FOR DELETE
USING (FALSE);
```

## DescuentosUY RLS Policies

### Current State (Public Data)

```sql
-- stores: Public read-only
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stores_public_read"
ON stores FOR SELECT
USING (TRUE);

-- branches: Public read-only
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branches_public_read"
ON branches FOR SELECT
USING (TRUE);

-- promotions: Public read-only
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "promotions_public_read"
ON promotions FOR SELECT
USING (TRUE);

-- store_promotions: Public read-only for active promotions
ALTER TABLE store_promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "active_promotions_public_read"
ON store_promotions FOR SELECT
USING (active = TRUE);

-- branch_details: Public read-only (cached Google data)
ALTER TABLE branch_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branch_details_public_read"
ON branch_details FOR SELECT
USING (TRUE);
```

### Future: Admin Panel Protection

When implementing user authentication for admin panel:

```sql
-- Only admins can insert/update/delete stores
CREATE POLICY "admins_can_manage_stores"
ON stores FOR ALL
USING (
  auth.jwt() ->> 'role' = 'admin' OR
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin' OR
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

-- Public read remains
CREATE POLICY "stores_public_read"
ON stores FOR SELECT
USING (TRUE);
```

### Future: User-Contributed Data

When allowing users to suggest promotions:

```sql
-- Users can suggest promotions (pending approval)
CREATE POLICY "users_can_suggest_promotions"
ON promotion_suggestions FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  auth.uid() = suggested_by
);

-- Users can view their own suggestions
CREATE POLICY "users_can_view_own_suggestions"
ON promotion_suggestions FOR SELECT
USING (auth.uid() = suggested_by);

-- Admins can view all suggestions
CREATE POLICY "admins_can_view_all_suggestions"
ON promotion_suggestions FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');
```

## Common RLS Patterns

### Pattern 1: Public Read, Admin Write

```sql
-- Anyone can read
CREATE POLICY "public_read" ON table_name
FOR SELECT USING (TRUE);

-- Only admins can modify
CREATE POLICY "admin_write" ON table_name
FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### Pattern 2: Owner-Based Access

```sql
-- Users see only their own data
CREATE POLICY "owner_access" ON table_name
FOR ALL USING (auth.uid() = owner_id);
```

### Pattern 3: Conditional Public Access

```sql
-- Only published items are public
CREATE POLICY "published_public" ON table_name
FOR SELECT USING (status = 'published' OR auth.uid() = owner_id);
```

### Pattern 4: Role-Based Access

```sql
-- Different access by role
CREATE POLICY "role_based_access" ON table_name
FOR SELECT USING (
  CASE auth.jwt() ->> 'role'
    WHEN 'admin' THEN TRUE
    WHEN 'moderator' THEN status != 'draft'
    ELSE status = 'published'
  END
);
```

## Security Functions

### auth.uid()

Returns the authenticated user's ID (UUID).

```sql
-- Returns NULL if not authenticated
auth.uid() -- UUID or NULL
```

### auth.role()

Returns the authentication role ('anon' or 'authenticated').

```sql
auth.role() -- 'anon' | 'authenticated'
```

### auth.jwt()

Returns the full JWT claims as JSONB.

```sql
-- Access custom claims
auth.jwt() ->> 'email'              -- email
auth.jwt() ->> 'role'               -- custom role
auth.jwt() -> 'app_metadata' ->> 'role'  -- metadata role
```

## Testing RLS Policies

### Manual Testing

```sql
-- Test as anonymous user
SET ROLE anon;
SET request.jwt.claims = '{}';
SELECT * FROM stores;  -- Should work if public read enabled

-- Test as authenticated user
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "user-uuid-here"}';
SELECT * FROM stores WHERE owner_id = 'user-uuid-here';

-- Reset
RESET ROLE;
```

### Automated Testing

```sql
-- Create test function
CREATE OR REPLACE FUNCTION test_rls_stores()
RETURNS void AS $$
BEGIN
  -- Test anonymous access
  SET ROLE anon;
  ASSERT (SELECT COUNT(*) FROM stores) > 0, 'Anon should see stores';

  -- Test authenticated access
  SET ROLE authenticated;
  ASSERT (SELECT COUNT(*) FROM stores) > 0, 'Authenticated should see stores';

  RESET ROLE;
END;
$$ LANGUAGE plpgsql;

-- Run test
SELECT test_rls_stores();
```

## Common Mistakes

### ❌ Mistake 1: Forgetting to Enable RLS

```sql
-- ❌ RLS not enabled = no protection!
CREATE POLICY "..." ON stores ...;  -- Policy ignored!

-- ✅ Enable RLS first
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON stores ...;
```

### ❌ Mistake 2: Missing Policies for Operations

```sql
-- ❌ Only SELECT policy = can't INSERT/UPDATE/DELETE
CREATE POLICY "read_only" ON stores FOR SELECT USING (TRUE);

-- User tries to insert -> denied (no INSERT policy)

-- ✅ Add policies for each operation needed
CREATE POLICY "public_read" ON stores FOR SELECT USING (TRUE);
CREATE POLICY "admin_write" ON stores FOR INSERT/UPDATE/DELETE
  USING (auth.jwt() ->> 'role' = 'admin');
```

### ❌ Mistake 3: Overly Permissive Policies

```sql
-- ❌ Everything is public, RLS provides no value
CREATE POLICY "allow_all" ON sensitive_table
FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ✅ Be specific
CREATE POLICY "users_own_data" ON sensitive_table
FOR ALL USING (auth.uid() = user_id);
```

### ❌ Mistake 4: Not Testing Policies

```sql
-- ❌ Deploy without testing
CREATE POLICY "..." ON stores ...;
-- Later: "Why can't users see anything?"

-- ✅ Test as different roles
SET ROLE anon;
SELECT * FROM stores;  -- Test anon access
RESET ROLE;
```

## Performance Considerations

### Index for RLS Checks

```sql
-- ✅ Index columns used in RLS policies
CREATE INDEX idx_stores_owner ON stores(owner_id);

-- Policy uses owner_id
CREATE POLICY "owner_access" ON stores
FOR ALL USING (auth.uid() = owner_id);
-- Index makes this fast
```

### Avoid Complex Policies

```sql
-- ❌ SLOW: Subquery in every row check
CREATE POLICY "complex_check" ON stores
FOR SELECT USING (
  id IN (SELECT store_id FROM user_access WHERE user_id = auth.uid())
);

-- ✅ FASTER: Direct column check
CREATE POLICY "simple_check" ON stores
FOR SELECT USING (owner_id = auth.uid());

-- ✅ OR: Use a materialized view
```

## Bypassing RLS (Service Role)

```typescript
// ⚠️ Service role BYPASSES RLS
const supabase = createClient(
  url,
  SERVICE_ROLE_KEY  // Has FULL access, ignores RLS
)

// Use service role ONLY in:
// 1. Server-side admin operations
// 2. Background jobs
// 3. System-level operations

// NEVER expose service role to client!
```

## Auditing RLS

```sql
-- Check which tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Find tables without policies (RLS enabled but no policies = total lockdown)
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
AND t.rowsecurity = TRUE
AND p.policyname IS NULL;
```

## Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [RLS Performance Tips](https://supabase.com/docs/guides/database/postgres/row-level-security#performance)
