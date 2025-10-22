import Link from 'next/link';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 px-4 py-12 text-white shadow-lg sm:px-8 md:px-12 lg:py-20">
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/95 sm:px-4 sm:py-1.5 sm:text-sm">
                <svg aria-hidden xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 sm:h-4 sm:w-4">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Montevideo, Uruguay
              </div>
              <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Encontrá los mejores descuentos cerca tuyo
              </h1>
              <p className="text-sm leading-relaxed text-white/90 sm:text-lg md:text-xl">
                Descubrí promociones de locales, bancos y tarjetas en tiempo real. Todo en un solo lugar.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row">
              <Link
                href="#top-promos"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl sm:px-8 sm:py-3.5 sm:text-base"
              >
                Ver descuentos
              </Link>
              <Link
                href="/mapa"
                className="group inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white/50 hover:bg-white/10 sm:px-8 sm:py-3.5 sm:text-base"
              >
                Abrir mapa
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Stats */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-md space-y-3 sm:space-y-4">
              {/* Main Stat Card */}
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm sm:p-6">
                <div className="mb-3 flex items-baseline gap-2 sm:mb-4">
                  <span className="text-4xl font-black text-white sm:text-5xl">35%</span>
                  <span className="text-lg font-semibold text-accent-300 sm:text-xl">OFF</span>
                </div>
                <p className="mb-1 text-xs font-semibold text-white sm:mb-2 sm:text-sm">Promociones hasta 35% de descuento</p>
                <p className="text-xs text-white/80">Encontrá los mejores beneficios cerca de tu ubicación</p>
              </div>

              {/* Mini Stats Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:p-4">
                  <p className="text-xl font-bold text-white sm:text-2xl">128</p>
                  <p className="text-xs text-white/80">Sucursales</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:p-4">
                  <p className="text-xl font-bold text-white sm:text-2xl">310+</p>
                  <p className="text-xs text-white/80">Promociones</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
