'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// El tipo de dato que este componente recibe (una sucursal con todos los datos)
type Promotion = {
  id: string;
  name: string;
  value: number;
  card_issuer: string;
};

type Branch = {
  store_id: string;
  branch_id: string;
  store_name: string;
  branch_name: string;
  latitude: number | null;
  longitude: number | null;
  logo_url?: string | null;
  distance_km?: number | null;
  max_discount_value?: number | null;
  promotions?: Promotion[];
  address?: string | null;
};

type MapLoaderProps = {
  stores: Branch[]; // La prop se sigue llamando 'stores' pero contiene sucursales
  height?: string | number;
};

// Este componente ahora solo necesita pasar los 'stores' (sucursales) al mapa.
export function MapLoader({ stores, height }: MapLoaderProps) {
  const Map = useMemo(() => dynamic(
    () => import('@/components/Map').then((mod) => mod.Map),
    {
      ssr: false,
      loading: () => <p className="text-center p-10">Cargando mapa...</p>,
    }
  ), []);

  // Solo pasamos los stores (sucursales) al mapa.
  return <Map stores={stores} height={height} />;
}
