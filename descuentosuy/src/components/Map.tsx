
'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSearchParams } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// Import the plugin to register markerClusterGroup on L
import 'leaflet.markercluster';

// Importamos el archivo de configuración de iconos de Leaflet
import '@/utils/leafletIconSetup';
import { defaultLeafletIcon } from '@/utils/leafletIconSetup';
import { LocationStatus } from '@/components/LocationStatus';
import type { BranchWithDetails as Branch } from '@/types/domain';

// Re-export Branch type for compatibility with existing code
export type { Branch };

type MapProps = {
  stores: Branch[]; // La prop se sigue llamando 'stores' pero contiene sucursales
  height?: string | number;
};

const defaultPosition: [number, number] = [-34.9011, -56.1645]; // Montevideo

type RecenterOnUserProps = {
  userLat: number | null;
  userLon: number | null;
  branchPositions: Array<[number, number]>;
};

function RecenterOnUser({ userLat, userLon, branchPositions }: RecenterOnUserProps) {
  const map = useMap();

  useEffect(() => {
    const points: Array<[number, number]> = [];
    if (userLat !== null && userLon !== null) {
      points.push([userLat, userLon]);
    }
    points.push(...branchPositions);

    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }

    const bounds = L.latLngBounds(points.map(([lat, lon]) => L.latLng(lat, lon)));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }, [branchPositions, map, userLat, userLon]);

  return null;
}

type ClusterManagerProps = {
  stores: Branch[];
  storeMarkerIcon: L.Icon;
  userQueryParams: URLSearchParams;
  userLat: number | null;
  userLon: number | null;
};

