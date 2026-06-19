import { describe, it, expect } from 'vitest';
import { SpatialHash } from '../src/core/spatialHash';

// Default cell size is 120 world units. Tests below assume that default.

describe('SpatialHash.queryRadius', () => {
  it('returns an empty result when nothing has been inserted', () => {
    const sh = new SpatialHash();
    const out: number[] = [];
    expect(sh.queryRadius(0, 0, 100, out)).toEqual([]);
    expect(out.length).toBe(0);
  });

  it('returns a point that sits at the query centre', () => {
    const sh = new SpatialHash();
    sh.insert(1, 0, 0);
    const out: number[] = [];
    sh.queryRadius(0, 0, 10, out);
    expect(out).toContain(1);
  });

  it('returns candidates whose cells overlap the query circle', () => {
    const sh = new SpatialHash(); // cellSize 120
    // Hand-placed points across several cells.
    sh.insert(1, 10, 10); // cell (0,0)
    sh.insert(2, 130, 10); // cell (1,0)
    sh.insert(3, 10, 130); // cell (0,1)
    sh.insert(4, 600, 600); // far away, cell (5,5)

    const out: number[] = [];
    // Circle centred at (60,60) with r=80 spans x:[-20,140], y:[-20,140]
    // => cell columns 0..1, rows 0..1. Picks up 1,2,3 but not 4.
    sh.queryRadius(60, 60, 80, out);
    expect(out).toContain(1);
    expect(out).toContain(2);
    expect(out).toContain(3);
    expect(out).not.toContain(4);
  });

  it('excludes points whose cells fall outside the query cell range', () => {
    const sh = new SpatialHash(); // cellSize 120
    sh.insert(1, 10, 10); // cell (0,0)
    sh.insert(2, 500, 500); // cell (4,4)

    const out: number[] = [];
    // Small circle near origin: x:[-5,25], y:[-5,25] => only cell (0,0).
    sh.queryRadius(10, 10, 15, out);
    expect(out).toContain(1);
    expect(out).not.toContain(2);
  });

  it('returns all eids sharing a single cell', () => {
    const sh = new SpatialHash(); // cellSize 120
    // All three land in cell (0,0).
    sh.insert(1, 5, 5);
    sh.insert(2, 50, 90);
    sh.insert(3, 119, 1);

    const out: number[] = [];
    sh.queryRadius(60, 60, 10, out);
    expect(out.sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  it('reuses and clears the provided out array', () => {
    const sh = new SpatialHash();
    sh.insert(1, 0, 0);
    const out: number[] = [42, 43, 44];
    const ret = sh.queryRadius(0, 0, 10, out);
    // out is cleared first, then filled — and the same reference is returned.
    expect(ret).toBe(out);
    expect(out).toContain(1);
    expect(out).not.toContain(42);
  });

  it('clear() empties the hash so later queries return nothing', () => {
    const sh = new SpatialHash();
    sh.insert(1, 0, 0);
    sh.clear();
    const out: number[] = [];
    sh.queryRadius(0, 0, 200, out);
    expect(out.length).toBe(0);
  });

  it('handles negative world coordinates', () => {
    const sh = new SpatialHash(); // cellSize 120
    sh.insert(1, -130, -130); // cell (-2,-2)
    sh.insert(2, 130, 130); // cell (1,1)
    const out: number[] = [];
    // Circle around the negative point only.
    sh.queryRadius(-130, -130, 20, out);
    expect(out).toContain(1);
    expect(out).not.toContain(2);
  });
});
