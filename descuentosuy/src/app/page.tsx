import { Suspense } from 'react';
import Link from 'next/link';
import { LocationHandler } from '@/components/LocationHandler';
import { StoreList } from '@/components/StoreList';
import { createPublicClient } from '@/utils/supabase/server';
import type { Promotion, Store } from '@/components/StoreCard';
import { HomeHero, HomeHighlights, HomeBenefits, HomeMapPreview, HomeCTA, FilterChips } from '@/components/home';

export const dynamic = 'force-dynamic';

type Branch = {
  store_id: string;
  branch_id: string;
  store_name: string;
  branch_name: string;
  logo_url: string | null;
  promotions: Promotion[];
  max_discount_value: number | null;
  distance_km: number | null;
  latitude: number | null;
  longitude: number | null;
};

type SearchParams = {
  query?: string;
  sort?: string;
  lat?: string;
  lon?: string;
};

function getMaxPromotionValue(promotions: Promotion[]): number {
  if (!promotions || promotions.length === 0) {
    return 0;
  }
  return promotions.reduce((acc, promo) => {
    const value = typeof promo.value === 'number' ? promo.value : 0;
    return value > acc ? value : acc;
  }, 0);
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { query, sort, lat, lon } = await searchParams;

  const userLocation = lat || lon ? { lat, lon } : undefined;

  const supabase = createPublicClient();

  const { data, error } = await supabase.rpc('search_stores', {
    search_term: query || '',
    sort_option: sort || 'default',
    user_lat: lat ? parseFloat(lat) : null,
    user_lon: lon ? parseFloat(lon) : null,
  });

  if (error) {
    return <p className="p-8 text-center text-red-500">Error al cargar los datos: {error.message}</p>;
  }

  const branches = (data as Branch[] | null) ?? [];

  const uniqueStoresMap = new Map<string, Store>();
  for (const branch of branches) {
    const existing = uniqueStoresMap.get(branch.store_id);
    const branchDistance = branch.distance_km;
    const existingDistance = existing?.distance_km;
    if (
      !existing ||
      (branchDistance != null && existingDistance == null) ||
      (branchDistance != null && existingDistance != null && branchDistance < existingDistance)
    ) {
      uniqueStoresMap.set(branch.store_id, {
        id: branch.store_id,
        branch_id: branch.branch_id,
        name: branch.store_name,
        logo_url: branch.logo_url,
        promotions: branch.promotions,
        distance_km: branch.distance_km ?? undefined,
      });
    }
  }
  const uniqueStores = Array.from(uniqueStoresMap.values());

  const topDiscountStores = uniqueStores
    .map((store) => ({ store, score: getMaxPromotionValue(store.promotions) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ store }) => store);

  const nearbyStores = uniqueStores
    .filter((store) => store.distance_km != null)
    .sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity))
    .slice(0, 6);

  const mapParams = new URLSearchParams();
  if (query) {
    mapParams.set('query', query);
  }
  if (sort) {
    mapParams.set('sort', sort);
  }
  if (lat) {
    mapParams.set('lat', lat);
  }
  if (lon) {
    mapParams.set('lon', lon);
  }
  const mapHref = mapParams.size > 0 ? `/mapa?${mapParams.toString()}` : '/mapa';

  return (
    <div className="min-h-screen bg-gray-50">
      <LocationHandler />

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-xl font-black text-gray-900 transition-colors hover:text-brand-600">
            <svg className="h-7 w-7 text-brand-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="currentColor"/>
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            DescuentosUY
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="#top-promos" className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:block">
              Destacados
            </Link>
            <Link href={mapHref} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
              Ver mapa
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <HomeHero />

        <section className="-mt-8">
          <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
            <form method="GET" action="/" className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 space-y-2">
                  <label htmlFor="query" className="text-sm font-medium text-gray-700">
                    Buscar locales o promociones
                  </label>
                  <input
                    id="query"
                    type="search"
                    name="query"
                    defaultValue={query || ''}
                    placeholder="Ej: hamburguesa, cafe, Santander..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div className="md:w-48">
                  <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                    Ordenar por
                  </label>
                  <select
                    id="sort"
                    name="sort"
                    defaultValue={sort || 'default'}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="default">Recomendados</option>
                    <option value="max_discount">Mayor descuento</option>
                    <option value="distance">Cercanía</option>
                  </select>
                </div>
                <div className="flex items-end md:w-auto">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 md:w-auto"
                  >
                    Buscar
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <FilterChips />
              </div>
            </form>
          </div>
        </section>

        <HomeHighlights topDiscounts={topDiscountStores} nearby={nearbyStores} userLocation={userLocation} />

        <HomeBenefits />

        <HomeMapPreview href={mapHref} />

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">Todos los locales con beneficios</h2>
            <p className="text-base text-gray-600">
              Explorá el listado completo y hacé clic en cualquier local para ver horarios, teléfonos y promociones adicionales.
            </p>
          </div>
          <Suspense fallback={<div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">Cargando locales...</div>}>
            <StoreList stores={uniqueStores} query={query} userLocation={userLocation} />
          </Suspense>
        </section>

        <HomeCTA />
      </main>
    </div>
  );
}

