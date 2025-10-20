'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { OpeningHours } from './OpeningHours';
import { calculateDistance } from '@/utils/distance';

// Tipos de datos que el componente recibe
type Promotion = {
  id: string;
  name: string;
  value: number;
  card_issuer: string;
  card_type: string;
  card_tier: string;
};

type BranchDetails = {
  rating: number | null;
  user_ratings_total: number | null;
  phone_number: string | null;
  opening_hours: { open_now?: boolean; weekday_text?: string[] } | null;
};

type Branch = {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  branch_details: BranchDetails | null;
  distance?: number; // La distancia se calculará en el cliente
};

export type Store = {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
  promotions: Promotion[];
  branches: Branch[];
};

// El componente ahora es un CLIENT component que solo renderiza y maneja estado
export function StoreDetail({ store }: { store: Store }) {
  const [sortOrder, setSortOrder] = useState<'distance' | 'rating'>('distance');
  const searchParams = useSearchParams();
  
  const userLat = searchParams.get('lat');
  const userLon = searchParams.get('lon');

  // Usamos useMemo para calcular y ordenar las sucursales eficientemente
  const sortedBranches = useMemo(() => {
    const branchesWithDistance = store.branches.map(branch => {
      let distance;
      if (userLat && userLon && branch.latitude && branch.longitude) {
        distance = calculateDistance(parseFloat(userLat), parseFloat(userLon), branch.latitude, branch.longitude);
      }
      return { ...branch, distance };
    });

    return branchesWithDistance.sort((a, b) => {
      if (sortOrder === 'distance') {
        return (a.distance ?? Infinity) - (b.distance ?? Infinity);
      } else if (sortOrder === 'rating') {
        return (b.branch_details?.rating ?? 0) - (a.branch_details?.rating ?? 0);
      }
      return 0;
    });
  }, [store.branches, sortOrder, userLat, userLon]);

  return (
    <>
      <div className="flex items-start gap-6">
        <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-brand-200/50 bg-gradient-to-br from-white to-brand-50 shadow-lg shadow-brand-500/10 flex items-center justify-center flex-shrink-0">
          {store.logo_url ? (
            <Image
              src={store.logo_url}
              alt={`${store.name} logo`}
              fill={true}
              style={{ objectFit: 'contain' }}
              className="p-2"
            />
          ) : (
            <span className="text-gray-500 text-sm font-semibold">Sin logo</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-gray-900">{store.name}</h1>
          {store.website && (
            <a href={store.website} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 text-brand-600 font-semibold transition-colors hover:text-brand-700">
              Visitar sitio web
              <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
            </a>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Sección de Promociones */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Promociones Disponibles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {store.promotions.length > 0 ? (
              store.promotions.map((promo) => (
                <div key={promo.id} className="group relative overflow-hidden rounded-2xl border border-brand-200/50 bg-gradient-to-br from-white to-brand-50/30 p-5 shadow-lg shadow-brand-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10">
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent-200/20 blur-xl" aria-hidden />
                  <div className="relative">
                    <p className="mb-2">
                      <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-2xl font-black text-transparent">{promo.value}%</span>{' '}
                      <span className="text-lg font-semibold text-gray-900">{promo.name}</span>
                    </p>
                    <p className="text-sm font-medium text-gray-600"><strong>Emisor:</strong> {promo.card_issuer}</p>
                    <p className="text-sm text-gray-600"><strong>Tarjetas:</strong> {promo.card_tier}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">No hay promociones específicas para este local.</p>
            )}
          </div>
        </div>

        {/* Sección de Sucursales */}
        <div>
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-3xl font-bold text-gray-900">Sucursales</h2>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'distance' | 'rating')}
              className="rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-100"
            >
              <option value="distance">Ordenar por Cercanía</option>
              <option value="rating">Ordenar por Rating</option>
            </select>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {sortedBranches.length > 0 ? (
              sortedBranches.map((branch) => (
                <div key={branch.id} className="rounded-2xl border border-brand-100/50 bg-white p-6 shadow-lg shadow-brand-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{branch.name}</h3>
                    {branch.distance != null && (
                       <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-500/10 to-accent-500/10 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200/50 whitespace-nowrap">
                         <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                           <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                         </svg>
                         {branch.distance.toFixed(1)} km
                       </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{branch.address}</p>
                  {branch.branch_details?.phone_number && (
                    <a href={`tel:${branch.branch_details.phone_number.replace(/\s/g, '')}`} className="group inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
                      </svg>
                      {branch.branch_details.phone_number}
                    </a>
                  )}
                  {branch.branch_details?.rating !== null &&
                    branch.branch_details?.rating !== undefined && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1">
                          <span className="text-yellow-500 text-lg">★</span>
                          <span className="font-bold text-gray-900">{branch.branch_details.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({branch.branch_details.user_ratings_total} reseñas)</span>
                      </div>
                    )}
                  <OpeningHours openingHours={branch.branch_details?.opening_hours ?? null} />
                </div>
              ))
            ) : (
              <p className="col-span-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">No se encontraron sucursales para este local.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
