// Optional art overlay on top of the procedural textures. Each of the five character
// slots (player, enemy0-2, boss) is overridden INDEPENDENTLY: drop a PNG named after a
// slot into public/assets/sprites/ and it replaces that slot's procedural texture; any
// slot without a PNG keeps its procedural art. Walk-cycle frames (z0/z1/z2_<i>.png) and
// a few other best-effort layers animate the enemies when present.
//
// Art currently in use: a pixel-art zombie (Run cycle) for the three enemy kinds + boss,
// with the procedural cartoon hero kept for the player. Everything is nearest-filtered
// to stay crisp. Missing files just fall back to procedural art.
import { Assets, Container, Sprite } from 'pixi.js';
import type { Renderer, Texture } from 'pixi.js';
import type { Textures } from './textures';

// Character slots, each overridden independently if its PNG is present.
const SLOTS = ['player', 'enemy0', 'enemy1', 'enemy2', 'boss'] as const;

// Best-effort walk-cycle frame groups (<key>_<i>.png), each degrading on its own.
const ANIM_GROUPS: Record<string, number> = { z0: 8, z1: 8, z2: 8 };
const SINGLES: readonly string[] = [];

export interface AnimPack {
  player: Texture[];
  enemy: (Texture[] | null)[]; // walk frames by texKind 0..2 (null = not loaded)
  boss: Texture[];
  turret: Texture[];
  explosion: Texture[];
  blood: Texture[];
  ground: Texture | null;
  money: Texture | null;
  props: Texture[];
}

function spriteUrl(name: string): string {
  const base = typeof document !== 'undefined' ? document.baseURI : '/';
  return new URL(`assets/sprites/${name}.png`, base).href;
}

let raw: Record<string, Texture> = {};
let rawAnim: Record<string, Texture[]> = {};
let rawSingle: Record<string, Texture> = {};
let active = false;

// True once at least one real character slot is in use.
export function isAssetPackActive(): boolean {
  return active;
}

async function loadTex(name: string): Promise<Texture> {
  const t = (await Assets.load(spriteUrl(name))) as Texture;
  t.source.scaleMode = 'nearest'; // crisp pixel art
  return t;
}

// Async step: fetch + decode the PNGs once at boot. Safe to call before any run.
// Every slot/group is best-effort and independent.
export async function preloadAssetPack(): Promise<void> {
  raw = {};
  rawAnim = {};
  rawSingle = {};
  await Promise.all(
    SLOTS.map(async (n) => {
      try {
        raw[n] = await loadTex(n);
      } catch {
        /* slot stays procedural */
      }
    }),
  );
  await Promise.all(
    Object.entries(ANIM_GROUPS).map(async ([k, n]) => {
      try {
        rawAnim[k] = await Promise.all(Array.from({ length: n }, (_, i) => loadTex(`${k}_${i}`)));
      } catch {
        /* group stays absent */
      }
    }),
  );
  await Promise.all(
    SINGLES.map(async (k) => {
      try {
        rawSingle[k] = await loadTex(k);
      } catch {
        /* single stays absent */
      }
    }),
  );
}

// Bake `src` to fit (w,h) preserving aspect. Wrapped in a Container so generateTexture
// (which sizes from the target's *local* bounds, ignoring a Sprite's own scale) honours
// the fit scale.
function bakeFit(renderer: Renderer, src: Texture, w: number, h: number): Texture {
  const spr = new Sprite(src);
  spr.scale.set(Math.min(w / src.width, h / src.height));
  const cont = new Container();
  cont.addChild(spr);
  const tex = renderer.generateTexture({ target: cont, resolution: 2 });
  tex.source.scaleMode = 'nearest';
  cont.destroy({ children: true });
  return tex;
}

// Sync step in createTextures: replace whichever procedural slots have a real PNG.
export function applyAssetPack(renderer: Renderer, tex: Textures): boolean {
  if (raw.player) tex.player = bakeFit(renderer, raw.player, tex.player.width, tex.player.height);
  if (raw.enemy0) tex.enemy[0] = bakeFit(renderer, raw.enemy0, tex.enemy[0].width, tex.enemy[0].height);
  if (raw.enemy1) tex.enemy[1] = bakeFit(renderer, raw.enemy1, tex.enemy[1].width, tex.enemy[1].height);
  if (raw.enemy2) tex.enemy[2] = bakeFit(renderer, raw.enemy2, tex.enemy[2].width, tex.enemy[2].height);
  if (raw.boss) tex.boss = bakeFit(renderer, raw.boss, tex.boss.width, tex.boss.height);
  active = Object.keys(raw).length > 0;
  return active;
}

// Optional composite ground from terrain tiles (unused unless ground_* PNGs exist).
function buildGround(renderer: Renderer): Texture | null {
  const tiles = ['ground_0', 'ground_1', 'ground_2', 'ground_3']
    .map((k) => rawSingle[k])
    .filter((t): t is Texture => !!t);
  if (!tiles.length) return null;
  const base = tiles.slice(0, Math.min(2, tiles.length));
  const debris = tiles.slice(2);
  const N = 24;
  const D = 32;
  const cont = new Container();
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const src =
        debris.length > 0 && Math.random() < 0.012
          ? debris[(Math.random() * debris.length) | 0]
          : base[(Math.random() * base.length) | 0];
      const s = new Sprite(src);
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

// Sync step after applyAssetPack: bake the best-effort animation + scenery layer.
export function buildAnimPack(renderer: Renderer, tex: Textures): AnimPack | null {
  if (!active) return null;
  const frames = (key: string, w: number, h: number): Texture[] =>
    (rawAnim[key] ?? []).map((f) => bakeFit(renderer, f, w, h));
  const single = (key: string, w: number, h: number): Texture | null =>
    rawSingle[key] ? bakeFit(renderer, rawSingle[key], w, h) : null;

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
    boss: rawAnim.z2 ? frames('z2', tex.boss.width, tex.boss.height) : [],
    turret: frames('zt', tex.enemy[1].width, tex.enemy[1].height),
    explosion: frames('fx_exp', 46, 46),
    blood: frames('fx_blood', 30, 30),
    ground: buildGround(renderer),
    money: single('money', 20, 20),
    props,
  };
}
