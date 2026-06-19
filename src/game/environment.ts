// Urban environment layer from the "2D HD Zombie City Tileset": a tiled street ground,
// scattered iso scenery (buildings, car wrecks, street clutter, overgrowth, fences),
// flat blood/detail decals, and animated FX (blood bursts, muzzle flash, fire barrels).
// Each category was trimmed/sliced into assets/sprites/env/<cat>/ (see tools/envproc.mjs
// and the asset-prep agents); here we just load each category's manifest into textures.
import { Assets, Texture } from 'pixi.js';

export interface EnvAssets {
  ground: Texture[]; // flat street/sidewalk floor tiles
  buildings: Texture[]; // iso building / facade obstacles
  decals: Texture[]; // blood splats (flat)
  detail: Texture[]; // cracks, manholes, oil, paint (flat)
  cars: Texture[]; // wrecked vehicles
  objects: Texture[]; // dumpsters, barrels, crates, cones, hydrants...
  flora: Texture[]; // bushes, weeds, overgrowth
  street: Texture[]; // fences, posts, lamps
  bloodfx: Texture[][]; // per-effect animated blood-burst frame lists
  muzzle: Texture[]; // muzzle-flash flipbook
  firebarrel: Texture[]; // flaming-barrel loop
  isoground: Record<string, Texture>; // named iso street tiles (asphalt/asphalt_yellow/sidewalk/...)
  isoMeta: { diamondW: number; diamondH: number; apexX: number; apexY: number } | null;
  buildings2: Texture[]; // composed complete iso buildings (walls + roof + detail), placed as blocks
  extras: Record<string, Texture[]>; // street furniture categories: railing, lamps, signs, rooftop, bins, ...
}

const TILE_CATS = ['ground', 'buildings', 'decals', 'detail', 'cars', 'objects', 'flora', 'street'] as const;
const raw: Record<string, Texture[]> = {};
const bloodfx: Texture[][] = [];
let muzzle: Texture[] = [];
let firebarrel: Texture[] = [];
const isoground: Record<string, Texture> = {};
let isoMeta: EnvAssets['isoMeta'] = null;
let buildings2: Texture[] = [];
const extras: Record<string, Texture[]> = {};
const EXTRA_CATS = ['railing', 'lamps', 'signs', 'rooftop', 'bins', 'rubble', 'furniture', 'struct', 'traffic', 'trees', 'graffiti', 'roaddetail', 'taxi', 'sedan'];

function url(p: string): string {
  const base = typeof document !== 'undefined' ? document.baseURI : '/';
  return new URL(`assets/sprites/env/${p}`, base).href;
}

async function loadList(paths: string[]): Promise<Texture[]> {
  // Promise.all preserves order, so the manifest order is kept (e.g. ground[0] = asphalt).
  const loaded = await Promise.all(
    paths.map(async (rel) => {
      try {
        const tex = (await Assets.load(url(rel))) as Texture;
        tex.source.scaleMode = 'linear';
        return tex;
      } catch {
        return null;
      }
    }),
  );
  return loaded.filter((t): t is Texture => t !== null);
}

async function manifest(cat: string): Promise<Record<string, unknown> | null> {
  try {
    return (await (await fetch(url(`${cat}/manifest.json`))).json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function preloadEnv(): Promise<void> {
  await Promise.all([
    ...TILE_CATS.map(async (c) => {
      const man = (await manifest(c)) as { tiles?: { file: string }[] } | null;
      raw[c] = man?.tiles ? await loadList(man.tiles.map((t) => `${c}/${t.file}`)) : [];
    }),
    (async () => {
      const man = (await manifest('bloodfx')) as { effects?: { frames: string[] }[] } | null;
      if (man?.effects) {
        for (const e of man.effects) bloodfx.push(await loadList(e.frames.map((f) => `bloodfx/${f}`)));
      }
    })(),
    (async () => {
      const man = (await manifest('muzzle')) as { frames?: string[] } | null;
      if (man?.frames) muzzle = await loadList(man.frames.map((f) => `muzzle/${f}`));
    })(),
    (async () => {
      const man = (await manifest('firebarrel')) as { frames?: string[] } | null;
      if (man?.frames) firebarrel = await loadList(man.frames.map((f) => `firebarrel/${f}`));
    })(),
    (async () => {
      const man = (await manifest('isoground')) as
        | { diamondW: number; diamondH: number; apexX: number; apexY: number; tiles?: { file: string; name?: string }[] }
        | null;
      if (man?.tiles) {
        isoMeta = { diamondW: man.diamondW, diamondH: man.diamondH, apexX: man.apexX, apexY: man.apexY };
        await Promise.all(
          man.tiles.map(async (t) => {
            try {
              const tex = (await Assets.load(url(`isoground/${t.file}`))) as Texture;
              tex.source.scaleMode = 'nearest'; // crisp pixel-art street tiles, no seam bleed
              isoground[t.name ?? t.file.replace('.png', '')] = tex;
            } catch {
              /* skip */
            }
          }),
        );
      }
    })(),
    (async () => {
      const man = (await manifest('buildings2')) as { tiles?: { file: string }[] } | null;
      if (man?.tiles) buildings2 = await loadList(man.tiles.map((t) => `buildings2/${t.file}`));
    })(),
    ...EXTRA_CATS.map(async (c) => {
      const man = (await manifest(c)) as { tiles?: { file: string }[] } | null;
      extras[c] = man?.tiles ? await loadList(man.tiles.map((t) => `${c}/${t.file}`)) : [];
    }),
  ]);
}

export function envLoaded(): boolean {
  return (raw.objects?.length ?? 0) + (raw.cars?.length ?? 0) + (raw.decals?.length ?? 0) > 0;
}

export function buildEnv(): EnvAssets | null {
  if (!envLoaded()) return null;
  return {
    ground: raw.ground ?? [],
    buildings: raw.buildings ?? [],
    decals: raw.decals ?? [],
    detail: raw.detail ?? [],
    cars: raw.cars ?? [],
    objects: raw.objects ?? [],
    flora: raw.flora ?? [],
    street: raw.street ?? [],
    bloodfx,
    muzzle,
    firebarrel,
    isoground,
    isoMeta,
    buildings2,
    extras,
  };
}
