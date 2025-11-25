import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { LocationHandler } from '@/components/LocationHandler';
import { createPublicClient } from '@/utils/supabase/server';
import type { Promotion } from '@/types/domain';
import { StoreCard, type Store } from '@/components/StoreCard';
import { HomeHero, HomeSearch, HomeHighlights, HomeBenefits, HomeMapPreview, HomeCTA, FloatingCTA } from '@/components/home';

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'DescuentosUY - Encuentra los mejores descuentos cerca tuyo',
  description: 'Descubre promociones de locales, bancos y tarjetas en tiempo real. Busca por categoría, ordenamiento y ubicación. Todos tus descuentos en un solo lugar.',
  keywords: ['descuentos', 'promociones', 'uruguay', 'montevideo', 'locales', 'tarjetas'],
  openGraph: {
    title: 'DescuentosUY - Descuentos cerca tuyo',
    description: 'Encuentra las mejores promociones locales en tiempo real',
    type: 'website',
    locale: 'es_UY',
    images: [
      {
        url: 'https://descuentosuy.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DescuentosUY - Descuentos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DescuentosUY - Descuentos cerca tuyo',
    description: 'Encuentra las mejores promociones locales en tiempo real',
  },
  robots: 'index, follow',
};

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

  const supabase = createPublicClient();
  const { data: topDiscountsData, error: topDiscountsError } = await supabase.rpc('search_stores', {
    search_term: '',
    sort_option: 'discount',
    user_lat: null,
    user_lon: null,
  });

  const topDiscounts: Store[] = [];
  if (!topDiscountsError && topDiscountsData) {
    const branches = topDiscountsData as Branch[];
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

    const storesArray = Array.from(uniqueStoresMap.values());
    const sortedByDiscount = storesArray
      .map((store) => {
        const maxDiscount = store.promotions.reduce((max, promo) => {
          const value = typeof promo.value === 'number' ? promo.value : 0;
          return value > max ? value : max;
        }, 0);
        return { store, maxDiscount };
      })
      .filter(({ maxDiscount }) => maxDiscount > 0)
      .sort((a, b) => b.maxDiscount - a.maxDiscount)
      .slice(0, 5)
      .map(({ store }) => store);

    topDiscounts.push(...sortedByDiscount);
  }

  const { data, error } = await supabase.rpc('search_stores', {
    search_term: query || '',
    sort_option: sort || 'default',
    user_lat: lat ? parseFloat(lat) : null,
    user_lon: lon ? parseFloat(lon) : null,
  });

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="rounded-3xl border border-red-100 bg-red-50/70 px-8 py-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-red-700">No pudimos cargar los datos</p>
          <p className="mt-2 text-sm text-red-600">{error.message}</p>
        </div>
      </div>
    );
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

  const userLocation = lat || lon ? { lat, lon } : undefined;

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
    <div className="pb-20">
      <LocationHandler />
      <div className="container-custom space-y-20 py-8">
        <section className="space-y-8">
          <HomeHero />
          <HomeSearch query={query} sort={sort} />
        </section>

        {topDiscounts.length > 0 && (
          <section className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary uppercase tracking-wide">
                  Radar semanal
                </div>
                <h2 className="font-heading font-bold text-3xl text-foreground">
                  Locales con beneficios recién confirmados
                </h2>
              </div>
              <Link
                href="/mapa"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors"
              >
                Ver mapa completo
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {topDiscounts.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </section>
        )}

        <HomeHighlights topDiscounts={topDiscountStores} nearby={nearbyStores} userLocation={userLocation} />
        <HomeMapPreview href={mapHref} />
        <HomeBenefits />
        <HomeCTA />
      </div>
      <FloatingCTA />
    </div>
  );
}


