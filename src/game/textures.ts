// Generate primitive textures at runtime so the prototype needs no art assets.
// (Real sprite atlases come later — see docs/08-ART-UI-AUDIO.md.)
// Everything is drawn with Pixi v8 Graphics centered at (0,0) and baked once into
// a Texture via renderer.generateTexture({ resolution: 2 }) for crispness when scaled.
//
// House style (kept consistent across every sprite so the cast reads as one set
// against a busy dark battlefield):
//   1. a soft outer glow / rim halo so the silhouette pops,
//   2. a clear, distinct silhouette,
//   3. a grounded darker underside (weight comes from below),
//   4. a broad sheen highlight PLUS a tight specular spark,
//   5. a crisp dark outline tracing the silhouette.
// Several enemy/boss sprites are *tinted* per-variant at runtime, so their base
// art leans on value (light->dark structure) rather than hue — a clean tint then
// recolours them convincingly. Player, blade and projectile are also tinted, so
// they stay light/neutral with a white-hot core that survives any tint.
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

// Shared cohesion helpers ----------------------------------------------------

// Layered soft outer glow: two faint rings (wide + tight) read as a clean halo
// rather than a hard band, the way every sprite should lift off the background.
function glow(g: Graphics, radius: number, color: number, strength = 1): Graphics {
  g.circle(0, 0, radius * 1.18).fill({ color, alpha: 0.12 * strength });
  g.circle(0, 0, radius * 1.06).fill({ color, alpha: 0.16 * strength });
  return g;
}

// A round body with a grounded underside: base fill, then a darker lower ellipse
// for weight. Returns nothing — callers add their own detail + outline on top.
function roundBody(
  g: Graphics,
  r: number,
  base: number,
  shade: number,
  shadeAlpha = 0.85,
): Graphics {
  g.circle(0, 0, r).fill(base);
  g.ellipse(0, r * 0.46, r * 0.94, r * 0.66).fill({ color: shade, alpha: shadeAlpha });
  return g;
}

// Two-part highlight: a broad soft sheen up-left, then a tight specular spark.
// Used everywhere so light reads consistently as coming from the upper-left.
function sheen(
  g: Graphics,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: number,
  alpha = 0.6,
): Graphics {
  g.ellipse(cx, cy, rx, ry).fill({ color, alpha });
  g.ellipse(cx - rx * 0.18, cy - ry * 0.22, rx * 0.34, ry * 0.34)
    .fill({ color: 0xffffff, alpha: Math.min(1, alpha + 0.25) });
  return g;
}

// A pair of glowing eyes: dark socket + bright pupil + a tiny catch-light.
function eyes(
  g: Graphics,
  ox: number,
  oy: number,
  socket: number,
  pupil: number,
  socketColor: number,
  pupilColor: number,
): Graphics {
  g.circle(-ox, oy, socket).fill(socketColor);
  g.circle(ox, oy, socket).fill(socketColor);
  g.circle(-ox, oy, pupil).fill(pupilColor);
  g.circle(ox, oy, pupil).fill(pupilColor);
  g.circle(-ox - pupil * 0.3, oy - pupil * 0.3, pupil * 0.4).fill({ color: 0xffffff, alpha: 0.9 });
  g.circle(ox - pupil * 0.3, oy - pupil * 0.3, pupil * 0.4).fill({ color: 0xffffff, alpha: 0.9 });
  return g;
}

