// Generate primitive textures at runtime so the prototype needs no art assets.
// (Real sprite atlases come later — see docs/08-ART-UI-AUDIO.md.)
// Everything is drawn with Pixi v8 Graphics centered at (0,0) and baked once into
// a Texture via renderer.generateTexture({ resolution: 2 }) for crispness when scaled.
import { Graphics, Texture } from 'pixi.js';
import type { Renderer } from 'pixi.js';

export interface Textures {
  player: Texture;
  enemy: Texture[]; // index by Enemy.kind (0 basic, 1 fast, 2 tank)
  boss: Texture;
  projectile: Texture;
  blade: Texture;
  gem: Texture[]; // 0 green, 1 blue, 2 gold, 3 heal
}

// Bake a Graphics into a texture and clean it up. All builders funnel through here.
function bake(renderer: Renderer, g: Graphics): Texture {
  const tex = renderer.generateTexture({ target: g, resolution: 2 });
  g.destroy();
  return tex;
}

// ----------------------------------------------------------------------------
// Player: a clear hero silhouette facing "up" (-Y). Rounded teal body, darker
// shaded lower half, a bright visor notch up top, shoulder accents and a strong
// dark outline so it reads against busy backgrounds. Collision radius ~18.
// ----------------------------------------------------------------------------
function makePlayer(renderer: Renderer): Texture {
  const r = 18;
  const g = new Graphics();

  // Soft outer glow / rim so the hero pops.
  g.circle(0, 0, r + 2).fill({ color: 0x6ffff0, alpha: 0.18 });

  // Body base.
  g.circle(0, 0, r).fill(0x2ee6c8);

  // Lower-half shading (darker teal) for a bit of volume.
  g.ellipse(0, r * 0.42, r * 0.92, r * 0.7).fill({ color: 0x16a892, alpha: 0.85 });

  // Top highlight sheen.
  g.ellipse(-r * 0.28, -r * 0.42, r * 0.42, r * 0.28).fill({ color: 0xbafff4, alpha: 0.7 });

  // Shoulder / armor accents (cyan) on each side.
  g.ellipse(-r * 0.78, r * 0.05, r * 0.26, r * 0.4).fill(0x18c7e6);
  g.ellipse(r * 0.78, r * 0.05, r * 0.26, r * 0.4).fill(0x18c7e6);

  // Facing visor: a bright notch pointing up.
  g.poly([0, -r * 0.95, r * 0.5, -r * 0.2, -r * 0.5, -r * 0.2]).fill(0x06343a);
  g.poly([0, -r * 0.78, r * 0.34, -r * 0.28, -r * 0.34, -r * 0.28]).fill(0x7dfcff);
  // Visor center dot (eye / aim point).
  g.circle(0, -r * 0.46, r * 0.12).fill(0x06343a);

  // Strong outline.
  g.circle(0, 0, r).stroke({ width: 3.5, color: 0x063a35, alignment: 0.5 });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Zombie (basic enemy, kind 0): sickly green blob with an uneven top, a darker
// shaded belly, two crooked eyes and a dark outline. Collision radius ~16.
// ----------------------------------------------------------------------------
function makeZombie(renderer: Renderer): Texture {
  const r = 16;
  const g = new Graphics();

  // Lumpy body — slightly irregular polygon over a circle base for an organic edge.
  g.circle(0, 0, r).fill(0x6cbf4b);
  g.poly([
    -r * 0.6, -r * 0.85,
    -r * 0.1, -r * 1.02,
    r * 0.5, -r * 0.88,
    r * 0.78, -r * 0.3,
  ]).fill(0x7fd05c); // raised, lighter scalp lump

  // Shaded lower belly.
  g.ellipse(0, r * 0.45, r * 0.92, r * 0.62).fill({ color: 0x3f7a2a, alpha: 0.85 });

  // Sickly mottling spots.
  g.circle(r * 0.5, -r * 0.1, r * 0.18).fill({ color: 0x4f8f30, alpha: 0.8 });
  g.circle(-r * 0.45, r * 0.35, r * 0.14).fill({ color: 0x4f8f30, alpha: 0.8 });

  // Eyes: dark sockets with glowing pupils, slightly uneven.
  g.circle(-r * 0.35, -r * 0.12, r * 0.26).fill(0x16300d);
  g.circle(r * 0.4, -r * 0.05, r * 0.22).fill(0x16300d);
  g.circle(-r * 0.32, -r * 0.12, r * 0.11).fill(0xeaff8a);
  g.circle(r * 0.43, -r * 0.05, r * 0.1).fill(0xeaff8a);

  // Grimace line.
  g.poly([-r * 0.32, r * 0.5, r * 0.32, r * 0.45, r * 0.18, r * 0.62, -r * 0.18, r * 0.64])
    .fill(0x2a4f1c);

  g.circle(0, 0, r).stroke({ width: 3, color: 0x2f5d22, alignment: 0.5 });
  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Fast enemy (kind 1): leaner, orange, swept-back teardrop shape suggesting
// speed, with a single angry eye-slit and a bright edge. Collision radius ~13.
// ----------------------------------------------------------------------------
function makeFast(renderer: Renderer): Texture {
  const r = 13;
  const g = new Graphics();

  // Teardrop / arrowhead body pointing up to read as "fast".
  g.poly([
    0, -r * 1.15,
    r * 0.82, r * 0.45,
    r * 0.32, r * 0.95,
    -r * 0.32, r * 0.95,
    -r * 0.82, r * 0.45,
  ]).fill(0xff9a3c);

  // Speed streaks (lighter) along the leading edges.
  g.poly([0, -r * 1.05, r * 0.18, -r * 0.2, -r * 0.18, -r * 0.2]).fill({ color: 0xffc274, alpha: 0.9 });

  // Lower shading.
  g.ellipse(0, r * 0.5, r * 0.6, r * 0.42).fill({ color: 0xb85a14, alpha: 0.85 });

  // Single angry eye-slit.
  g.poly([-r * 0.42, -r * 0.05, r * 0.42, -r * 0.05, r * 0.3, r * 0.2, -r * 0.3, r * 0.2])
    .fill(0x4a1c05);
  g.poly([-r * 0.28, 0.0, r * 0.28, 0.0, r * 0.2, r * 0.12, -r * 0.2, r * 0.12])
    .fill(0xfff2c2);

  g.poly([
    0, -r * 1.15,
    r * 0.82, r * 0.45,
    r * 0.32, r * 0.95,
    -r * 0.32, r * 0.95,
    -r * 0.82, r * 0.45,
  ]).stroke({ width: 2.5, color: 0x7a3d10, alignment: 0.5 });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Tank enemy (kind 2): bulky purple brute with armor plates and a ring of
// spikes around the perimeter. Heavy outline. Collision radius ~24.
// ----------------------------------------------------------------------------
function makeTank(renderer: Renderer): Texture {
  const r = 24;
  const g = new Graphics();

  // Spike ring behind the body.
  const spikes = 10;
  for (let i = 0; i < spikes; i++) {
    const a = (i / spikes) * Math.PI * 2;
    const tip = r * 1.22;
    const baseR = r * 0.92;
    const halfW = 0.18; // angular half-width of each spike
    const tx = Math.cos(a) * tip;
    const ty = Math.sin(a) * tip;
    const b1x = Math.cos(a - halfW) * baseR;
    const b1y = Math.sin(a - halfW) * baseR;
    const b2x = Math.cos(a + halfW) * baseR;
    const b2y = Math.sin(a + halfW) * baseR;
    g.poly([tx, ty, b1x, b1y, b2x, b2y]).fill(0x6c3483);
  }

  // Main bulky body.
  g.circle(0, 0, r).fill(0x9b59b6);

  // Lower shading for weight.
  g.ellipse(0, r * 0.4, r * 0.95, r * 0.72).fill({ color: 0x5e3370, alpha: 0.8 });

  // Armor plate seams (darker bands).
  g.rect(-r * 0.9, -r * 0.16, r * 1.8, r * 0.1).fill({ color: 0x3d1f4d, alpha: 0.85 });
  g.poly([-r * 0.5, -r, -r * 0.5, r, -r * 0.42, r, -r * 0.42, -r]).fill({ color: 0x3d1f4d, alpha: 0.6 });
  g.poly([r * 0.5, -r, r * 0.5, r, r * 0.42, r, r * 0.42, -r]).fill({ color: 0x3d1f4d, alpha: 0.6 });

  // Top highlight.
  g.ellipse(-r * 0.25, -r * 0.4, r * 0.45, r * 0.28).fill({ color: 0xc78fe0, alpha: 0.6 });

  // Two heavy glowing eyes.
  g.circle(-r * 0.34, -r * 0.05, r * 0.2).fill(0x1e0f26);
  g.circle(r * 0.34, -r * 0.05, r * 0.2).fill(0x1e0f26);
  g.circle(-r * 0.34, -r * 0.05, r * 0.1).fill(0xff5de0);
  g.circle(r * 0.34, -r * 0.05, r * 0.1).fill(0xff5de0);

  g.circle(0, 0, r).stroke({ width: 4, color: 0x4a235a, alignment: 0.5 });
  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Boss: a large menacing red brute with armor plating, a pair of horns and a
// bright hot rim light. Collision radius ~58.
// ----------------------------------------------------------------------------
function makeBoss(renderer: Renderer): Texture {
  const r = 58;
  const g = new Graphics();

  // Outer hot rim glow.
  g.circle(0, 0, r + 4).fill({ color: 0xff6a4a, alpha: 0.25 });

  // Horns sweeping up and out (drawn behind the body).
  g.poly([
    -r * 0.55, -r * 0.55,
    -r * 1.05, -r * 1.15,
    -r * 0.78, -r * 0.45,
  ]).fill(0x7a1f14);
  g.poly([
    r * 0.55, -r * 0.55,
    r * 1.05, -r * 1.15,
    r * 0.78, -r * 0.45,
  ]).fill(0x7a1f14);

  // Body.
  g.circle(0, 0, r).fill(0xc0392b);

  // Lower body shading.
  g.ellipse(0, r * 0.42, r * 0.95, r * 0.72).fill({ color: 0x7d1f15, alpha: 0.85 });

  // Central chest plate (darker), framed.
  g.poly([
    -r * 0.4, -r * 0.1,
    r * 0.4, -r * 0.1,
    r * 0.5, r * 0.55,
    0, r * 0.8,
    -r * 0.5, r * 0.55,
  ]).fill({ color: 0x8c241a, alpha: 0.9 });

  // Plate ridges.
  g.rect(-r * 0.36, r * 0.06, r * 0.72, r * 0.08).fill({ color: 0x5c130c, alpha: 0.9 });
  g.rect(-r * 0.3, r * 0.28, r * 0.6, r * 0.08).fill({ color: 0x5c130c, alpha: 0.9 });

  // Top sheen highlight.
  g.ellipse(-r * 0.28, -r * 0.4, r * 0.5, r * 0.3).fill({ color: 0xff8a72, alpha: 0.55 });

  // Heavy brow.
  g.poly([-r * 0.62, -r * 0.34, r * 0.62, -r * 0.34, r * 0.5, -r * 0.12, -r * 0.5, -r * 0.12])
    .fill(0x5c130c);

  // Two large burning eyes under the brow.
  g.circle(-r * 0.3, -r * 0.16, r * 0.16).fill(0x2a0a06);
  g.circle(r * 0.3, -r * 0.16, r * 0.16).fill(0x2a0a06);
  g.circle(-r * 0.3, -r * 0.16, r * 0.09).fill(0xffe14a);
  g.circle(r * 0.3, -r * 0.16, r * 0.09).fill(0xffe14a);

  // Bright rim stroke + dark base outline.
  g.circle(0, 0, r).stroke({ width: 7, color: 0x4d130d, alignment: 0.5 });
  g.circle(0, 0, r - 2).stroke({ width: 2, color: 0xff8866, alignment: 0.5, alpha: 0.7 });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Projectile: a bright 4-point shuriken / star-diamond with a glowing pale-gold
// core. Collision radius ~7 (matches the diamond extent).
// ----------------------------------------------------------------------------
function makeProjectile(renderer: Renderer): Texture {
  const r = 7;
  const g = new Graphics();

  // Soft glow halo.
  g.circle(0, 0, r * 1.4).fill({ color: 0xfff3b0, alpha: 0.22 });

  // 4-point star (shuriken) — long primary points + short diagonal points.
  const k = 0.42; // inner radius factor
  g.poly([
    0, -r,
    r * k, -r * k,
    r, 0,
    r * k, r * k,
    0, r,
    -r * k, r * k,
    -r, 0,
    -r * k, -r * k,
  ]).fill(0xffe98a);

  // Bright core.
  g.circle(0, 0, r * 0.42).fill(0xfffce0);
  g.circle(0, 0, r * 0.2).fill(0xffffff);

  // Crisp edge.
  g.poly([
    0, -r,
    r * k, -r * k,
    r, 0,
    r * k, r * k,
    0, r,
    -r * k, r * k,
    -r, 0,
    -r * k, -r * k,
  ]).stroke({ width: 1.25, color: 0xffffff, alignment: 0 });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Blade: an orbiting crescent / saw blade with a bright cyan cutting edge.
// Collision radius ~11.
// ----------------------------------------------------------------------------
function makeBlade(renderer: Renderer): Texture {
  const r = 11;
  const g = new Graphics();

  // Faint cyan glow.
  g.circle(0, 0, r * 1.25).fill({ color: 0x49c5ff, alpha: 0.2 });

  // Base disc.
  g.circle(0, 0, r).fill(0xeaffff);

  // Saw teeth around the rim.
  const teeth = 9;
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const tip = r * 1.18;
    const baseR = r * 0.86;
    const hw = 0.16;
    g.poly([
      Math.cos(a) * tip, Math.sin(a) * tip,
      Math.cos(a - hw) * baseR, Math.sin(a - hw) * baseR,
      Math.cos(a + hw) * baseR, Math.sin(a + hw) * baseR,
    ]).fill(0xbff0ff);
  }

  // Crescent shading: an offset lighter disc gives the blade a curved, beveled read.
  g.circle(r * 0.32, -r * 0.18, r * 0.66).fill(0x9fdcff);

  // Hub.
  g.circle(0, 0, r * 0.28).fill(0x2f9fd6);
  g.circle(0, 0, r * 0.12).fill(0xeaffff);

  // Bright cyan cutting edge.
  g.circle(0, 0, r).stroke({ width: 3, color: 0x49c5ff, alignment: 0.5 });
  g.circle(0, 0, r - 1.5).stroke({ width: 1, color: 0xeaffff, alignment: 0.5, alpha: 0.8 });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Gems: faceted crystals with a bright highlight. The first three (green/blue/
// gold) are XP gems; index 3 is the heal pickup drawn as a red cross.
// Collision radii ~7-9.
// ----------------------------------------------------------------------------
function makeGem(renderer: Renderer, r: number, base: number, light: number, dark: number): Texture {
  const g = new Graphics();

  // Faint glow.
  g.circle(0, 0, r * 1.3).fill({ color: base, alpha: 0.2 });

  // Faceted hexagon-ish crystal.
  g.poly([
    0, -r,
    r * 0.86, -r * 0.45,
    r * 0.86, r * 0.45,
    0, r,
    -r * 0.86, r * 0.45,
    -r * 0.86, -r * 0.45,
  ]).fill(base);

  // Left facets darker, top-right facet lighter — gives a cut-gem read.
  g.poly([0, -r, 0, r, -r * 0.86, r * 0.45, -r * 0.86, -r * 0.45]).fill({ color: dark, alpha: 0.55 });
  g.poly([0, -r, r * 0.86, -r * 0.45, 0, 0]).fill({ color: light, alpha: 0.85 });

  // Bright highlight spark.
  g.poly([-r * 0.18, -r * 0.55, r * 0.05, -r * 0.7, r * 0.12, -r * 0.4, -r * 0.1, -r * 0.28])
    .fill({ color: 0xffffff, alpha: 0.85 });

  // Edge outline.
  g.poly([
    0, -r,
    r * 0.86, -r * 0.45,
    r * 0.86, r * 0.45,
    0, r,
    -r * 0.86, r * 0.45,
    -r * 0.86, -r * 0.45,
  ]).stroke({ width: 1.5, color: dark, alignment: 0.5 });

  return bake(renderer, g);
}

// Heal pickup: a red rounded badge with a bright white/red cross.
function makeHealGem(renderer: Renderer): Texture {
  const r = 9;
  const g = new Graphics();

  // Glow.
  g.circle(0, 0, r * 1.3).fill({ color: 0xff5d6c, alpha: 0.22 });

  // Rounded badge body.
  g.circle(0, 0, r).fill(0xff5d6c);
  g.ellipse(0, r * 0.4, r * 0.85, r * 0.6).fill({ color: 0xc62f3c, alpha: 0.8 });
  g.ellipse(-r * 0.25, -r * 0.35, r * 0.4, r * 0.26).fill({ color: 0xffb0b8, alpha: 0.7 });

  // White cross (plus).
  const cw = r * 0.32; // half-thickness
  const cl = r * 0.66; // half-length
  g.rect(-cw, -cl, cw * 2, cl * 2).fill(0xffffff);
  g.rect(-cl, -cw, cl * 2, cw * 2).fill(0xffffff);

  g.circle(0, 0, r).stroke({ width: 2, color: 0x7a1622, alignment: 0.5 });
  return bake(renderer, g);
}

export function createTextures(renderer: Renderer): Textures {
  return {
    player: makePlayer(renderer),
    enemy: [
      makeZombie(renderer), // 0 basic green zombie
      makeFast(renderer),   // 1 fast / orange
      makeTank(renderer),   // 2 tank / purple
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
}
