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
        <div className="relative h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
          {store.logo_url ? (
            <Image 
              src={store.logo_url} 
              alt={`${store.name} logo`} 
              fill={true}
              style={{ objectFit: 'contain' }}
              className="p-2"
            />
          ) : (
            <span className="text-gray-500 text-sm">Sin logo</span>
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold text-gray-900">{store.name}</h1>
          {store.website && (
            <a href={store.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline mt-1 font-semibold">
              Visitar sitio web ↗
            </a>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Sección de Promociones */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Promociones Disponibles</h2>
          <div className="space-y-4">
            {store.promotions.length > 0 ? (
              store.promotions.map((promo) => (
                <div key={promo.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <p className="font-bold text-lg text-purple-600">{promo.value}% <span className="text-gray-700 font-semibold">{promo.name}</span></p>
                  <p className="text-sm text-gray-600 mt-1"><strong>Emisor:</strong> {promo.card_issuer}</p>
                  <p className="text-sm text-gray-600"><strong>Tarjetas:</strong> {promo.card_tier}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No hay promociones específicas para este local.</p>
            )}
          </div>
        </div>

        {/* Sección de Sucursales */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Sucursales</h2>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'distance' | 'rating')}
              className="shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="distance">Ordenar por Cercanía</option>
              <option value="rating">Ordenar por Rating</option>
            </select>
          </div>
          <div className="space-y-4">
            {sortedBranches.length > 0 ? (
              sortedBranches.map((branch) => (
                <div key={branch.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-md text-gray-800">{branch.name}</p>
                    {branch.distance != null && (
                       <p className="text-sm text-gray-500 font-medium">Aprox. a {branch.distance.toFixed(1)} km</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{branch.address}</p>
                  {branch.branch_details?.phone_number && (
                    <a href={`tel:${branch.branch_details.phone_number.replace(/\s/g, '')}`} className="block text-sm text-gray-600 mt-2 hover:text-purple-600">
                      <span className="font-semibold">Tel:</span> {branch.branch_details.phone_number}
                    </a>
                  )}
                  {branch.branch_details?.rating !== null &&
                    branch.branch_details?.rating !== undefined && (
                      <div className="flex items-center mt-2 text-sm">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 font-bold">{branch.branch_details.rating}</span>
                        <span className="ml-1 text-gray-500">({branch.branch_details.user_ratings_total} reseñas)</span>
                      </div>
                    )}
                  <OpeningHours openingHours={branch.branch_details?.opening_hours ?? null} />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No se encontraron sucursales para este local.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
