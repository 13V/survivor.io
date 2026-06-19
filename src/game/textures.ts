// Generate primitive textures at runtime so the prototype needs no art assets.
// Characters are drawn as flat, bold "survivor.io"-style cartoons: thick dark
// outlines, flat colour fills, chunky rounded silhouettes and big white dot eyes,
// so the cast reads clearly at small size on a busy field. Everything is drawn with
// Pixi v8 Graphics centered at (0,0) and baked once into a Texture.
import { Graphics, Texture } from 'pixi.js';
import type { Renderer } from 'pixi.js';
import { applyAssetPack, buildAnimPack } from './assetPack';
import type { AnimPack } from './assetPack';
import { buildSurvivor } from './survivorSprite';
import type { SurvivorSprite } from './survivorSprite';
import { buildZombies } from './zombieSprite';
import type { ZombieSet } from './zombieSprite';

export interface Textures {
  player: Texture;
  enemy: Texture[]; // index by Enemy.kind (0 basic, 1 fast, 2 tank)
  boss: Texture;
  projectile: Texture;
  blade: Texture;
  gem: Texture[]; // 0 green, 1 blue, 2 gold, 3 heal
  // Best-effort animation + scenery layer from the art pack (null in procedural mode).
  anim?: AnimPack | null;
  // 8-direction HD survivor player sprite (null if its sheets weren't loaded).
  survivor?: SurvivorSprite | null;
  // 8-direction HD zombie enemy set, keyed by type id (null if not loaded).
  zombies?: ZombieSet | null;
}

// Bake a Graphics into a texture and clean it up. All builders funnel through here.
function bake(renderer: Renderer, g: Graphics): Texture {
  const tex = renderer.generateTexture({ target: g, resolution: 2 });
  g.destroy();
  return tex;
}

// Shared cartoon ink (outline) colour.
const INK = 0x2a2018;

// Big white cartoon eyes with dark pupils, mirrored left/right. Pupils sit slightly
// low/inward for that cute survivor.io stare.
function eyes(g: Graphics, ox: number, oy: number, R: number, lw: number): void {
  for (const s of [-1, 1]) {
    g.circle(s * ox, oy, R).fill(0xffffff);
    g.circle(s * ox, oy, R).stroke({ width: lw, color: INK, alignment: 0.5 });
    g.circle(s * ox + s * R * 0.04, oy + R * 0.2, R * 0.42).fill(INK);
  }
}

