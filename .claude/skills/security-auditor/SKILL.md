---
name: security-auditor
description: Audits application security including RLS policies, authentication, SQL injection, XSS vulnerabilities, and API security. Uses Supabase MCP for direct RLS policy inspection.
---

# Security Auditor

Perform comprehensive security audits for Supabase + Next.js applications, focusing on Row Level Security (RLS), authentication, input validation, and common web vulnerabilities.

## When to Use This Skill

Invoke this skill when:
- Auditing database security and RLS policies
- Reviewing authentication and authorization logic
- Checking for SQL injection vulnerabilities
- Investigating potential XSS or CSRF issues
- Before deploying security-critical changes
- After security incidents or concerns
- Performing regular security reviews

## Audit Workflow

### 1. RLS Policy Audit

Use Supabase MCP to inspect Row Level Security policies:

```
Use mcp__supabase__execute_sql to query pg_policies system catalog
Use mcp__supabase__list_tables to identify tables without RLS
Use mcp__supabase__get_advisors with type="security" for automated checks
```

**Check for:**
- Tables without RLS enabled
- Overly permissive policies (e.g., allowing all SELECT)
- Missing policies for INSERT/UPDATE/DELETE
- Policies that don't check user authentication
- Policies with logic errors

**Example Query:**
```sql
-- Find tables without RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = FALSE;

-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';
```

**Reference:** See `references/rls-security.md` for RLS best practices.

### 2. Authentication Security

Review authentication implementation:

**Supabase Auth:**
- Verify proper use of `createClient()` for authenticated routes
- Check that service_role key is never exposed to client
- Review session management and token handling
- Ensure proper logout implementation

**Protected Routes:**
```typescript
// ✅ CORRECT: Check auth in Server Component
export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return <div>Protected content</div>
}

// ❌ WRONG: No auth check
export default function ProtectedPage() {
  return <div>Anyone can see this!</div>
}
```

**API Routes:**
```typescript
// ✅ CORRECT: Verify user in API route
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Process authenticated request...
}
```

### 3. SQL Injection Prevention

Check for SQL injection vulnerabilities in RPC functions and queries:

**In RPC Functions:**
```sql
-- ❌ DANGEROUS: String concatenation
CREATE FUNCTION search_unsafe(query TEXT)
RETURNS TABLE(...) AS $$
BEGIN
  RETURN QUERY EXECUTE 'SELECT * FROM stores WHERE name = ''' || query || '''';
END;
$$ LANGUAGE plpgsql;

-- ✅ SAFE: Parameterized query
CREATE FUNCTION search_safe(query TEXT)
RETURNS TABLE(...) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM stores
  WHERE name = query;  -- Automatically escaped
END;
$$ LANGUAGE plpgsql;

-- ✅ SAFE: Using format with proper escaping
CREATE FUNCTION search_dynamic(query TEXT)
RETURNS TABLE(...) AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT * FROM stores WHERE name = %L',
    query  -- %L escapes as literal
  );
END;
$$ LANGUAGE plpgsql;
```

**In TypeScript:**
```typescript
// ✅ SAFE: Supabase query builder (automatically parameterized)
const { data } = await supabase
  .from('stores')
  .select('*')
  .eq('name', userInput)  // Safe

// ✅ SAFE: RPC with parameters
const { data } = await supabase
  .rpc('search_stores', { search_query: userInput })  // Safe
```

### 4. XSS Prevention

Check for Cross-Site Scripting vulnerabilities:

**React/Next.js (generally safe):**
- React escapes content by default
- Watch for `dangerouslySetInnerHTML`
- Be careful with user-generated content in metadata

```typescript
// ✅ SAFE: React auto-escapes
<div>{userInput}</div>

// ❌ DANGEROUS: Direct HTML injection
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFER: Sanitize first
import DOMPurify from 'isomorphic-dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ❌ DANGEROUS: Unsanitized metadata
export const metadata = {
  title: userInput,  // Could inject scripts
}

// ✅ SAFE: Sanitize or validate
export const metadata = {
  title: sanitizeTitle(userInput),
}
```

### 5. API Key Security

Audit environment variable usage and API key exposure:

**Check for:**
- Service role key used in client-side code
- API keys committed to git
- Exposed keys in client bundles
- Missing environment variable validation

```typescript
// ❌ DANGEROUS: Service role in client
'use client'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // EXPOSED TO CLIENT!
)

// ✅ CORRECT: Service role only in server
// app/api/admin/route.ts
import { createClient } from '@/utils/supabase/server'
const supabase = createServiceRoleClient()

// ✅ CORRECT: Anon key for client
'use client'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // Safe for client
)
```

**Use script:** `scripts/check_exposed_secrets.py` to scan for exposed secrets.

### 6. Input Validation

Review input validation and sanitization:

**Server-Side Validation:**
```typescript
// ✅ CORRECT: Validate before using
import { z } from 'zod'

const StoreSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['restaurant', 'retail', 'service']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

export async function POST(request: Request) {
  const body = await request.json()

  // Validate input
  const result = StoreSchema.safeParse(body)
  if (!result.success) {
    return Response.json(
      { error: 'Invalid input', details: result.error },
      { status: 400 }
    )
  }

  // Use validated data
  const validatedData = result.data
  // ...
}
```

**Check for:**
- Missing input validation
- Client-side only validation (not secure)
- Weak validation (e.g., no max length)
- Type mismatches

### 7. CORS and CSRF

Review Cross-Origin and CSRF protections:

