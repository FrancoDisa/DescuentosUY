import Link from 'next/link';
import { MapPin } from 'lucide-react';

const footerLinks = [
  {
    title: 'Explorar',
    links: [
      { label: 'Mapa interactivo', href: '/mapa' },
      { label: 'Beneficios', href: '/#beneficios' },
      { label: 'Sucursales destacadas', href: '/#top-promos' },
    ],
  },
  {
    title: 'Comunidad',
    links: [
      { label: 'Sugerir promoción', href: 'mailto:hola@descuentosuy.com' },
      { label: 'Sumar tu marca', href: 'mailto:hola@descuentosuy.com' },
      { label: 'Panel admin', href: '/admin/cargar' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Buscar locales', href: '/mapa?sort=distance' },
      { label: 'Política de privacidad', href: '#' },
      { label: 'Términos', href: '#' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-secondary/50 border-t border-border pt-16 pb-8">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-4 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-heading font-bold text-lg text-foreground">
                DescuentosUY
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Plataforma abierta para mapear descuentos reales en Montevideo. Información colaborativa y validada con datos públicos.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border border-border shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-medium text-foreground">Hecho en Uruguay</span>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-heading font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} DescuentosUY • Datos colaborativos y fuentes abiertas
          </p>
          <div className="flex items-center gap-4">
            {/* Social links could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
