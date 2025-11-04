# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DescuentosUY is a Next.js 15 application that helps users find discounts in Montevideo using an interactive map. The app combines Supabase (PostgreSQL with PostGIS), Google Maps/Places APIs, and geolocation to show stores and promotions sorted by proximity and relevance.

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack (recommended)
npm run dev:webpack      # Start dev server with Webpack

# Testing & Building
npm test                 # Run Vitest unit tests
npm run lint             # Run ESLint
npm run build            # Production build
npm start                # Start production server
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key for client access
- `SUPABASE_SERVICE_ROLE_KEY` - Secret key for admin operations (API routes only)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps/Places/Geocoding API key

## Architecture

### Next.js App Router Structure

The app uses Next.js 15 App Router with Server Components by default:

- **`/` (home)**: Store listing with search, filters, and geolocation-based sorting
- **`/local/[id]`**: Store detail page with Google Places enriched data
- **`/mapa`**: Full-screen interactive Leaflet map view
- **`/admin/cargar`**: Protected admin panel for CRUD operations

Key patterns:
- Pages use `export const dynamic = 'force-dynamic'` to bypass static generation
- Suspense boundaries wrap async components for progressive loading
- URL searchParams (`?query=X&sort=Y&lat=Z&lon=W`) drive component state

### Database Schema

PostGIS extension enabled for geospatial calculations.

**Core tables:**
- `stores` - Brand/merchant entities (name, logo, description)
- `branches` - Physical locations with coordinates (latitude, longitude, google_place_id)
- `promotions` - Reusable discount templates (value, card_issuer, card_type, card_tier)
- `store_promotions` - Junction table for many-to-many store-promotion relationships
- `branch_details` - Cached Google Places data (phone, rating, opening_hours) with 3-month TTL

**Critical RPC function:**
`search_stores(search_term, sort_option, user_lat, user_lon)` returns denormalized branches with:
- Joined promotion data
- Calculated `distance_km` via PostGIS `ST_Distance`
- Sorting: default (recommended), max_discount, distance (nearest)

### Supabase Client Patterns

**Two server-side clients exist** (`src/utils/supabase/server.ts`):

1. `createClient(cookieStore)` - SSR-safe client using cookies (@supabase/ssr)
   - Use for: Authenticated operations (when auth is implemented)
   - Requires: `const cookieStore = cookies()`

2. `createPublicClient()` - Public client using SSR pattern without cookies
   - Use for: Public, unauthenticated operations on the server
   - Preferred for: Pages with searchParams (home, map, store detail)
   - Implementation: Uses `createServerClient` with empty cookie handlers
   - Follows official @supabase/ssr pattern for public operations

**Client-side:** `src/utils/supabase/client.ts`
- Browser client for interactive features (admin panel, real-time updates)
- Uses `createBrowserClient` from @supabase/ssr

**Middleware** (`src/middleware.ts`):
- Session refresh middleware (prepared for future authentication)
- Currently handles no active sessions but ready for auth implementation
- Required by @supabase/ssr for proper session management

### Geolocation Architecture

**Flow:**
1. `LocationHandler` (client component) requests browser geolocation on mount
2. Uses `watchPosition()` with 5-second debounce for accuracy refinement
3. Updates URL: `?lat=X&lon=Y`
4. Stores metadata in sessionStorage via `locationStorage.ts`:
   - `GEO_META_KEY`: `{ lat, lon, accuracy, updatedAt, source }`
   - Cross-component sync via custom `GEO_STATE_EVENT`
5. Server pages read `lat`/`lon` from searchParams → pass to `search_stores()` RPC

**Manual override:**
- `LocationStatus` component allows postal address input
- Geocodes via Google Geocoding API → updates sessionStorage + URL

### API Routes

All routes use Service Role Key for admin operations:

**`/api/find-branches-google` (GET)**
- Search single store name in Google Places Text Search
- Input: `?storeName=X`
- Returns: `GooglePlaceSearchResult[]` with place_id, name, address, coordinates

**`/api/find-potential-branches` (POST)**
- Batch search multiple store names
- Input: `{ storeNames: string[] }`
- Returns: `{ results: { [storeName]: GooglePlaceSearchResult[] } }`

**`/api/import-branches` (POST)**
- Bulk import branches to database
- Creates/finds store → inserts branches → links promotions
- Input: `{ storeName, promotionIds, branches }`

**`/api/update-branch-details` (GET)**
- Syncs Google Places enriched data (phone, rating, hours)
- Caching: Skips branches updated < 3 months ago
- Updates both `branches` (coordinates) and `branch_details` (contact info)

### Google Maps/Places Integration

**APIs used:**
1. **Text Search** - Find branches by name (find-branches-google, import flow)
2. **Details API** - Enrich with phone, rating, hours (update-branch-details)
3. **Geocoding API** - Convert addresses to coordinates (LocationStatus component)
4. **Maps JavaScript API** - Display map (via Leaflet wrapper)

**Rate limiting:** Details API called serially (no parallelization) to avoid quota exhaustion.

### Admin Panel Workflow

`/admin/cargar/page.tsx` has three-tab interface:

