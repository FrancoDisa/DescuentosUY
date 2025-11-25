import type { Store, UserLocation } from '@/components/StoreCard';
import { StoreCard } from '@/components/StoreCard';

export type HomeHighlightsProps = {
  topDiscounts: Store[];
  nearby: Store[];
  userLocation?: UserLocation;
};

export function HomeHighlights({ topDiscounts, nearby, userLocation }: HomeHighlightsProps) {
  return (
    <section className="space-y-16">
      <div id="top-promos" className="space-y-8">
        <header className="space-y-4 max-w-3xl">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary uppercase tracking-wide">
            Mejores descuentos
          </div>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground">
            Los más altos esta semana
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Construimos este ranking con los porcentajes más agresivos reportados por la comunidad y los locales.
          </p>
        </header>

        {topDiscounts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {topDiscounts.map((store) => (
              <StoreCard key={store.branch_id} store={store} userLocation={userLocation} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-12 text-center">
            <p className="text-muted-foreground font-medium">No hay descuentos destacados disponibles en este momento.</p>
          </div>
        )}
      </div>

      {nearby.length > 0 && (
        <div className="space-y-8 pt-8 border-t border-border">
          <header className="space-y-4 max-w-3xl">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-600 uppercase tracking-wide">
              Cerca tuyo
            </div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground">
              Locales con beneficios a menos de 5 km
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Calculamos la distancia usando tu referencia actual o la ubicación ingresada manualmente.
            </p>
          </header>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {nearby.map((store) => (
              <StoreCard key={store.branch_id} store={store} userLocation={userLocation} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
