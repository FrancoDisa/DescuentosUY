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
      <div id="top-promos" className="space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Mejores descuentos</p>
          <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">Los descuentos más altos esta semana</h2>
          <p className="max-w-2xl text-base text-gray-600">
            Encontramos las promociones con mayor porcentaje de ahorro para que aproveches al máximo.
          </p>
        </header>
        {topDiscounts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {topDiscounts.map((store) => (
              <StoreCard key={store.branch_id} store={store} userLocation={userLocation} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500">
            No hay descuentos destacados disponibles en este momento.
          </div>
        )}
      </div>

      {nearby.length > 0 && (
        <div className="space-y-6">
          <header className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent-600">Cerca de vos</p>
            <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl">Locales cercanos con promociones</h2>
            <p className="max-w-2xl text-base text-gray-600">
              Según tu ubicación, estos son los locales más cercanos con beneficios activos.
            </p>
          </header>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {nearby.map((store) => (
              <StoreCard key={store.branch_id} store={store} userLocation={userLocation} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
