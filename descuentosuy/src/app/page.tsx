import { Suspense } from 'react';
import { StoreList } from '@/components/StoreList';
import { LocationHandler } from '@/components/LocationHandler';
import { MapLoader } from '@/components/MapLoader';
import { createPublicClient } from '@/utils/supabase/server';
import type { Store, Promotion } from '@/components/StoreCard';

export const dynamic = 'force-dynamic';

// El tipo de dato que ahora devuelve la RPC (una sucursal con datos del local)
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

type PageProps = {
  searchParams: { 
    query?: string;
    sort?: string;
    lat?: string;
    lon?: string;
  };
};

export default async function Home({ searchParams }: PageProps) {
  const { query, sort, lat, lon } = searchParams;

  const userLocation = lat || lon ? { lat, lon } : undefined;

  const supabase = createPublicClient();

  // 1. Obtenemos la lista de SUCURSALES
  const { data, error } = await supabase.rpc<Branch[]>('search_stores', {
    search_term: query || '',
    sort_option: sort || 'default',
    user_lat: lat ? parseFloat(lat) : null,
    user_lon: lon ? parseFloat(lon) : null,
  });

  if (error) {
    return <p className="p-8 text-center text-red-500">Error al cargar los datos: {error.message}</p>;
  }

  const branches = data ?? [];

  // 2. Creamos una lista de LOCALES únicos para la vista de tarjetas
  const uniqueStoresMap = new Map<string, Store>();
  for (const branch of branches) {
    const existing = uniqueStoresMap.get(branch.store_id);
    // Si no hemos visto este local, o si esta sucursal está más cerca que la guardada, la reemplazamos.
    if (!existing || (branch.distance_km != null && existing.distance_km != null && branch.distance_km < existing.distance_km)) {
      uniqueStoresMap.set(branch.store_id, {
        id: branch.store_id,
        branch_id: branch.branch_id,
        name: branch.store_name, // Usamos el nombre del LOCAL
        logo_url: branch.logo_url,
        promotions: branch.promotions,
        distance_km: branch.distance_km,
      });
    }
  }
  const uniqueStores = Array.from(uniqueStoresMap.values());

  return (
    <div className="bg-gray-50 min-h-screen">
      <LocationHandler /> 

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center text-gray-900">DescuentosUY</h1>
          <p className="text-center text-gray-600 mt-2">Encuentra los mejores descuentos en tus locales favoritos.</p>
          
          <div className="mt-6 max-w-2xl mx-auto">
            <form method="GET" action="/" className="flex flex-col sm:flex-row gap-2">
              <input
                type="search"
                name="query"
                defaultValue={query || ''}
                placeholder="Busca por local o promoción (ej: hamburguesa, pizza...)"
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <select
                name="sort"
                defaultValue={sort || 'default'}
                className="shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="default" disabled>Ordenar por...</option>
                <option value="max_discount">Mayor Descuento</option>
                <option value="distance">Cercanía</option>
              </select>
              <button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Buscar
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* 3. Pasamos la lista COMPLETA de sucursales al mapa */}
        <MapLoader stores={branches} />
      </div>

      <main className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center col-span-full"><p>Cargando locales...</p></div>}>
          {/* 4. Pasamos la lista de locales ÚNICOS a la lista de tarjetas */}
          <StoreList stores={uniqueStores} query={query} userLocation={userLocation} />
        </Suspense>
      </main>
    </div>
  );
}
