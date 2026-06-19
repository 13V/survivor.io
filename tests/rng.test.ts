import { describe, it, expect } from 'vitest';
import { clamp, randInt, len, pick, shuffle } from '../src/core/rng';

const SAMPLES = 5000;

describe('clamp', () => {
  it('returns the value when within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('clamps below the lower bound', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(-100, -5, 5)).toBe(-5);
  });

  it('clamps above the upper bound', () => {
    expect(clamp(42, 0, 10)).toBe(10);
    expect(clamp(100, -5, 5)).toBe(5);
  });

  it('never returns a value outside [lo, hi] for random inputs', () => {
    for (let i = 0; i < SAMPLES; i++) {
      const lo = Math.random() * 200 - 100;
      const hi = lo + Math.random() * 100;
      const v = Math.random() * 400 - 200;
      const out = clamp(v, lo, hi);
      expect(out).toBeGreaterThanOrEqual(lo);
      expect(out).toBeLessThanOrEqual(hi);
    }
  });
});

describe('randInt', () => {
  it('is inclusive of both endpoints over many samples', () => {
    const min = 1;
    const max = 6;
    const seen = new Set<number>();
    for (let i = 0; i < SAMPLES; i++) {
      const v = randInt(min, max);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(min);
      expect(v).toBeLessThanOrEqual(max);
      seen.add(v);
    }
    // With 5000 samples over a 6-value range, every value should appear.
    for (let v = min; v <= max; v++) {
      expect(seen.has(v)).toBe(true);
    }
  });

  it('returns the single value when min === max', () => {
    for (let i = 0; i < 100; i++) {
      expect(randInt(3, 3)).toBe(3);
    }
  });

  it('handles negative ranges inclusively', () => {
    const min = -4;
    const max = -1;
    for (let i = 0; i < SAMPLES; i++) {
      const v = randInt(min, max);
      expect(v).toBeGreaterThanOrEqual(min);
      expect(v).toBeLessThanOrEqual(max);
    }
  });
});

describe('len', () => {
  it('computes Euclidean length of (x, y)', () => {
    expect(len(3, 4)).toBeCloseTo(5);
    expect(len(0, 0)).toBe(0);
    expect(len(-3, -4)).toBeCloseTo(5);
    expect(len(5, 0)).toBeCloseTo(5);
    expect(len(0, -7)).toBeCloseTo(7);
  });

  it('matches sqrt(x^2 + y^2) for random inputs', () => {
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 200 - 100;
      const y = Math.random() * 200 - 100;
      expect(len(x, y)).toBeCloseTo(Math.sqrt(x * x + y * y));
    }
  });
});

describe('pick', () => {
  it('returns an element that is in the array', () => {
    const arr = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 1000; i++) {
      expect(arr).toContain(pick(arr));
    }
  });

  it('returns the only element of a single-element array', () => {
    expect(pick([99])).toBe(99);
  });

  it('eventually returns every element', () => {
    const arr = [10, 20, 30];
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) seen.add(pick(arr));
    expect(seen.size).toBe(arr.length);
  });
});

describe('shuffle', () => {
  it('preserves the multiset of elements', () => {
    const original = [1, 2, 3, 4, 5, 5, 5, 8, 13, 21];
    const copy = original.slice();
    const result = shuffle(copy);
    // Same length and same element counts (sorting normalises order).
    expect(result.length).toBe(original.length);
    expect([...result].sort((a, b) => a - b)).toEqual(
      [...original].sort((a, b) => a - b),
    );
  });

  it('mutates and returns the same array reference', () => {
    const arr = [1, 2, 3];
    expect(shuffle(arr)).toBe(arr);
  });

  it('preserves the multiset across many shuffles of duplicate-heavy data', () => {
    const original = ['x', 'x', 'y', 'z', 'z', 'z'];
    for (let i = 0; i < 200; i++) {
      const copy = original.slice();
      const result = shuffle(copy);
      expect([...result].sort()).toEqual([...original].sort());
    }
  });

  it('handles empty and single-element arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle([7])).toEqual([7]);
  });
});
