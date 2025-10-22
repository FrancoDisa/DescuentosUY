import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StoreList } from './StoreList';
import type { Store } from './StoreCard';

// Mock next/image
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('StoreList', () => {
  const mockStores: Store[] = [
    {
      id: 'store-1',
      branch_id: 'branch-1',
      name: 'McDonald\'s',
      logo_url: 'https://example.com/mcdonalds.png',
      promotions: [
        {
          id: 'promo-1',
          name: '20% en comida',
          value: 20,
          card_issuer: 'Santander',
          card_type: 'Crédito',
          card_tier: 'Todas',
          description: 'Válido siempre',
        },
      ],
      distance_km: 1.2,
    },
    {
      id: 'store-2',
      branch_id: 'branch-2',
      name: 'Starbucks',
      logo_url: 'https://example.com/starbucks.png',
      promotions: [
        {
          id: 'promo-2',
          name: '15% en bebidas',
          value: 15,
          card_issuer: 'BBVA',
          card_type: 'Débito',
          card_tier: 'Any',
          description: '',
        },
      ],
      distance_km: 2.5,
    },
  ];

  it('renders empty state when no stores provided', () => {
    render(<StoreList stores={[]} />);
    expect(screen.getByText('No hay locales para mostrar.')).toBeInTheDocument();
  });

  it('renders all stores when provided', () => {
    render(<StoreList stores={mockStores} />);
    expect(screen.getByText('McDonald\'s')).toBeInTheDocument();
    expect(screen.getByText('Starbucks')).toBeInTheDocument();
  });

  it('renders the correct number of store cards', () => {
    render(<StoreList stores={mockStores} />);
    const articles = screen.getAllByRole('link');
    expect(articles).toHaveLength(2);
  });

  it('displays store information correctly', () => {
    render(<StoreList stores={mockStores} />);
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
    expect(screen.getByText('Santander')).toBeInTheDocument();
    expect(screen.getByText('BBVA')).toBeInTheDocument();
  });

  it('displays distance for each store', () => {
    render(<StoreList stores={mockStores} />);
    expect(screen.getByText('1.2 km')).toBeInTheDocument();
    expect(screen.getByText('2.5 km')).toBeInTheDocument();
  });

  it('passes user location to store cards', () => {
    const userLocation = { lat: '-34.9', lon: '-56.16' };
    render(
      <StoreList 
        stores={mockStores} 
        userLocation={userLocation}
      />
    );
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link.getAttribute('href')).toContain('lat=-34.9');
      expect(link.getAttribute('href')).toContain('lon=-56.16');
    });
  });

  it('handles single store correctly', () => {
    render(<StoreList stores={[mockStores[0]]} />);
    expect(screen.getByText('McDonald\'s')).toBeInTheDocument();
    expect(screen.queryByText('Starbucks')).not.toBeInTheDocument();
  });
});
