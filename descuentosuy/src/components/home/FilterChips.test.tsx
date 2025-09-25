import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FilterChips } from './FilterChips';

describe.skip('FilterChips', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the filter chips correctly', () => {
    render(<FilterChips />);
    expect(screen.getByText('Filtros rápidos:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bancos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Comida' })).toBeInTheDocument();
  });

  it('does not show the tooltip on initial render', () => {
    render(<FilterChips />);
    expect(screen.queryByText('Funcionalidad en desarrollo.')).not.toBeInTheDocument();
  });

  it('shows the tooltip when a chip is clicked', () => {
    render(<FilterChips />);
    const chipButton = screen.getByRole('button', { name: 'Bancos' });

    fireEvent.click(chipButton);

    expect(screen.getByText('Funcionalidad en desarrollo.')).toBeInTheDocument();
  });

  it('hides the tooltip after the timeout', () => {
    render(<FilterChips />);
    const chipButton = screen.getByRole('button', { name: 'Bancos' });

    // Click to show the tooltip
    fireEvent.click(chipButton);
    expect(screen.getByText('Funcionalidad en desarrollo.')).toBeInTheDocument();

    // Fast-forward time by 4000ms
    vi.advanceTimersByTime(4000);

    // Now the tooltip should be gone
    expect(screen.queryByText('Funcionalidad en desarrollo.')).not.toBeInTheDocument();
  });
});
