'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { GEO_DENIED_KEY, markGeoDenied, saveGeoMeta } from '@/utils/locationStorage';

export function LocationHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const hasRequestedRef = useRef(false);
  const watchIdRef = useRef<number | null>(null);
  const lastCoordsRef = useRef<{ lat: number; lon: number; accuracy?: number } | null>(null);

  const applyLocation = useCallback((latitude: number, longitude: number, { replace }: { replace: boolean }) => {
    const currentSearch = typeof window !== 'undefined' ? window.location.search : searchParams.toString();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
    const currentParams = new URLSearchParams(currentSearch);
    currentParams.set('lat', latitude.toString());
    currentParams.set('lon', longitude.toString());

    const queryString = currentParams.toString();
    const url = queryString ? `${currentPath}?${queryString}` : currentPath;
    if (replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  }, [pathname, router, searchParams]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const handleGeoError = (phase: 'initial' | 'watch', error: GeolocationPositionError | null | unknown) => {
    const action = phase === 'initial' ? 'obtener la ubicación inicial' : 'actualizar la ubicación';

    if (!error || typeof error !== 'object') {
      console.warn(`[LocationHandler] No se pudo ${action}: error sin detalles.`);
      return;
    }

    const geoError = error as GeolocationPositionError;
    const details = { code: geoError.code, message: geoError.message };

    if (typeof window !== 'undefined' && geoError.code === geoError.PERMISSION_DENIED) {
      markGeoDenied();
      console.warn(`[LocationHandler] Permiso denegado al intentar ${action}.`, details);
      return;
    }

    if (geoError.code === geoError.TIMEOUT) {
      console.warn(`[LocationHandler] No se pudo ${action}: la solicitud expiró.`, details);
      return;
    }

    if (geoError.code === geoError.POSITION_UNAVAILABLE) {
      console.warn(`[LocationHandler] No se pudo ${action}: posición no disponible.`, details);
      return;
    }

    console.error(`[LocationHandler] No se pudo ${action}: error desconocido.`, details);
  };

  useEffect(() => {
    // Si ya tenemos lat y lon en la URL, no hacemos nada.
    if (searchParams.has('lat') && searchParams.has('lon')) {
      return;
    }

    if (hasRequestedRef.current) {
      return;
    }

    hasRequestedRef.current = true;

    // Si ya hubo un rechazo previo guardado en la sesión, evitamos volver a pedirlo.
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(GEO_DENIED_KEY) === 'true') {
      return;
    }

    // Pedimos la ubicación al usuario
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          lastCoordsRef.current = { lat: latitude, lon: longitude, accuracy };
          applyLocation(latitude, longitude, { replace: false });
          if (typeof window !== 'undefined') {
            saveGeoMeta({
              lat: latitude,
              lon: longitude,
              accuracy,
              updatedAt: Date.now(),
              source: 'gps',
            });
          }

          watchIdRef.current = navigator.geolocation.watchPosition(
            (update) => {
              const { latitude: newLat, longitude: newLon, accuracy: newAccuracy } = update.coords;
              const last = lastCoordsRef.current;

              const hasImprovedAccuracy =
                typeof newAccuracy === 'number' &&
                (last?.accuracy == null || newAccuracy < last.accuracy - 10);

              const distanceMoved =
                !last
                  ? Infinity
                  : Math.sqrt(
                      (newLat - last.lat) * (newLat - last.lat) +
                      (newLon - last.lon) * (newLon - last.lon)
                    ) * 111_139; // aprox metros

              if (hasImprovedAccuracy || distanceMoved > 20) {
                lastCoordsRef.current = { lat: newLat, lon: newLon, accuracy: newAccuracy };
                applyLocation(newLat, newLon, { replace: true });
                if (typeof window !== 'undefined') {
                  saveGeoMeta({
                    lat: newLat,
                    lon: newLon,
                    accuracy: newAccuracy,
                    updatedAt: Date.now(),
                    source: 'gps',
                  });
                }

                if (typeof newAccuracy === 'number' && newAccuracy <= 30) {
                  stopWatching();
                }
              }
            },
            (error) => {
              handleGeoError('watch', error);
              stopWatching();
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 20_000,
            }
          );
        },
        (error) => {
          handleGeoError('initial', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5_000,
          timeout: 20_000,
        }
      );
    } else {
      console.warn('Geolocalización no soportada por el navegador.');
    }
  }, [applyLocation, router, searchParams, stopWatching]);

  useEffect(() => () => {
    stopWatching();
  }, [stopWatching]);

  // Este componente no renderiza nada visualmente
  return null;
}
