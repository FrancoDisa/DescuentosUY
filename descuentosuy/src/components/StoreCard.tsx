import Image from 'next/image';
import Link from 'next/link';

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
  branch_id: string;
  name: string;
  logo_url: string | null;
  promotions: Promotion[];
  distance_km?: number;
};

export type UserLocation = {
  lat?: string;
  lon?: string;
};

type StoreCardProps = {
  store: Store;
  userLocation?: UserLocation;
};

export function StoreCard({ store, userLocation }: StoreCardProps) {
  const queryParams = new URLSearchParams();

  if (userLocation?.lat) {
    queryParams.set('lat', userLocation.lat);
  }

  if (userLocation?.lon) {
    queryParams.set('lon', userLocation.lon);
  }

  const href = queryParams.size > 0 ? `/local/${store.id}?${queryParams.toString()}` : `/local/${store.id}`;
  const topPromotion = store.promotions?.[0];
  const extraPromotions = store.promotions?.slice(1) ?? [];
  const promoValueLabel = typeof topPromotion?.value === 'number' ? `${Math.round(topPromotion.value)}%` : null;
  const promoMeta = topPromotion ? [topPromotion.card_type, topPromotion.card_tier].filter(Boolean).join(' · ') : '';

  return (
    <Link href={href} className="block h-full">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-brand-300 hover:shadow-lg">
        {/* Discount Hero Section */}
        {topPromotion && promoValueLabel ? (
          <div className="relative border-b border-gray-100 bg-gradient-to-br from-accent-500 to-accent-600 px-6 py-8 text-center">
            <div className="space-y-2">
              <div className="text-6xl font-black text-white">{promoValueLabel}</div>
              <div className="text-sm font-semibold uppercase tracking-wide text-white/90">DE DESCUENTO</div>
            </div>
          </div>
        ) : (
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-8 text-center">
            <div className="text-sm text-gray-500">Promociones disponibles</div>
          </div>
        )}

        {/* Store Info */}
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex items-start gap-3">
            {store.logo_url && (
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <Image
                  src={store.logo_url}
                  alt={`${store.name} logo`}
                  fill
                  sizes="48px"
                  className="object-contain p-1.5"
                />
              </div>
            )}
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-bold text-gray-900">{store.name}</h3>
              {topPromotion?.card_issuer && (
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{topPromotion.card_issuer}</p>
              )}
            </div>
            {store.distance_km != null && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{store.distance_km.toFixed(1)} km</span>
              </div>
            )}
          </div>

          {/* Top Promotion Details */}
          {topPromotion && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-900">{topPromotion.name}</p>
              {promoMeta && <p className="text-xs text-gray-500">{promoMeta}</p>}
              {topPromotion.description && (
                <p className="text-xs leading-relaxed text-gray-600">{topPromotion.description}</p>
              )}
            </div>
          )}

          {/* Extra Promotions */}
          {extraPromotions.length > 0 && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500">
                +{extraPromotions.length} promoción{extraPromotions.length > 1 ? 'es' : ''} más
              </p>
              <ul className="space-y-1.5">
                {extraPromotions.slice(0, 2).map((promo) => (
                  <li key={promo.id} className="flex items-baseline gap-2 text-xs text-gray-600">
                    <span className="font-bold text-accent-600">{Math.round(promo.value)}%</span>
                    <span className="line-clamp-1">{promo.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* CTA Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 text-center text-sm font-semibold text-brand-600 transition-colors group-hover:bg-brand-50">
          Ver detalles completos
        </div>
      </article>
    </Link>
  );
}

