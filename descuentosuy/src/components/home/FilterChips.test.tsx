import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FilterChips } from './FilterChips';

describe('FilterChips', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the filter chips section title', () => {
    render(<FilterChips />);
    expect(screen.getByText('Filtros rápidos:')).toBeInTheDocument();
  });

  it('renders all filter category buttons', () => {
    render(<FilterChips />);
    expect(screen.getByRole('button', { name: 'Bancos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Comida' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cafeterías' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ropa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Servicios' })).toBeInTheDocument();
  });

  it('does not show the tooltip on initial render', () => {
    render(<FilterChips />);
    expect(screen.queryByText('Funcionalidad en desarrollo')).not.toBeInTheDocument();
  });

  it('shows the tooltip when a chip is clicked', () => {
    render(<FilterChips />);
    const chipButton = screen.getByRole('button', { name: 'Bancos' });
    
    fireEvent.click(chipButton);
    
    expect(screen.getByText('Funcionalidad en desarrollo')).toBeInTheDocument();
    expect(screen.getByText('Los filtros estarán disponibles próximamente.')).toBeInTheDocument();
  });

  it('shows tooltip when clicking different chips', () => {
    render(<FilterChips />);
    const comidaButton = screen.getByRole('button', { name: 'Comida' });
    
    fireEvent.click(comidaButton);
    
    expect(screen.getByText('Funcionalidad en desarrollo')).toBeInTheDocument();
  });

  it('has correct styling for chips', () => {
    render(<FilterChips />);
    const bancoButton = screen.getByRole('button', { name: 'Bancos' });
    
    expect(bancoButton).toHaveClass('cursor-pointer');
    expect(bancoButton).toHaveClass('rounded-lg');
    expect(bancoButton).toHaveClass('px-4');
    expect(bancoButton).toHaveClass('py-2');
    expect(bancoButton).toHaveClass('text-sm');
    expect(bancoButton).toHaveClass('font-medium');
  });

  it('renders tooltip with correct styling', () => {
    render(<FilterChips />);
    const chipButton = screen.getByRole('button', { name: 'Bancos' });
    
    fireEvent.click(chipButton);
    
    const tooltip = screen.getByText('Funcionalidad en desarrollo');
    expect(tooltip).toHaveClass('font-semibold');
    expect(tooltip).toHaveClass('text-amber-900');
  });
});
