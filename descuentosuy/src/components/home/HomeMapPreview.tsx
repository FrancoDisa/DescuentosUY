import Link from 'next/link';

type HomeMapPreviewProps = {
  href: string;
};

export function HomeMapPreview({ href }: HomeMapPreviewProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gray-900 px-6 py-12 text-white shadow-2xl sm:px-10">
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute -left-16 top-24 h-48 w-48 rounded-full bg-purple-500/40 blur-3xl" />
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-indigo-500/30 blur-3xl" />
      </div>
      <div className="relative mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-200">Mapa inteligente</p>
          <h2 className="text-3xl font-bold leading-tight">Visualizá sucursales, distancias y promos en un mapa dedicado</h2>
          <p className="text-base text-white/80">
            Ajustá tu ubicación, analizá cada pin con promociones activas y abrí la ruta en Google Maps en un solo clic. Conservamos tu búsqueda y orden preferidos.
          </p>
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-purple-100"
          >
            Abrir mapa en pantalla completa
            <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="flex-1">
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur">
            <div className="relative h-56">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" fill="none" className="h-full w-full text-purple-200/30">
                <rect width="300" height="220" rx="24" fill="currentColor" />
                <path d="M24 48c52 10 75 40 120 38s66-28 132-18" stroke="#A855F7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M28 158c44-30 88-24 118-8s70 32 126 18" stroke="#F9A8D4" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <g fill="#FDF4FF">
                  <circle cx="92" cy="88" r="12" />
                  <circle cx="168" cy="126" r="10" />
                  <circle cx="236" cy="72" r="9" />
                </g>
                <g fill="#C084FC">
                  <circle cx="92" cy="88" r="6" />
                  <circle cx="168" cy="126" r="5" />
                  <circle cx="236" cy="72" r="4" />
                </g>
              </svg>
              <div className="absolute inset-4 rounded-2xl border border-white/20" aria-hidden />
            </div>
            <div className="border-t border-white/10 bg-gray-900/40 px-6 py-4 text-sm text-white/70">
              Mostrando sucursales con promos verificadas. Los datos reales se cargan al abrir el mapa.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
