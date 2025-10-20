import Link from 'next/link';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-600 px-4 py-12 text-white shadow-2xl shadow-brand-500/20 sm:px-6 md:px-10 md:py-16">
      <div className="absolute -left-24 top-1/2 hidden h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-3xl lg:block" aria-hidden />
      <div className="absolute -right-20 -top-16 h-48 w-48 rounded-full bg-accent-400/40 blur-3xl" aria-hidden />
      <div className="absolute left-1/2 top-1/4 h-32 w-32 -translate-x-1/2 rounded-full bg-brand-300/20 blur-2xl" aria-hidden />

      <div className="relative mx-auto flex max-w-4xl flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 shadow-lg backdrop-blur-sm">
            <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Descuentos verificados en Montevideo
          </span>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Descubrí promociones cerca tuyo y ahorrá en cada salida
          </h1>
          <p className="text-base leading-relaxed text-white/90 sm:text-lg lg:text-xl">
            DescuentosUY reúne beneficios de locales, bancos y tarjetas en un único mapa inteligente. Ajustá tu ubicación, filtrá por emisores y elegí la mejor promo antes de salir.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#top-promos"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-brand-700 shadow-xl transition-all duration-200 hover:scale-105 hover:bg-brand-50 hover:shadow-2xl active:scale-95"
            >
              Ver descuentos destacados
            </Link>
            <Link
              href="/mapa"
              className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white hover:bg-white/10"
            >
              Abrir mapa interactivo
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div className="relative mx-auto w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent-300/30 blur-2xl" aria-hidden />
            <div className="relative flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Promoción destacada</p>
                  <h2 className="bg-gradient-to-r from-white to-accent-100 bg-clip-text text-3xl font-black text-transparent">Hasta 35% OFF</h2>
                </div>
                <span className="rounded-full bg-gradient-to-r from-accent-400/30 to-brand-400/30 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg backdrop-blur-sm ring-1 ring-white/30">
                  Ejemplo
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/80">
                Refiná tu ubicación para ver cuánto ahorrás en cada sucursal. Calculamos distancias en tiempo real y sincronizamos datos con Google Places.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-xs font-medium uppercase text-white/70">Sucursales activas</p>
                  <p className="text-2xl font-bold text-white">128</p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-xs font-medium uppercase text-white/70">Promos verificadas</p>
                  <p className="text-2xl font-bold text-white">310</p>
                </div>
              </div>
              <p className="text-xs font-medium text-white/60">
                *Ejemplo ilustrativo. Los datos reales se actualizan al cargar la aplicación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
