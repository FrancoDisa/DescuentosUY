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
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-600">Promociones imperdibles</p>
            <h2 className="text-3xl font-bold text-gray-900">Los descuentos más fuertes de la semana</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Calculamos el beneficio mayor por sucursal y destacamos las oportunidades con mejor porcentaje de ahorro.
            </p>
          </div>
        </header>
        {topDiscounts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {topDiscounts.map((store) => (
              <StoreCard key={store.branch_id} store={store} userLocation={userLocation} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/50 px-6 py-12 text-center text-sm text-purple-700">
            Cargaremos descuentos destacados cuando existan promociones activas.
          </div>
        )}
      </div>

      {nearby.length > 0 && (
        <div className="space-y-6">
          <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">A metros de tu ubicación</p>
              <h2 className="text-3xl font-bold text-gray-900">Sucursales cercanas para pasar hoy</h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Según tu última ubicación detectada, estas son las sucursales más próximas con beneficios vigentes.
              </p>
            </div>
          </header>
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {nearby.map((store) => (
              <StoreCard key={store.branch_id} store={store} userLocation={userLocation} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
