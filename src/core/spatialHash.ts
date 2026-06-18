// Uniform-grid spatial hash for O(1)-ish broad-phase queries.
// Rebuilt each simulation step from the current enemy set.

export class SpatialHash {
  private cells = new Map<number, number[]>();
  private readonly inv: number;

  constructor(private readonly cellSize = 120) {
    this.inv = 1 / cellSize;
  }

  private key(cx: number, cy: number): number {
    // Offset to keep keys non-negative for our world range, then pack.
    return (cx + 0x8000) * 0x10000 + (cy + 0x8000);
  }

  clear(): void {
    this.cells.clear();
  }

  insert(eid: number, x: number, y: number): void {
    const k = this.key(Math.floor(x * this.inv), Math.floor(y * this.inv));
    const bucket = this.cells.get(k);
    if (bucket) bucket.push(eid);
    else this.cells.set(k, [eid]);
  }

  /** Collect candidate eids in cells overlapping the circle (x,y,r) into `out`. */
  queryRadius(x: number, y: number, r: number, out: number[]): number[] {
    out.length = 0;
    const minCx = Math.floor((x - r) * this.inv);
    const maxCx = Math.floor((x + r) * this.inv);
    const minCy = Math.floor((y - r) * this.inv);
    const maxCy = Math.floor((y + r) * this.inv);
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const bucket = this.cells.get(this.key(cx, cy));
        if (bucket) {
          for (let i = 0; i < bucket.length; i++) out.push(bucket[i]);
        }
      }
    }
    return out;
  }
}
