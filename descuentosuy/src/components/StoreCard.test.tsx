import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StoreCard, type Store } from './StoreCard';

// Mock Next.js components
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// --- Mock Data ---
const baseMockStore: Store = {
  id: '1',
  branch_id: '101',
  name: 'Test Store',
  logo_url: 'https://example.com/logo.png',
  promotions: [],
  distance_km: undefined,
};

const promo1 = { id: 'p1', name: 'Descuento Principal', value: 25, card_issuer: 'Test Bank', card_type: 'Credit', card_tier: 'Gold', description: 'Test description' };
const promo2 = { id: 'p2', name: '10% OFF', value: 10, card_issuer: 'Another Bank', card_type: 'Debit', card_tier: 'Any', description: '' };
const promo3 = { id: 'p3', name: 'Promo de 5 porciento', value: 5, card_issuer: 'Another Bank', card_type: 'Debit', card_tier: 'Any', description: '' };
const promo4 = { id: 'p4', name: 'BOGO', value: 50, card_issuer: 'Another Bank', card_type: 'Debit', card_tier: 'Any', description: '' };
const promo5 = { id: 'p5', name: 'Free Drink', value: 100, card_issuer: 'Another Bank', card_type: 'Debit', card_tier: 'Any', description: '' };



describe('StoreCard', () => {
  it('renders basic store information', () => {
    render(<StoreCard store={baseMockStore} />);
    expect(screen.getByText('Test Store')).toBeInTheDocument();
    expect(screen.getByAltText('Test Store logo')).toBeInTheDocument();
  });

  it('renders a placeholder when there is no logo', () => {
    const storeWithoutLogo = { ...baseMockStore, logo_url: null };
    render(<StoreCard store={storeWithoutLogo} />);
    expect(screen.getByText('Sin logo')).toBeInTheDocument();
    expect(screen.queryByAltText('Test Store logo')).not.toBeInTheDocument();
  });

  it('renders the distance when provided', () => {
    const storeWithDistance = { ...baseMockStore, distance_km: 5.36 };
    render(<StoreCard store={storeWithDistance} />);
    expect(screen.getByText(/5.4 km/i)).toBeInTheDocument();
  });

  it('does not render the distance when not provided', () => {
    render(<StoreCard store={baseMockStore} />);
    expect(screen.queryByText(/km/i)).not.toBeInTheDocument();
  });

  it('renders a placeholder when there are no promotions', () => {
    render(<StoreCard store={baseMockStore} />);
    expect(screen.getByText('Estamos cargando promociones para este local.')).toBeInTheDocument();
  });

  it('renders the top promotion correctly', () => {
    const storeWithPromo = { ...baseMockStore, promotions: [promo1] };
    render(<StoreCard store={storeWithPromo} />);
    expect(screen.getByText('25% OFF')).toBeInTheDocument(); // The value label
    expect(screen.getByText('Descuento Principal')).toBeInTheDocument(); // The name
    expect(screen.getByText('Test Bank')).toBeInTheDocument();
    expect(screen.getByText(/Credit \/ Gold/i)).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders a count of additional promotions (plural)', () => {
    const storeWithPromos = { ...baseMockStore, promotions: [promo1, promo2, promo3] };
    render(<StoreCard store={storeWithPromos} />);
    expect(screen.getByText(/2 beneficios adicionales/i)).toBeInTheDocument();
  });

  it('renders a count of additional promotions (singular)', () => {
    const storeWithPromos = { ...baseMockStore, promotions: [promo1, promo2] };
    render(<StoreCard store={storeWithPromos} />);
    expect(screen.getByText(/1 beneficio adicional/i)).toBeInTheDocument();
  });

  it('renders a truncated list of extra promotions and a summary message', () => {
    const storeWithManyPromos = { ...baseMockStore, promotions: [promo1, promo2, promo3, promo4, promo5] };
    render(<StoreCard store={storeWithManyPromos} />);
    // Top promo
    expect(screen.getByText('25% OFF')).toBeInTheDocument();
    expect(screen.getByText('Descuento Principal')).toBeInTheDocument();
    // 3 extra promos are listed by name
    expect(screen.getByText(/10% OFF/i)).toBeInTheDocument();
    expect(screen.getByText(/Promo de 5 porciento/i)).toBeInTheDocument();
    expect(screen.getByText(/BOGO/i)).toBeInTheDocument();
    // The 5th promo (4th extra) is not listed by name
    expect(screen.queryByText(/Free Drink/i)).not.toBeInTheDocument();
    // A summary message is shown for the rest
    expect(screen.getByText(/y 1 promos mas.../i)).toBeInTheDocument();
  });
});
