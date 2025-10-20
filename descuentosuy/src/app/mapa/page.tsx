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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-brand-50/20">
        <header className="border-b border-brand-100/50 bg-white/80 shadow-sm shadow-brand-500/5 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Link href="/?" className="group inline-flex items-center gap-1 text-brand-600 font-semibold transition-colors hover:text-brand-700">
              <span className="transition-transform group-hover:-translate-x-1">&larr;</span>
              Volver al inicio
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Mapa de descuentos</h1>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 px-6 py-4 text-center shadow-lg">
            <p className="font-semibold text-red-900">No pudimos cargar el mapa</p>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </div>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-brand-50/20">
      <LocationHandler />
      <header className="border-b border-brand-100/50 bg-white/80 shadow-sm shadow-brand-500/5 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Link href="/?" className="group inline-flex items-center gap-1 text-brand-600 font-semibold transition-colors hover:text-brand-700">
            <span className="transition-transform group-hover:-translate-x-1">&larr;</span>
            Volver al inicio
          </Link>
          <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 lg:text-4xl">Mapa de descuentos</h1>
              <p className="text-base text-gray-600">Explora sucursales cercanas y afina tu ubicación en tiempo real.</p>
            </div>
            <Link
              href={listHref}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-brand-200 bg-gradient-to-r from-brand-50 to-accent-50 px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm transition-all duration-300 hover:border-brand-300 hover:shadow-md hover:shadow-brand-500/20"
            >
              Ver lista de locales
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-brand-100/50 bg-white shadow-2xl shadow-brand-500/10">
          <MapLoader stores={branches} height="75vh" />
        </div>
      </main>
    </div>
  );
}
