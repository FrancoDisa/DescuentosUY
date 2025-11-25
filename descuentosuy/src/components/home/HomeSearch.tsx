import { FilterChips } from './FilterChips';
import { Suspense } from 'react';
import { Search, MapPin } from 'lucide-react';

type HomeSearchProps = {
  query?: string;
  sort?: string;
  variant?: 'default' | 'compact';
  title?: string;
  description?: string;
  action?: string;
};

export function HomeSearch({
  query,
  sort,
  variant = 'default',
  title = 'Encontrá tu descuento perfecto',
  description = 'Buscá por categoría, cercanía o tipo de tarjeta. Miles de beneficios se actualizan cada semana.',
  action = '/',
}: HomeSearchProps) {
  const isCompact = variant === 'compact';

  return (
    <section
      id="search"
      className={`bg-background border border-border rounded-3xl ${isCompact ? 'p-6' : 'p-8 sm:p-12'
        } shadow-sm space-y-8`}
    >
      <div className="max-w-2xl space-y-4">
        <div className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-semibold text-secondary-foreground uppercase tracking-wide">
          Buscador inteligente
        </div>
        <h2 className={`font-heading font-bold text-foreground ${isCompact ? 'text-2xl' : 'text-3xl sm:text-4xl'}`}>
          {title}
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
      </div>

      <form method="GET" action={action} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="query"
              name="query"
              type="search"
              defaultValue={query || ''}
              placeholder="Hamburguesas, café, súper, banco..."
              className="w-full h-14 rounded-2xl border border-input bg-background pl-12 pr-4 text-base placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm hover:border-primary/50"
            />
          </div>

          <div className="relative min-w-[200px]">
            <select
              id="sort"
              name="sort"
              defaultValue={sort || 'default'}
              className="w-full h-14 rounded-2xl border border-input bg-background px-4 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all shadow-sm hover:border-primary/50 appearance-none cursor-pointer"
            >
              <option value="default">Recomendados</option>
              <option value="max_discount">Mayor descuento</option>
              <option value="distance">Más cercano</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            type="submit"
            className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
          >
            Buscar
          </button>
        </div>

        <div className="pt-2">
          <Suspense fallback={<div className="h-8 rounded-lg bg-secondary animate-pulse" />}>
            <FilterChips />
          </Suspense>
        </div>
      </form>

      {!isCompact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/50">
          {['Gastronomía', 'Cafeterías', 'Indumentaria', 'Belleza'].map((category, index) => (
            <div
              key={category}
              className="group p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary hover:border-primary/30 transition-all cursor-pointer flex items-center justify-between"
            >
              <span className="font-medium text-foreground">{category}</span>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                +{(index + 1) * 8}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
