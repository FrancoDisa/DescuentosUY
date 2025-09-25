import { describe, it, expect } from 'vitest';
import { calculateDistance } from './distance';

describe('calculateDistance', () => {
  it('should return 0 for the same coordinates', () => {
    const lat = -34.9011;
    const lon = -56.1645;
    expect(calculateDistance(lat, lon, lat, lon)).toBe(0);
  });

  it('should calculate the correct distance between two points', () => {
    // Coordinates for Plaza Independencia, Montevideo
    const lat1 = -34.9069;
    const lon1 = -56.1996;

    // Coordinates for Carrasco Airport (MVD)
    const lat2 = -34.8384;
    const lon2 = -56.0322;

    // Expected distance is roughly 17.1 km
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeCloseTo(17.1, 1); // Check with a precision of 1 decimal place
  });

  it('should handle crossing the equator or prime meridian', () => {
    const lat1 = 10;
    const lon1 = 10;
    const lat2 = -10;
    const lon2 = -10;

    // Just ensuring it returns a positive number without errors
    expect(calculateDistance(lat1, lon1, lat2, lon2)).toBeGreaterThan(0);
  });
});
