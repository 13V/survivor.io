// 8-direction directional sprite for the HD Survivor player character.
//
// Each animation is a 1792x1024 sheet = a grid of 128px cells, 14 frames (columns)
// x 8 facing directions (rows). Rows are the 8 compass headings clockwise from East:
//   row 0=E, 1=SE, 2=S, 3=SW, 4=W, 5=NW, 6=N, 7=NE
// so the character faces its aim/move direction with no horizontal flipping (the gun
// and shadow rotate correctly). We slice each sheet into per-direction Texture rows
// that share the sheet's GPU source, and pick [direction][frame] at runtime.
import { Assets, Texture, Rectangle } from 'pixi.js';

export interface DirAnim {
  frames: Texture[][]; // [direction 0..7][frame 0..count-1]
  count: number;
  fps: number;
  loop: boolean;
}

export interface SurvivorSprite {
  idle: DirAnim;
  run: DirAnim;
  hit: DirAnim;
  die: DirAnim;
  rideIdle: DirAnim | null;
  rideRun: DirAnim | null;
}

const CELL = 128;
const DIRS = 8;
const FRAMES = 14; // all sheets verified to use exactly 14 active frames
const SHEETS = ['Idle', 'Run', 'TakeDamage', 'Die', 'RideIdle', 'RideRun'] as const;

const raw: Record<string, Texture> = {};

function url(name: string): string {
  const base = typeof document !== 'undefined' ? document.baseURI : '/';
  return new URL(`assets/sprites/survivor/${name}.png`, base).href;
}

// Boot step: fetch + decode the survivor sheets. Best-effort — if they're missing the
// player just falls back to the procedural cartoon hero.
export async function preloadSurvivor(): Promise<void> {
  await Promise.all(
    SHEETS.map(async (n) => {
      try {
        raw[n] = (await Assets.load(url(n))) as Texture;
      } catch {
        /* optional */
      }
    }),
  );
}

export function survivorLoaded(): boolean {
  return !!raw.Idle && !!raw.Run;
}

function slice(tex: Texture | undefined, fps: number, loop: boolean): DirAnim | null {
  if (!tex) return null;
  tex.source.scaleMode = 'linear'; // soft HD art, not pixel
  const frames: Texture[][] = [];
  for (let r = 0; r < DIRS; r++) {
    const row: Texture[] = [];
    for (let c = 0; c < FRAMES; c++) {
      row.push(new Texture({ source: tex.source, frame: new Rectangle(c * CELL, r * CELL, CELL, CELL) }));
    }
    frames.push(row);
  }
  return { frames, count: FRAMES, fps, loop };
}

// Sync step (in createTextures): slice the loaded sheets into directional animations.
export function buildSurvivor(): SurvivorSprite | null {
  if (!survivorLoaded()) return null;
  const idle = slice(raw.Idle, 10, true)!;
  return {
    idle,
    run: slice(raw.Run, 18, true) ?? idle,
    hit: slice(raw.TakeDamage, 24, false) ?? idle,
    die: slice(raw.Die, 16, false) ?? idle,
    rideIdle: slice(raw.RideIdle, 10, true),
    rideRun: slice(raw.RideRun, 22, true),
  };
}

// Aim/move angle (radians, screen coords with y pointing down) -> direction row 0..7.
// 0=E and increasing clockwise (SE, S, SW, W, NW, N, NE) to match the sheet rows.
export function dirRow(angle: number): number {
  const a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  return Math.round(a / (Math.PI / 4)) % DIRS;
}
