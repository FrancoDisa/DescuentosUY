import Link from 'next/link';
import type { Metadata } from 'next';
import { LocationHandler } from '@/components/LocationHandler';
import { MapLoader } from '@/components/MapLoader';
import { StoreList } from '@/components/StoreList';
import { createPublicClient } from '@/utils/supabase/server';
import { HomeSearch } from '@/components/home';
import type { BranchWithDetails, Promotion } from '@/types/domain';
import type { Store } from '@/components/StoreCard';
import { MapPin, List, Filter, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Explorar Descuentos - DescuentosUY',
  description: 'Busca, filtra y encuentra los mejores descuentos en Montevideo. Mapa interactivo y lista completa de locales con promociones.',
  openGraph: {
    title: 'Explorar Descuentos - DescuentosUY',
    description: 'Busca y encuentra descuentos en Montevideo',
    type: 'website',
  },
};

type SearchParams = {
  query?: string;
  sort?: string;
  lat?: string;
  lon?: string;
};

export const dynamic = 'force-dynamic';

function getMaxPromotionValue(promotions: Promotion[]): number {
  if (!promotions || promotions.length === 0) {
    return 0;
  }
  return promotions.reduce((acc, promo) => {
    const value = typeof promo.value === 'number' ? promo.value : 0;
    return value > acc ? value : acc;
  }, 0);
}

export default async function MapPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { query, sort, lat, lon } = await searchParams;

  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc('search_stores', {
    search_term: query || '',
    sort_option: sort || 'default',
    user_lat: lat ? parseFloat(lat) : null,
    user_lon: lon ? parseFloat(lon) : null,
  });

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="rounded-xl border border-red-200 bg-red-50/50 px-8 py-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <MapPin className="h-6 w-6" />
          </div>
          <p className="text-lg font-semibold text-red-900">No pudimos cargar el mapa</p>
          <p className="mt-2 text-sm text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const branches = (data as BranchWithDetails[] | null) ?? [];
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
  const userLocation = lat || lon ? { lat, lon } : undefined;

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col lg:flex-row overflow-hidden bg-background">
      <LocationHandler />

      {/* Sidebar / List View */}
      <div className="flex w-full flex-col border-r border-border bg-background lg:w-[450px] xl:w-[500px] shrink-0">
        <div className="flex-none border-b border-border p-4 lg:p-6 space-y-4 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Explorar Mapa
            </h1>
            <div className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
              {uniqueStores.length} locales
            </div>
          </div>

          <HomeSearch
            query={query}
            sort={sort}
            variant="compact"
            title=""
            description=""
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/5">
          <div className="space-y-6">
            {uniqueStores.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                <StoreList stores={uniqueStores} query={query} userLocation={userLocation} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <Filter className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="font-medium">No se encontraron locales</p>
                <p className="text-sm mt-1">Probá ajustando los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="relative flex-1 bg-muted/10 h-[50vh] lg:h-auto w-full">
        <MapLoader stores={branches} height="100%" />
      </div>
    </div>
  );
}
