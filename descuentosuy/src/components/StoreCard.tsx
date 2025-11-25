import Image from 'next/image';
import Link from 'next/link';
import type { Promotion } from '@/types/domain';
import { MapPin, ArrowRight, Tag } from 'lucide-react';

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
  address?: string;
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
  const additionalPromos = store.promotions?.slice(1) ?? [];
  const topValue = typeof topPromotion?.value === 'number' ? Math.round(topPromotion.value) : null;
  const promoMeta = topPromotion ? [topPromotion.card_type, topPromotion.card_tier].filter(Boolean).join(' · ') : '';

  return (
    <Link href={href} className="group block h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/30">
        <div className="p-5 flex flex-col gap-4 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {store.logo_url ? (
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-white p-1">
                  <Image
                    src={store.logo_url}
                    alt={`${store.name} logo`}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-secondary text-xs font-medium text-muted-foreground">
                  Logo
                </div>
              )}
              <div>
                <h3 className="font-heading font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {store.name}
                </h3>
                {topPromotion?.card_issuer && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {topPromotion.card_issuer}
                  </p>
                )}
              </div>
            </div>

            {topValue !== null && (
              <div className="flex flex-col items-end">
                <span className="text-2xl font-bold text-primary leading-none">
                  {topValue}%
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  Ahorro
                </span>
              </div>
            )}
          </div>

          {topPromotion && (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                    {topPromotion.name}
                  </p>
                  {promoMeta && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {promoMeta}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!topPromotion && (
            <div className="rounded-lg bg-secondary/50 p-3 text-center text-sm text-muted-foreground">
              Ver promociones disponibles
            </div>
          )}

          {additionalPromos.length > 0 && (
            <div className="mt-auto pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground font-medium">
                +{additionalPromos.length} beneficio{additionalPromos.length > 1 ? 's' : ''} más
              </p>
            </div>
          )}
        </div>

        <div className="bg-secondary/30 px-5 py-3 border-t border-border flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:bg-secondary/50 transition-colors">
          <div className="flex items-center gap-1.5">
            {store.distance_km != null && (
              <>
                <MapPin className="w-3.5 h-3.5" />
                <span>{store.distance_km.toFixed(1)} km</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Ver detalle <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </article>
    </Link>
  );
}