function ClusterManager({ stores, storeMarkerIcon, userQueryParams, userLat, userLon }: ClusterManagerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Crear grupo de clustering proporcionado por leaflet.markercluster
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 80,
      disableClusteringAtZoom: 17,
    });

    // Agregar markers al grupo
    stores.forEach((branch) => {
      if (branch.latitude != null && branch.longitude != null) {
        const topPromotion = branch.promotions?.[0];
        const extraPromotions = Math.max((branch.promotions?.length ?? 0) - 1, 0);
        const distanceLabel = branch.distance_km != null ? branch.distance_km.toFixed(1) + ' km' : null;
        const addressLabel = branch.address ?? null;
        const promoValueLabel =
          typeof topPromotion?.value === 'number' ? Math.round(topPromotion.value).toString() + '%' : null;
        const promoTitleLabel = topPromotion?.name?.trim() || null;
        const promoIssuerLabel = topPromotion?.card_issuer?.trim() || null;
        const promoMetaParts: string[] = [];
        if (topPromotion?.card_type) {
          promoMetaParts.push(topPromotion.card_type.replace(/\s+/g, ' ').trim());
        }
        if (topPromotion?.card_tier) {
          promoMetaParts.push(topPromotion.card_tier.replace(/\s+/g, ' ').trim());
        }
        const promoMetaLabel = promoMetaParts.length > 0 ? promoMetaParts.join(' · ') : null;
        const promoCountLabel = extraPromotions > 0
          ? '+' + extraPromotions + ' promo' + (extraPromotions > 1 ? 's' : '') + ' extra'
          : null;
        const maxDiscount = typeof branch.max_discount_value === 'number'
          ? Math.round(branch.max_discount_value)
          : null;
        const ctaLabel = maxDiscount != null
          ? 'Ver ' + maxDiscount + '% en detalle'
          : 'Ver detalles';
        const directionsUrl = (() => {
          const base = 'https://www.google.com/maps/dir/?api=1';
          const params = new URLSearchParams();
          if (userLat !== null && userLon !== null) {
            params.set('origin', `${userLat},${userLon}`);
          }
          if (branch.latitude != null && branch.longitude != null) {
            params.set('destination', `${branch.latitude},${branch.longitude}`);
          } else if (addressLabel) {
            params.set('destination', addressLabel);
          }
          params.set('travelmode', 'walking');
          return `${base}&${params.toString()}`;
        })();
        const detailHref = (() => {
          if (!branch.store_id) {
            return '#';
          }
          const params = new URLSearchParams(userQueryParams.toString());
          return params.size > 0
            ? `/local/${branch.store_id}?${params.toString()}`
            : `/local/${branch.store_id}`;
        })();

        const popupContent = `
          <div class="w-64 font-sans">
            <div class="flex items-start gap-3 mb-3">
              <div class="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                ${branch.logo_url
            ? `<img src="${branch.logo_url}" alt="${branch.store_name}" class="h-full w-full object-contain p-1" />`
            : '<div class="flex h-full w-full items-center justify-center bg-gray-50 text-[10px] text-gray-400">Sin logo</div>'
          }
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-bold text-gray-900 leading-tight truncate">${branch.store_name}</h3>
                <p class="text-xs text-gray-500 truncate mt-0.5">${branch.branch_name}</p>
                ${addressLabel ? `<p class="text-[10px] text-gray-400 truncate mt-0.5">${addressLabel}</p>` : ''}
              </div>
            </div>
            
            <div class="flex flex-wrap gap-1.5 mb-3">
              ${distanceLabel ? `<span class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-200">📍 ${distanceLabel}</span>` : ''}
              ${promoCountLabel ? `<span class="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 border border-indigo-100">${promoCountLabel}</span>` : ''}
            </div>

            <div class="rounded-lg bg-slate-50 p-2.5 border border-slate-100 mb-3">
              ${topPromotion
            ? `<div class="space-y-1">
                    <div class="flex items-baseline gap-1.5">
                      ${promoValueLabel ? `<span class="text-lg font-bold text-indigo-600">${promoValueLabel}</span>` : ''}
                      <span class="text-xs font-medium text-gray-900 line-clamp-1">${promoTitleLabel || 'Promoción activa'}</span>
                    </div>
                    ${promoIssuerLabel ? `<p class="text-[10px] text-indigo-600 font-medium">${promoIssuerLabel}</p>` : ''}
                    ${promoMetaLabel ? `<p class="text-[10px] text-slate-500">${promoMetaLabel}</p>` : ''}
                  </div>`
            : maxDiscount != null
              ? `<p class="text-sm font-semibold text-indigo-600">Hasta ${maxDiscount}% de descuento</p>`
              : '<p class="text-xs text-gray-500">Sin promociones activas</p>'
          }
            </div>

            <div class="grid grid-cols-2 gap-2">
              <a href="${detailHref}" class="flex items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 shadow-sm">
                Ver detalles
              </a>
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 shadow-sm">
                Ir ahora
                <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3 w-3">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.25A1 1 0 009 15.75V11a1 1 0 112 0v4.75a1 1 0 00.725.962l5 1.25a1 1 0 001.169-1.409l-7-14z" />
                </svg>
              </a>
            </div>
          </div>
        `;

        const marker = L.marker([branch.latitude, branch.longitude], { icon: storeMarkerIcon });
        marker.bindPopup(popupContent, { minWidth: 260, maxWidth: 260, offset: [0, -8] });
        clusterGroup.addLayer(marker);
      }
    });

    // Agregar el grupo al mapa
    map.addLayer(clusterGroup);

    // Cleanup
    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, stores, storeMarkerIcon, userQueryParams, userLat, userLon]);

  return null;
}

export function Map({ stores, height }: MapProps) {
  const searchParams = useSearchParams();
  const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const userLon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : null;

  const mapCenter: [number, number] =
    userLat !== null && userLon !== null ? [userLat, userLon] : defaultPosition;

  const mapHeight = typeof height === 'number' ? `${height}px` : height ?? '500px';

  const branchPositions = useMemo(() => {
    return stores
      .filter((branch) => branch.latitude != null && branch.longitude != null)
      .map((branch) => [branch.latitude as number, branch.longitude as number] as [number, number]);
  }, [stores]);

  const userQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (userLat !== null) {
      params.set('lat', String(userLat));
    }
    if (userLon !== null) {
      params.set('lon', String(userLon));
    }
    return params;
  }, [userLat, userLon]);

  const userMarkerIcon = useMemo(
    () =>
      L.divIcon({
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        html: `
          <div class="relative flex h-6 w-6 items-center justify-center">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span class="relative inline-flex h-4 w-4 rounded-full bg-indigo-600 border-2 border-white shadow-md"></span>
          </div>
        `,
      }),
    []
  );

  const storeMarkerIcon = useMemo(() => {
    const { iconUrl, iconRetinaUrl, shadowUrl } = defaultLeafletIcon;
    const fallbackOptions = L.Icon.Default.prototype.options as {
      iconUrl?: string;
      iconRetinaUrl?: string;
      shadowUrl?: string;
      iconSize?: L.PointExpression;
      iconAnchor?: L.PointExpression;
      popupAnchor?: L.PointExpression;
      shadowSize?: L.PointExpression;
      shadowAnchor?: L.PointExpression;
    };
    const resolvedIconUrl = iconUrl ?? fallbackOptions.iconUrl ?? '';
    const resolvedIconRetina = iconRetinaUrl ?? fallbackOptions.iconRetinaUrl ?? '';
    const resolvedShadowUrl = shadowUrl ?? fallbackOptions.shadowUrl ?? '';
    return L.icon({
      iconUrl: resolvedIconUrl,
      iconRetinaUrl: resolvedIconRetina,
      shadowUrl: resolvedShadowUrl,
      iconSize: fallbackOptions.iconSize ?? [25, 41],
      iconAnchor: fallbackOptions.iconAnchor ?? [12, 41],
      popupAnchor: fallbackOptions.popupAnchor ?? [1, -34],
      shadowSize: fallbackOptions.shadowSize ?? [41, 41],
      shadowAnchor: fallbackOptions.shadowAnchor ?? [12, 41],
    });
  }, []);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: mapHeight, width: '100%', zIndex: 0 }}
      >
        <RecenterOnUser userLat={userLat} userLon={userLon} branchPositions={branchPositions} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Marcador para la ubicación del usuario */}
        {userLat !== null && userLon !== null && (
          <Marker position={[userLat, userLon]} icon={userMarkerIcon}>
            <Popup>Tu ubicación</Popup>
          </Marker>
        )}

        {/* Marcadores para cada sucursal */}
        <ClusterManager stores={stores} storeMarkerIcon={storeMarkerIcon} userQueryParams={userQueryParams} userLat={userLat} userLon={userLon} />
      </MapContainer>
      <LocationStatus />
    </div>
  );
}
