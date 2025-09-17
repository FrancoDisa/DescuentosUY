'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export function LocationHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Si ya tenemos lat y lon en la URL, no hacemos nada.
    if (searchParams.has('lat') && searchParams.has('lon')) {
      return;
    }

    // Pedimos la ubicación al usuario
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Creamos los nuevos parámetros de búsqueda manteniendo los existentes
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.set('lat', latitude.toString());
        currentParams.set('lon', longitude.toString());

        // Redirigimos a la misma página pero con las coordenadas en la URL
        router.push(`/?${currentParams.toString()}`);
      },
      (error) => {
        // Opcional: manejar el caso en que el usuario deniega el permiso
        console.error("Error getting location:", error);
      }
    );
  }, [searchParams, router]);

  // Este componente no renderiza nada visualmente
  return null;
}
