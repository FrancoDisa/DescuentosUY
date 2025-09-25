'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { GeoState } from '@/utils/locationStorage';
import { GEO_STATE_EVENT, clearGeoState, loadGeoState, saveGeoMeta } from '@/utils/locationStorage';

function formatAccuracy(accuracy?: number) {
  if (accuracy == null || Number.isNaN(accuracy)) {
    return 'Precision aproximada';
  }
  if (accuracy <= 5) {
    return 'Precision +/- 5 m';
  }
  if (accuracy <= 15) {
    return 'Precision +/- 15 m';
  }
  return 'Precision +/- ' + Math.round(accuracy) + ' m';
}

function formatRelativeTime(timestamp?: number) {
  if (!timestamp) {
    return '';
  }
  const diff = Date.now() - timestamp;
  if (diff < 60000) {
    return 'hace unos segundos';
  }
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return 'hace ' + minutes + ' min';
  }
  const hours = Math.floor(diff / 3600000);
  return 'hace ' + hours + ' h';
}

function clampValue(value: string) {
  return value.replace(/[^0-9+\-\.]/g, '');
}

async function geocodeAddress(address: string) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Falta la clave de Google Maps (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).');
  }
  const url =
    'https://maps.googleapis.com/maps/api/geocode/json?address=' +
    encodeURIComponent(address) +
    '&components=country:UY&key=' +
    apiKey;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error al consultar la API de Google Maps.');
  }
  const payload = await response.json();
  if (payload.status !== 'OK' || !payload.results || !payload.results.length) {
    throw new Error('No pudimos encontrar esa direccion.');
  }
  const result = payload.results[0];
  const locationType = result.geometry.location_type as string | undefined;
  const estimatedAccuracy = locationType === 'ROOFTOP' ? 15 : 60;
  return {
    lat: result.geometry.location.lat as number,
    lon: result.geometry.location.lng as number,
    accuracy: estimatedAccuracy,
    formattedAddress: result.formatted_address as string | undefined,
  };
}