// ----------------------------------------------------------------------------
// Player: a clear hero silhouette facing "up" (-Y). Rounded teal body, darker
// grounded lower half, a bright visor wedge up top, shoulder pauldrons and a
// strong dark outline so it reads against busy backgrounds. Collision radius ~18.
// ----------------------------------------------------------------------------
function makePlayer(renderer: Renderer): Texture {
  const r = 18;
  const g = new Graphics();

  // Soft outer rim so the hero pops.
  glow(g, r, 0x6ffff0, 1.1);

  // Shoulder pauldrons (drawn behind the body so they tuck under the torso).
  g.ellipse(-r * 0.82, r * 0.02, r * 0.3, r * 0.46).fill(0x12b7d8);
  g.ellipse(r * 0.82, r * 0.02, r * 0.3, r * 0.46).fill(0x12b7d8);
  g.ellipse(-r * 0.82, -r * 0.14, r * 0.22, r * 0.24).fill({ color: 0x8bf3ff, alpha: 0.65 });
  g.ellipse(r * 0.82, -r * 0.14, r * 0.22, r * 0.24).fill({ color: 0x8bf3ff, alpha: 0.65 });

  // Body base + grounded underside.
  roundBody(g, r, 0x2ee6c8, 0x0f9c87, 0.9);

  // Broad sheen + spark up-left for volume.
  sheen(g, -r * 0.3, -r * 0.4, r * 0.46, r * 0.3, 0xbafff4, 0.7);

  // Facing visor: a dark wedge pointing up, with a bright cyan inset.
  g.poly([0, -r * 0.98, r * 0.52, -r * 0.18, -r * 0.52, -r * 0.18]).fill(0x05323a);
  g.poly([0, -r * 0.8, r * 0.36, -r * 0.26, -r * 0.36, -r * 0.26]).fill(0x7dfcff);
  // Inner visor glint and a central aim dot.
  g.poly([0, -r * 0.66, r * 0.16, -r * 0.34, -r * 0.16, -r * 0.34])
    .fill({ color: 0xffffff, alpha: 0.85 });
  g.circle(0, -r * 0.44, r * 0.11).fill(0x05323a);

  // Crest fin on top for a clear "forward" tell.
  g.poly([0, -r * 1.02, r * 0.1, -r * 0.7, -r * 0.1, -r * 0.7]).fill(0xeafffb);

  // Strong dark outline + a thin inner rim light.
  g.circle(0, 0, r).stroke({ width: 3.5, color: 0x05332f, alignment: 0.5 });
  g.circle(0, 0, r - 1.6).stroke({ width: 1, color: 0xbafff4, alignment: 0.5, alpha: 0.55 });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Zombie (basic enemy, kind 0): sickly green blob with an uneven lumpy top, a
// grounded shaded belly, two crooked glowing eyes and a dark outline. Reads as
// soft/organic vs the angular fast/tank. Collision radius ~16.
// ----------------------------------------------------------------------------
function makeZombie(renderer: Renderer): Texture {
  const r = 16;
  const g = new Graphics();

  glow(g, r, 0x7fd05c, 0.85);

  // Lumpy body — irregular raised scalp over a circle base for an organic edge.
  g.circle(0, 0, r).fill(0x6cbf4b);
  g.poly([
    -r * 0.62, -r * 0.8,
    -r * 0.12, -r * 1.04,
    r * 0.5, -r * 0.9,
    r * 0.8, -r * 0.28,
  ]).fill(0x80d35d); // raised, lighter scalp lump
  g.circle(-r * 0.62, -r * 0.42, r * 0.3).fill(0x80d35d); // secondary lump

  // Grounded shaded belly.
  g.ellipse(0, r * 0.48, r * 0.92, r * 0.62).fill({ color: 0x3a7327, alpha: 0.88 });

  // Sickly mottling spots (read as rot, not just noise).
  g.circle(r * 0.5, -r * 0.08, r * 0.18).fill({ color: 0x4f8f30, alpha: 0.8 });
  g.circle(-r * 0.46, r * 0.36, r * 0.14).fill({ color: 0x4f8f30, alpha: 0.8 });
  g.circle(r * 0.16, r * 0.2, r * 0.1).fill({ color: 0x4f8f30, alpha: 0.7 });

  // Soft sheen up-left.
  sheen(g, -r * 0.32, -r * 0.36, r * 0.36, r * 0.24, 0xc4f59a, 0.5);

  // Eyes: dark sockets with glowing pupils, deliberately uneven for menace.
  g.circle(-r * 0.35, -r * 0.1, r * 0.27).fill(0x14300c);
  g.circle(r * 0.42, -r * 0.02, r * 0.23).fill(0x14300c);
  g.circle(-r * 0.32, -r * 0.1, r * 0.12).fill(0xeaff8a);
  g.circle(r * 0.45, -r * 0.02, r * 0.1).fill(0xeaff8a);
  g.circle(-r * 0.35, -r * 0.14, r * 0.05).fill({ color: 0xffffff, alpha: 0.85 });

  // Crooked grimace.
  g.poly([-r * 0.34, r * 0.5, r * 0.34, r * 0.44, r * 0.18, r * 0.64, -r * 0.2, r * 0.66])
    .fill(0x24441a);

  g.circle(0, 0, r).stroke({ width: 3, color: 0x274d1d, alignment: 0.5 });
  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Fast enemy (kind 1): lean orange arrowhead/teardrop sloping up to read as
// "speed", with swept fins, a single angry visor-slit and a bright leading
// edge. Angular + narrow so it contrasts the round zombie. Collision radius ~13.
// ----------------------------------------------------------------------------
function makeFast(renderer: Renderer): Texture {
  const r = 13;
  const g = new Graphics();

  // Glow stretched a touch along travel so it feels quick.
  g.ellipse(0, 0, r * 1.0, r * 1.25).fill({ color: 0xffb15a, alpha: 0.16 });

  // Swept-back fins flanking the body (behind), reinforcing the forward read.
  g.poly([-r * 0.55, r * 0.2, -r * 1.02, r * 0.95, -r * 0.2, r * 0.55]).fill(0xcf6a1c);
  g.poly([r * 0.55, r * 0.2, r * 1.02, r * 0.95, r * 0.2, r * 0.55]).fill(0xcf6a1c);

  // Arrowhead body pointing up.
  const blade = [
    0, -r * 1.18,
    r * 0.8, r * 0.42,
    r * 0.34, r * 0.96,
    -r * 0.34, r * 0.96,
    -r * 0.8, r * 0.42,
  ];
  g.poly(blade).fill(0xff9a3c);

  // Bright leading edge / nose streak.
  g.poly([0, -r * 1.1, r * 0.2, -r * 0.18, -r * 0.2, -r * 0.18])
    .fill({ color: 0xffc877, alpha: 0.95 });

  // Grounded lower shading.
  g.ellipse(0, r * 0.54, r * 0.58, r * 0.4).fill({ color: 0xb05512, alpha: 0.88 });

  // Single angry visor-slit with a hot inner glow.
  g.poly([-r * 0.44, -r * 0.06, r * 0.44, -r * 0.06, r * 0.3, r * 0.2, -r * 0.3, r * 0.2])
    .fill(0x481a05);
  g.poly([-r * 0.3, -r * 0.01, r * 0.3, -r * 0.01, r * 0.2, r * 0.12, -r * 0.2, r * 0.12])
    .fill(0xffe39a);
  g.poly([-r * 0.16, 0.0, r * 0.16, 0.0, r * 0.1, r * 0.07, -r * 0.1, r * 0.07])
    .fill({ color: 0xffffff, alpha: 0.85 });

  g.poly(blade).stroke({ width: 2.5, color: 0x763a0f, alignment: 0.5 });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Tank enemy (kind 2): bulky armored purple brute. A full ring of spikes, banded
// armor plates, rivets and heavy glowing eyes. Big, blocky, heavily outlined so
// it reads as a wall. Collision radius ~24.
// ----------------------------------------------------------------------------
function makeTank(renderer: Renderer): Texture {
  const r = 24;
  const g = new Graphics();

  glow(g, r, 0xb07cd0, 0.7);

  // Spike ring behind the body (alternating long/short for a meaner silhouette).
  const spikes = 10;
  for (let i = 0; i < spikes; i++) {
    const a = (i / spikes) * Math.PI * 2;
    const tip = r * (i % 2 === 0 ? 1.26 : 1.12);
    const baseR = r * 0.92;
    const halfW = 0.17;
    const tx = Math.cos(a) * tip;
    const ty = Math.sin(a) * tip;
    const b1x = Math.cos(a - halfW) * baseR;
    const b1y = Math.sin(a - halfW) * baseR;
    const b2x = Math.cos(a + halfW) * baseR;
    const b2y = Math.sin(a + halfW) * baseR;
    g.poly([tx, ty, b1x, b1y, b2x, b2y]).fill(0x6c3483);
    // tiny spec on each spike tip
    g.poly([tx, ty, (tx + b1x) * 0.5, (ty + b1y) * 0.5, (b1x + b2x) * 0.5, (b1y + b2y) * 0.5])
      .fill({ color: 0xbb8ad6, alpha: 0.4 });
  }

  // Main bulky body + grounded underside.
  roundBody(g, r, 0x9b59b6, 0x55305f, 0.85);

  // Armor plate seams: a central horizontal band + two vertical shoulder bands.
  g.rect(-r * 0.92, -r * 0.16, r * 1.84, r * 0.12).fill({ color: 0x371a45, alpha: 0.88 });
  g.poly([-r * 0.52, -r * 0.98, -r * 0.42, -r * 0.98, -r * 0.42, r * 0.98, -r * 0.52, r * 0.98])
    .fill({ color: 0x371a45, alpha: 0.6 });
  g.poly([r * 0.52, -r * 0.98, r * 0.42, -r * 0.98, r * 0.42, r * 0.98, r * 0.52, r * 0.98])
    .fill({ color: 0x371a45, alpha: 0.6 });

  // Rivets along the central band.
  for (let i = -2; i <= 2; i++) {
    g.circle(i * r * 0.34, -r * 0.1, r * 0.05).fill({ color: 0x2a1336, alpha: 0.9 });
  }

  // Broad top sheen + spark.
  sheen(g, -r * 0.26, -r * 0.42, r * 0.46, r * 0.28, 0xca94e2, 0.55);

  // Two heavy glowing eyes under the band.
  eyes(g, r * 0.34, r * 0.06, r * 0.21, r * 0.11, 0x1c0e24, 0xff5de0);

  // Heavy dark outline + faint inner rim.
  g.circle(0, 0, r).stroke({ width: 4, color: 0x40204f, alignment: 0.5 });
  g.circle(0, 0, r - 2).stroke({ width: 1, color: 0xca94e2, alignment: 0.5, alpha: 0.4 });
  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Boss: a large imposing red brute with layered armor plating, a pair of swept
// horns, a heavy brow, burning eyes and a hot rim light. Built bigger and more
// detailed than the rank-and-file so it commands the screen. Collision radius ~58.
// ----------------------------------------------------------------------------
function makeBoss(renderer: Renderer): Texture {
  const r = 58;
  const g = new Graphics();

  // Layered hot rim glow.
  g.circle(0, 0, r * 1.16).fill({ color: 0xff6a4a, alpha: 0.14 });
  g.circle(0, 0, r * 1.06).fill({ color: 0xff6a4a, alpha: 0.2 });

  // Horns sweeping up and out (behind the body), tapered with a lit edge.
  const hornL = [-r * 0.5, -r * 0.5, -r * 1.12, -r * 1.22, -r * 0.92, -r * 0.78, -r * 0.74, -r * 0.42];
  const hornR = [r * 0.5, -r * 0.5, r * 1.12, -r * 1.22, r * 0.92, -r * 0.78, r * 0.74, -r * 0.42];
  g.poly(hornL).fill(0x7a1f14);
  g.poly(hornR).fill(0x7a1f14);
  g.poly([-r * 0.86, -r * 0.94, -r * 1.12, -r * 1.22, -r * 0.96, -r * 0.82])
    .fill({ color: 0xff9272, alpha: 0.7 });
  g.poly([r * 0.86, -r * 0.94, r * 1.12, -r * 1.22, r * 0.96, -r * 0.82])
    .fill({ color: 0xff9272, alpha: 0.7 });

  // Body + grounded underside.
  roundBody(g, r, 0xc0392b, 0x7a1d14, 0.88);

  // Shoulder pauldrons for bulk.
  g.ellipse(-r * 0.86, -r * 0.1, r * 0.3, r * 0.44).fill(0xa52d20);
  g.ellipse(r * 0.86, -r * 0.1, r * 0.3, r * 0.44).fill(0xa52d20);

  // Central chest plate (darker), framed with ridges.
  g.poly([
    -r * 0.42, -r * 0.08,
    r * 0.42, -r * 0.08,
    r * 0.5, r * 0.56,
    0, r * 0.82,
    -r * 0.5, r * 0.56,
  ]).fill({ color: 0x8c241a, alpha: 0.92 });
  g.rect(-r * 0.36, r * 0.08, r * 0.72, r * 0.07).fill({ color: 0x551109, alpha: 0.9 });
  g.rect(-r * 0.3, r * 0.3, r * 0.6, r * 0.07).fill({ color: 0x551109, alpha: 0.9 });
  // Glowing core gem in the chest.
  g.circle(0, r * 0.46, r * 0.1).fill(0x3a0c07);
  g.circle(0, r * 0.46, r * 0.06).fill(0xffb347);

  // Broad top sheen + spark.
  sheen(g, -r * 0.28, -r * 0.4, r * 0.5, r * 0.3, 0xff9c84, 0.55);

  // Heavy brow casting the eyes into shadow.
  g.poly([-r * 0.64, -r * 0.34, r * 0.64, -r * 0.34, r * 0.5, -r * 0.1, -r * 0.5, -r * 0.1])
    .fill(0x551109);

  // Two large burning eyes under the brow.
  eyes(g, r * 0.3, -r * 0.16, r * 0.16, r * 0.09, 0x280906, 0xffe14a);

  // Bright hot rim stroke + dark base outline (rim on top so it glows).
  g.circle(0, 0, r).stroke({ width: 7, color: 0x47120c, alignment: 0.5 });
  g.circle(0, 0, r - 2.5).stroke({ width: 2.5, color: 0xff9070, alignment: 0.5, alpha: 0.75 });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Projectile: a bright 4-point shuriken / star-diamond with a glowing white-hot
// core. Stays pale so Game's per-weapon tint reads cleanly; the white centre
// keeps a hot highlight through any tint. Collision radius ~7.
// ----------------------------------------------------------------------------
function makeProjectile(renderer: Renderer): Texture {
  const r = 7;
  const g = new Graphics();

  // Two-step soft glow halo.
  g.circle(0, 0, r * 1.6).fill({ color: 0xfff3b0, alpha: 0.14 });
  g.circle(0, 0, r * 1.3).fill({ color: 0xfff3b0, alpha: 0.2 });

  // 4-point star (shuriken) — long primary points + short diagonal points.
  const k = 0.4; // inner radius factor
  const star = [
    0, -r,
    r * k, -r * k,
    r, 0,
    r * k, r * k,
    0, r,
    -r * k, r * k,
    -r, 0,
    -r * k, -r * k,
  ];
  g.poly(star).fill(0xffe98a);

  // Subtle lit/shaded split so the star has a touch of form even when tinted.
  g.poly([0, -r, r * k, -r * k, r, 0, r * k, r * k, 0, r]).fill({ color: 0xfff6c8, alpha: 0.55 });

  // White-hot core.
  g.circle(0, 0, r * 0.46).fill(0xfffce0);
  g.circle(0, 0, r * 0.24).fill(0xffffff);

  // Crisp white edge for definition against dark.
  g.poly(star).stroke({ width: 1.25, color: 0xffffff, alignment: 0 });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Blade: an orbiting circular saw with a bright cyan cutting edge, beveled body
// and a hub. Tinted by pet colour at runtime, so it leans pale-cyan + value.
// Collision radius ~11.
// ----------------------------------------------------------------------------
function makeBlade(renderer: Renderer): Texture {
  const r = 11;
  const g = new Graphics();

  // Two-step cyan glow.
  g.circle(0, 0, r * 1.4).fill({ color: 0x49c5ff, alpha: 0.14 });
  g.circle(0, 0, r * 1.18).fill({ color: 0x49c5ff, alpha: 0.2 });

  // Base disc.
  g.circle(0, 0, r).fill(0xeaffff);

  // Saw teeth around the rim, each with a lit leading face.
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
    g.poly([tx, ty, b1x, b1y, (b1x + b2x) * 0.5, (b1y + b2y) * 0.5])
      .fill({ color: 0xeaffff, alpha: 0.7 });
  }

  // Bevel: an offset lighter disc gives the blade a curved, machined read.
  g.circle(r * 0.3, -r * 0.2, r * 0.66).fill(0x9fdcff);
  g.ellipse(-r * 0.32, -r * 0.34, r * 0.4, r * 0.24).fill({ color: 0xffffff, alpha: 0.55 });

  // Hub with bolt holes.
  g.circle(0, 0, r * 0.3).fill(0x2f9fd6);
  g.circle(0, 0, r * 0.14).fill(0xeaffff);
  g.circle(r * 0.16, 0, r * 0.045).fill(0x1c6f99);
  g.circle(-r * 0.16, 0, r * 0.045).fill(0x1c6f99);

  // Bright cyan cutting edge + inner glint.
  g.circle(0, 0, r).stroke({ width: 3, color: 0x49c5ff, alignment: 0.5 });
  g.circle(0, 0, r - 1.5).stroke({ width: 1, color: 0xeaffff, alignment: 0.5, alpha: 0.85 });

  return bake(renderer, g);
}

// ----------------------------------------------------------------------------
// Gems: faceted crystals with a clear lit/shaded facet split and a bright spark.
// The first three (green/blue/gold) are XP gems; index 3 is the heal pickup
// drawn as a clean red cross. Collision radii ~7-9.
// ----------------------------------------------------------------------------
function makeGem(renderer: Renderer, r: number, base: number, light: number, dark: number): Texture {
  const g = new Graphics();

  // Two-step glow.
  g.circle(0, 0, r * 1.5).fill({ color: base, alpha: 0.14 });
  g.circle(0, 0, r * 1.25).fill({ color: base, alpha: 0.2 });

  // Faceted hexagonal crystal silhouette.
  const crystal = [
    0, -r,
    r * 0.86, -r * 0.45,
    r * 0.86, r * 0.45,
    0, r,
    -r * 0.86, r * 0.45,
    -r * 0.86, -r * 0.45,
  ];
  g.poly(crystal).fill(base);

  // Facet split: left/bottom in shadow, top-right lit, plus a centre table facet.
  g.poly([0, -r, 0, r, -r * 0.86, r * 0.45, -r * 0.86, -r * 0.45]).fill({ color: dark, alpha: 0.6 });
  g.poly([0, -r, r * 0.86, -r * 0.45, r * 0.86, r * 0.45, 0, 0]).fill({ color: light, alpha: 0.85 });
  g.poly([0, -r * 0.5, r * 0.3, -r * 0.1, 0, r * 0.5, -r * 0.3, -r * 0.1])
    .fill({ color: light, alpha: 0.35 });

  // Bright highlight spark on the top-left edge.
  g.poly([-r * 0.2, -r * 0.56, r * 0.04, -r * 0.72, r * 0.12, -r * 0.4, -r * 0.12, -r * 0.26])
    .fill({ color: 0xffffff, alpha: 0.9 });

  // Crisp facet outline.
  g.poly(crystal).stroke({ width: 1.5, color: dark, alignment: 0.5 });

  return bake(renderer, g);
}

// Heal pickup: a red rounded badge with a clean white cross and a soft glow.
function makeHealGem(renderer: Renderer): Texture {
  const r = 9;
  const g = new Graphics();

  // Two-step glow.
  g.circle(0, 0, r * 1.5).fill({ color: 0xff5d6c, alpha: 0.16 });
  g.circle(0, 0, r * 1.25).fill({ color: 0xff5d6c, alpha: 0.22 });

  // Rounded badge body + grounded underside + sheen.
  g.circle(0, 0, r).fill(0xff5d6c);
  g.ellipse(0, r * 0.42, r * 0.85, r * 0.58).fill({ color: 0xc62f3c, alpha: 0.82 });
  sheen(g, -r * 0.26, -r * 0.36, r * 0.42, r * 0.26, 0xffc0c6, 0.7);

  // Clean white cross with a faint inner red bevel.
  const cw = r * 0.3; // half-thickness
  const cl = r * 0.64; // half-length
  g.rect(-cw, -cl, cw * 2, cl * 2).fill(0xffffff);
  g.rect(-cl, -cw, cl * 2, cw * 2).fill(0xffffff);
  g.rect(-cw * 0.5, -cl * 0.7, cw, cl * 1.4).fill({ color: 0xffd7da, alpha: 0.6 });

  g.circle(0, 0, r).stroke({ width: 2, color: 0x76151f, alignment: 0.5 });
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

// Drop-in: same Textures shape, same createTextures(renderer) signature and the
// same collision radii — no wiring changes needed in Game.ts.
