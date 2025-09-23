import { Suspense } from 'react';
import Link from 'next/link';
import { LocationHandler } from '@/components/LocationHandler';
import { StoreList } from '@/components/StoreList';
import { createPublicClient } from '@/utils/supabase/server';
import type { Promotion, Store } from '@/components/StoreCard';
import { HomeHero, HomeHighlights, HomeBenefits, HomeMapPreview, HomeCTA } from '@/components/home';

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
    <div className="bg-gray-50 min-h-screen">
      <LocationHandler />

      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-bold text-purple-700">
            DescuentosUY
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <Link href="#top-promos" className="hover:text-purple-600">
              Destacados
            </Link>
            <Link href={mapHref} className="inline-flex items-center gap-1 rounded-full border border-purple-200 px-3 py-1 text-purple-700 transition hover:bg-purple-600 hover:text-white">
              Ver mapa
              <span aria-hidden>&rarr;</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <HomeHero />

        <section className="-mt-12">
          <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl sm:p-8">
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
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="default">Recomendados</option>
                  <option value="max_discount">Mayor descuento</option>
                  <option value="distance">Cercanía</option>
                </select>
              </div>
              <div className="md:w-auto">
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-purple-700 md:w-auto"
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </section>

        <HomeHighlights topDiscounts={topDiscountStores} nearby={nearbyStores} userLocation={userLocation} />

        <HomeBenefits />

        <HomeMapPreview href={mapHref} />

        <section className="space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-gray-900">Todos los locales con beneficios</h2>
            <p className="text-sm text-gray-600">
              Explorá el listado completo y abrí la ficha para ver horarios, teléfonos y promociones adicionales.
            </p>
          </div>
          <Suspense fallback={<div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Cargando locales...</div>}>
            <StoreList stores={uniqueStores} query={query} userLocation={userLocation} />
          </Suspense>
        </section>

        <HomeCTA />
      </main>
    </div>
  );
}

