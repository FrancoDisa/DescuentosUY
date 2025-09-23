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
  const promoValueLabel = typeof topPromotion?.value === 'number' ? `${Math.round(topPromotion.value)}% OFF` : null;
  const promoMeta = topPromotion ? [topPromotion.card_type, topPromotion.card_tier].filter(Boolean).join(' / ') : '';

  return (
    <Link href={href} className="block h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
        <div className="relative bg-gradient-to-r from-purple-100 via-purple-50 to-pink-50 p-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-inner">
              {store.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={`${store.name} logo`}
                  fill
                  sizes="64px"
                  className="object-contain p-2"
                />
              ) : (
                <span className="flex h-full items-center justify-center text-xs font-semibold text-gray-400">
                  Sin logo
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                {store.distance_km != null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-600/10 px-3 py-1 text-xs font-semibold text-purple-700">
                    <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {store.distance_km.toFixed(1)} km
                  </span>
                )}
              </div>
              {topPromotion?.card_issuer && (
                <p className="text-xs uppercase tracking-wide text-purple-600">{topPromotion.card_issuer}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6">
          {topPromotion ? (
            <div className="rounded-2xl border border-purple-100 bg-purple-50/80 p-4">
              <div className="flex items-baseline gap-3">
                {promoValueLabel && <span className="text-3xl font-black text-purple-700">{promoValueLabel}</span>}
                <p className="text-sm font-semibold text-gray-900">{topPromotion.name}</p>
              </div>
              {promoMeta && <p className="mt-2 text-xs text-gray-600">{promoMeta}</p>}
              {topPromotion.description && (
                <p className="mt-2 text-xs leading-relaxed text-gray-500">{topPromotion.description}</p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
              Estamos cargando promociones para este local.
            </div>
          )}

          {extraPromotions.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {extraPromotions.length} beneficio{extraPromotions.length > 1 ? 's' : ''} adicional{extraPromotions.length > 1 ? 'es' : ''}
              </p>
              <ul className="space-y-2 text-xs text-gray-600">
                {extraPromotions.slice(0, 3).map((promo) => {
                  const extraMeta = [promo.card_type, promo.card_tier].filter(Boolean).join(' / ');
                  return (
                    <li key={promo.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                      <span className="font-semibold text-gray-900">{Math.round(promo.value)}% </span>
                      {promo.name}
                      {extraMeta ? ` / ${extraMeta}` : ''}
                    </li>
                  );
                })}
                {extraPromotions.length > 3 && (
                  <li className="text-xs text-gray-400">y {extraPromotions.length - 3} promos mas...</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <footer className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4 text-sm font-semibold text-purple-700 transition group-hover:bg-purple-50">
          Ver detalles del local
          <span aria-hidden className="text-lg">&rarr;</span>
        </footer>
      </article>
    </Link>
  );
}

