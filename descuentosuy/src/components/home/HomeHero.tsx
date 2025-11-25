import Link from 'next/link';
import { MapPin, ArrowRight, Info } from 'lucide-react';

const stats = [
  { label: 'Sucursales activas', value: '128' },
  { label: 'Promociones verificadas', value: '310+' },
  { label: 'Descuento promedio', value: '35%' },
];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-primary/5 border border-primary/10 p-8 sm:p-12 lg:p-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background border border-primary/20 shadow-sm mx-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
          </span>
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            En vivo desde Montevideo
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-foreground">
            Un mapa vivo con los <br className="hidden sm:block" />
            <span className="text-primary">beneficios reales</span> que podés usar hoy
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Cruzamos datos oficiales, aportes de la comunidad y señales en tiempo real para que descubras dónde conviene pagar con tu banco o tarjeta.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/mapa"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Abrir mapa interactivo
          </Link>
          <Link
            href="#beneficios"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-background border border-border text-foreground font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
          >
            <Info className="w-5 h-5" />
            Ver cómo funciona
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-border/50 mt-12">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <dt className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {stat.value}
              </dt>
              <dd className="text-sm font-medium text-muted-foreground uppercase tracking-wide mt-1">
                {stat.label}
              </dd>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
