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
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-100/50 bg-white shadow-lg shadow-brand-500/5 transition-all duration-300 hover:-translate-y-2 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/10 md:hover:-translate-y-2">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50 p-6">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-200/20 blur-2xl" aria-hidden />
          <div className="relative flex items-center gap-4">
            <div className="group-hover:scale-110 relative h-16 w-16 overflow-hidden rounded-2xl border border-white/70 bg-white shadow-lg transition-transform duration-300">
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
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-500/10 to-accent-500/10 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-200/50">
                    <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {store.distance_km.toFixed(1)} km
                  </span>
                )}
              </div>
              {topPromotion?.card_issuer && (
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{topPromotion.card_issuer}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6">
          {topPromotion ? (
            <div className="relative overflow-hidden rounded-2xl border border-brand-200/50 bg-gradient-to-br from-brand-50 to-accent-50/30 p-4 shadow-sm">
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-accent-200/30 blur-xl" aria-hidden />
              <div className="relative flex items-baseline gap-3">
                {promoValueLabel && <span className="bg-gradient-to-br from-brand-600 to-accent-600 bg-clip-text text-3xl font-black text-transparent">{promoValueLabel}</span>}
                <p className="text-sm font-semibold text-gray-900">{topPromotion.name}</p>
              </div>
              {promoMeta && <p className="mt-2 text-xs font-medium text-gray-600">{promoMeta}</p>}
              {topPromotion.description && (
                <p className="mt-2 text-xs leading-relaxed text-gray-600">{topPromotion.description}</p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-4 text-sm text-gray-500">
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
                    <li key={promo.id} className="rounded-xl border border-brand-100/50 bg-gradient-to-r from-white to-brand-50/30 px-3 py-2 shadow-sm">
                      <span className="font-semibold text-brand-700">{Math.round(promo.value)}% </span>
                      <span className="text-gray-700">{promo.name}</span>
                      {extraMeta && <span className="text-gray-500"> / {extraMeta}</span>}
                    </li>
                  );
                })}
                {extraPromotions.length > 3 && (
                  <li className="text-xs text-gray-400">y {extraPromotions.length - 3} promos más...</li>
                )}
              </ul>
            </div>
          )}
        </div>
        <footer className="flex items-center justify-between border-t border-brand-100/50 bg-gradient-to-r from-brand-50/50 to-accent-50/30 px-6 py-4 text-sm font-semibold text-brand-700 transition-colors duration-300 group-hover:from-brand-100 group-hover:to-accent-100/50">
          Ver detalles del local
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
        </footer>
      </article>
    </Link>
  );
}