1. **Manage Promotions** - CRUD promotions (name, value, issuer, tier)
2. **Associate Promotions** - Link promotions to stores via junction table
3. **Import Branches (Bulk CSV)**:
   - Upload CSV with store names
   - Call `/api/find-potential-branches` → display Google Places results
   - Multi-select checkboxes to confirm matches
   - Call `/api/import-branches` → save to DB

### Map Component Architecture

`Map` component (client-side) uses React-Leaflet:
- **Marker clustering** via leaflet.markercluster
- **`RecenterOnUser`** subcomponent: Fits bounds to include user + all branches
- **`ClusterManager`** subcomponent: Dynamically manages cluster groups
- **Popups**: Compact cards with store info, top promotion, "view full" link

## Important Patterns

### Data Fetching in Server Pages

```typescript
const { query, sort, lat, lon } = await searchParams;
const supabase = createPublicClient(); // Use public client for searchParams pages
const { data } = await supabase.rpc('search_stores', {
  search_term: query || '',
  sort_option: sort || 'default',
  user_lat: lat ? parseFloat(lat) : null,
  user_lon: lon ? parseFloat(lon) : null
});
```

### Client Component Type Definitions

Types are typically defined inline in component files (no central `types.ts`):

```typescript
type Promotion = {
  id: string; name: string; value: number;
  card_issuer: string; card_type: string; card_tier: string;
};

type Store = {
  id: string; branch_id: string; name: string;
  logo_url: string | null; promotions: Promotion[];
  distance_km?: number;
};
```

### Error Handling

- API routes return NextResponse with appropriate status codes (400, 500, 207)
- Client interactions use Sonner toast notifications (success/error)
- Geolocation errors logged to console (no user-facing error boundary)

### Coordinate Validation

Database check constraints enforce valid coordinates:
- Latitude: [-90, 90]
- Longitude: [-180, 180]

## Key Architectural Decisions

1. **No separate backend** - Jamstack pattern with Supabase + Next.js API routes only
2. **PostGIS for distance** - DB calculates distances, not client-side (performance)
3. **Service Role Key in API routes** - Enables admin operations without exposing to client
4. **3-month Google Places cache** - Prevents redundant API calls via `branch_details` table
5. **SessionStorage for location** - Persists geolocation metadata without backend storage
6. **Dual Supabase clients** - Public client avoids hydration issues with searchParams
7. **searchParams as state** - URL drives filters, sort, and location (shareable links)

## Preparación para Autenticación (Futuro)

El proyecto está **preparado** para agregar autenticación cuando sea necesario. Todo el código SSR sigue las mejores prácticas oficiales.

### Código ya implementado y listo:
- ✅ Middleware de session refresh (`src/middleware.ts`)
- ✅ Cliente SSR con cookies (`createClient` en `src/utils/supabase/server.ts`)
- ✅ Cliente browser (`createClient` en `src/utils/supabase/client.ts`)

### Para activar autenticación:

1. **Habilitar Auth en Supabase**:
   - Configurar providers (Email, Google, GitHub, etc.) en Supabase Dashboard
   - Configurar redirect URLs en Settings > Auth

2. **Crear páginas de autenticación**:
   ```typescript
   // app/login/page.tsx
   // app/signup/page.tsx
   ```

3. **Proteger rutas** (descomentar en `middleware.ts:60-65`):
   ```typescript
   if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
     const url = request.nextUrl.clone()
     url.pathname = '/login'
     return NextResponse.redirect(url)
   }
   ```

4. **Usar el cliente autenticado**:
   ```typescript
   // En Server Components que requieren auth
   const cookieStore = cookies()
   const supabase = createClient(cookieStore)
   const { data: { user } } = await supabase.auth.getUser()
   ```

**Nota**: El middleware actual no afecta el rendimiento porque simplemente verifica sesiones que no existen (retorna null inmediatamente).

## Database Migrations

When modifying schema:
1. Create migration in Supabase dashboard or via CLI
2. Test locally with branch database if available
3. Deploy to production via Supabase migration tools
4. Update RPC functions if query logic changes

### Pending Migration (CRITICAL) ⚠️

**Location**: `supabase/migrations/20250104_enable_rls_security.sql`

**Must be applied before production deployment**

This migration fixes critical security issues:
- Enables Row Level Security (RLS) on all public tables
- Creates public read-only access policies
- Restricts write operations to Service Role Key only
- Fixes function search_path vulnerabilities

**Security Model**:
- `SELECT`: Public access for `anon` and `authenticated` roles
- `INSERT/UPDATE/DELETE`: Only via Service Role Key (API routes use this)

**To apply**:
1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of `supabase/migrations/20250104_enable_rls_security.sql`
3. Execute the migration
4. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`

**Impact**: Zero downtime, no code changes required, significantly improves security posture.

See `supabase/migrations/README.md` for detailed instructions and validation steps.

## Google API Quota Management

- Text Search: Limited by quota (import flow can be rate-limited)
- Details API: Called serially in `/api/update-branch-details` (avoid parallel calls)
- Geocoding: Client-side, user-triggered (manual location override)
- Enable required APIs in Google Cloud Console: Maps, Places, Geocoding

## Testing

- Unit tests use Vitest + @testing-library/react
- Example tests: `FilterChips.test.tsx`, `StoreCard.test.tsx`, `OpeningHours.test.tsx`
- Run individual test: `npm test -- <filename>`
