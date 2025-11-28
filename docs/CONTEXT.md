# Project Context

## App Overview
- Next.js 15 (App Router) app lives in `descuentosuy/` with routes under `src/app/`.
- Supabase provides data (stores/branches/promotions) via RPC `search_stores`; Google APIs supply geocoding/Places info.
- Front page (`/`) now usa componentes de `src/components/home/` (hero, búsqueda, destacados, beneficios y CTA) y reserva el mapa completo para `/mapa`.
- `/mapa` ofrece experiencia full-screen preservando búsqueda y parámetros de ubicación.

## Key Client Components
- `LocationHandler`: requests high-accuracy geolocation, stores session metadata, updates `lat/lon` URL params.
- `LocationStatus`: overlay showing precision/age, supports manual address geocode or raw coordinates and clears denied state.
- `MapLoader` + `Map`: dynamic Leaflet map with user marker, per-branch popups (logo, promos, CTA, Google Maps link) and shared `fitBounds` logic.
- `StoreList` + `StoreCard`: deduplicate branches into unique stores, show promotions and nearest distance when available.
- Home sections en `src/components/home/`: hero narrativo, destacados (top descuentos + cercanos), bloque de beneficios, preview del mapa y CTA comunidad.
- `StoreDetail`: client component fed by server side fetch (`/local/[id]`), re-sorts branches by distance/rating and renders Places data.

## Server/Data Utilities
- `src/utils/supabase/server.ts`: `createPublicClient` for anonymous server calls (RPC) and `createClient` for authenticated contexts.
- `src/utils/locationStorage.ts`: sessionStorage helpers for geo meta/denied flags.
- `/api/update-branch-details`: service-role route to refresh branch coordinates plus cached Google Places details on a 3-month cadence.

## Core Flows
1. **Listado principal**: `LocationHandler` añade coordenadas -> `search_stores` devuelve sucursales -> se deduplican en `StoreList` y se generan destacados (top descuentos, cercanos) antes del listado completo.
2. **Mapa**: comparte feed de sucursales, navega entre `/` y `/mapa` manteniendo `query/sort/lat/lon`; popups habilitan "Como llegar" y CTA a detalle.
3. **Ajuste manual**: `LocationStatus` guarda origen `manual`, reescribe params y fuerza recarga de datos (lista + mapa).

## Documentation Status
- `README.md`, `ARCHITECTURE.md`, `ROADMAP.md` y `TODOLIST.md` reflejan vista de mapa, geolocalizacion y sincronizacion.
- `AGENTS.md` resume convenciones de repositorio.

## Known Gaps
- Bloqueado: filtros avanzados en UI/consulta hasta actualizar Next mas alla de `v15.5.2` (`TODOLIST` 4.3).
- Futuro: autenticacion, perfiles de tarjetas, filtros automaticos, aportes de comunidad (epica 3).
- Test suite aun inexistente; confiar en QA manual (`npm run dev`) y lint (`npm run lint`).

## Operativa Actual
- `npm run dev` para el servidor de desarrollo (Turbopack); `npm run lint` verificado en la ultima ejecucion.
- Requiere `.env.local` con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
\n## Next Steps\n- Revisar layout mobile (hero + formulario) y ajustar espaciados/typography segun resultado.\n- Diseñar chips de filtros rapidos (placeholder) listos para habilitar cuando se resuelva bug de Next sobre searchParams.\n- Monitorear issue #76499 de Next.js antes de implementar filtros avanzados.\n
