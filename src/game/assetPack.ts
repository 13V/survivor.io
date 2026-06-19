// Optional CC0 art pack (Kenney "Top-down Shooter", public domain) overlaid on top
// of the procedural textures. The real PNGs live in public/assets/sprites/ and are
// copied verbatim into the build (and cached by the service worker on first load).
// Each is baked to the SAME footprint as the procedural slot it replaces, so the
// game's existing scale math is unchanged — a pure drop-in. If the files are missing
// or fail to load, the procedural art is used as a fallback and nothing else changes.
import { Assets, Sprite } from 'pixi.js';
import type { Renderer, Texture } from 'pixi.js';
import type { Textures } from './textures';

// Slots we override: player, the 3 base enemy kinds, and the boss.
const NEEDED = ['player', 'enemy0', 'enemy1', 'enemy2', 'boss'] as const;

// Resolve against the document so the URL is correct under any deploy base ('./').
function spriteUrl(name: string): string {
  const base = typeof document !== 'undefined' ? document.baseURI : '/';
  return new URL(`assets/sprites/${name}.png`, base).href;
}

let raw: Record<string, Texture> | null = null;
let active = false;

// True once real sprites are in use — the game uses this to enable aim/facing
// rotation (Kenney top-down art faces east; procedural art faces up and stays put).
export function isAssetPackActive(): boolean {
  return active;
}

// Async step: fetch + decode the PNGs once at boot. Safe to call before any run.
// All-or-nothing: if any file is unavailable we fall back to procedural art.
export async function preloadAssetPack(): Promise<void> {
  try {
    const loaded: Record<string, Texture> = {};
    await Promise.all(
      NEEDED.map(async (n) => {
        loaded[n] = (await Assets.load(spriteUrl(n))) as Texture;
      }),
    );
    raw = loaded;
  } catch {
    raw = null;
  }
}

// Bake `src` scaled to fit within a target footprint, preserving aspect ratio.
function bakeFit(renderer: Renderer, src: Texture, w: number, h: number): Texture {
  const spr = new Sprite(src);
  spr.scale.set(Math.min(w / src.width, h / src.height));
  const tex = renderer.generateTexture({ target: spr, resolution: 2 });
  spr.destroy();
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
