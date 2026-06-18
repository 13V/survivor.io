// Generate simple primitive textures at runtime so the prototype needs no art assets.
// (Real sprite atlases come later — see docs/08-ART-UI-AUDIO.md.)
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

function circle(
  renderer: Renderer,
  r: number,
  fill: number,
  stroke?: number,
  strokeW = 0,
): Texture {
  const g = new Graphics().circle(0, 0, r).fill(fill);
  if (stroke !== undefined && strokeW > 0) {
    g.circle(0, 0, r).stroke({ width: strokeW, color: stroke, alignment: 0.5 });
  }
  const tex = renderer.generateTexture({ target: g, resolution: 2 });
  g.destroy();
  return tex;
}

function diamond(renderer: Renderer, r: number, fill: number): Texture {
  const g = new Graphics()
    .poly([0, -r, r, 0, 0, r, -r, 0])
    .fill(fill)
    .stroke({ width: 1.5, color: 0xffffff, alignment: 0 });
  const tex = renderer.generateTexture({ target: g, resolution: 2 });
  g.destroy();
  return tex;
}

export function createTextures(renderer: Renderer): Textures {
  return {
    player: circle(renderer, 18, 0x2ee6c8, 0x0c5f54, 4),
    enemy: [
      circle(renderer, 16, 0x6cbf4b, 0x2f5d22, 3), // basic green zombie
      circle(renderer, 13, 0xff9a3c, 0x7a3d10, 3), // fast
      circle(renderer, 24, 0x9b59b6, 0x4a235a, 4), // tank
    ],
    boss: circle(renderer, 58, 0xc0392b, 0x4d130d, 7),
    projectile: diamond(renderer, 7, 0xfff3b0),
    blade: circle(renderer, 11, 0xeaffff, 0x49c5ff, 3),
    gem: [
      circle(renderer, 7, 0x7CFF6B, 0x1f5f17, 2), // green
      circle(renderer, 8, 0x5ab0ff, 0x1a4a7a, 2), // blue
      circle(renderer, 9, 0xffd24a, 0x7a5a10, 2), // gold
      circle(renderer, 9, 0xff5d6c, 0x7a1622, 2), // heal
    ],
  };
}