// ----------------------------------------------------------------------------
// Player: a clean hero — rounded jacket body, round head, a ball-cap and a little
// sidearm. Bold outline. Collision radius ~18.
// ----------------------------------------------------------------------------
function makePlayer(renderer: Renderer): Texture {
  const r = 18;
  const g = new Graphics();
  const jacket = 0x3f78c2;
  const jacketLo = 0x315f9c;
  const skin = 0xeec08c;
  const cap = 0xd8483a;
  const pants = 0x2b3a55;

  // legs
  g.roundRect(-r * 0.5, r * 0.62, r * 0.36, r * 0.55, 3).fill(pants).stroke({ width: 2.6, color: INK });
  g.roundRect(r * 0.14, r * 0.62, r * 0.36, r * 0.55, 3).fill(pants).stroke({ width: 2.6, color: INK });
  // sidearm
  g.roundRect(r * 0.62, r * 0.18, r * 0.62, r * 0.22, 2).fill(0x39414a).stroke({ width: 2, color: INK });
  // jacket body
  g.roundRect(-r * 0.82, -r * 0.18, r * 1.64, r * 1.2, r * 0.42).fill(jacket).stroke({ width: 3, color: INK, alignment: 0.5 });
  g.roundRect(-r * 0.16, -r * 0.16, r * 0.32, r * 1.12, r * 0.14).fill({ color: jacketLo, alpha: 0.9 }); // zip
  // head
  g.circle(0, -r * 0.5, r * 0.66).fill(skin).stroke({ width: 3, color: INK, alignment: 0.5 });
  // cap: dome + brim (drawn over the top of the head)
  g.arc(0, -r * 0.52, r * 0.66, Math.PI, 0).fill(cap);
  g.ellipse(0, -r * 0.52, r * 0.66, r * 0.5).stroke({ width: 3, color: INK, alignment: 0.5 });
  g.roundRect(-r * 0.78, -r * 0.6, r * 1.05, r * 0.2, r * 0.1).fill(cap).stroke({ width: 2.4, color: INK, alignment: 0.5 });
  // eyes
  eyes(g, r * 0.24, -r * 0.42, r * 0.17, 2.2);

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Basic zombie (kind 0): the iconic chunky green block with a torn blue shirt,
// stubby legs and big goofy eyes. Collision radius ~16.
// ----------------------------------------------------------------------------
function makeZombie(renderer: Renderer): Texture {
  const r = 16;
  const g = new Graphics();
  const green = 0x8ebd4e;
  const shirt = 0x3f7fb5;

  // legs
  g.roundRect(-r * 0.46, r * 0.74, r * 0.34, r * 0.5, 3).fill(INK);
  g.roundRect(r * 0.12, r * 0.74, r * 0.34, r * 0.5, 3).fill(INK);
  // body block (green) with shirt as a lower band
  g.roundRect(-r * 0.9, -r * 0.92, r * 1.8, r * 1.86, r * 0.5).fill(green);
  g.roundRect(-r * 0.9, r * 0.08, r * 1.8, r * 0.86, r * 0.34).fill(shirt);
  g.roundRect(-r * 0.9, -r * 0.92, r * 1.8, r * 1.86, r * 0.5).stroke({ width: 3.2, color: INK, alignment: 0.5 });
  // collar line
  g.moveTo(-r * 0.84, r * 0.12).lineTo(r * 0.84, r * 0.12).stroke({ width: 2, color: INK });
  // eyes + flat mouth
  eyes(g, r * 0.34, -r * 0.26, r * 0.3, 2.4);
  g.moveTo(-r * 0.22, r * 0.62).lineTo(r * 0.24, r * 0.6).stroke({ width: 2.2, color: INK });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Fast zombie (kind 1): smaller and leaner, a mop of hair, an orange tee, beady
// eager eyes. Reads as "runner". Collision radius ~13.
// ----------------------------------------------------------------------------
function makeFast(renderer: Renderer): Texture {
  const r = 13;
  const g = new Graphics();
  const green = 0x9cc24f;
  const shirt = 0xe0782e;
  const hair = 0xe7c768;

  g.roundRect(-r * 0.44, r * 0.72, r * 0.3, r * 0.5, 3).fill(INK);
  g.roundRect(r * 0.14, r * 0.72, r * 0.3, r * 0.5, 3).fill(INK);
  g.roundRect(-r * 0.78, -r * 0.74, r * 1.56, r * 1.66, r * 0.46).fill(green);
  g.roundRect(-r * 0.78, r * 0.12, r * 1.56, r * 0.78, r * 0.32).fill(shirt);
  g.roundRect(-r * 0.78, -r * 0.74, r * 1.56, r * 1.66, r * 0.46).stroke({ width: 3, color: INK, alignment: 0.5 });
  // spiky hair on top
  g.poly([
    -r * 0.7, -r * 0.5, -r * 0.5, -r * 1.05, -r * 0.2, -r * 0.6,
    0, -r * 1.15, r * 0.22, -r * 0.6, r * 0.5, -r * 1.0, r * 0.7, -r * 0.5,
  ]).fill(hair).stroke({ width: 2.4, color: INK, alignment: 0.5 });
  eyes(g, r * 0.32, -r * 0.18, r * 0.26, 2.2);

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Tank zombie (kind 2): a hulking green brute with heavy grey limbs and a wide
// jagged grin. Big and blocky. Collision radius ~24.
// ----------------------------------------------------------------------------
function makeTank(renderer: Renderer): Texture {
  const r = 24;
  const g = new Graphics();
  const green = 0x82a945;
  const grey = 0x9aa0a6;

  // grey feet
  g.roundRect(-r * 0.62, r * 0.74, r * 0.5, r * 0.6, 4).fill(grey).stroke({ width: 3, color: INK });
  g.roundRect(r * 0.12, r * 0.74, r * 0.5, r * 0.6, 4).fill(grey).stroke({ width: 3, color: INK });
  // one heavy grey arm on the left
  g.roundRect(-r * 1.18, -r * 0.1, r * 0.52, r * 1.0, 6).fill(grey).stroke({ width: 3, color: INK });
  // body
  g.roundRect(-r * 0.96, -r * 0.98, r * 1.92, r * 1.9, r * 0.42).fill(green).stroke({ width: 3.6, color: INK, alignment: 0.5 });
  // wide jagged mouth with teeth
  g.roundRect(-r * 0.52, r * 0.18, r * 1.04, r * 0.46, 5).fill(INK);
  for (let i = 0; i < 4; i++) {
    const x = -r * 0.46 + i * r * 0.3;
    g.poly([x, r * 0.2, x + r * 0.18, r * 0.2, x + r * 0.09, r * 0.42]).fill(0xffffff);
  }
  // eyes
  eyes(g, r * 0.36, -r * 0.36, r * 0.26, 2.8);

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Boss (kind 3): a giant, darker brute with grey armour plates, a snarling tusked
// maw and glaring eyes. Commands the screen. Collision radius ~58.
// ----------------------------------------------------------------------------
function makeBoss(renderer: Renderer): Texture {
  const r = 58;
  const g = new Graphics();
  const green = 0x6f9a3c;
  const greenLo = 0x577d2c;
  const grey = 0x8b9197;

  // heavy grey legs + arms
  g.roundRect(-r * 0.66, r * 0.66, r * 0.56, r * 0.66, 8).fill(grey).stroke({ width: 5, color: INK });
  g.roundRect(r * 0.1, r * 0.66, r * 0.56, r * 0.66, 8).fill(grey).stroke({ width: 5, color: INK });
  g.roundRect(-r * 1.18, -r * 0.2, r * 0.5, r * 1.1, 9).fill(grey).stroke({ width: 5, color: INK });
  g.roundRect(r * 0.68, -r * 0.2, r * 0.5, r * 1.1, 9).fill(grey).stroke({ width: 5, color: INK });
  // body
  g.roundRect(-r * 1.0, -r * 1.0, r * 2.0, r * 1.96, r * 0.4).fill(green).stroke({ width: 6, color: INK, alignment: 0.5 });
  // chest armour plate
  g.roundRect(-r * 0.46, -r * 0.5, r * 0.92, r * 0.62, r * 0.18).fill({ color: greenLo, alpha: 0.9 });
  // snarling maw with tusks
  g.roundRect(-r * 0.58, r * 0.22, r * 1.16, r * 0.5, 7).fill(INK);
  for (let i = 0; i < 5; i++) {
    const x = -r * 0.5 + i * r * 0.26;
    g.poly([x, r * 0.24, x + r * 0.16, r * 0.24, x + r * 0.08, r * 0.46]).fill(0xffffff);
  }
  g.poly([-r * 0.5, r * 0.24, -r * 0.62, r * 0.6, -r * 0.36, r * 0.36]).fill(0xffffff).stroke({ width: 3, color: INK }); // tusk
  g.poly([r * 0.5, r * 0.24, r * 0.62, r * 0.6, r * 0.36, r * 0.36]).fill(0xffffff).stroke({ width: 3, color: INK });
  // angry glaring eyes (red)
  for (const s of [-1, 1]) {
    g.circle(s * r * 0.36, -r * 0.4, r * 0.22).fill(0xffffff).stroke({ width: 4, color: INK, alignment: 0.5 });
    g.circle(s * r * 0.4, -r * 0.36, r * 0.1).fill(0xc0392b);
  }
  // angry brow
  g.poly([-r * 0.6, -r * 0.66, -r * 0.16, -r * 0.46, -r * 0.16, -r * 0.3, -r * 0.6, -r * 0.46]).fill(INK);
  g.poly([r * 0.6, -r * 0.66, r * 0.16, -r * 0.46, r * 0.16, -r * 0.3, r * 0.6, -r * 0.46]).fill(INK);

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Projectile: a bright 4-point shuriken / star-diamond with a glowing white-hot
// core. Stays pale so Game's per-weapon tint reads cleanly. Collision radius ~7.
// ----------------------------------------------------------------------------
function makeProjectile(renderer: Renderer): Texture {
  const r = 7;
  const g = new Graphics();

  g.circle(0, 0, r * 1.6).fill({ color: 0xfff3b0, alpha: 0.14 });
  g.circle(0, 0, r * 1.3).fill({ color: 0xfff3b0, alpha: 0.2 });

  const k = 0.4;
  const star = [
    0, -r, r * k, -r * k, r, 0, r * k, r * k,
    0, r, -r * k, r * k, -r, 0, -r * k, -r * k,
  ];
  g.poly(star).fill(0xffe98a);
  g.poly([0, -r, r * k, -r * k, r, 0, r * k, r * k, 0, r]).fill({ color: 0xfff6c8, alpha: 0.55 });
  g.circle(0, 0, r * 0.46).fill(0xfffce0);
  g.circle(0, 0, r * 0.24).fill(0xffffff);
  g.poly(star).stroke({ width: 1.25, color: 0xffffff, alignment: 0 });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Blade: an orbiting circular saw with a bright cyan cutting edge. Tinted by pet
// colour at runtime. Collision radius ~11.
// ----------------------------------------------------------------------------
function makeBlade(renderer: Renderer): Texture {
  const r = 11;
  const g = new Graphics();

  g.circle(0, 0, r * 1.4).fill({ color: 0x49c5ff, alpha: 0.14 });
  g.circle(0, 0, r * 1.18).fill({ color: 0x49c5ff, alpha: 0.2 });
  g.circle(0, 0, r).fill(0xeaffff);

  const teeth = 9;
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const tip = r * 1.2;
    const baseR = r * 0.86;
    const hw = 0.16;
    const tx = Math.cos(a) * tip;
    const ty = Math.sin(a) * tip;
    const b1x = Math.cos(a - hw) * baseR;
    const b1y = Math.sin(a - hw) * baseR;
    const b2x = Math.cos(a + hw) * baseR;
    const b2y = Math.sin(a + hw) * baseR;
    g.poly([tx, ty, b1x, b1y, b2x, b2y]).fill(0xbff0ff);
  }
  g.circle(r * 0.3, -r * 0.2, r * 0.66).fill(0x9fdcff);
  g.circle(0, 0, r * 0.3).fill(0x2f9fd6);
  g.circle(0, 0, r * 0.14).fill(0xeaffff);
  g.circle(0, 0, r).stroke({ width: 3, color: 0x49c5ff, alignment: 0.5 });
  g.circle(0, 0, r - 1.5).stroke({ width: 1, color: 0xeaffff, alignment: 0.5, alpha: 0.85 });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Gems: faceted crystals (green/blue/gold XP) + a red heal cross. Collision ~7-9.
// ----------------------------------------------------------------------------
function makeGem(renderer: Renderer, r: number, base: number, light: number, dark: number): Texture {
  const g = new Graphics();

  g.circle(0, 0, r * 1.5).fill({ color: base, alpha: 0.14 });
  g.circle(0, 0, r * 1.25).fill({ color: base, alpha: 0.2 });

  const crystal = [
    0, -r, r * 0.86, -r * 0.45, r * 0.86, r * 0.45,
    0, r, -r * 0.86, r * 0.45, -r * 0.86, -r * 0.45,
  ];
  g.poly(crystal).fill(base);
  g.poly([0, -r, 0, r, -r * 0.86, r * 0.45, -r * 0.86, -r * 0.45]).fill({ color: dark, alpha: 0.6 });
  g.poly([0, -r, r * 0.86, -r * 0.45, r * 0.86, r * 0.45, 0, 0]).fill({ color: light, alpha: 0.85 });
  g.poly([-r * 0.2, -r * 0.56, r * 0.04, -r * 0.72, r * 0.12, -r * 0.4, -r * 0.12, -r * 0.26])
    .fill({ color: 0xffffff, alpha: 0.9 });
  g.poly(crystal).stroke({ width: 1.5, color: dark, alignment: 0.5 });

  return bake(renderer, g);
}

function makeHealGem(renderer: Renderer): Texture {
  const r = 9;
  const g = new Graphics();

  g.circle(0, 0, r * 1.5).fill({ color: 0xff5d6c, alpha: 0.16 });
  g.circle(0, 0, r * 1.25).fill({ color: 0xff5d6c, alpha: 0.22 });
  g.circle(0, 0, r).fill(0xff5d6c);
  g.ellipse(0, r * 0.42, r * 0.85, r * 0.58).fill({ color: 0xc62f3c, alpha: 0.82 });

  const cw = r * 0.3;
  const cl = r * 0.64;
  g.rect(-cw, -cl, cw * 2, cl * 2).fill(0xffffff);
  g.rect(-cl, -cw, cl * 2, cw * 2).fill(0xffffff);
  g.circle(0, 0, r).stroke({ width: 2, color: 0x76151f, alignment: 0.5 });

  return bake(renderer, g);
}

export function createTextures(renderer: Renderer): Textures {
  const tex: Textures = {
    player: makePlayer(renderer),
    enemy: [
      makeZombie(renderer), // 0 basic green block zombie
      makeFast(renderer),   // 1 fast / runner
      makeTank(renderer),   // 2 tank / brute
    ],
    boss: makeBoss(renderer),
    projectile: makeProjectile(renderer),
    blade: makeBlade(renderer),
    gem: [
      makeGem(renderer, 7, 0x7cff6b, 0xc9ffbf, 0x1f5f17), // 0 green
      makeGem(renderer, 8, 0x5ab0ff, 0xbfe2ff, 0x1a4a7a), // 1 blue
      makeGem(renderer, 9, 0xffd24a, 0xfff0b0, 0x7a5a10), // 2 gold
      makeHealGem(renderer),                              // 3 heal (red cross)
    ],
  };
  // Overlay the real art pack if present, then bake the optional animation layer.
  applyAssetPack(renderer, tex);
  tex.anim = buildAnimPack(renderer, tex);
  if (tex.anim?.money) {
    tex.gem[0] = tex.anim.money;
    tex.gem[1] = tex.anim.money;
    tex.gem[2] = tex.anim.money;
  }
  tex.survivor = buildSurvivor();
  tex.zombies = buildZombies();
  return tex;
}
