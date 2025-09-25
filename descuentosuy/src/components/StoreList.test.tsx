import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StoreList } from './StoreList';
import type { Store } from './StoreCard';

// Mock next/link to prevent errors in test environment
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // The real <Image> component is complex, so we render a simple <img>
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock data for stores
const mockStores: Store[] = [
  {
    id: '1',
    branch_id: '101',
    name: 'La Pasiva',
    logo_url: 'https://example.com/logo1.png',
    promotions: [
      { id: 'p1', name: '25% Itau', value: 25, card_issuer: 'Itau', card_type: 'Crédito', card_tier: 'Gold', description: '' },
    ],
    distance_km: 1.2,
  },
  {
    id: '2',
    branch_id: '201',
    name: 'McDonals',
    logo_url: 'https://example.com/logo2.png',
    promotions: [
      { id: 'p2', name: '15% Scotiabank', value: 15, card_issuer: 'Scotiabank', card_type: 'Débito', card_tier: 'Classic', description: '' },
    ],
    distance_km: 2.5,
  },
];

describe('StoreList', () => {
  it('should display a message when no stores are provided', () => {
    render(<StoreList stores={[]} />);
    expect(screen.getByText('No hay locales para mostrar.')).toBeInTheDocument();
  });

  it('should display a search-specific message when no stores match a query', () => {
    const query = 'pizzerias';
    render(<StoreList stores={[]} query={query} />);
    expect(screen.getByText(`No se encontraron resultados para "${query}".`)).toBeInTheDocument();
  });

  it('should render a list of stores when data is provided', () => {
    render(<StoreList stores={mockStores} />);

    // Check that the store names are rendered
    // This also implicitly tests that StoreCard is being rendered
    expect(screen.getByText('La Pasiva')).toBeInTheDocument();
    expect(screen.getByText('McDonals')).toBeInTheDocument();

    // Check that promotion info is rendered
    expect(screen.getByText(/25% Itau/i)).toBeInTheDocument();
    expect(screen.getByText(/15% Scotiabank/i)).toBeInTheDocument();
  });

  it('should display an error message if the stores prop is null', () => {
    // @ts-expect-error - Intentionally passing null to test error handling
    render(<StoreList stores={null} />);
    expect(screen.getByText('Error: No se pudo cargar la lista de locales.')).toBeInTheDocument();
  });
});
