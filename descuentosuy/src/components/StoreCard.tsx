import Image from 'next/image';
import Link from 'next/link';

// src/components/StoreCard.tsx

// Tipos simplificados solo para lo que la tarjeta necesita
export type Promotion = {
  id: string;
  name: string;
  value: number;
  card_issuer: string;
  card_type: string;
  card_tier: string;
  description: string;
};

export type Store = {
  id: string;
  branch_id: string; // ID único de la sucursal
  name: string;
  logo_url: string | null;
  promotions: Promotion[];
  distance_km?: number; // Añadimos la distancia como opcional
};

// El componente de la tarjeta para un solo local, ahora envuelto en un Link
export function StoreCard({ store }: { store: Store }) {
  return (
    <Link href={`/local/${store.id}`} className="block h-full">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 flex flex-col h-full">
        {/* Logo del Local */}
        <div className="relative h-40 bg-gray-200 flex items-center justify-center">
          {store.logo_url ? (
            <Image 
              src={store.logo_url} 
              alt={`${store.name} logo`} 
              fill={true}
              style={{ objectFit: 'contain' }}
              className="p-4"
            />
          ) : (
            <span className="text-gray-500">Logo no disponible</span>
          )}
        </div>

        <div className="p-6 flex-grow flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{store.name}</h2>

          {/* Mostramos la distancia si está disponible */}
          {store.distance_km != null && (
            <div className="flex items-center text-gray-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>Aprox. a {store.distance_km.toFixed(1)} km</span>
            </div>
          )}

          <div className="space-y-3 flex-grow">
            {store.promotions && store.promotions.length > 0 ? (
              store.promotions.map((promo) => (
                <div key={promo.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-bold text-lg text-purple-600">{promo.value}% <span className="text-gray-700 font-semibold">{promo.name}</span></p>
                  <p className="text-sm text-gray-600 mt-1"><strong>Emisor:</strong> {promo.card_issuer}</p>
                  <p className="text-sm text-gray-600"><strong>Tarjetas:</strong> {promo.card_tier}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No hay promociones asignadas a este local.</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
