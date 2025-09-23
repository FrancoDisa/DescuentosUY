# Repository Guidelines

## Project Structure & Module Organization
DescuentosUY vive dentro de <code>descuentosuy/</code> como app Next.js. Las rutas en <code>src/app/</code> abarcan <code>admin/</code>, <code>local/</code> y <code>api/</code>; cualquier segmento nuevo debería ubicarse en ese árbol. La UI compartida reside en <code>src/components/</code> (mapa y overlays: <code>Map.tsx</code>, <code>LocationHandler.tsx</code>, <code>LocationStatus.tsx</code>) y las utilidades en <code>src/utils/</code> (<code>supabase/</code>, <code>locationStorage.ts</code>). Los estilos globales viven en <code>src/app/globals.css</code>, mientras que íconos o logos fijos van en <code>public/</code>. Los CSV (<code>stores.csv</code>, <code>branches.csv</code>) sirven como base de datos local.

## Build, Test, and Development Commands
Install dependencies with <code>npm install</code>. Use <code>npm run dev</code> to boot the Turbopack dev server; fall back to <code>npm run dev:webpack</code> if you hit caching issues. Build production bundles via <code>npm run build</code> and sanity-check with <code>npm run start</code>. Run <code>npm run lint</code> before pushing; it applies the Next.js Core Web Vitals rule set declared in <code>eslint.config.mjs</code>.

## Coding Style & Naming Conventions
Escribe componentes en TypeScript siguiendo los patrones modernos de React/Next (ver <code>src/app/page.tsx</code> y <code>src/components/Map.tsx</code>). Usa indentación de 2 espacios, componentes en PascalCase y helpers camelCase. Mantén la lógica Supabase dentro de <code>src/utils/supabase/</code> y la persistencia de geolocalización en <code>src/utils/locationStorage.ts</code>. Prioriza utilidades Tailwind existentes (<code>bg-purple-50</code>, <code>text-gray-600</code>) y exports nominales.

## Maps & Geolocation
El mapa usa Leaflet. Los pines requieren sucursales con <code>logo_url</code>, dirección y promociones para alimentar el popup. `<LocationHandler>` solicita la ubicación con precisión alta, inicia un <code>watchPosition</code> temporal y actualiza los parámetros <code>lat</code>/<code>lon</code>; `<LocationStatus>` muestra precisión/antigüedad y permite refinar con direcciones (geocodificadas con Google) o coordenadas manuales. Si agregas campos nuevos en las promociones, sincroniza los tipos en <code>src/components/Map.tsx</code>, <code>MapLoader.tsx</code> y <code>StoreCard.tsx</code>.

## Testing Guidelines
No automated suite exists yet. Add tests alongside features (<code>src/components/__tests__/StoreList.test.tsx</code>) and use descriptive names (“renders empty state when no branches”). Until then, manually verify search filters, map markers, and Supabase RPC behaviour via <code>npm run dev</code>. Document any new test commands here when you introduce Vitest, Playwright, or similar.

## Commit & Pull Request Guidelines
Commits follow concise present-tense summaries (“Memoize Supabase client in admin page”). Group related changes and avoid multi-feature commits. For PRs, confirm <code>npm run lint</code> passes, explain the change scope, link relevant issues or Notion tasks, and include screenshots or GIFs for UI updates. Note required Supabase env vars and manual QA steps so reviewers can reproduce.

## Environment & Supabase Notes
Create <code>.env.local</code> con <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> (usado para Geocoding/Places) y cualquier secreto adicional. No las publiques. Reutiliza los clientes memoizados de Supabase y, al modificar RPCs como <code>search_stores</code>, alinea los tipos en <code>src/app/page.tsx</code>, <code>src/components/MapLoader.tsx</code> y las tarjetas.
