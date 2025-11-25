'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, MapPin } from 'lucide-react';

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Mapa', href: '/mapa' },
  { label: 'Beneficios', href: '/#beneficios' },
  { label: 'Admin', href: '/admin/cargar' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href.includes('#')) {
      return pathname === '/' && href.includes('#');
    }
    return pathname === href;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm'
          : 'bg-transparent border-b border-transparent'
        }`}
    >
      <div className="container-custom h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group" aria-label="Ir al inicio">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-lg leading-none text-foreground">
              DescuentosUY
            </span>
            <span className="text-[10px] font-medium text-muted-foreground tracking-wide">
              MONTEVIDEO
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive(link.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/mapa"
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5"
          >
            Explorar mapa
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border shadow-xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-5 duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="my-2 border-border" />
          <Link
            href="/mapa"
            onClick={() => setMenuOpen(false)}
            className="w-full p-3 rounded-lg bg-primary text-primary-foreground text-center text-sm font-medium shadow-md"
          >
            Explorar mapa
          </Link>
        </div>
      )}
    </header>
  );
}
