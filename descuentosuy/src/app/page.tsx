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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-brand-50/20">
      <LocationHandler />

      <header className="sticky top-0 z-40 border-b border-brand-100/50 bg-white/80 shadow-sm shadow-brand-500/5 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2 text-lg font-bold text-brand-700 transition-colors hover:text-brand-600">
            <svg className="h-6 w-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
            DescuentosUY
          </Link>
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link href="#top-promos" className="hidden text-gray-600 transition-colors hover:text-brand-600 sm:block">
              Destacados
            </Link>
            <Link href={mapHref} className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-gradient-to-r from-brand-50 to-accent-50 px-4 py-2 text-brand-700 shadow-sm transition-all duration-300 hover:border-brand-300 hover:shadow-md hover:shadow-brand-500/20">
              Ver mapa
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <HomeHero />

        <section className="-mt-12">
          <div className="mx-auto max-w-4xl rounded-3xl border border-brand-100/50 bg-white p-4 shadow-2xl shadow-brand-500/10 sm:p-6 md:p-8">
            <form method="GET" action="/" className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <label htmlFor="query" className="text-sm font-semibold text-gray-700">
                  Buscar locales o promociones
                </label>
                <input
                  id="query"
                  type="search"
                  name="query"
                  defaultValue={query || ''}
                  placeholder="Ej: hamburguesa, cafe, Santander..."
                  className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-700 shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
                />
              </div>
              <div className="md:w-56">
                <label htmlFor="sort" className="text-sm font-semibold text-gray-700">
                  Ordenar resultados
                </label>
                <select
                  id="sort"
                  name="sort"
                  defaultValue={sort || 'default'}
                  className="mt-2 w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-700 shadow-sm transition-all duration-200 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
                >
                  <option value="default">Recomendados</option>
                  <option value="max_discount">Mayor descuento</option>
                  <option value="distance">Cercanía</option>
                </select>
              </div>
              <div className="md:w-auto">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-200 hover:from-brand-700 hover:to-accent-700 hover:shadow-xl hover:shadow-brand-500/40 active:scale-95 md:w-auto"
                >
                  Buscar
                </button>
              </div>
            </form>
            <div className="mt-6">
              <FilterChips />
            </div>
          </div>
        </section>

        <HomeHighlights topDiscounts={topDiscountStores} nearby={nearbyStores} userLocation={userLocation} />

        <HomeBenefits />

        <HomeMapPreview href={mapHref} />

        <section className="space-y-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">Todos los locales con beneficios</h2>
            <p className="text-base text-gray-600">
              Explorá el listado completo y abrí la ficha para ver horarios, teléfonos y promociones adicionales.
            </p>
          </div>
          <Suspense fallback={<div className="rounded-2xl border border-brand-200/50 bg-gradient-to-br from-brand-50 to-accent-50/30 p-8 text-center text-sm font-medium text-brand-700 shadow-lg">Cargando locales...</div>}>
            <StoreList stores={uniqueStores} query={query} userLocation={userLocation} />
          </Suspense>
        </section>

        <HomeCTA />
      </main>
    </div>
  );
}