export function LocationStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [geoState, setGeoState] = useState<GeoState | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLon, setManualLon] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);

  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');

  useEffect(() => {
    setMounted(true);
    setManualLat(latParam ?? '');
    setManualLon(lonParam ?? '');
  }, [latParam, lonParam]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleGeoStateChange = () => {
      setGeoState(loadGeoState());
    };

    window.addEventListener(GEO_STATE_EVENT, handleGeoStateChange);
    return () => window.removeEventListener(GEO_STATE_EVENT, handleGeoStateChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setGeoState(loadGeoState());
  }, [latParam, lonParam]);

  const handleRetry = useCallback(() => {
    clearGeoState();
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('lat');
    nextParams.delete('lon');
    const url = nextParams.toString();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
    router.replace(url ? `${currentPath}?${url}` : currentPath);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, [pathname, router, searchParams]);

  const handleOpenDialog = useCallback(() => {
    setErrors(null);
    setManualAddress('');
    setManualLat(latParam ?? '');
    setManualLon(lonParam ?? '');
    setShowAdvanced(false);
    setIsDialogOpen(true);
  }, [latParam, lonParam]);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleSubmitManual = useCallback(async () => {
    setErrors(null);

    let targetLat: number | null = null;
    let targetLon: number | null = null;
    let accuracy: number | undefined;

    const trimmedLat = manualLat.trim();
    const trimmedLon = manualLon.trim();
    const hasManualCoords = trimmedLat !== '' && trimmedLon !== '';

    try {
      setIsSubmitting(true);

      if (hasManualCoords) {
        const parsedLat = Number(trimmedLat);
        const parsedLon = Number(trimmedLon);
        if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLon)) {
          throw new Error('Latitud o longitud con formato invalido.');
        }
        if (parsedLat < -90 || parsedLat > 90 || parsedLon < -180 || parsedLon > 180) {
          throw new Error('Latitud o longitud fuera de rango permitido.');
        }
        targetLat = parsedLat;
        targetLon = parsedLon;
      } else {
        const trimmedAddress = manualAddress.trim();
        if (!trimmedAddress) {
          throw new Error('Escribe una direccion (ej: Charrua 2515, Montevideo).');
        }
        const result = await geocodeAddress(trimmedAddress);
        targetLat = result.lat;
        targetLon = result.lon;
        accuracy = result.accuracy;
        setManualLat(result.lat.toFixed(6));
        setManualLon(result.lon.toFixed(6));
      }

      if (targetLat == null || targetLon == null) {
        throw new Error('No se pudo determinar la ubicacion.');
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set('lat', targetLat.toString());
      params.set('lon', targetLon.toString());

      const queryString = params.toString();
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
      router.replace(queryString ? `${currentPath}?${queryString}` : currentPath);
      saveGeoMeta({
        lat: targetLat,
        lon: targetLon,
        updatedAt: Date.now(),
        source: 'manual',
        accuracy,
        status: 'granted',
      });
      setIsDialogOpen(false);
    } catch (error) {
      setErrors(error instanceof Error ? error.message : 'Ocurrio un error.');
    } finally {
      setIsSubmitting(false);
    }
  }, [manualAddress, manualLat, manualLon, pathname, router, searchParams]);

  const statusMessage = useMemo(() => {
    if (geoState?.status === 'denied') {
      return 'Permiso de ubicacion denegado';
    }
    if (geoState?.source === 'manual') {
      return 'Ubicacion ajustada manualmente';
    }
    if (!latParam || !lonParam) {
      return 'Buscando tu ubicacion';
    }
    return 'Ubicacion detectada';
  }, [geoState, latParam, lonParam]);

  const accuracyLabel = useMemo(() => {
    if (geoState?.status === 'denied') {
      return 'Habilita los permisos de ubicacion en tu navegador.';
    }
    return formatAccuracy(geoState?.accuracy);
  }, [geoState]);

  const updatedLabel = useMemo(() => formatRelativeTime(geoState?.updatedAt), [geoState]);

  if (!mounted) {
    return null;
  }

  const showOverlay = Boolean(latParam || lonParam || geoState);
  if (!showOverlay) {
    return null;
  }

  const showRetry = geoState?.status === 'denied';

  return (
    <>
      <div className="pointer-events-none absolute bottom-4 left-4 z-[1200] flex max-w-sm text-sm">
        <div className="pointer-events-auto flex w-full flex-col gap-2 rounded-2xl border border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Tu ubicacion</p>
              <p className="text-xs text-gray-600">
                {statusMessage}
                {updatedLabel ? ' · ' + updatedLabel : ''}
              </p>
              <p className="text-xs text-purple-600">{accuracyLabel}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={handleOpenDialog}
                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:border-purple-400 hover:text-purple-600"
              >
                Ajustar
              </button>
              {showRetry && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-purple-700"
                >
                  Reintentar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Refina tu ubicacion</h2>
                <p className="text-sm text-gray-500">
                  Escribe una direccion completa (ej: Charrua 2515, Montevideo) o ingresa coordenadas exactas.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="rounded-full border border-gray-200 px-2 text-lg text-gray-500 hover:border-purple-300 hover:text-purple-600"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Direccion
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(event) => setManualAddress(event.target.value)}
                  placeholder="Ej: Charrua 2515, Montevideo"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                {showAdvanced ? 'Ocultar coordenadas' : 'Ingresar coordenadas manualmente'}
              </button>

              {showAdvanced && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Latitud
                    <input
                      type="text"
                      inputMode="decimal"
                      value={manualLat}
                      onChange={(event) => setManualLat(clampValue(event.target.value))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="-34.90"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    Longitud
                    <input
                      type="text"
                      inputMode="decimal"
                      value={manualLon}
                      onChange={(event) => setManualLon(clampValue(event.target.value))}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="-56.16"
                    />
                  </label>
                </div>
              )}

              {errors && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors}</p>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  clearGeoState();
                  setManualAddress('');
                  setManualLat('');
                  setManualLon('');
                  setErrors(null);
                }}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700"
              >
                Limpiar valores guardados
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-gray-400"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmitManual}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar ubicacion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