**Next.js API Routes:**
```typescript
// ✅ Restrict origins if needed
export async function POST(request: Request) {
  const origin = request.headers.get('origin')

  if (origin && !allowedOrigins.includes(origin)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Process request...
}

// ✅ Verify request comes from your app
const referer = request.headers.get('referer')
if (!referer?.includes(process.env.NEXT_PUBLIC_APP_URL)) {
  // Potential CSRF
}
```

**Supabase (handles CORS automatically):**
- Check Supabase dashboard for allowed origins
- Ensure only your domain(s) are whitelisted

### 8. Rate Limiting

Check for rate limiting and abuse prevention:

**Vercel (automatic):**
- Review Vercel analytics for unusual traffic
- Check for DDoS protection settings

**Supabase:**
- Review connection limits
- Check for query timeouts
- Monitor for abusive queries

**Custom Rate Limiting:**
```typescript
// ✅ Add rate limiting to sensitive endpoints
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return Response.json({ error: 'Too many requests' }, { status: 429 })
  }

  // Process request...
}
```

### 9. Dependency Vulnerabilities

Check for vulnerable dependencies:

```bash
# Run npm audit
npm audit

# Check for high/critical vulnerabilities
npm audit --production

# Fix automatically (with caution)
npm audit fix
```

Use `scripts/check_dependencies.py` for automated vulnerability scanning.

### 10. Google Maps API Security

Review Google Maps API usage:

**API Key Restrictions:**
- Verify API key has HTTP referrer restrictions
- Check that only necessary APIs are enabled
- Review usage quotas and caps

```javascript
// ✅ CORRECT: Restricted key
// In Google Cloud Console:
// - Application restrictions: HTTP referrers
// - Website restrictions: https://descuentosuy.com/*
// - API restrictions: Maps JavaScript API, Geocoding API, Places API

// ❌ DANGEROUS: Unrestricted key
// Anyone can use it from any website!
```

### 11. Generate Security Report

Provide a structured security audit with:

1. **Executive Summary:** Overall security posture and critical findings
2. **Critical Vulnerabilities:** Issues requiring immediate remediation
3. **RLS Policy Issues:** Tables without RLS, weak policies
4. **Authentication Gaps:** Missing auth checks, exposed keys
5. **Injection Risks:** SQL injection, XSS vulnerabilities
6. **Configuration Issues:** CORS, rate limiting, API restrictions
7. **Dependency Vulnerabilities:** Outdated or vulnerable packages
8. **Recommendations:** Prioritized security improvements
9. **Compliance:** OWASP Top 10 checklist

## Output Format

```markdown
## Security Audit Report

### Executive Summary
[Overall security rating: Critical/High/Medium/Low Risk]
[Key findings summary]

### Critical Vulnerabilities (Immediate Action Required)
- [Vulnerability 1: Description, Location, Impact]
- [Vulnerability 2: Description, Location, Impact]

### RLS Policy Issues
**Tables without RLS:**
- [table_name: Why this is a problem]

**Weak Policies:**
- [table_name.policy_name: Issue and fix]

### Authentication & Authorization
- [Issue: Missing auth check in /admin routes]
- [Issue: Service role key exposed]

### Injection Vulnerabilities
**SQL Injection:**
- [Location: RPC function, Issue, Fix]

**XSS:**
- [Location: Component, Issue, Fix]

### API Security
- [Issue: Google Maps API key unrestricted]
- [Issue: Missing rate limiting on /api/contact]

### Dependencies
**Vulnerable Packages:**
- [package@version: CVE-2024-XXXX (Critical)]

### OWASP Top 10 Checklist
- [x] A01:2021 – Broken Access Control: [Status]
- [ ] A02:2021 – Cryptographic Failures: [Status]
- [x] A03:2021 – Injection: [Status]
...

### Recommended Actions
1. [Critical: Fix RLS policy on stores table]
2. [High: Restrict Google Maps API key]
3. [Medium: Add rate limiting to auth endpoints]

### Resources
- [OWASP Top 10](https://owasp.org/Top10/)
- [Supabase Security Best Practices](...)
```

## Integration with Project

This skill is designed specifically for DescuentosUY and understands:
- Supabase authentication patterns
- RLS policies for stores, branches, promotions tables
- Next.js 15 App Router security considerations
- Google Maps Platform API key security
- Admin panel protection requirements

## Tools and References

**MCP Integrations:**
- Supabase MCP: Direct RLS policy inspection and security advisors
- GitHub MCP (optional): Security alerts and dependency scanning

**Local References:**
- `references/rls-security.md`: RLS policy patterns and best practices
- `references/owasp-checklist.md`: OWASP Top 10 checklist for audits

**Scripts:**
- `scripts/check_exposed_secrets.py`: Scan for exposed API keys and secrets
- `scripts/check_dependencies.py`: Check for vulnerable dependencies
- `scripts/audit_rls.py`: Automated RLS policy audit

## Example Usage

**User:** "Audit the security of the stores table"

**Workflow:**
1. Use mcp__supabase__execute_sql to check if RLS is enabled
2. Query pg_policies to review RLS policies
3. Check for policies on SELECT, INSERT, UPDATE, DELETE
4. Verify policies check auth.uid() appropriately
5. Use mcp__supabase__get_advisors for automated security checks
6. Generate report with specific policy recommendations

**User:** "Check if my API routes are secure"

**Workflow:**
1. Read all files in app/api/ directory
2. Check for auth verification in each route
3. Review input validation
4. Check for rate limiting
5. Verify proper error handling (no info leakage)
6. Generate report with vulnerable endpoints
