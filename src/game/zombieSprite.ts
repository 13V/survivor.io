// HD zombie enemies — memory-efficient 8-direction via 5 stored directions + mirroring,
// with each sheet alpha-trimmed of its empty padding.
//
// Top-down characters are horizontally symmetric, so we only store 5 directions
// (E, SE, S, N, NE); W/SW/NW are the same rows rendered with a horizontal flip. Each
// sheet is also cropped to the figures' bounding box (most of a cell is transparent),
// and a per-sheet anchorY (baked in atlas.json) keeps the feet planted at the same world
// point regardless of the crop -- so trimming is invisible to gameplay but cuts GPU
// memory enough to load 6 animations (Run/Walk/Attack1/Attack2/Die/Die2) for all 36 types.
import { Assets, Texture, Rectangle } from 'pixi.js';

const COLS = 15;
const ROWS = 5; // stored directions: 0=E 1=SE 2=S 3=N 4=NE
export const ORIG_CELL = 64; // source cell size before trimming (display-scale basis)

// dirRow() 8-dir index -> stored row + horizontal flip.
const DIR5 = [0, 1, 2, 1, 0, 4, 3, 4];
const FLIP5 = [false, false, false, true, true, true, false, false];
export function dir5(d8: number): { row: number; flip: boolean } {
  return { row: DIR5[d8], flip: FLIP5[d8] };
}

export const ZOMBIE_POOLS: string[][] = [
  [
    'ZombieMale1', 'ZombieMale2', 'ZombieMale3', 'ZombieMale4', 'ZombieMale5', 'ZombieMale6',
    'ZombieMale7', 'ZombieMale8', 'ZombieMale9', 'ZombieFemale1', 'ZombieFemale2', 'ZombieFemale3',
    'ZombieFemale4', 'ZombieFemale5', 'ZombieFemale6', 'ZombieFemale7',
  ],
  [
    'ZombieCop1', 'ZombieCop2', 'ZombieCop3', 'ZombieCop4', 'ZombieSoldier1', 'ZombieSoldier2',
    'ZombieSoldier3', 'ZombieSoldier4', 'ZombieSoldier5', 'ZombieSoldier6', 'ZombieRadioactive1',
    'ZombieRadioactive2', 'ZombieRadioactive3',
  ],
  ['ZombieHulk1', 'ZombieHulk2', 'ZombieMonster1', 'ZombieMonster2', 'ZombieMonster3'],
  ['ZombieGeneral1', 'ZombieGeneral2'],
];

export const ZOMBIE_BY_ID: Record<string, string> = {
  colossus: 'ZombieHulk2', titan: 'ZombieHulk1', leviathan: 'ZombieMonster3', reaper: 'ZombieMonster2',
  warden: 'ZombieGeneral2', artillerist: 'ZombieGeneral1', broodmother: 'ZombieMonster1',
  rampager: 'ZombieMonster3', tempest: 'ZombieRadioactive2', warlord: 'ZombieGeneral2',
};

const ALL = [...new Set([...ZOMBIE_POOLS.flat(), ...Object.values(ZOMBIE_BY_ID)])];
const ANIMS = ['Run', 'Walk', 'Attack1', 'Attack2', 'Die', 'Die2'] as const;
const FX = ['Acid1', 'Acid2', 'Acid3', 'Acid4', 'Acid5', 'Blood1', 'Blood2', 'Blood3', 'Blood4', 'Blood5'];

export interface DirAnimZ {
  frames: Texture[][]; // [5 stored dirs][frame]
  count: number;
  fps: number;
  anchorY: number; // baked feet line for this (trimmed) sheet
}
export interface ZombieAnims {
  run: DirAnimZ;
  walk: DirAnimZ;
  attack: DirAnimZ[]; // Attack1, Attack2
  die: DirAnimZ[]; // Die, Die2
}
export type ZombieSet = Record<string, ZombieAnims>;
export interface ZombieAssets {
  types: ZombieSet;
  acid: Texture[][];
  blood: Texture[][];
}

const raw: Record<string, Partial<Record<string, Texture>>> = {};
const rawFx: Record<string, Texture> = {};
let manifest: { ground: number; anchorY: Record<string, Record<string, number>> } | null = null;

function url(path: string): string {
  const base = typeof document !== 'undefined' ? document.baseURI : '/';
  return new URL(`assets/sprites/zombies/${path}`, base).href;
}

export async function preloadZombies(): Promise<void> {
  try {
    manifest = await (await fetch(url('atlas.json'))).json();
  } catch {
    manifest = null;
  }
  await Promise.all([
    ...ALL.map(async (t) => {
      raw[t] = {};
      await Promise.all(
        ANIMS.map(async (a) => {
          try {
            raw[t]![a] = (await Assets.load(url(`${t}/${a}.png`))) as Texture;
          } catch {
            /* optional */
          }
        }),
      );
    }),
    ...FX.map(async (f) => {
      try {
        rawFx[f] = (await Assets.load(url(`_fx/${f}.png`))) as Texture;
      } catch {
        /* optional */
      }
    }),
  ]);
}

export function zombiesLoaded(): boolean {
  return ALL.some((t) => raw[t]?.Run);
}

function sliceZ(type: string, animKey: string, fps: number): DirAnimZ | null {
  const tex = raw[type]?.[animKey];
  if (!tex) return null;
  tex.source.scaleMode = 'linear';
  const cw = tex.width / COLS;
  const ch = tex.height / ROWS;
  const frames: Texture[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: Texture[] = [];
    for (let c = 0; c < COLS; c++) {
      row.push(new Texture({ source: tex.source, frame: new Rectangle(c * cw, r * ch, cw, ch) }));
    }
    frames.push(row);
  }
  const anchorY = manifest?.anchorY?.[type]?.[animKey] ?? 0.66;
  return { frames, count: COLS, fps, anchorY };
}

export function buildZombies(): ZombieAssets | null {
  if (!zombiesLoaded()) return null;
  const types: ZombieSet = {};
  for (const t of ALL) {
    const run = sliceZ(t, 'Run', 16);
    if (!run) continue;
    types[t] = {
      run,
      walk: sliceZ(t, 'Walk', 11) ?? run,
      attack: [sliceZ(t, 'Attack1', 18), sliceZ(t, 'Attack2', 18)].filter(Boolean) as DirAnimZ[],
      die: [sliceZ(t, 'Die', 18), sliceZ(t, 'Die2', 18)].filter(Boolean) as DirAnimZ[],
    };
  }
  const acid: Texture[][] = [];
  const blood: Texture[][] = [];
  for (const f of FX) {
    const tex = rawFx[f];
    if (!tex) continue;
    tex.source.scaleMode = 'linear';
    const cw = tex.width / COLS;
    const out: Texture[] = [];
    for (let c = 0; c < COLS; c++) {
      out.push(new Texture({ source: tex.source, frame: new Rectangle(c * cw, 0, cw, tex.height) }));
    }
    (f.startsWith('Acid') ? acid : blood).push(out);
  }
  return { types, acid, blood };
}

export function resolveZombieType(id: string, texKind: number): string {
  const sig = ZOMBIE_BY_ID[id];
  if (sig && raw[sig]?.Run) return sig;
  const pool = ZOMBIE_POOLS[texKind] ?? ZOMBIE_POOLS[0];
  return pool[(Math.random() * pool.length) | 0];
}
