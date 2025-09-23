
'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

// Importamos el archivo de configuración de iconos de Leaflet
import '@/utils/leafletIconSetup';
import { defaultLeafletIcon } from '@/utils/leafletIconSetup';
import { LocationStatus } from '@/components/LocationStatus';

// El tipo de dato que este componente recibe (una sucursal con todos los datos)
type Promotion = {
  id: string;
  name: string;
  value: number;
  card_issuer: string;
  card_type?: string;
  card_tier?: string;
};

type Branch = {
  store_id: string;
  branch_id: string;
  store_name: string;
  branch_name: string;
  latitude: number | null;
  longitude: number | null;
  logo_url?: string | null;
  address?: string | null;
  distance_km?: number | null;
  max_discount_value?: number | null;
  promotions?: Promotion[];
};

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
          <span
            style="
              display:flex;
              align-items:center;
              justify-content:center;
              width:24px;
              height:24px;
              border-radius:9999px;
              background:rgba(124, 58, 237, 0.9);
              border:3px solid #ffffff;
              box-shadow:0 0 6px rgba(124, 58, 237, 0.75);
            "
          >
            <span
              style="
                width:8px;
                height:8px;
                border-radius:9999px;
                background:#ffffff;
                display:block;
              "
            ></span>
          </span>
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
    <div className="relative">
      <MapContainer
        center={mapCenter}
        zoom={14}
        style={{ height: mapHeight, width: '100%', borderRadius: '8px' }}
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
      {stores && stores.map((branch) => {
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

          return (
            <Marker
              key={branch.branch_id}
              position={[branch.latitude, branch.longitude]}
              icon={storeMarkerIcon}
            >
              <Popup className="map-branch-popup" minWidth={240} maxWidth={240} offset={[0, -8]}>
                <div className="w-56 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-11 w-11 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                      {branch.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={branch.logo_url}
                          alt={`${branch.store_name} logo`}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                          Sin logo
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {branch.store_name}
                      </p>
                      <p className="text-xs text-gray-500 leading-tight">{branch.branch_name}</p>
                      {addressLabel && (
                        <p className="text-xs text-gray-400 leading-tight">{addressLabel}</p>
                      )}
                      <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
                        {distanceLabel && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 font-medium text-purple-600">
                            <svg
                              aria-hidden
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-3.5 w-3.5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {distanceLabel}
                          </span>
                        )}
                        {promoCountLabel && (
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-purple-700">
                            {promoCountLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md bg-purple-50 p-3">
                    {topPromotion ? (
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          {promoValueLabel && (
                            <span className="text-xl font-extrabold text-purple-700">{promoValueLabel}</span>
                          )}
                          <span className="text-sm font-semibold text-gray-900 leading-tight">
                            {promoTitleLabel || 'Promocion activa'}
                          </span>
                        </div>
                        {promoIssuerLabel && (
                          <p className="text-xs text-purple-700 leading-tight">{promoIssuerLabel}</p>
                        )}
                        {promoMetaLabel && (
                          <p className="text-xs text-purple-500 leading-tight">{promoMetaLabel}</p>
                        )}
                        {promoCountLabel && (
                          <p className="text-[11px] text-purple-500 leading-tight">{promoCountLabel}</p>
                        )}
                      </div>
                    ) : maxDiscount != null ? (
                      <p className="text-sm font-semibold text-purple-700 leading-tight">
                        Hasta {maxDiscount}% de descuento
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 leading-tight">Promocion en proceso de carga.</p>
                    )}
                  </div>

                  <Link
                    href={detailHref}
                    className="flex items-center justify-between gap-3 rounded-md border border-purple-200 bg-white px-3 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-600 hover:text-white"
                  >
                    {ctaLabel}
                    <span aria-hidden>→</span>
                  </Link>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Como llegar
                    <svg
                      aria-hidden
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.25A1 1 0 009 15.75V11a1 1 0 112 0v4.75a1 1 0 00.725.962l5 1.25a1 1 0 001.169-1.409l-7-14z" />
                    </svg>
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
      </MapContainer>
      <LocationStatus />
    </div>
  );
}
