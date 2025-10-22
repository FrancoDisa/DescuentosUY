# DescuentosUY Skills

Specialized skills for code review, optimization, and quality assurance in the DescuentosUY project.

## Available Skills

### 1. frontend-reviewer
**Purpose:** Reviews Next.js 15 + React frontend code for performance, best practices, and modern patterns.

**Features:**
- Next.js 15 App Router pattern validation
- React Server vs Client Component analysis
- Performance optimization (memoization, bundle size, Core Web Vitals)
- TypeScript quality checks
- Integration with Context7 MCP for latest Next.js/React docs

**Usage:**
```
/frontend-reviewer
```

**Example:**
> "Review the StoreList component for performance issues"

---

### 2. backend-reviewer
**Purpose:** Reviews Supabase backend code including database schema, RPC functions, and PostGIS queries.

**Features:**
- Database schema design validation
- PostGIS spatial query optimization
- RPC function performance analysis
- Migration safety checks
- Integration with Supabase MCP for direct DB access

**Usage:**
```
/backend-reviewer
```

**Example:**
> "Review the search_stores RPC function for performance"

---

### 3. security-auditor
**Purpose:** Audits application security including RLS policies, authentication, and common vulnerabilities.

**Features:**
- Row Level Security (RLS) policy audit
- SQL injection and XSS prevention checks
- API key and secret exposure detection
- Authentication flow validation
- OWASP Top 10 compliance check
- Integration with Supabase MCP for RLS inspection

**Usage:**
```
/security-auditor
```

**Example:**
> "Audit the security of the stores table"

---

### 4. design-reviewer
**Purpose:** Reviews UI/UX design including Tailwind CSS, accessibility (WCAG), and responsive design.

**Features:**
- WCAG 2.1 Level AA accessibility audit
- Tailwind CSS best practices
- Responsive design validation
- Color contrast checking
- Keyboard navigation testing
- Visual consistency checks

**Usage:**
```
/design-reviewer
```

**Example:**
> "Review the StoreCard component for accessibility"

---

## Skill Structure

Each skill follows this structure:

```
skill-name/
├── SKILL.md              # Main skill instructions
├── references/           # Documentation and patterns
│   ├── pattern1.md
│   └── pattern2.md
└── scripts/              # Utility scripts (optional)
    └── helper_script.py
```

## MCP Integrations

These skills leverage MCP (Model Context Protocol) servers for enhanced capabilities:

- **Context7:** Latest documentation from official sources (Next.js, React, Supabase)
- **Supabase MCP:** Direct database access, RLS inspection, security advisors
- **GitHub MCP:** (Optional) PR context and automated review comments

## How Skills Work

Skills are **specialized instructions** that Claude follows when invoked. They:

1. **Guide Claude's behavior** with domain-specific knowledge
2. **Reference documentation** that gets loaded on-demand
3. **Provide reusable scripts** for automated checks
4. **Integrate with MCPs** for real-time data access

## Using Multiple Skills

You can chain skills together for comprehensive reviews:

```bash
# Full code review workflow
1. /frontend-reviewer   # Check React/Next.js code
2. /backend-reviewer    # Check database/API code
3. /security-auditor    # Check for vulnerabilities
4. /design-reviewer     # Check UI/UX quality
```

## Best Practices

### When to Use Each Skill

**frontend-reviewer:**
- Before creating PRs with React/Next.js changes
- When investigating slow page loads
- When adding new client-side features

**backend-reviewer:**
- Before applying database migrations
- When creating new RPC functions
- When slow queries are reported

**security-auditor:**
- Before deploying to production
- After implementing authentication changes
- Regular security audits (monthly)

**design-reviewer:**
- Before releasing new UI features
- When accessibility is questioned
- When adding responsive layouts

### Skill Maintenance

Skills are versioned with the project. Update them when:
- Project architecture changes
- New patterns are established
- Dependencies are upgraded (Next.js, React, Supabase)
- Security best practices evolve

## Scripts Reference

### Frontend Scripts
- `analyze_bundle.py` - Analyze Next.js bundle size and identify optimization opportunities

### Backend Scripts
- `validate_migration.py` - Check migration safety before applying

### Security Scripts
- `check_exposed_secrets.py` - Scan for exposed API keys and secrets

### Running Scripts

```bash
# From project root
python .claude/skills/frontend-reviewer/scripts/analyze_bundle.py
python .claude/skills/backend-reviewer/scripts/validate_migration.py migrations/new_migration.sql
python .claude/skills/security-auditor/scripts/check_exposed_secrets.py src/
```

## Contributing

When adding new patterns or best practices:

1. **Update the relevant skill's SKILL.md**
2. **Add detailed references** in `references/` directory
3. **Create helper scripts** in `scripts/` if applicable
4. **Document in this README**

## Resources

- [Claude Code Skills Documentation](https://docs.claude.com/claude-code/skills)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [DescuentosUY Architecture](../../ARCHITECTURE.md)
- [DescuentosUY Context](../../CONTEXT.md)
