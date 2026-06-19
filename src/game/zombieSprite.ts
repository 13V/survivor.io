// HD zombie enemies — 8-direction sheets (same family as the survivor) plus FX strips.
//
// Character sheets are a 15-frame x 8-direction grid; cell = width/15 x height/8 (the
// source mixes 128/192px cells and we downscale to 64px, so we derive it per sheet).
// Acid/Blood are 15-frame single-row FX strips. Types are grouped into pools that match
// the game's four enemy classes (texKind 0=walkers, 1=fast, 2=brutes, 3=bosses); each
// spawn picks a random type for a varied horde, while named bosses get a signature type.
import { Assets, Texture, Rectangle } from 'pixi.js';
import type { DirAnim } from './survivorSprite';

const COLS = 15;
const ROWS = 8;

export const ZOMBIE_POOLS: string[][] = [
  // 0 walkers (the common horde): all males + females
  [
    'ZombieMale1', 'ZombieMale2', 'ZombieMale3', 'ZombieMale4', 'ZombieMale5', 'ZombieMale6',
    'ZombieMale7', 'ZombieMale8', 'ZombieMale9', 'ZombieFemale1', 'ZombieFemale2', 'ZombieFemale3',
    'ZombieFemale4', 'ZombieFemale5', 'ZombieFemale6', 'ZombieFemale7',
  ],
  // 1 fast / small: uniformed + agile (cops, soldiers, radioactive)
  [
    'ZombieCop1', 'ZombieCop2', 'ZombieCop3', 'ZombieCop4', 'ZombieSoldier1', 'ZombieSoldier2',
    'ZombieSoldier3', 'ZombieSoldier4', 'ZombieSoldier5', 'ZombieSoldier6', 'ZombieRadioactive1',
    'ZombieRadioactive2', 'ZombieRadioactive3',
  ],
  // 2 brutes
  ['ZombieHulk1', 'ZombieHulk2', 'ZombieMonster1', 'ZombieMonster2', 'ZombieMonster3'],
  // 3 boss pool fallback
  ['ZombieGeneral1', 'ZombieGeneral2'],
];

// Signature zombie for named bosses (falls back to the class pool if unset/unloaded).
export const ZOMBIE_BY_ID: Record<string, string> = {
  colossus: 'ZombieHulk2',
  titan: 'ZombieHulk1',
  leviathan: 'ZombieMonster3',
  reaper: 'ZombieMonster2',
  warden: 'ZombieGeneral2',
  artillerist: 'ZombieGeneral1',
  broodmother: 'ZombieMonster1',
  rampager: 'ZombieMonster3',
  tempest: 'ZombieRadioactive2',
  warlord: 'ZombieGeneral2',
};

const ALL = [...new Set([...ZOMBIE_POOLS.flat(), ...Object.values(ZOMBIE_BY_ID)])];
const ANIMS = ['Run', 'Die', 'Attack1'] as const;
const FX = ['Acid1', 'Acid2', 'Acid3', 'Acid4', 'Acid5', 'Blood1', 'Blood2', 'Blood3', 'Blood4', 'Blood5'];

export interface ZombieAnims {
  run: DirAnim;
  die: DirAnim | null;
  attack: DirAnim | null;
  cell: number; // px size of one frame cell (for display scaling)
}
export type ZombieSet = Record<string, ZombieAnims>;
export interface ZombieAssets {
  types: ZombieSet;
  acid: Texture[][]; // variants x 15 frames
  blood: Texture[][];
}

const raw: Record<string, Partial<Record<string, Texture>>> = {};
const rawFx: Record<string, Texture> = {};

function url(path: string): string {
  const base = typeof document !== 'undefined' ? document.baseURI : '/';
  return new URL(`assets/sprites/zombies/${path}`, base).href;
}

export async function preloadZombies(): Promise<void> {
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

function sliceDir(tex: Texture, fps: number, loop: boolean): DirAnim {
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
  return { frames, count: COLS, fps, loop };
}

function sliceStrip(tex: Texture): Texture[] {
  tex.source.scaleMode = 'linear';
  const cw = tex.width / COLS;
  const out: Texture[] = [];
  for (let c = 0; c < COLS; c++) {
    out.push(new Texture({ source: tex.source, frame: new Rectangle(c * cw, 0, cw, tex.height) }));
  }
  return out;
}

export function buildZombies(): ZombieAssets | null {
  if (!zombiesLoaded()) return null;
  const types: ZombieSet = {};
  for (const t of ALL) {
    const r = raw[t];
    if (!r?.Run) continue;
    types[t] = {
      run: sliceDir(r.Run, 16, true),
      die: r.Die ? sliceDir(r.Die, 18, false) : null,
      attack: r.Attack1 ? sliceDir(r.Attack1, 18, true) : null,
      cell: r.Run.width / COLS,
    };
  }
  const acid: Texture[][] = [];
  const blood: Texture[][] = [];
  for (const f of FX) {
    const tex = rawFx[f];
    if (!tex) continue;
    (f.startsWith('Acid') ? acid : blood).push(sliceStrip(tex));
  }
  return { types, acid, blood };
}

// Resolve the zombie type id for an enemy: signature type for named bosses, else a random
// pick from the class pool.
export function resolveZombieType(id: string, texKind: number): string {
  const sig = ZOMBIE_BY_ID[id];
  if (sig && raw[sig]?.Run) return sig;
  const pool = ZOMBIE_POOLS[texKind] ?? ZOMBIE_POOLS[0];
  return pool[(Math.random() * pool.length) | 0];
}
