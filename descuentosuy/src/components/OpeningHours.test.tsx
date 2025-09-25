import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpeningHours } from './OpeningHours';

const mockOpeningHours = {
  open_now: true,
  weekday_text: [
    'Monday: 9:00 AM – 5:00 PM',
    'Tuesday: 9:00 AM – 5:00 PM',
    'Wednesday: 9:00 AM – 5:00 PM',
    'Thursday: 9:00 AM – 5:00 PM',
    'Friday: 9:00 AM – 8:00 PM',
    'Saturday: 10:00 AM – 6:00 PM',
    'Sunday: Closed',
  ],
};

describe.skip('OpeningHours', () => {
  beforeEach(() => {
    // Mock Date to control which day of the week it is. Sunday = 0, Monday = 1, etc.
    // We will set it to a Wednesday (3)
    const mockDate = new Date('2025-09-24T12:00:00Z'); // This is a Wednesday
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing if openingHours prop is null', () => {
    const { container } = render(<OpeningHours openingHours={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing if weekday_text is missing', () => {
    const { container } = render(<OpeningHours openingHours={{ open_now: true }} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays "Abierto ahora" when open_now is true', () => {
    render(<OpeningHours openingHours={mockOpeningHours} />);
    expect(screen.getByText('Abierto ahora')).toBeInTheDocument();
  });

  it('displays "Cerrado ahora" when open_now is false', () => {
    const closedHours = { ...mockOpeningHours, open_now: false };
    render(<OpeningHours openingHours={closedHours} />);
    expect(screen.getByText('Cerrado ahora')).toBeInTheDocument();
  });

  it('displays the hours for the current day (Wednesday)', () => {
    render(<OpeningHours openingHours={mockOpeningHours} />);
    // The component should identify Wednesday's hours
    expect(screen.getByText('9:00 AM – 5:00 PM')).toBeInTheDocument();
  });

  it('toggles the visibility of the full week schedule on click', () => {
    render(<OpeningHours openingHours={mockOpeningHours} />);

    // Initially, the full schedule should not be visible
    expect(screen.queryByText(/Lunes:/)).not.toBeInTheDocument();

    // Click to expand
    const toggleButton = screen.getByText('Abierto ahora').parentElement;
    expect(toggleButton).not.toBeNull();
    fireEvent.click(toggleButton!);

    // Now, the full schedule should be visible
    expect(screen.getByText(/Lunes: 9:00 AM – 5:00 PM/)).toBeInTheDocument();
    expect(screen.getByText(/Domingo: Cerrado/)).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(toggleButton!);
    expect(screen.queryByText(/Lunes:/)).not.toBeInTheDocument();
  });

  it('translates the weekday names to Spanish', () => {
    render(<OpeningHours openingHours={mockOpeningHours} />);
    const toggleButton = screen.getByText('Abierto ahora').parentElement;
    fireEvent.click(toggleButton!);

    // Check for translated day names
    expect(screen.getByText(/Miércoles: 9:00 AM – 5:00 PM/)).toBeInTheDocument();
    expect(screen.queryByText(/Wednesday:/)).not.toBeInTheDocument();
  });
});
