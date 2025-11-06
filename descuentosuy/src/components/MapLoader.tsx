'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import type { BranchWithDetails as Branch } from '@/types/domain';

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
