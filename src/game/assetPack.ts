// Optional pixel-art pack ("Zombie Apocalypse Tileset" by Ittai Manero) overlaid on
// top of the procedural textures. The real PNGs live in public/assets/sprites/ and are
// copied verbatim into the build (and cached by the service worker on first load).
//
// Two layers:
//   1. NEEDED (all-or-nothing) — the five static slots (player, enemy0-2, boss) baked
//      to the SAME footprint as the procedural slot they replace, so existing scale
//      math is unchanged. If any of these fail, the whole pack is skipped and the game
//      falls back to procedural art.
//   2. Extras (best-effort) — walk-cycle animation frames, the turret zombie, explosion
//      and blood FX, the money pickup, a ground tile and scenery props. Any extra that
//      fails to load is simply disabled; the static pack is unaffected.
//
// The source art is low-res (~16px) pixel art, so every texture uses nearest-neighbour
// scaling to stay crisp when scaled up.
//
// Licence note: the pack permits commercial/personal use but forbids redistribution,
// so it lives only in this (private) repo — see public/assets/sprites/CREDITS.txt.
import { Assets, Container, Sprite } from 'pixi.js';
import type { Renderer, Texture } from 'pixi.js';
import type { Textures } from './textures';

// Slots we override all-or-nothing: player, the 3 base enemy kinds, and the boss.
const NEEDED = ['player', 'enemy0', 'enemy1', 'enemy2', 'boss'] as const;

// Best-effort animation groups (indexed frame files <key>_<i>.png) and single sprites.
// The current art is static Meshy-rendered character sprites only, so the optional
// animation / FX / scenery layers are disabled (empty manifests). The machinery below
// is retained so a future animated pack can re-enable them by listing files here.
const ANIM_GROUPS: Record<string, number> = {};
const SINGLES: readonly string[] = [];

// Baked, ready-to-use animation frames and scenery. Built once after the static pack.
export interface AnimPack {
  player: Texture[];
  enemy: (Texture[] | null)[]; // walk frames by texKind 0..2 (null = not loaded)
  boss: Texture[];
  turret: Texture[];
  explosion: Texture[];
  blood: Texture[];
  ground: Texture | null;
  money: Texture | null;
  props: Texture[]; // trees / bushes / tombstone / sitting zombie / corpse
}

// Resolve against the document so the URL is correct under any deploy base ('./').
function spriteUrl(name: string): string {
  const base = typeof document !== 'undefined' ? document.baseURI : '/';
  return new URL(`assets/sprites/${name}.png`, base).href;
}

let raw: Record<string, Texture> | null = null;
let rawAnim: Record<string, Texture[]> = {};
let rawSingle: Record<string, Texture> = {};
let active = false;

// True once real sprites are in use — the game uses this to switch enemies/player to
// upright, mirrored rendering and to enable the animation / FX / scenery layers.
export function isAssetPackActive(): boolean {
  return active;
}

async function loadTex(name: string): Promise<Texture> {
  const t = (await Assets.load(spriteUrl(name))) as Texture;
  t.source.scaleMode = 'linear'; // smooth filtering for the rendered cartoon art
  return t;
}

// Async step: fetch + decode the PNGs once at boot. Safe to call before any run.
export async function preloadAssetPack(): Promise<void> {
  try {
    const loaded: Record<string, Texture> = {};
    await Promise.all(NEEDED.map(async (n) => { loaded[n] = await loadTex(n); }));
    raw = loaded;
  } catch {
    raw = null;
    return; // no static pack → don't bother with the extras
  }
  // Extras are best-effort: any failure just disables that feature.
  try {
    const ra: Record<string, Texture[]> = {};
    await Promise.all(
      Object.entries(ANIM_GROUPS).map(async ([k, n]) => {
        ra[k] = await Promise.all(Array.from({ length: n }, (_, i) => loadTex(`${k}_${i}`)));
      }),
    );
    rawAnim = ra;
  } catch {
    rawAnim = {};
  }
  try {
    const rs: Record<string, Texture> = {};
    await Promise.all(SINGLES.map(async (k) => { rs[k] = await loadTex(k); }));
    rawSingle = rs;
  } catch {
    rawSingle = {};
  }
}

// Bake `src` scaled to fit within a target footprint, preserving aspect ratio.
function bakeFit(renderer: Renderer, src: Texture, w: number, h: number): Texture {
  // Scale the source to fit (w,h) preserving aspect, then bake. The sprite is wrapped
  // in a Container because generateTexture sizes from the target's *local* bounds,
  // which ignore a Sprite's own scale — a Container's bounds include it.
  const spr = new Sprite(src);
  spr.scale.set(Math.min(w / src.width, h / src.height));
  const cont = new Container();
  cont.addChild(spr);
  const tex = renderer.generateTexture({ target: cont, resolution: 2 });
  tex.source.scaleMode = 'linear';
  cont.destroy({ children: true });
  return tex;
}

