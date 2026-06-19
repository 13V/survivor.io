import { describe, it, expect } from 'vitest';
import { difficultyMul, xpForLevel } from '../src/config';

describe('difficultyMul', () => {
  it('is 1 at t = 0', () => {
    expect(difficultyMul(0)).toBeCloseTo(1);
  });

  it('strictly increases with elapsed time', () => {
    let prev = difficultyMul(0);
    for (let t = 1; t <= 600; t++) {
      const cur = difficultyMul(t);
      expect(cur).toBeGreaterThan(prev);
      prev = cur;
    }
  });

  it('is monotonic across fine-grained sub-second steps', () => {
    let prev = -Infinity;
    for (let t = 0; t <= 120; t += 0.5) {
      const cur = difficultyMul(t);
      expect(cur).toBeGreaterThanOrEqual(prev);
      prev = cur;
    }
  });
});

describe('xpForLevel', () => {
  it('is strictly increasing with level', () => {
    let prev = xpForLevel(1);
    for (let lvl = 2; lvl <= 200; lvl++) {
      const cur = xpForLevel(lvl);
      expect(cur).toBeGreaterThan(prev);
      prev = cur;
    }
  });

  it('returns positive integer XP thresholds', () => {
    for (let lvl = 1; lvl <= 50; lvl++) {
      const v = xpForLevel(lvl);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThan(0);
    }
  });
});
