'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// El tipo de dato que este componente recibe (una sucursal con todos los datos)
type Branch = {
  store_id: string;
  branch_id: string;
  store_name: string;
  branch_name: string;
  latitude: number | null;
  longitude: number | null;
};

type MapLoaderProps = {
  stores: Branch[]; // La prop se sigue llamando 'stores' pero contiene sucursales
};

// Este componente ahora solo necesita pasar los 'stores' (sucursales) al mapa.
export function MapLoader({ stores }: MapLoaderProps) {
  const Map = useMemo(() => dynamic(
    () => import('@/components/Map').then((mod) => mod.Map),
    {
      ssr: false,
      loading: () => <p className="text-center p-10">Cargando mapa...</p>,
    }
  ), []);

  // Solo pasamos los stores (sucursales) al mapa.
  return <Map stores={stores} />;
}
