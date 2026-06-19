// HD zombie enemies — same 8-direction format as the survivor, but many types.
//
// Each sheet is a 15-frame x 8-direction grid; the cell size varies per type (standard
// zombies use 128px cells / 1920x1024, the big ones use 192px cells / 2880x1536), so we
// derive the cell from width/15 x height/8 rather than assuming a constant.
//
// Types are grouped into pools that line up with the game's four enemy classes (texKind
// 0=walkers, 1=fast/small, 2=brutes, 3=bosses). Each spawn picks a random type from the
// matching pool, so the horde shows lots of variety from one shared set of textures.
import { Assets, Texture, Rectangle } from 'pixi.js';
import type { DirAnim } from './survivorSprite';

const COLS = 15;
const ROWS = 8;

export const ZOMBIE_POOLS: string[][] = [
  ['ZombieMale1', 'ZombieMale2', 'ZombieMale4', 'ZombieFemale1', 'ZombieCop1'], // 0 walkers
  ['ZombieSoldier1', 'ZombieRadioactive1', 'ZombieFemale3'], // 1 fast / small
  ['ZombieHulk1', 'ZombieMonster1'], // 2 brutes
  ['ZombieGeneral1', 'ZombieMonster2'], // 3 bosses
];
const ALL = [...new Set(ZOMBIE_POOLS.flat())];

// Animations to load per type. Run drives movement; Die plays once on death.
const ANIMS = ['Run', 'Die'] as const;

export interface ZombieAnims {
  run: DirAnim;
  die: DirAnim | null;
  cell: number; // px size of one frame cell (for display scaling)
}
export type ZombieSet = Record<string, ZombieAnims>;

const raw: Record<string, Partial<Record<string, Texture>>> = {};

function url(type: string, anim: string): string {
  const base = typeof document !== 'undefined' ? document.baseURI : '/';
  return new URL(`assets/sprites/zombies/${type}/${anim}.png`, base).href;
}

export async function preloadZombies(): Promise<void> {
  await Promise.all(
    ALL.map(async (t) => {
      raw[t] = {};
      await Promise.all(
        ANIMS.map(async (a) => {
          try {
            raw[t]![a] = (await Assets.load(url(t, a))) as Texture;
          } catch {
            /* optional */
          }
        }),
      );
    }),
  );
}

export function zombiesLoaded(): boolean {
  return ALL.some((t) => raw[t]?.Run);
}

function slice(tex: Texture, fps: number, loop: boolean): DirAnim {
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

export function buildZombies(): ZombieSet | null {
  if (!zombiesLoaded()) return null;
  const set: ZombieSet = {};
  for (const t of ALL) {
    const r = raw[t];
    if (!r?.Run) continue;
    set[t] = {
      run: slice(r.Run, 16, true),
      die: r.Die ? slice(r.Die, 18, false) : null,
      cell: r.Run.width / COLS,
    };
  }
  return set;
}

// Pick a random zombie type id for a given enemy class (texKind 0..3).
export function pickZombieType(texKind: number): string {
  const pool = ZOMBIE_POOLS[texKind] ?? ZOMBIE_POOLS[0];
  return pool[(Math.random() * pool.length) | 0];
}
