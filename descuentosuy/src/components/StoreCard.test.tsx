import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StoreCard } from './StoreCard';
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

describe('StoreCard', () => {
  const mockStore: Store = {
    id: 'store-1',
    branch_id: 'branch-1',
    name: 'Burger King',
    logo_url: 'https://example.com/burger-king.png',
    promotions: [
      {
        id: 'promo-1',
        name: '15% descuento en hamburguesas',
        value: 15,
        card_issuer: 'Santander',
        card_type: 'Crédito',
        card_tier: 'Gold',
        description: 'Válido todos los días',
      },
      {
        id: 'promo-2',
        name: '10% descuento en papas',
        value: 10,
        card_issuer: 'BBVA',
        card_type: 'Débito',
        card_tier: 'Standard',
        description: '',
      },
    ],
    distance_km: 2.5,
  };

  it('renders store name correctly', () => {
    render(<StoreCard store={mockStore} />);
    expect(screen.getByText('Burger King')).toBeInTheDocument();
  });

  it('displays the top promotion discount percentage', () => {
    render(<StoreCard store={mockStore} />);
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('displays the top promotion name', () => {
    render(<StoreCard store={mockStore} />);
    expect(screen.getByText('15% descuento en hamburguesas')).toBeInTheDocument();
  });

  it('displays card issuer information', () => {
    render(<StoreCard store={mockStore} />);
    expect(screen.getByText('Santander')).toBeInTheDocument();
  });

  it('displays distance when available', () => {
    render(<StoreCard store={mockStore} />);
    expect(screen.getByText('2.5 km')).toBeInTheDocument();
  });

  it('displays the count of extra promotions', () => {
    render(<StoreCard store={mockStore} />);
    expect(screen.getByText('+1 promoción más')).toBeInTheDocument();
  });

  it('displays extra promotion details', () => {
    render(<StoreCard store={mockStore} />);
    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('10% descuento en papas')).toBeInTheDocument();
  });

  it('renders logo image when available', () => {
    render(<StoreCard store={mockStore} />);
    const img = screen.getByAltText('Burger King logo');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/burger-king.png');
  });

  it('handles store with no promotions', () => {
    const storeWithoutPromos: Store = {
      ...mockStore,
      promotions: [],
    };
    render(<StoreCard store={storeWithoutPromos} />);
    expect(screen.getByText('Promociones disponibles')).toBeInTheDocument();
  });

  it('handles store without distance', () => {
    const storeWithoutDistance: Store = {
      ...mockStore,
      distance_km: undefined,
    };
    render(<StoreCard store={storeWithoutDistance} />);
    expect(screen.queryByText(/km/)).not.toBeInTheDocument();
  });

  it('handles store without logo', () => {
    const storeWithoutLogo: Store = {
      ...mockStore,
      logo_url: null,
    };
    render(<StoreCard store={storeWithoutLogo} />);
    expect(screen.queryByAltText('Burger King logo')).not.toBeInTheDocument();
  });

  it('creates correct link href with user location', () => {
    render(
      <StoreCard 
        store={mockStore} 
        userLocation={{ lat: '-34.9', lon: '-56.16' }}
      />
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('/local/store-1')
    );
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('lat=-34.9')
    );
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('lon=-56.16')
    );
  });

  it('has correct CTA button text', () => {
    render(<StoreCard store={mockStore} />);
    expect(screen.getByText('Ver detalles completos')).toBeInTheDocument();
  });
});
