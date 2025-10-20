import Link from 'next/link';

type HomeMapPreviewProps = {
  href: string;
};

export function HomeMapPreview({ href }: HomeMapPreviewProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-slate-900 to-slate-800 px-8 py-12 text-white shadow-lg sm:px-12 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">Mapa interactivo</p>
              <h2 className="text-3xl font-bold leading-tight lg:text-4xl">Visualizá todos los locales en el mapa</h2>
              <p className="text-base leading-relaxed text-gray-300 lg:text-lg">
                Explorá sucursales cercanas, calculá distancias en tiempo real y obtené direcciones con un solo clic.
              </p>
            </div>
            <div>
              <Link
                href={href}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-lg transition-all hover:bg-gray-50"
              >
                Abrir mapa completo
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
              <div className="relative h-56 bg-gradient-to-br from-gray-700 to-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" fill="none" className="h-full w-full">
                  <rect width="300" height="220" fill="#1e293b" />
                  <path d="M24 48c52 10 75 40 120 38s66-28 132-18" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                  <path d="M28 158c44-30 88-24 118-8s70 32 126 18" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
                  <g fill="#0ea5e9">
                    <circle cx="92" cy="88" r="8" opacity="0.8" />
                    <circle cx="168" cy="126" r="8" opacity="0.8" />
                    <circle cx="236" cy="72" r="8" opacity="0.8" />
                  </g>
                </svg>
              </div>
              <div className="border-t border-gray-700 bg-gray-900/80 px-4 py-3 text-xs text-gray-400">
                Vista previa del mapa interactivo
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
