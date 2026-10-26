import { describe, expect, it } from 'vitest';
import { flowerImageForMonth, flowerImages } from './flower-images';

describe('flower-images', () => {
  it('has one photo per calendar month', () => {
    expect(flowerImages).toHaveLength(12);
    expect(new Set(flowerImages).size).toBe(12);
  });

  it('maps 1-based months to distinct photos and wraps out-of-range input', () => {
    expect(flowerImageForMonth(1)).toBe(flowerImages[0]);
    expect(flowerImageForMonth(12)).toBe(flowerImages[11]);
    expect(flowerImageForMonth(13)).toBe(flowerImages[0]);
    expect(flowerImageForMonth(0)).toBe(flowerImages[11]);
  });
});
