import Link from 'next/link';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-500 to-purple-800 px-6 py-16 text-white shadow-2xl sm:px-10">
      <div className="absolute -left-24 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" aria-hidden />
      <div className="absolute -right-20 -top-16 h-48 w-48 rounded-full bg-purple-400/30 blur-2xl" aria-hidden />

      <div className="relative mx-auto flex max-w-4xl flex-col gap-10 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-semibold text-white/80">
            <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Descuentos verificados en Montevideo
          </span>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Descubrí promociones cerca tuyo y ahorrá en cada salida
          </h1>
          <p className="text-lg text-white/80 sm:text-xl">
            DescuentosUY reúne beneficios de locales, bancos y tarjetas en un único mapa inteligente. Ajustá tu ubicación, filtrá por emisores y elegí la mejor promo antes de salir.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#top-promos"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-purple-700 shadow-lg transition hover:translate-y-0.5 hover:bg-purple-50"
            >
              Ver descuentos destacados
            </Link>
            <Link
              href="/mapa"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white/90 transition hover:border-white hover:text-white"
            >
              Abrir mapa interactivo
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative mx-auto w-full max-w-sm rounded-2xl bg-white/10 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/70">Promoción destacada</p>
                  <h2 className="text-2xl font-bold">Hasta 35% OFF</h2>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                  Ejemplo
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/70">
                Refiná tu ubicación para ver cuánto ahorrás en cada sucursal. Calculamos distancias en tiempo real y sincronizamos datos con Google Places.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm text-white/70">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs uppercase text-white/50">Sucursales activas</p>
                  <p className="text-lg font-semibold text-white">128</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs uppercase text-white/50">Promos verificadas</p>
                  <p className="text-lg font-semibold text-white">310</p>
                </div>
              </div>
              <p className="text-xs text-white/50">
                *Ejemplo ilustrativo. Los datos reales se actualizan al cargar la aplicación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