// Sync step run inside createTextures: replace procedural slots with baked real art.
export function applyAssetPack(renderer: Renderer, tex: Textures): boolean {
  if (!raw) return false;
  tex.player = bakeFit(renderer, raw.player, tex.player.width, tex.player.height);
  tex.enemy[0] = bakeFit(renderer, raw.enemy0, tex.enemy[0].width, tex.enemy[0].height);
  tex.enemy[1] = bakeFit(renderer, raw.enemy1, tex.enemy[1].width, tex.enemy[1].height);
  tex.enemy[2] = bakeFit(renderer, raw.enemy2, tex.enemy[2].width, tex.enemy[2].height);
  tex.boss = bakeFit(renderer, raw.boss, tex.boss.width, tex.boss.height);
  active = true;
  return true;
}

// Composite a large, varied ground texture from the 4 terrain variants (mostly plain
// dirt with sparse rubble) plus the odd grass patch, so the tiled ground reads as
// organic instead of one 16px stamp repeating. Returns null if no tiles loaded.
function buildGround(renderer: Renderer): Texture | null {
  const tiles = ['ground_0', 'ground_1', 'ground_2', 'ground_3']
    .map((k) => rawSingle[k])
    .filter((t): t is Texture => !!t);
  if (!tiles.length) return null;
  const base = tiles.slice(0, Math.min(2, tiles.length)); // plain dirt = the field
  const debris = tiles.slice(2); // rubble = rare accents only
  const N = 24; // tiles per side → 768px period, repeats far less obviously
  const D = 32; // on-screen px per 16px tile (×2 — finer than the old ×4 stamp)
  const cont = new Container();
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const src =
        debris.length > 0 && Math.random() < 0.012
          ? debris[(Math.random() * debris.length) | 0]
          : base[(Math.random() * base.length) | 0];
      const s = new Sprite(src);
      // Centre each cell, then randomly rotate/flip so the plain tiles don't read as
      // a grid — the specks scatter and the seams disappear.
      s.anchor.set(0.5);
      s.position.set(x * D + D / 2, y * D + D / 2);
      s.width = D;
      s.height = D;
      s.rotation = ((Math.random() * 4) | 0) * (Math.PI / 2);
      if (Math.random() < 0.5) s.scale.x = -s.scale.x;
      if (Math.random() < 0.5) s.scale.y = -s.scale.y;
      cont.addChild(s);
    }
  }
  const tex = renderer.generateTexture({ target: cont, resolution: 1 });
  tex.source.scaleMode = 'nearest';
  cont.destroy({ children: true });
  return tex;
}

// Sync step run after applyAssetPack: bake the best-effort animation + scenery layer.
// Returns null if the static pack isn't active. Each group degrades independently —
// a group that didn't load comes back empty, and callers fall back to the static slot.
export function buildAnimPack(renderer: Renderer, tex: Textures): AnimPack | null {
  if (!active) return null;
  const frames = (key: string, w: number, h: number): Texture[] =>
    (rawAnim[key] ?? []).map((f) => bakeFit(renderer, f, w, h));
  const single = (key: string, w: number, h: number): Texture | null =>
    rawSingle[key] ? bakeFit(renderer, rawSingle[key], w, h) : null;

  // Scenery props, each baked to a hand-picked world size (art is ~16px).
  const propSpecs: [string, number][] = [
    ['tree_0', 46], ['tree_1', 46], ['tree_2', 42], ['bush_0', 34], ['bush_1', 30],
    ['tomb_0', 30], ['sit_0', 30], ['corpse_0', 28],
  ];
  const props: Texture[] = [];
  for (const [k, s] of propSpecs) {
    const t = single(k, s, s);
    if (t) props.push(t);
  }

  return {
    player: frames('player', tex.player.width, tex.player.height),
    enemy: [
      rawAnim.z0 ? frames('z0', tex.enemy[0].width, tex.enemy[0].height) : null,
      rawAnim.z1 ? frames('z1', tex.enemy[1].width, tex.enemy[1].height) : null,
      rawAnim.z2 ? frames('z2', tex.enemy[2].width, tex.enemy[2].height) : null,
    ],
    boss: frames('z2', tex.boss.width, tex.boss.height),
    turret: frames('zt', tex.enemy[1].width, tex.enemy[1].height),
    explosion: frames('fx_exp', 46, 46),
    blood: frames('fx_blood', 30, 30),
    ground: buildGround(renderer),
    money: single('money', 20, 20),
    props,
  };
}
