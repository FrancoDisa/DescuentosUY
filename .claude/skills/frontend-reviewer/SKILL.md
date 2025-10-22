---
name: frontend-reviewer
description: Reviews Next.js 15 App Router frontend code for performance, best practices, and React patterns. Uses Context7 MCP for latest Next.js/React documentation.
---

# Frontend Reviewer

Perform comprehensive frontend code reviews for Next.js 15 + React applications, focusing on performance, best practices, and modern patterns.

## When to Use This Skill

Invoke this skill when:
- Reviewing new or modified frontend components
- Investigating performance issues or slow renders
- Validating Server vs Client Component usage
- Auditing React hooks and state management
- Checking bundle size and optimization opportunities
- Before creating pull requests with frontend changes

## Review Workflow

### 1. Fetch Latest Documentation

Before starting the review, gather the most recent official documentation using Context7 MCP:

```
Use mcp__context7__search to find:
- Next.js 15 App Router patterns
- React Server Components best practices
- Next.js caching and revalidation strategies
- Performance optimization techniques
```

Cross-reference findings with the official documentation to ensure recommendations are current and accurate.

### 2. Analyze Component Architecture

Review the component structure and patterns:

**Server vs Client Components:**
- Verify components are Server Components by default (no `'use client'` directive)
- Check that `'use client'` is only used when necessary (interactivity, hooks, browser APIs)
- Ensure async Server Components properly handle data fetching
- Validate that Client Components don't unnecessarily re-fetch data

**Component Composition:**
- Check for proper component hierarchy and separation of concerns
- Verify prop drilling is avoided (consider composition or context when needed)
- Ensure components follow single responsibility principle
- Review component file organization and naming conventions

**Reference:** See `references/nextjs-patterns.md` for project-specific patterns.

### 3. Performance Analysis

Conduct a thorough performance review:

**React Performance:**
- Identify unnecessary re-renders (missing memoization)
- Check for expensive computations without `useMemo`
- Verify callback functions use `useCallback` when passed as props
- Look for large lists that could benefit from virtualization
- Check for memory leaks (useEffect cleanup functions)

**Next.js Optimization:**
- Verify `next/image` is used instead of `<img>` tags
- Check image sizes have width/height to prevent CLS
- Ensure dynamic imports for heavy client components
- Review loading states and Suspense boundaries
- Check for proper error boundaries

**Bundle Size:**
- Look for heavy dependencies that could be code-split
- Check for unused imports and dead code
- Verify tree-shaking friendly import patterns (named imports)

**Reference:** Consult `references/performance-checklist.md` for optimization patterns.

### 4. Data Fetching Patterns

Review how data is loaded and cached:

**Fetching Strategy:**
- Verify data fetching happens in Server Components when possible
- Check for proper error handling in async components
- Ensure loading states are implemented with Suspense
- Review caching strategies (force-cache, no-store, revalidate)

**Client-Side Fetching:**
- When client-side fetching is necessary, verify proper loading/error states
- Check for race conditions in useEffect data fetching
- Ensure proper cleanup of pending requests

### 5. TypeScript Quality

Assess TypeScript usage and type safety:

**Type Safety:**
- Check for `any` types and suggest specific alternatives
- Verify proper typing of props, state, and return values
- Ensure generic types are used appropriately
- Review type inference vs explicit typing balance

**Reference:** See `references/typescript-patterns.md` for type patterns.

### 6. Hooks Usage

Review React hooks for correctness and best practices:

**Common Issues:**
- Missing dependencies in useEffect/useMemo/useCallback arrays
- Conditional hook calls (hooks must be at top level)
- Custom hooks not following naming convention (use*)
- State updates based on previous state not using updater function

### 7. Routing and Navigation

Check Next.js routing patterns:

**App Router:**
- Verify proper use of file-based routing conventions
- Check for correct use of route groups, parallel routes, intercepting routes
- Review navigation with `useRouter`, `Link`, and `redirect`
- Ensure proper usage of `searchParams` and `params`

### 8. Generate Review Report

Provide a structured review with:

1. **Summary:** Overall code quality rating and key findings
2. **Critical Issues:** Problems that must be fixed (security, performance, bugs)
3. **Performance Improvements:** Specific optimization opportunities with impact estimates
4. **Best Practice Violations:** Deviations from Next.js/React conventions
5. **Code Examples:** Before/after code snippets showing recommended changes
6. **Documentation Links:** References to official docs (from Context7) supporting recommendations
7. **Actionable Steps:** Prioritized list of changes to implement

## Output Format

Structure the review as:

```markdown
## Frontend Code Review

### Summary
[Overall assessment]

### Critical Issues
- [Issue 1 with file:line reference]
- [Issue 2 with file:line reference]

### Performance Opportunities
- [Optimization 1: Expected impact]
- [Optimization 2: Expected impact]

### Best Practices
- [Recommendation 1]
- [Recommendation 2]

### Code Examples
#### Issue: [Description]
**Before:**
[Current code]

**After:**
[Improved code]

**Why:** [Explanation with doc link]

### Action Items
1. [High priority]
2. [Medium priority]
3. [Low priority]
```

## Integration with Project

This skill is designed specifically for DescuentosUY and understands:
- Next.js 15 App Router architecture
- Supabase SSR client patterns
- TypeScript strict mode configuration
- Project component structure in `src/components/`
- Server/Client component separation in the codebase

## Tools and References

**MCP Integrations:**
- Context7: For latest Next.js, React, and TypeScript documentation
- GitHub MCP (optional): For PR context and automated review comments

**Local References:**
- `references/nextjs-patterns.md`: Project-specific Next.js patterns
- `references/performance-checklist.md`: Performance optimization guide
- `references/typescript-patterns.md`: TypeScript conventions

**Scripts:**
- `scripts/analyze_bundle.py`: Analyze bundle size and identify heavy dependencies
- `scripts/find_rerenders.py`: Detect components with excessive re-renders

## Example Usage

**User:** "Review the StoreList component for performance issues"

**Workflow:**
1. Search Context7 for Next.js Server Components performance patterns
2. Read the StoreList component and related files
3. Analyze rendering patterns and data flow
4. Check for unnecessary client-side work
5. Review deduplication logic efficiency
6. Generate report with specific recommendations

**User:** "Check if I'm using Server Components correctly in the new map page"

**Workflow:**
1. Fetch latest Next.js Server Components docs from Context7
2. Review the map page component hierarchy
3. Identify which components should be Server vs Client
4. Verify proper 'use client' boundaries
5. Check data fetching patterns
6. Provide refactoring suggestions if needed
