import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { OpeningHours } from './OpeningHours';

describe('OpeningHours', () => {
  beforeAll(() => {
    // Mock the date to control day of week
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const mockOpeningHours = {
    open_now: true,
    weekday_text: [
      'Monday: 09:00 – 22:00',
      'Tuesday: 09:00 – 22:00',
      'Wednesday: 09:00 – 22:00',
      'Thursday: 09:00 – 22:00',
      'Friday: 09:00 – 23:00',
      'Saturday: 10:00 – 23:00',
      'Sunday: 10:00 – 21:00',
    ],
  };

  const mockClosedHours = {
    open_now: false,
    weekday_text: [
      'Monday: 09:00 – 22:00',
      'Tuesday: 09:00 – 22:00',
      'Wednesday: 09:00 – 22:00',
      'Thursday: 09:00 – 22:00',
      'Friday: 09:00 – 23:00',
      'Saturday: 10:00 – 23:00',
      'Sunday: Closed',
    ],
  };

  it('returns null when opening hours data is not provided', () => {
    const { container } = render(<OpeningHours openingHours={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when weekday_text is not provided', () => {
    const { container } = render(<OpeningHours openingHours={{ open_now: true }} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows "Abierto ahora" status when open_now is true', () => {
    render(<OpeningHours openingHours={mockOpeningHours} />);
    expect(screen.getByText('Abierto ahora')).toBeInTheDocument();
  });

  it('shows "Cerrado ahora" status when open_now is false', () => {
    render(<OpeningHours openingHours={mockClosedHours} />);
    expect(screen.getByText('Cerrado ahora')).toBeInTheDocument();
  });

  it('displays correct styling for open status', () => {
    render(<OpeningHours openingHours={mockOpeningHours} />);
    const statusBadge = screen.getByText('Abierto ahora');
    expect(statusBadge).toHaveClass('bg-green-100');
    expect(statusBadge).toHaveClass('text-green-800');
  });

  it('displays correct styling for closed status', () => {
    render(<OpeningHours openingHours={mockClosedHours} />);
    const statusBadge = screen.getByText('Cerrado ahora');
    expect(statusBadge).toHaveClass('bg-red-100');
    expect(statusBadge).toHaveClass('text-red-800');
  });

  it('is not expanded initially', () => {
    render(<OpeningHours openingHours={mockOpeningHours} />);
    expect(screen.queryByText('Lunes:')).not.toBeInTheDocument();
  });

  it('expands when clicked', () => {
    render(<OpeningHours openingHours={mockOpeningHours} />);
    const expandButton = screen.getByText('Abierto ahora').closest('div');
    
    fireEvent.click(expandButton!);
    
    expect(screen.getByText(/Lunes:/)).toBeInTheDocument();
  });

  it('collapses when clicked again', () => {
    render(<OpeningHours openingHours={mockOpeningHours} />);
    const expandButton = screen.getByText('Abierto ahora').closest('div');
    
    // Expand
    fireEvent.click(expandButton!);
    expect(screen.getByText(/Lunes:/)).toBeInTheDocument();
    
    // Collapse
    fireEvent.click(expandButton!);
    expect(screen.queryByText(/Lunes:/)).not.toBeInTheDocument();
  });

  it('translates day names to Spanish', () => {
    render(<OpeningHours openingHours={mockOpeningHours} />);
    const expandButton = screen.getByText('Abierto ahora').closest('div');
    
    fireEvent.click(expandButton!);
    
    expect(screen.getByText(/Lunes:/)).toBeInTheDocument();
    expect(screen.getByText(/Martes:/)).toBeInTheDocument();
    expect(screen.getByText(/Miércoles:/)).toBeInTheDocument();
    expect(screen.getByText(/Jueves:/)).toBeInTheDocument();
    expect(screen.getByText(/Viernes:/)).toBeInTheDocument();
    expect(screen.getByText(/Sábado:/)).toBeInTheDocument();
    expect(screen.getByText(/Domingo:/)).toBeInTheDocument();
  });

  it('translates Closed status to Cerrado', () => {
    render(<OpeningHours openingHours={mockClosedHours} />);
    const expandButton = screen.getByText('Cerrado ahora').closest('div');
    
    fireEvent.click(expandButton!);
    
    expect(screen.getByText(/Domingo: Cerrado/)).toBeInTheDocument();
  });

  it('highlights today\'s hours', () => {
    render(<OpeningHours openingHours={mockOpeningHours} />);
    const expandButton = screen.getByText('Abierto ahora').closest('div');
    
    fireEvent.click(expandButton!);
    
    // Find today's item and check if it has bold styling
    const todayItem = Array.from(screen.getAllByText(/:/)).find(el => {
      return el.className?.includes('font-bold');
    });
    
    expect(todayItem).toBeTruthy();
  });

  it('displays chevron icon', () => {
    render(<OpeningHours openingHours={mockOpeningHours} />);
    expect(screen.getByText('▼')).toBeInTheDocument();
  });
});
