import Link from 'next/link';
import { Map, ArrowRight, Check } from 'lucide-react';

type HomeMapPreviewProps = {
  href: string;
};

export function HomeMapPreview({ href }: HomeMapPreviewProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 lg:p-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="relative z-10 grid gap-12 lg:grid-cols-2 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
              Mapa interactivo
            </div>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Visualizá todos los locales en una sola vista
            </h2>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              Filtrá por distancia, banco emisor, categoría de comercio o cantidad de promociones. Calculamos rutas y te mostramos qué tarjeta te conviene usar en cada punto.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              'Distancias calculadas con geolocalización precisa',
              'Pop ups con beneficios destacados y contacto del local',
              'Direcciones listas para abrir en Google Maps'
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href={href}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-primary font-bold shadow-lg hover:bg-white/90 transition-colors"
          >
            <Map className="w-5 h-5" />
            Abrir mapa completo
          </Link>
        </div>

        <div className="relative lg:h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-white/5 backdrop-blur-sm p-2">
          <div className="w-full h-full rounded-xl bg-secondary/20 flex items-center justify-center relative overflow-hidden">
            {/* Abstract Map Representation */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-80"></div>
            <div className="relative z-10 text-center p-6">
              <Map className="w-16 h-16 mx-auto text-white/50 mb-4" />
              <p className="text-white/70 font-medium">Vista previa del mapa</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
