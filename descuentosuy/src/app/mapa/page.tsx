import Link from 'next/link';
import { LocationHandler } from '@/components/LocationHandler';
import { MapLoader } from '@/components/MapLoader';
import { createPublicClient } from '@/utils/supabase/server';

type Promotion = {
  id: string;
  name: string;
  value: number;
  card_issuer: string;
  card_type?: string;
  card_tier?: string;
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
  address?: string | null;
};

type SearchParams = {
  query?: string;
  sort?: string;
  lat?: string;
  lon?: string;
};

export const dynamic = 'force-dynamic';

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
      <div className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Link href="/?" className="text-purple-600 hover:text-purple-800">&larr; Volver al inicio</Link>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900">Mapa de descuentos</h1>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-red-600 shadow">
            No pudimos cargar el mapa: {error.message}
          </p>
        </main>
      </div>
    );
  }

  const branches = (data as Branch[] | null) ?? [];

  const listParams = new URLSearchParams();
  if (query) {
    listParams.set('query', query);
  }
  if (sort) {
    listParams.set('sort', sort);
  }
  if (lat) {
    listParams.set('lat', lat);
  }
  if (lon) {
    listParams.set('lon', lon);
  }
  const listHref = listParams.size > 0 ? `/?${listParams.toString()}` : '/?';

  return (
    <div className="bg-gray-50 min-h-screen">
      <LocationHandler />
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Link href="/?" className="text-purple-600 hover:text-purple-800">&larr; Volver al inicio</Link>
          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Mapa de descuentos</h1>
              <p className="text-sm text-gray-500">Explora sucursales cercanas y afina tu ubicación en tiempo real.</p>
            </div>
            <Link
              href={listHref}
              className="inline-flex items-center justify-center rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-600 hover:text-white"
            >
              Ver lista de locales
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <MapLoader stores={branches} height="75vh" />
        </div>
      </main>
    </div>
  );
}
