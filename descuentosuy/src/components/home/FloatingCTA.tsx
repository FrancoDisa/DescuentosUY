'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Show CTA after scrolling down a bit
      setHasScrolled(scrollY > windowHeight * 0.5);

      // Hide CTA near the bottom (where the main CTA is)
      setIsVisible(scrollY > windowHeight * 0.3 && scrollY < documentHeight - windowHeight * 1.2);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible || !hasScrolled) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Link
        href="#search"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-110 transition-all"
        aria-label="Buscar descuentos"
      >
        <Search className="w-6 h-6" />
      </Link>
    </div>
  );
}
