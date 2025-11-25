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
      <div className="flex items-start gap-6 animate-fade-in-up">
        <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-brand-300/50 bg-gradient-to-br from-white via-brand-50/30 to-secondary-50/30 shadow-xl transition-all duration-300 hover:scale-105 hover:border-brand-400 hover:shadow-2xl flex items-center justify-center flex-shrink-0">
          {store.logo_url ? (
            <Image
              src={store.logo_url}
              alt={`${store.name} logo`}
              fill={true}
              style={{ objectFit: 'contain' }}
              className="p-3 transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <span className="text-neutral-500 text-sm font-bold">Sin logo</span>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="display-lg text-gradient-blue">{store.name}</h1>
          {store.website && (
            <a href={store.website} target="_blank" rel="noopener noreferrer" className="group inline-flex w-fit items-center gap-2 rounded-2xl border-2 border-brand-300/50 bg-gradient-to-r from-white to-brand-50/30 px-5 py-2.5 font-semibold text-brand-700 shadow-md transition-all hover:border-brand-400 hover:shadow-lg hover:-translate-y-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Visitar sitio web
              <span className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
            </a>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Sección de Promociones */}
        <div className="animate-fade-in-up animate-delay-100">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="display-sm text-gradient-emerald">Promociones Disponibles</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {store.promotions.length > 0 ? (
              store.promotions.map((promo, index) => (
                <div
                  key={promo.id}
                  className="group relative overflow-hidden rounded-2xl border-2 border-brand-200/50 bg-gradient-to-br from-white via-white to-brand-50/40 p-6 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-brand-400 card-glow-blue animate-scale-in"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-accent-400/20 to-brand-400/15 blur-2xl transition-all duration-300 group-hover:scale-150" aria-hidden />
                  <div className="relative space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-brand-500 via-secondary-500 to-accent-500 px-5 py-3 shadow-lg transition-all duration-300 group-hover:scale-110">
                        <span className="heading-xl text-white drop-shadow-md font-black">{Math.round(promo.value)}%</span>
                      </div>
                      <p className="heading-md text-gradient-blue flex-1">{promo.name}</p>
                    </div>
                    <div className="space-y-2 rounded-2xl border border-secondary-200/60 bg-gradient-to-br from-white to-secondary-50/30 p-4">
                      <p className="body-sm text-neutral-700"><strong className="text-brand-700">Emisor:</strong> {promo.card_issuer}</p>
                      <p className="body-sm text-neutral-700"><strong className="text-secondary-700">Tarjetas:</strong> {promo.card_tier}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-gradient-to-br from-white to-neutral-50 p-8 text-center shadow-sm">
                <span className="body-md text-neutral-600 font-semibold">No hay promociones específicas para este local.</span>
              </p>
            )}
          </div>
        </div>

        {/* Sección de Sucursales */}
        <div className="animate-fade-in-up animate-delay-200">
          <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-secondary-600 shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="display-sm text-gradient-indigo">Sucursales</h2>
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'distance' | 'rating')}
              className="rounded-2xl border-2 border-secondary-200/50 bg-gradient-to-r from-white to-secondary-50/30 px-5 py-3 text-sm font-bold text-secondary-700 shadow-md transition-all duration-200 focus:border-secondary-400 focus:outline-none focus:ring-4 focus:ring-secondary-100 hover:shadow-lg"
            >
              <option value="distance">Ordenar por Cercanía</option>
              <option value="rating">Ordenar por Rating</option>
            </select>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {sortedBranches.length > 0 ? (
              sortedBranches.map((branch, index) => (
                <div
                  key={branch.id}
                  className="group rounded-2xl border-2 border-secondary-200/50 bg-gradient-to-br from-white via-white to-secondary-50/30 p-6 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary-400 card-glow-indigo animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="heading-md text-gradient-indigo flex-1">{branch.name}</h3>
                    {branch.distance != null && (
                       <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-500/20 to-accent-500/15 border-2 border-brand-300/50 px-4 py-1.5 text-xs font-bold text-brand-700 shadow-md whitespace-nowrap transition-all group-hover:scale-105">
                         <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                           <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                         </svg>
                         {branch.distance.toFixed(1)} km
                       </span>
                    )}
                  </div>
                  <p className="body-sm text-neutral-700 mb-4 leading-relaxed">{branch.address}</p>
                  {branch.branch_details?.phone_number && (
                    <a href={`tel:${branch.branch_details.phone_number.replace(/\s/g, '')}`} className="group/phone inline-flex items-center gap-2 rounded-2xl border-2 border-brand-200/50 bg-gradient-to-r from-white to-brand-50/30 px-4 py-2 mb-4 text-sm font-semibold text-brand-700 shadow-sm transition-all hover:border-brand-400 hover:shadow-md hover:-translate-y-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
                      </svg>
                      {branch.branch_details.phone_number}
                    </a>
                  )}
                  {branch.branch_details?.rating !== null &&
                    branch.branch_details?.rating !== undefined && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1.5 rounded-full border-2 border-gold-300/60 bg-gradient-to-r from-gold-50 to-yellow-50 px-4 py-1.5 shadow-sm">
                          <span className="text-gold-500 text-lg font-bold">★</span>
                          <span className="font-black text-gold-700">{branch.branch_details.rating}</span>
                        </div>
                        <span className="body-xs text-neutral-600">({branch.branch_details.user_ratings_total} reseñas)</span>
                      </div>
                    )}
                  <OpeningHours openingHours={branch.branch_details?.opening_hours ?? null} />
                </div>
              ))
            ) : (
              <p className="col-span-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-gradient-to-br from-white to-neutral-50 p-8 text-center shadow-sm">
                <span className="body-md text-neutral-600 font-semibold">No se encontraron sucursales para este local.</span>
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
