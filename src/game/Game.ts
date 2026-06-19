// Core game: bitECS world + fixed-timestep loop + spawn director + weapons +
// collisions + level-ups + boss. See docs/01-CORE-GAMEPLAY.md for the design.
import {
  Application,
  Container,
  Sprite,
  Text,
  Graphics,
  TilingSprite,
  Texture,
  Matrix,
  Rectangle,
  ColorMatrixFilter,
} from 'pixi.js';
import {
  createWorld,
  addEntity,
  removeEntity,
  addComponent,
  defineQuery,
  type IWorld,
} from 'bitecs';
import { Position, Velocity, Enemy, Projectile, Gem } from '../ecs/components';
import { createTextures, type Textures } from './textures';
import { dirRow, type SurvivorSprite, type DirAnim } from './survivorSprite';
import { resolveZombieType, dir5, ORIG_CELL, type ZombieAssets, type ZombieAnims, type DirAnimZ } from './zombieSprite';
import type { EnvAssets } from './environment';
import { Particles } from './particles';
import {
  WEAPONS,
  PASSIVES,
  EVOLUTIONS,
  ENEMY_DEFS,
  GEAR,
  baseMods,
  MAX_WEAPONS,
  MAX_PASSIVES,
  type Mods,
  type WeaponContext,
  type WeaponRuntime,
  type CharacterDef,
  type StageDef,
  type PetDef,
  type EnemyDef,
} from './data';
import { behaviors } from './behaviors';
import { Input } from '../core/input';
import { SpatialHash } from '../core/spatialHash';
import { Hud, type LevelOption } from '../ui/hud';
import * as C from '../config';
import { rand, pick } from '../core/rng';
import { audio } from '../audio/sfx';
import { meta } from '../meta/save';
import { settings } from '../ui/settings';
import type { Minimap } from '../ui/minimap';

interface WeaponInst extends WeaponRuntime {
  blades: Sprite[];
}

interface DmgNum {
  t: Text;
  vy: number;
  life: number;
  max: number;
}

interface Telegraph {
  g: Graphics;
  x: number;
  y: number;
  r: number;
  t: number;
  delay: number;
  dmg: number;
}

interface FxLine {
  g: Graphics;
  life: number;
}

type State = 'play' | 'paused' | 'over';

const enemyQuery = defineQuery([Enemy, Position]);
const projQuery = defineQuery([Projectile, Position, Velocity]);
const gemQuery = defineQuery([Gem, Position]);

// Base sprite radius per texKind (0 zombie, 1 runner, 2 brute, 3 boss).
const ENEMY_BASE_R = [16, 13, 24, 58];

// Walk-cycle / FX playback rate for the art-pack animation layer (frames per second).
const ANIM_FPS = 9;

// Bike dash ability (HD survivor only): a short fast hop with i-frames, on a cooldown.
const DASH_DUR = 0.32; // seconds astride the bike
const DASH_CD = 2.2; // cooldown seconds
const DASH_SPEED = 720; // px/s during the dash (~3x walk)

// HD zombie display: cell px = radius * Z_DISPLAY_K (tuned so figures sit on their
// collision circle). Run/Attack cycle speeds come from each DirAnim's fps.
const Z_DISPLAY_K = 7.2;

// Player death sequence: play the survivor Die animation, then show the game-over card.
const DEATH_DUR = 1.3;
// Zombies hold position briefly on spawn while their WakeUp (emerge) animation plays.
const WAKE_DUR = 0.42;

// Isometric projection: the sim stays in flat world coords; only rendering projects to a
// 2:1 dimetric view. world (wx,wy) -> screen (sx,sy): sx=(wx-wy)*K, sy=(wx+wy)*K/2.
// Sprites stay upright (billboarded); depth is wx+wy. A world tile of ISO_TILE units maps
// to a 128x64 screen diamond, so the street/building tiles tessellate.
const ISO_K = 2 / 3;
const ISO_TILE = 96;
const ISO_DIAMOND_W = ISO_TILE * ISO_K * 2; // 128
const ISO_DIAMOND_H = ISO_TILE * ISO_K; // 64

export class Game {
  private world: IWorld = createWorld();
  private tex: Textures;
  private bg: TilingSprite;
  private worldC = new Container();
  private input = new Input();
  private hash = new SpatialHash(120);
  private cand: number[] = [];
  private ctx!: WeaponContext;

  private spr: (Sprite | undefined)[] = [];
  private freeSprites: Sprite[] = [];
  private playerSprite: Sprite;

  private dead = new Set<number>();
  private killList: number[] = [];
  private projDead = new Set<number>();
  private gemDead = new Set<number>();

  private dmgNums: DmgNum[] = [];
  private freeText: Text[] = [];
  private tele: Telegraph[] = [];
  private fx: FxLine[] = [];

  private player = {
    x: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    moveSpeed: 230,
    invuln: 0,
    radius: C.PLAYER_RADIUS,
    dashT: 0, // remaining dash time (s); >0 while on the bike
    dashCd: 0, // remaining cooldown (s)
    dashDx: 1, // dash direction (unit)
    dashDy: 0,
  };
  private mods: Mods = baseMods();
  private weapons: WeaponInst[] = [];
  private ownedWeapons = new Map<string, WeaponInst>();
  private passives = new Map<string, number>();

  private time = 0;
  private kills = 0;
  private level = 1;
  private xp = 0;
  private xpNext = C.xpForLevel(1);
  private spawnAcc = 0;
  private bossSpawned = false;
  private bossEid = -1;
  private win = false;
  private state: State = 'play';
  private acc = 0;
  private lastHitSfx = -1;
  private lastPickSfx = -1;
  private shakeMag = 0;
  private hitstop = 0;
  private flashEl!: HTMLDivElement;
  private dashBtn: HTMLDivElement | null = null;
  private petSprite!: Sprite;
  private petPos = { x: 0, y: 0 };
  private petAngle = 0;
  private petTimer = 0;
  private particles!: Particles;
  private artUpright = false;
  // Art-pack animation + scenery layer (populated only when the extras loaded).
  private decoC = new Container();
  // Urban environment: flat ground decals (blood/grime) below, scattered iso props above,
  // all depth-sorted with the cast by base-Y.
  private env: EnvAssets | null = null;
  private decalC = new Container();
  private envProps: Sprite[] = [];
  private firePhase = 0;
  private fireBarrels: { s: Sprite; t: number }[] = [];
  private vignette: Sprite | null = null;
  private muzzleSprite: Sprite | null = null;
  private tracer: Graphics | null = null;
  // Isometric ground tilemap: a pool of diamond tiles re-laid around the camera each frame.
  private groundTileC = new Container();
  private groundPool: Sprite[] = [];
  private isoMap: Record<string, Texture> = {}; // named street tiles (asphalt/asphalt_yellow/sidewalk/...)
  private groundAnchorY = 0.5; // top-face-center as a fraction of tile height
  private showBuildings = false; // buildings parked for now — focusing on the street floor
  private diamondTex: Texture | null = null;
  private fxC = new Container();
  private animClock = 0;
  private animFrame = 0;
  private prevPx = 0;
  private prevPy = 0;
  private playerWalk: Texture[] | null = null;
  // 8-direction HD survivor player: faces aim, switches idle/run/hit. null = procedural.
  private survivor: SurvivorSprite | null = null;
  private survFacing = Math.PI / 2; // start facing down (south)
  private dying = false; // player death animation in progress
  private deathStart = 0;
  // HD zombie enemies: a shared type->anim set + the chosen type per live entity.
  private zombies: ZombieAssets | null = null;
  private enemyZ: (ZombieAnims | undefined)[] = [];
  private enemyAtk: number[] = []; // chosen Attack variant per entity
  private enemyDie: number[] = []; // chosen Die variant per entity
  private enemyIdle: number[] = []; // chosen Idle variant per entity
  private enemyGait: number[] = []; // 0 = run, 1 = crouch-run (when fast)
  private enemySpawnT: number[] = []; // spawn time, for the WakeUp emerge
  private enemyHitT: number[] = []; // TakeDamage flinch timer
  private enemyTauntEnd: number[] = []; // time until current Taunt ends
  // Sprites detached from dead zombies, playing their one-shot Die animation.
  private zDeaths: { s: Sprite; die: DirAnimZ; row: number; flip: boolean; t: number; dur: number }[] = [];
  private enemyWalk: (Texture[] | undefined)[] = [];
  private animFx: { s: Sprite; frames: Texture[]; t: number; dur: number }[] = [];
  private fxPool: Sprite[] = [];

  constructor(
    private app: Application,
    private hud: Hud,
    private minimap: Minimap,
    private character: CharacterDef,
    private stage: StageDef,
    private pet: PetDef | null,
  ) {
    this.tex = createTextures(app.renderer);
    this.artUpright = true; // flat top-down cartoon art: upright + mirrored, untinted
    this.bg = new TilingSprite({
      texture: this.makeGroundTexture(),
      width: app.screen.width,
      height: app.screen.height,
    });
    app.stage.addChild(this.bg);
    app.stage.addChild(this.worldC);
    this.worldC.addChild(this.decoC); // scenery props render behind the cast
    this.particles = new Particles(app.renderer, this.worldC);

    this.playerSprite = new Sprite(this.tex.player);
    this.playerSprite.anchor.set(0.5);
    this.worldC.addChild(this.playerSprite);

    this.petSprite = new Sprite(this.tex.blade);
    this.petSprite.anchor.set(0.5);
    this.petSprite.visible = false;
    this.worldC.addChild(this.petSprite);

    this.worldC.addChild(this.fxC); // hit / death FX render above the cast

    // Environment: depth-sort the world by base-Y so the cast walks behind props/buildings.
    this.env = this.tex.env ?? null;
    this.worldC.sortableChildren = true;
    // Isometric layers: ground tiles at the bottom, then flat decals (skewed onto the
    // ground plane), then the depth-sorted upright cast, then FX on top.
    this.diamondTex = this.makeDiamondTex();
    this.isoMap = this.env?.isoground ?? {};
    // real iso tiles are 128x81 with the top-face center at y=32 -> anchor 0.395; the
    // procedural fallback diamond is 128x64 -> 0.5.
    this.groundAnchorY = Object.keys(this.isoMap).length ? 0.395 : 0.5;
    this.worldC.addChild(this.groundTileC);
    this.groundTileC.zIndex = -2e6;
    this.worldC.addChild(this.decalC);
    this.decalC.zIndex = -1e6;
    // Project flat decals onto the iso ground plane (skew); their own positions stay in
    // world coords and the matrix maps them to screen.
    this.decalC.setFromMatrix(new Matrix(ISO_K, ISO_K * 0.5, -ISO_K, ISO_K * 0.5, 0, 0));
    this.decoC.zIndex = -9e5;
    this.fxC.zIndex = 1e6;
    if (this.env) {
      this.makeVignette();
      // filmic grade: desaturate + lift contrast so the gritty palette reads and blood pops.
      // Applied to the screen-space stage (origin 0,0) with a screen-sized filterArea so it
      // clips to the viewport rather than worldC's enormous camera-translated bounds.
      const grade = new ColorMatrixFilter();
      grade.saturate(-0.05, false);
      grade.contrast(0.12, true);
      grade.brightness(1.08, true);
      this.app.stage.filters = [grade];
      this.app.stage.filterArea = new Rectangle(0, 0, this.app.screen.width, this.app.screen.height);
    }

    this.playerWalk = this.tex.anim?.player?.length ? this.tex.anim.player : null;
    this.zombies = this.tex.zombies ?? null;
    this.survivor = this.tex.survivor ?? null;
    if (this.survivor) {
      this.playerSprite.anchor.set(0.5, 0.6); // feet near the ground point
      this.createDashButton();
    }

    window.addEventListener('resize', () => this.onResize());

    this.flashEl = document.createElement('div');
    this.flashEl.style.cssText =
      'position:fixed;inset:0;pointer-events:none;z-index:8;opacity:0;transition:opacity 0.18s ease;background:#fff;';
    document.body.appendChild(this.flashEl);

    this.buildContext();
    this.reset();
    app.ticker.add(() => this.frame());
  }

  // ---- isometric projection -------------------------------------------------
  private isoX(wx: number, wy: number): number {
    return (wx - wy) * ISO_K;
  }
  private isoY(wx: number, wy: number): number {
    return (wx + wy) * (ISO_K * 0.5);
  }
  // Position an upright (billboarded) sprite at world (wx,wy) with iso depth (wx+wy).
  private place(s: Container, wx: number, wy: number): void {
    s.position.set((wx - wy) * ISO_K, (wx + wy) * (ISO_K * 0.5));
    s.zIndex = wx + wy;
  }

  private makeDiamondTex(): Texture {
    // A single iso floor diamond (128x64) with a faint seam — the base street tile.
    const w = ISO_DIAMOND_W;
    const h = ISO_DIAMOND_H;
    const g = new Graphics()
      .poly([w / 2, 0, w, h / 2, w / 2, h, 0, h / 2])
      .fill(0x3d4147)
      .stroke({ width: 1, color: 0x34373d, alpha: 0.5 });
    const t = this.app.renderer.generateTexture({ target: g, antialias: true, resolution: 2 });
    g.destroy();
    return t;
  }

  // Procedural city block: which surface a world cell is. Roads (3 wide) run on a grid with
  // yellow centre lines; sidewalks border them; block interiors are concrete (where buildings
  // sit). Deterministic in (col,row) so the city is consistent as the camera streams.
  private cityCell(col: number, row: number): string {
    const B = 9; // block period: 3-wide road + sidewalk + 4-cell building lot + sidewalk
    const RW = 3; // road width (wider avenues so the streets read + the horde funnels)
    const cx = ((col % B) + B) % B;
    const cy = ((row % B) + B) % B;
    const onColRoad = cx < RW;
    const onRowRoad = cy < RW;
    if (onColRoad || onRowRoad) {
      // continuous yellow centre line down each road
      if ((onColRoad && cx === 1) || (onRowRoad && cy === 1)) return 'asphalt_yellow';
      // white edge line where the road meets the kerb (outer lanes, away from intersections)
      if (onColRoad && !onRowRoad && (cx === 0 || cx === RW - 1)) return 'asphalt_edge';
      if (onRowRoad && !onColRoad && (cy === 0 || cy === RW - 1)) return 'asphalt_edge';
      return 'asphalt';
    }
    if (cx === RW || cy === RW || cx === B - 1 || cy === B - 1) return 'sidewalk';
    return 'concrete';
  }

  // Deterministic per-cell hash in [0,1) so tile-variant choices are stable as the camera streams.
  private cellHash(col: number, row: number): number {
    let h = Math.imul(col, 374761393) + Math.imul(row, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  private pickVar(list: Texture[] | undefined, col: number, row: number): Texture | null {
    if (!list || !list.length) return null;
    return list[(this.cellHash(row * 31 + 7, col * 17 + 3) * list.length) | 0];
  }

  private tileTexFor(col: number, row: number): Texture {
    const m = this.isoMap;
    if (!Object.keys(m).length) return this.diamondTex!;
    const cell = this.cityCell(col, row);
    const ex = this.env?.extras;
    const h = this.cellHash(col, row);
    // empty block interiors: gritty vacant-lot tiles instead of the loud checker
    if (cell === 'concrete') return this.pickVar(ex?.lot, col, row) ?? m.concrete ?? m.asphalt ?? this.diamondTex!;
    // roads: a deterministic minority get a cracked/patched or manhole/drain variant
    if (cell === 'asphalt') {
      if (h < 0.1) return this.pickVar(ex?.utility, col, row) ?? m.asphalt ?? this.diamondTex!;
      if (h < 0.5) return this.pickVar(ex?.asphaltvar, col, row) ?? m.asphalt ?? this.diamondTex!;
    }
    // sidewalks: half get a cracked/grimy/weedy variant
    if (cell === 'sidewalk' && h < 0.5) return this.pickVar(ex?.sidewalkvar, col, row) ?? m.sidewalk ?? this.diamondTex!;
    return m[cell] ?? m.asphalt ?? this.diamondTex!;
  }

  // Building footprints (block interiors) are solid: the cast can only walk the streets +
  // sidewalks, so the horde funnels down the avenues instead of clipping through/onto roofs.
  private blockedCity(wx: number, wy: number): boolean {
    if (!this.env || !this.showBuildings) return false; // no building collision while buildings are parked
    return this.cityCell(Math.round(wx / ISO_TILE), Math.round(wy / ISO_TILE)) === 'concrete';
  }

  // Move from (x,y) by (mx,my), sliding along building walls; returns the new [x,y].
  // If already inside a block (spawned/knocked in), move freely so nothing gets stuck.
  private slideMove(x: number, y: number, mx: number, my: number): [number, number] {
    if (this.blockedCity(x, y)) return [x + mx, y + my];
    let nx = x;
    let ny = y;
    if (!this.blockedCity(x + mx, y)) nx = x + mx;
    if (!this.blockedCity(nx, y + my)) ny = y + my;
    return [nx, ny];
  }

  // Re-lay the iso ground tiles covering the viewport, centered on the player's tile.
  private renderGround(): void {
    const p = this.player;
    const pc = Math.round(p.x / ISO_TILE);
    const pr = Math.round(p.y / ISO_TILE);
    const camX = this.worldC.x;
    const camY = this.worldC.y;
    const W = this.app.screen.width;
    const H = this.app.screen.height;
    const NX = 16;
    const NY = 24;
    let i = 0;
    for (let dr = -NY; dr <= NY; dr++) {
      for (let dc = -NX; dc <= NX; dc++) {
        const wx = (pc + dc) * ISO_TILE;
        const wy = (pr + dr) * ISO_TILE;
        const sx = (wx - wy) * ISO_K;
        const sy = (wx + wy) * (ISO_K * 0.5);
        if (camX + sx < -ISO_DIAMOND_W || camX + sx > W + ISO_DIAMOND_W) continue;
        if (camY + sy < -ISO_DIAMOND_H || camY + sy > H + ISO_DIAMOND_H) continue;
        let s = this.groundPool[i];
        if (!s) {
          s = new Sprite();
          s.anchor.set(0.5, this.groundAnchorY);
          s.scale.set(1.04); // slight overlap closes anti-aliased tile seams
          this.groundTileC.addChild(s);
          this.groundPool[i] = s;
        }
        s.texture = this.tileTexFor(pc + dc, pr + dr);
        s.visible = true;
        s.position.set(sx, sy);
        i++;
      }
    }
    for (let k = i; k < this.groundPool.length; k++) this.groundPool[k].visible = false;
  }

  private makeVignette(): void {
    const cv = document.createElement('canvas');
    cv.width = 256;
    cv.height = 256;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const grd = ctx.createRadialGradient(128, 128, 36, 128, 128, 152);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(0.68, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(8,9,13,0.42)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 256, 256);
    const v = new Sprite(Texture.from(cv));
    v.width = this.app.screen.width;
    v.height = this.app.screen.height;
    this.app.stage.addChild(v); // above the world, below the DOM HUD
    this.vignette = v;
  }

  private makeGroundTexture(): Texture {
    // Gritty mid-grey asphalt for the city (the pack's actual street tiles are scattered
    // as decals on top). Mid value so the cast, blood and props read clearly over it.
    if (this.tex.env) {
      // Uniform mid-grey base + only fine speckle, so the tiling shows no repeating grid;
      // all larger variety (cracks, patches, blood) comes from non-repeating scattered decals.
      // Solid mid-grey asphalt — a uniform tile cannot show a tiling seam; every bit of
      // grit (cracks, oil, patches, blood) comes from the non-repeating scattered decals.
      const g = new Graphics().rect(0, 0, 16, 16).fill(0x3d4147);
      const t = this.app.renderer.generateTexture({ target: g, antialias: false, resolution: 1 });
      t.source.scaleMode = 'nearest';
      g.destroy();
      return t;
    }
    // Use the art pack's terrain tile when available; else the procedural dark grid.
    const gt = this.tex.anim?.ground;
    if (gt) return gt;
    // survivor.io-style smooth ground: flat muted mauve (vignette adds depth on top).
    const g = new Graphics().rect(0, 0, 64, 64).fill(0x9b8a92);
    const t = this.app.renderer.generateTexture(g);
    g.destroy();
    return t;
  }

  // Scatter static scenery (trees/bushes/tombstones/etc.) around the arena. Purely
  // visual — placed behind the cast in decoC and left to scroll with the world.
  private scatterProps(): void {
    // clear previous dressing
    for (const c of this.decalC.removeChildren()) c.destroy();
    for (const s of this.envProps) {
      this.worldC.removeChild(s);
      s.destroy();
    }
    this.envProps = [];
    this.fireBarrels = [];

    const env = this.env;
    const R = 3700; // decorated half-extent around the spawn (covers the city blocks)
    const clear = 190; // keep the spawn point itself walkable

    if (!env) {
      // legacy fallback: the old art-pack props, flat behind the cast
      for (const c of this.decoC.removeChildren()) c.destroy();
      const props = this.tex.anim?.props;
      if (props?.length) {
        for (let i = 0; i < 120; i++) {
          const px = (Math.random() * 2 - 1) * R;
          const py = (Math.random() * 2 - 1) * R;
          if (px * px + py * py < clear * clear) continue;
          const s = new Sprite(props[(Math.random() * props.length) | 0]);
          s.anchor.set(0.5, 0.7);
          s.position.set(px, py);
          s.alpha = 0.9;
          this.decoC.addChild(s);
        }
      }
      return;
    }

    // --- flat ground decals: grime, oil, tyre marks, trash, puddles and blood strewn across
    // the streets (the floor-grit pass). Falls back to the old detail/blood sets if absent. ---
    const ex0 = env.extras;
    const decalSets: { tex?: Texture[]; n: number; smin: number; smax: number; alpha: number }[] = [
      { tex: ex0?.grimedecal, n: 150, smin: 0.6, smax: 1.5, alpha: 0.7 }, // cracks / grime / scorch
      { tex: ex0?.oildecal, n: 70, smin: 0.5, smax: 1.1, alpha: 0.7 }, // oil / fluid stains
      { tex: ex0?.tiredecal, n: 55, smin: 0.5, smax: 1.1, alpha: 0.55 }, // skid / tyre marks
      { tex: ex0?.puddledecal, n: 35, smin: 0.6, smax: 1.3, alpha: 0.8 }, // wet patches / puddles
      { tex: ex0?.trashdecal, n: 160, smin: 0.4, smax: 0.9, alpha: 0.95 }, // litter / leaves / glass
      { tex: ex0?.blooddecal, n: 80, smin: 0.5, smax: 1.2, alpha: 0.9 }, // gore pools / smears
      { tex: env.detail, n: 50, smin: 0.7, smax: 1.4, alpha: 0.55 }, // fallback grit
      { tex: env.decals, n: 50, smin: 0.8, smax: 1.6, alpha: 0.5 }, // fallback blood
    ];
    for (const set of decalSets) {
      if (!set.tex?.length) continue;
      for (let i = 0; i < set.n; i++) {
        const s = new Sprite(set.tex[(Math.random() * set.tex.length) | 0]);
        s.anchor.set(0.5);
        s.position.set((Math.random() * 2 - 1) * R, (Math.random() * 2 - 1) * R);
        s.rotation = Math.random() * Math.PI * 2;
        s.scale.set(set.smin + Math.random() * (set.smax - set.smin));
        s.alpha = set.alpha * (0.7 + Math.random() * 0.3);
        this.decalC.addChild(s);
      }
    }

    // --- structured city: buildings fill the block interiors; roads stay clear so the
    // horde funnels down the streets, vehicles sit on the asphalt, clutter on sidewalks. ---
    const B = 9;
    const TILE = ISO_TILE;
    const NB = 5; // city blocks in each direction around spawn
    const span = NB * B;
    const addAt = (tex: Texture, wx: number, wy: number, anchorY: number, sc: number): Sprite | null => {
      if (wx * wx + wy * wy < clear * clear) return null;
      const s = new Sprite(tex);
      s.anchor.set(0.5, anchorY);
      s.scale.set(sc);
      this.place(s, wx, wy);
      this.worldC.addChild(s);
      this.envProps.push(s);
      return s;
    };
    const randCell = (): number => ((Math.random() * (2 * span)) | 0) - span;

    const ex = env.extras;
    // composed multi-storey buildings (fallback to single facades) packed into block
    // interiors on a 3-cell grid so each block is a solid mass with streets around it.
    const buildings = env.buildings2.length ? env.buildings2 : env.buildings;
    if (this.showBuildings && buildings.length) {
      for (let bc = -NB; bc <= NB; bc++) {
        for (let br = -NB; br <= NB; br++) {
          // ONE solid building per block, centred in the 4-cell lot (cells 4..7), no overlap
          // and exact grid scale so each reads as a clean rectangular box with streets around it.
          const cc = bc * B + 5.5;
          const rr = br * B + 5.5;
          addAt(buildings[(Math.random() * buildings.length) | 0], cc * TILE, rr * TILE, 0.86, 1.0);
        }
      }
    }
    // place N props on cells of a given surface type (roads vs sidewalks)
    const onCells = (type: string, n: number, texs: Texture[] | undefined, anchorY: number, smin: number, smax: number): void => {
      if (!texs || !texs.length) return;
      let placed = 0;
      let tries = 0;
      while (placed < n && tries < n * 12) {
        tries++;
        const cc = randCell();
        const rr = randCell();
        if (this.cityCell(cc, rr) !== type) continue;
        const s = addAt(
          texs[(Math.random() * texs.length) | 0],
          cc * TILE + (Math.random() * 30 - 15),
          rr * TILE + (Math.random() * 30 - 15),
          anchorY,
          smin + Math.random() * (smax - smin),
        );
        if (s) placed++;
      }
    };
    const cars = [...(ex.taxi ?? []), ...(ex.sedan ?? []), ...env.cars];
    onCells('asphalt', 26, cars, 0.88, 0.95, 1.15); // wrecks on the road
    onCells('asphalt', 16, ex.rubble, 0.9, 0.7, 1.0);
    onCells('sidewalk', 34, ex.railing, 0.9, 0.95, 1.1); // guardrails line the sidewalks
    onCells('sidewalk', 18, ex.lamps, 0.95, 0.9, 1.05);
    onCells('sidewalk', 12, ex.traffic, 0.95, 0.9, 1.05);
    onCells('sidewalk', 14, ex.signs, 0.92, 0.8, 1.0);
    onCells('sidewalk', 16, ex.bins, 0.9, 0.75, 0.95);
    onCells('sidewalk', 16, ex.furniture, 0.9, 0.7, 0.95);
    onCells('sidewalk', 18, ex.trees, 0.95, 0.85, 1.15);
    onCells('sidewalk', 14, [...(ex.rubble ?? []), ...env.objects], 0.9, 0.6, 0.9);
    if (env.firebarrel.length) {
      let placed = 0;
      let tries = 0;
      while (placed < 8 && tries < 90) {
        tries++;
        const cc = randCell();
        const rr = randCell();
        if (this.cityCell(cc, rr) !== 'sidewalk') continue;
        const s = addAt(env.firebarrel[0], cc * TILE, rr * TILE, 0.9, 0.9);
        if (s) {
          this.fireBarrels.push({ s, t: Math.random() * 10 });
          placed++;
        }
      }
    }
  }

  private onResize(): void {
    this.bg.width = this.app.screen.width;
    this.bg.height = this.app.screen.height;
    if (this.vignette) {
      this.vignette.width = this.app.screen.width;
      this.vignette.height = this.app.screen.height;
    }
    if (this.app.stage.filterArea)
      this.app.stage.filterArea = new Rectangle(0, 0, this.app.screen.width, this.app.screen.height);
  }

  private addShake(n: number): void {
    this.shakeMag = Math.min(24, Math.max(this.shakeMag, n));
  }

  private flash(color = '#ffffff', a = 0.5): void {
    if (settings.reduceMotion) return;
    this.flashEl.style.background = color;
    this.flashEl.style.opacity = String(a);
    requestAnimationFrame(() => {
      this.flashEl.style.opacity = '0';
    });
  }

  // Capabilities exposed to weapon behaviors (see behaviors.ts).
  private buildContext(): void {
    const self = this;
    this.ctx = {
      get px() {
        return self.player.x;
      },
      get py() {
        return self.player.y;
      },
      get fx() {
        return self.input.facing.x;
      },
      get fy() {
        return self.input.facing.y;
      },
      get mods() {
        return self.mods;
      },
      get time() {
        return self.time;
      },
      critRoll: () => self.critRoll(),
      aimNearest: (range) => {
        const t = self.nearestEnemy(self.player.x, self.player.y, range);
        if (t < 0) return null;
        const dx = Position.x[t] - self.player.x;
        const dy = Position.y[t] - self.player.y;
        const d = Math.hypot(dx, dy) || 1;
        return { x: dx / d, y: dy / d };
      },
      forEachInRadius: (x, y, r, cb) => {
        self.hash.queryRadius(x, y, r, self.cand);
        for (const e of self.cand) {
          if (self.dead.has(e)) continue;
          const dx = Position.x[e] - x;
          const dy = Position.y[e] - y;
          cb(e, dx, dy, Math.hypot(dx, dy));
        }
      },
      damage: (eid, dmg, crit) => self.damageEnemy(eid, dmg, crit),
      knockback: (eid, nx, ny, force) => {
        Enemy.knx[eid] = nx;
        Enemy.kny[eid] = ny;
        Enemy.knock[eid] = force;
      },
      spawnProjectile: (x, y, vx, vy, dmg, pierce, crit, radius, color) =>
        self.spawnProjectile(x, y, vx, vy, dmg, pierce, crit, radius, color),
      spawnZap: (x1, y1, x2, y2, color) => self.spawnZap(x1, y1, x2, y2, color),
      spawnRing: (x, y, r, color) => self.spawnNovaRing(x, y, r, color),
    };
  }

  // ---- sprite pooling -------------------------------------------------------
  private acquireSprite(tex: Texture): Sprite {
    let s = this.freeSprites.pop();
    if (!s) {
      s = new Sprite();
      s.anchor.set(0.5);
      this.worldC.addChild(s);
    }
    s.texture = tex;
    s.visible = true;
    s.tint = 0xffffff;
    s.rotation = 0;
    s.scale.set(1);
    return s;
  }

  private releaseSprite(eid: number): void {
    const s = this.spr[eid];
    if (s) {
      s.visible = false;
      this.freeSprites.push(s);
      this.spr[eid] = undefined;
      this.enemyWalk[eid] = undefined;
      this.enemyZ[eid] = undefined;
    }
  }

  // On death, hand a zombie's sprite to a one-shot Die animation (facing the player).
  // Returns true if it took over the sprite; false means a plain release (pixel
  // fallback, no Die sheet, or the on-screen death cap was hit).
  private playZombieDeath(eid: number): boolean {
    const s = this.spr[eid];
    const za = this.enemyZ[eid];
    if (!s || !za?.die.length || this.zDeaths.length >= 36) {
      this.releaseSprite(eid);
      return false;
    }
    const die = za.die[this.enemyDie[eid] % za.die.length];
    const m = dir5(dirRow(Math.atan2(this.player.y - Position.y[eid], this.player.x - Position.x[eid])));
    const sc = (Enemy.radius[eid] * Z_DISPLAY_K) / ORIG_CELL;
    s.tint = 0xffffff;
    s.alpha = 1;
    s.scale.set(m.flip ? -sc : sc, sc);
    s.anchor.set(0.5, die.anchorY);
    this.zDeaths.push({ s, die, row: m.row, flip: m.flip, t: 0, dur: die.count / die.fps });
    this.spr[eid] = undefined;
    this.enemyZ[eid] = undefined;
    this.enemyWalk[eid] = undefined;
    return true;
  }

  private updateZDeaths(dt: number): void {
    for (let i = this.zDeaths.length - 1; i >= 0; i--) {
      const d = this.zDeaths[i];
      d.t += dt;
      d.s.texture = d.die.frames[d.row][Math.min(d.die.count - 1, Math.floor(d.t * d.die.fps))];
      const left = d.dur - d.t;
      d.s.alpha = left < 0.3 ? Math.max(0, left / 0.3) : 1; // fade the corpse out at the end
      if (d.t >= d.dur) {
        d.s.visible = false;
        d.s.alpha = 1;
        this.freeSprites.push(d.s);
        this.zDeaths.splice(i, 1);
      }
    }
  }

  // ---- entity factories -----------------------------------------------------
  private spawnEnemy(kind: number, x: number, y: number): number {
    const def = ENEMY_DEFS[kind];
    const dmul = C.difficultyMul(this.time);
    const eid = addEntity(this.world);
    addComponent(this.world, Position, eid);
    addComponent(this.world, Velocity, eid);
    addComponent(this.world, Enemy, eid);
    Position.x[eid] = x;
    Position.y[eid] = y;
    Enemy.speed[eid] = def.speed;
    Enemy.hp[eid] = def.hp * dmul * this.stage.enemyHpMul;
    Enemy.maxHp[eid] = def.hp * dmul * this.stage.enemyHpMul;
    Enemy.dmg[eid] = def.dmg * dmul * this.stage.enemyDmgMul;
    Enemy.radius[eid] = def.radius;
    Enemy.kind[eid] = kind;
    Enemy.xp[eid] = def.xp;
    Enemy.flash[eid] = 0;
    Enemy.boss[eid] = def.boss ? 1 : 0;
    Enemy.atkCd[eid] = def.boss
      ? (def.bossAttack?.interval ?? 2.6)
      : def.ai === 'shooter'
        ? (def.shootCd ?? 2.2)
        : def.ai === 'charger'
          ? (def.chargeCd ?? 3)
          : 99999;
    Enemy.knock[eid] = 0;
    // Pick the visual: shooter enemies become the turret zombie; everything else
    // uses its texKind slot (boss = the big zombie). Walk frames, when present,
    // drive the animation in render(); the turret is sized like a runner (kind 1).
    // HD zombie visual: a random type from this class's pool, scaled to the collision
    // radius. The render loop faces it at the player and cycles its Run frames.
    if (this.zombies) {
      const za = this.zombies.types[resolveZombieType(def.id, def.texKind)];
      if (za) {
        const s = this.acquireSprite(za.run.frames[2][0]); // row 2 = facing south
        s.anchor.set(0.5, za.run.anchorY);
        s.scale.set((def.radius * Z_DISPLAY_K) / ORIG_CELL);
        this.spr[eid] = s;
        this.enemyZ[eid] = za;
        this.enemyAtk[eid] = (Math.random() * 5) | 0;
        this.enemyDie[eid] = (Math.random() * 2) | 0;
        this.enemyIdle[eid] = (Math.random() * 2) | 0;
        this.enemyGait[eid] = Math.random() < 0.4 ? 1 : 0;
        this.enemySpawnT[eid] = this.time;
        this.enemyHitT[eid] = 0;
        this.enemyTauntEnd[eid] = 0;
        this.enemyWalk[eid] = undefined;
        return eid;
      }
    }

    const anim = this.tex.anim;
    const useTurret = !!(anim && def.ai === 'shooter' && anim.turret.length);
    const sizeKind = useTurret ? 1 : def.texKind;
    const baseTex = useTurret
      ? anim!.turret[0]
      : def.texKind === 3
        ? this.tex.boss
        : this.tex.enemy[def.texKind];
    const s = this.acquireSprite(baseTex);
    s.scale.set(def.radius / ENEMY_BASE_R[sizeKind]);
    this.spr[eid] = s;
    let frames: Texture[] | undefined;
    if (anim) {
      if (useTurret) frames = anim.turret;
      else if (def.texKind === 3) frames = anim.boss.length ? anim.boss : undefined;
      else frames = anim.enemy[def.texKind] ?? undefined;
    }
    this.enemyWalk[eid] = frames;
    this.enemyZ[eid] = undefined;
    return eid;
  }

  private spawnProjectile(
    x: number,
    y: number,
    vx: number,
    vy: number,
    dmg: number,
    pierce: number,
    crit: boolean,
    radius: number,
    color = 0xffffff,
  ): void {
    const eid = addEntity(this.world);
    addComponent(this.world, Position, eid);
    addComponent(this.world, Velocity, eid);
    addComponent(this.world, Projectile, eid);
    Position.x[eid] = x;
    Position.y[eid] = y;
    Velocity.x[eid] = vx;
    Velocity.y[eid] = vy;
    Projectile.dmg[eid] = dmg;
    Projectile.life[eid] = 1.4;
    Projectile.radius[eid] = radius;
    Projectile.pierce[eid] = pierce;
    Projectile.crit[eid] = crit ? 1 : 0;
    Projectile.enemy[eid] = 0;
    const s = this.acquireSprite(this.tex.projectile);
    s.rotation = Math.atan2(vy, vx);
    s.tint = color;
    s.scale.set(radius / 7);
    this.spr[eid] = s;
  }

  // Enemy-owned hazard projectile that damages the player.
  private spawnHazard(
    x: number,
    y: number,
    vx: number,
    vy: number,
    dmg: number,
    radius: number,
    color: number,
  ): void {
    const eid = addEntity(this.world);
    addComponent(this.world, Position, eid);
    addComponent(this.world, Velocity, eid);
    addComponent(this.world, Projectile, eid);
    Position.x[eid] = x;
    Position.y[eid] = y;
    Velocity.x[eid] = vx;
    Velocity.y[eid] = vy;
    Projectile.dmg[eid] = dmg;
    Projectile.life[eid] = 3;
    Projectile.radius[eid] = radius;
    Projectile.pierce[eid] = 0;
    Projectile.crit[eid] = 0;
    Projectile.enemy[eid] = 1;
    const s = this.acquireSprite(this.tex.projectile);
    s.rotation = Math.atan2(vy, vx);
    s.tint = color;
    s.scale.set(radius / 7);
    this.spr[eid] = s;
  }

  private spawnGem(x: number, y: number, value: number, kind: number): void {
    const eid = addEntity(this.world);
    addComponent(this.world, Position, eid);
    addComponent(this.world, Gem, eid);
    Position.x[eid] = x + rand(-6, 6);
    Position.y[eid] = y + rand(-6, 6);
    Gem.value[eid] = value;
    Gem.kind[eid] = kind;
    Gem.magnet[eid] = 0;
    Gem.life[eid] = 30;
    this.spr[eid] = this.acquireSprite(this.tex.gem[kind]);
  }

  // ---- weapons --------------------------------------------------------------
  private addWeapon(id: string): void {
    const def = WEAPONS[id];
    if (!def) return;
    const inst: WeaponInst = { def, level: 1, timer: 0, angle: 0, blades: [] };
    this.weapons.push(inst);
    this.ownedWeapons.set(id, inst);
    if (inst.def.type === 'orbit') this.rebuildBlades(inst);
  }

  private rebuildBlades(inst: WeaponInst): void {
    for (const b of inst.blades) b.destroy();
    inst.blades = [];
    const count = inst.def.stats(inst.level).count;
    for (let i = 0; i < count; i++) {
      const b = new Sprite(this.tex.blade);
      b.anchor.set(0.5);
      this.worldC.addChild(b);
      inst.blades.push(b);
    }
  }

  private critRoll(): boolean {
    return Math.random() < this.mods.critRate;
  }

  private nearestEnemy(x: number, y: number, range: number): number {
    this.hash.queryRadius(x, y, range, this.cand);
    let best = -1;
    let bd = range * range;
    for (const e of this.cand) {
      if (this.dead.has(e)) continue;
      const dx = Position.x[e] - x;
      const dy = Position.y[e] - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bd) {
        bd = d2;
        best = e;
      }
    }
    return best;
  }

  private damageEnemy(eid: number, base: number, crit: boolean): void {
    if (this.dead.has(eid)) return;
    const dmg = base * (crit ? this.mods.critDmg : 1);
    Enemy.hp[eid] -= dmg;
    Enemy.flash[eid] = 0.09;
    if (this.enemyZ[eid] && Math.random() < 0.3) this.enemyHitT[eid] = 0.2; // occasional flinch
    this.particles.spark(Position.x[eid], Position.y[eid], 0xfff2a0);
    const bl = this.tex.anim?.blood;
    if (bl?.length && this.animFx.length < 48 && Math.random() < 0.33)
      this.spawnAnimFx(bl, Position.x[eid], Position.y[eid], 1, 0.28);
    if (settings.showDamageNumbers)
      this.spawnDmgNum(Position.x[eid], Position.y[eid] - Enemy.radius[eid], dmg, crit);
    if (this.time - this.lastHitSfx > 0.05) {
      audio.hit();
      this.lastHitSfx = this.time;
    }
    if (Enemy.hp[eid] <= 0) {
      this.dead.add(eid);
      this.killList.push(eid);
    }
  }

  private updatePet(dt: number): void {
    if (!this.pet) return;
    const p = this.player;
    this.petAngle += 0.9 * dt;
    const tx = p.x + Math.cos(this.petAngle) * 64;
    const ty = p.y + Math.sin(this.petAngle) * 64;
    const k = Math.min(1, 7 * dt);
    this.petPos.x += (tx - this.petPos.x) * k;
    this.petPos.y += (ty - this.petPos.y) * k;

    this.petTimer -= dt;
    if (this.petTimer > 0) return;
    this.petTimer += Math.max(this.pet.cooldown * this.mods.cdMul, 0.1);
    const t = this.nearestEnemy(this.petPos.x, this.petPos.y, this.pet.range);
    let dx = this.input.facing.x;
    let dy = this.input.facing.y;
    if (t >= 0) {
      dx = Position.x[t] - this.petPos.x;
      dy = Position.y[t] - this.petPos.y;
      const d = Math.hypot(dx, dy) || 1;
      dx /= d;
      dy /= d;
    }
    const a0 = Math.atan2(dy, dx);
    for (let i = 0; i < this.pet.count; i++) {
      const a = a0 + (i - (this.pet.count - 1) / 2) * 0.18;
      this.spawnProjectile(
        this.petPos.x,
        this.petPos.y,
        Math.cos(a) * this.pet.speed,
        Math.sin(a) * this.pet.speed,
        this.pet.dmg * this.mods.dmgMul,
        0,
        this.critRoll(),
        6,
        this.pet.color,
      );
    }
  }

  private fireWeapons(dt: number): void {
    for (const w of this.weapons) {
      const h = behaviors[w.def.type];
      if (!h) continue;
      const s = w.def.stats(w.level);
      if (h.update) h.update(this.ctx, w, s, dt);
      if (h.fire) {
        w.timer -= dt;
        if (w.timer <= 0) {
          w.timer += Math.max(s.cooldown * this.mods.cdMul, 0.1);
          h.fire(this.ctx, w, s);
          if (w.def.type === 'projectile' || w.def.type === 'burst') audio.shoot();
        }
      }
    }
  }

  // ---- vfx ------------------------------------------------------------------
  private spawnDmgNum(x: number, y: number, val: number, crit: boolean): void {
    let t = this.freeText.pop();
    if (!t) {
      t = new Text({ text: '', style: { fontFamily: 'Arial', fontSize: 16, fill: 0xffffff } });
      t.anchor.set(0.5);
      this.worldC.addChild(t);
    }
    t.text = String(Math.round(val));
    t.style.fontSize = crit ? 23 : 16;
    t.style.fill = crit ? 0xffe066 : 0xffffff;
    t.style.fontWeight = crit ? 'bold' : 'normal';
    t.style.stroke = { color: 0x000000, width: 3 };
    t.position.set(this.isoX(x, y), this.isoY(x, y));
    t.visible = true;
    t.alpha = 1;
    this.dmgNums.push({ t, vy: -46, life: 0.6, max: 0.6 });
  }

  private spawnZap(x1: number, y1: number, x2: number, y2: number, color = 0x9be7ff): void {
    const g = new Graphics();
    g.moveTo(this.isoX(x1, y1), this.isoY(x1, y1)).lineTo(this.isoX(x2, y2), this.isoY(x2, y2)).stroke({ width: 3, color, alpha: 0.9 });
    this.worldC.addChild(g);
    this.fx.push({ g, life: 0.12 });
  }

  private spawnNovaRing(x: number, y: number, r: number, color: number): void {
    const g = new Graphics().circle(0, 0, r).stroke({ width: 4, color, alpha: 0.7 });
    g.position.set(this.isoX(x, y), this.isoY(x, y));
    g.scale.set(1, 0.5); // flat on the iso ground plane
    this.worldC.addChild(g);
    this.fx.push({ g, life: 0.18 });
  }

  // ---- per-step systems -----------------------------------------------------
  private movePlayer(dt: number): void {
    const p = this.player;
    p.dashCd = Math.max(0, p.dashCd - dt);
    // Start a bike dash on request (off cooldown, not already dashing).
    if (this.survivor && p.dashT <= 0 && p.dashCd <= 0 && this.input.consumeDash()) {
      let dx = this.input.dir.x;
      let dy = this.input.dir.y;
      if (dx === 0 && dy === 0) {
        dx = this.input.facing.x; // idle: dash along last travel heading
        dy = this.input.facing.y;
      }
      const m = Math.hypot(dx, dy) || 1;
      p.dashDx = dx / m;
      p.dashDy = dy / m;
      p.dashT = DASH_DUR;
      p.dashCd = DASH_CD;
      this.addShake(5);
    }

    let mvx = 0;
    let mvy = 0;
    if (p.dashT > 0) {
      p.dashT = Math.max(0, p.dashT - dt);
      mvx = p.dashDx * DASH_SPEED * dt;
      mvy = p.dashDy * DASH_SPEED * dt;
    } else {
      const sp = p.moveSpeed * this.mods.moveMul;
      mvx = this.input.dir.x * sp * dt;
      mvy = this.input.dir.y * sp * dt;
    }
    [p.x, p.y] = this.slideMove(p.x, p.y, mvx, mvy); // slide along building walls
    p.x = Math.max(-C.ARENA_HALF, Math.min(C.ARENA_HALF, p.x));
    p.y = Math.max(-C.ARENA_HALF, Math.min(C.ARENA_HALF, p.y));
    p.invuln = Math.max(0, p.invuln - dt);
  }

  private spawnDirector(dt: number): void {
    if (this.bossSpawned) return;
    const rate = (this.stage.spawnBase + this.time * this.stage.spawnRamp) * 1.8;
    this.spawnAcc += dt * rate;
    let count = enemyQuery(this.world).length;
    const cap = 900;
    while (this.spawnAcc >= 1) {
      this.spawnAcc -= 1;
      if (count >= cap) continue;
      this.spawnOne();
      count++;
    }
  }

  private spawnOne(): void {
    const t = this.time;
    let total = 0;
    for (let i = 0; i < ENEMY_DEFS.length; i++) {
      const d = ENEMY_DEFS[i];
      if (d.boss || (d.spawn?.minTime ?? 0) > t) continue;
      total += d.spawn?.weight ?? 1;
    }
    let kind = 0;
    if (total > 0) {
      let roll = Math.random() * total;
      for (let i = 0; i < ENEMY_DEFS.length; i++) {
        const d = ENEMY_DEFS[i];
        if (d.boss || (d.spawn?.minTime ?? 0) > t) continue;
        roll -= d.spawn?.weight ?? 1;
        if (roll <= 0) {
          kind = i;
          break;
        }
      }
    }
    const R = Math.max(this.app.screen.width, this.app.screen.height) / 2 + 90;
    let sx = this.player.x;
    let sy = this.player.y;
    for (let tries = 0; tries < 8; tries++) {
      const ang = rand(0, Math.PI * 2);
      sx = this.player.x + Math.cos(ang) * R;
      sy = this.player.y + Math.sin(ang) * R;
      if (!this.blockedCity(sx, sy)) break; // spawn on a street, not inside a building
    }
    this.spawnEnemy(kind, sx, sy);
  }

  private bossCheck(): void {
    if (this.bossSpawned || this.stage.bossTime <= 0 || this.time < this.stage.bossTime) return;
    this.bossSpawned = true;
    // board-wipe: clear all normal enemies (see docs/04)
    for (const e of enemyQuery(this.world).slice()) {
      this.releaseSprite(e);
      removeEntity(this.world, e);
    }
    const bossKinds: number[] = [];
    for (let i = 0; i < ENEMY_DEFS.length; i++) if (ENEMY_DEFS[i].boss) bossKinds.push(i);
    const bk = bossKinds.length ? pick(bossKinds) : 0;
    this.bossEid = this.spawnEnemy(bk, this.player.x, this.player.y - 360);
    audio.bossSpawn();
    audio.setBossMode(true);
    this.particles.ring(Position.x[this.bossEid], Position.y[this.bossEid], 0xff5050, 120);
    this.addShake(16);
    this.flash('#ff5050', 0.3);
    this.hitstop = 0.05;
  }

  private updateEnemies(dt: number): void {
    const p = this.player;
    for (const e of enemyQuery(this.world)) {
      const dx = p.x - Position.x[e];
      const dy = p.y - Position.y[e];
      const d = Math.hypot(dx, dy) || 1;
      // Hold position briefly on spawn while the WakeUp emerge animation plays.
      const waking = this.enemyZ[e] !== undefined && this.time - this.enemySpawnT[e] < WAKE_DUR;
      if (!waking) {
        const [nx, ny] = this.slideMove(Position.x[e], Position.y[e], (dx / d) * Enemy.speed[e] * dt, (dy / d) * Enemy.speed[e] * dt);
        Position.x[e] = nx;
        Position.y[e] = ny;
      }
      if (this.enemyHitT[e] > 0) this.enemyHitT[e] -= dt;
      // Occasional Taunt roar when not crowding the player.
      if (this.enemyZ[e] && !waking && this.enemyTauntEnd[e] < this.time && d > 240 && Math.random() < 0.0011)
        this.enemyTauntEnd[e] = this.time + 1.1;
      if (Enemy.knock[e] > 0) {
        Position.x[e] += Enemy.knx[e] * Enemy.knock[e] * dt;
        Position.y[e] += Enemy.kny[e] * Enemy.knock[e] * dt;
        Enemy.knock[e] = Math.max(0, Enemy.knock[e] - 900 * dt);
      }
      if (Enemy.flash[e] > 0) Enemy.flash[e] -= dt;
      const edef = ENEMY_DEFS[Enemy.kind[e]];
      if (Enemy.boss[e] || edef.ai === 'shooter' || edef.ai === 'charger') {
        Enemy.atkCd[e] -= dt;
        if (Enemy.atkCd[e] <= 0) {
          if (Enemy.boss[e]) {
            this.bossAttack(e, edef);
          } else if (edef.ai === 'shooter') {
            Enemy.atkCd[e] = edef.shootCd ?? 2.2;
            this.fireEnemyShot(Position.x[e], Position.y[e], Enemy.dmg[e] * 0.7, edef.shootSpeed ?? 240, edef);
          } else {
            Enemy.atkCd[e] = edef.chargeCd ?? 3;
            const cdx = p.x - Position.x[e];
            const cdy = p.y - Position.y[e];
            const cd = Math.hypot(cdx, cdy) || 1;
            Enemy.knx[e] = cdx / cd;
            Enemy.kny[e] = cdy / cd;
            Enemy.knock[e] = 640;
          }
        }
      }
    }
  }

  private spawnTelegraph(x: number, y: number, r: number, delay: number, dmg: number): void {
    const g = new Graphics();
    this.worldC.addChild(g);
    this.tele.push({ g, x, y, r, t: 0, delay, dmg });
  }

  private firstMobKind(): number {
    for (let i = 0; i < ENEMY_DEFS.length; i++) if (!ENEMY_DEFS[i].boss) return i;
    return 0;
  }

  private fireEnemyShot(x: number, y: number, dmg: number, speed: number, def: EnemyDef): void {
    const dx = this.player.x - x;
    const dy = this.player.y - y;
    const d = Math.hypot(dx, dy) || 1;
    this.spawnHazard(x, y, (dx / d) * speed, (dy / d) * speed, dmg, 8, def.tint ?? 0xff8030);
  }

  private bossAttack(e: number, def: EnemyDef): void {
    const p = this.player;
    const atk = def.bossAttack;
    Enemy.atkCd[e] = atk?.interval ?? 2.6;
    const kind = atk?.kind ?? 'slam';
    const bx = Position.x[e];
    const by = Position.y[e];
    if (kind === 'volley') {
      const n = atk?.projCount ?? 14;
      const spd = atk?.projSpeed ?? 220;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        this.spawnHazard(bx, by, Math.cos(a) * spd, Math.sin(a) * spd, Enemy.dmg[e] * 0.6, 10, def.tint ?? 0xff5050);
      }
      this.addShake(8);
    } else if (kind === 'summon') {
      const cnt = atk?.summonCount ?? 3;
      const mob = this.firstMobKind();
      for (let i = 0; i < cnt; i++) {
        const a = Math.random() * Math.PI * 2;
        this.spawnEnemy(mob, bx + Math.cos(a) * 70, by + Math.sin(a) * 70);
      }
    } else if (kind === 'charge') {
      const dx = p.x - bx;
      const dy = p.y - by;
      const d = Math.hypot(dx, dy) || 1;
      Enemy.knx[e] = dx / d;
      Enemy.kny[e] = dy / d;
      Enemy.knock[e] = 720;
      this.spawnTelegraph(p.x, p.y, atk?.radius ?? 120, 0.5, Enemy.dmg[e] * 0.5);
      this.addShake(10);
    } else {
      this.spawnTelegraph(p.x, p.y, atk?.radius ?? 140, 0.9, Enemy.dmg[e]);
    }
  }

  private updateProjectiles(dt: number): void {
    for (const e of projQuery(this.world)) {
      Position.x[e] += Velocity.x[e] * dt;
      Position.y[e] += Velocity.y[e] * dt;
      Projectile.life[e] -= dt;
      if (Projectile.life[e] <= 0) this.projDead.add(e);
    }
  }

  private collideProjectiles(): void {
    for (const e of projQuery(this.world)) {
      if (this.projDead.has(e)) continue;
      const px = Position.x[e];
      const py = Position.y[e];
      const pr = Projectile.radius[e];
      if (Projectile.enemy[e] === 1) {
        const dxp = this.player.x - px;
        const dyp = this.player.y - py;
        const rr = pr + this.player.radius;
        if (dxp * dxp + dyp * dyp < rr * rr) {
          if (!this.invulnerable()) {
            this.player.hp -= Projectile.dmg[e] * this.mods.dmgTakenMul;
            this.player.invuln = C.PLAYER_INVULN;
            audio.playerHurt();
            this.addShake(7);
          }
          const acid = this.zombies?.acid;
          if (acid?.length && this.animFx.length < 60)
            this.spawnAnimFx(acid[(Math.random() * acid.length) | 0], px, py, 1.1, 0.45);
          this.projDead.add(e);
        }
        continue;
      }
      let pierce = Projectile.pierce[e];
      this.hash.queryRadius(px, py, pr + 30, this.cand);
      for (const en of this.cand) {
        if (this.dead.has(en)) continue;
        const er = Enemy.radius[en];
        const dx = Position.x[en] - px;
        const dy = Position.y[en] - py;
        if (dx * dx + dy * dy < (pr + er) * (pr + er)) {
          this.damageEnemy(en, Projectile.dmg[e], Projectile.crit[e] === 1);
          pierce--;
          if (pierce < 0) {
            this.projDead.add(e);
            break;
          }
        }
      }
    }
    for (const e of this.projDead) {
      this.releaseSprite(e);
      removeEntity(this.world, e);
    }
    this.projDead.clear();
  }

  private flushKills(): void {
    for (const e of this.killList) {
      const kind = Enemy.xp[e] >= 50 ? 2 : Enemy.kind[e] === 2 ? 1 : 0;
      if (Math.random() < 0.04) this.spawnGem(Position.x[e], Position.y[e], 0, 3);
      else this.spawnGem(Position.x[e], Position.y[e], Enemy.xp[e], kind);
      if (Enemy.boss[e]) this.win = true;
      if (ENEMY_DEFS[Enemy.kind[e]].explodeOnDeath) {
        const hx = Position.x[e];
        const hy = Position.y[e];
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          this.spawnHazard(hx, hy, Math.cos(a) * 200, Math.sin(a) * 200, Enemy.dmg[e] * 0.8, 9, 0xff5530);
        }
        const acid = this.zombies?.acid;
        if (acid?.length)
          this.spawnAnimFx(acid[(Math.random() * acid.length) | 0], hx, hy, (Enemy.radius[e] * 4) / 64, 0.5);
      }
      this.particles.burst(
        Position.x[e],
        Position.y[e],
        ENEMY_DEFS[Enemy.kind[e]].tint ?? 0xffffff,
        Enemy.boss[e] ? 48 : 12,
      );
      const died = this.playZombieDeath(e); // hand the sprite to its Die animation if any
      if (!died) {
        const ex = this.tex.anim?.explosion;
        if (ex?.length)
          this.spawnAnimFx(ex, Position.x[e], Position.y[e], Enemy.boss[e] ? 2.6 : 1.05, 0.45);
      }
      const bfx = this.env?.bloodfx;
      const blood = this.zombies?.blood;
      if (died && this.animFx.length < 60) {
        if (bfx?.length)
          this.spawnAnimFx(bfx[(Math.random() * bfx.length) | 0], Position.x[e], Position.y[e], (Enemy.radius[e] * 2.8) / 96, 0.55);
        else if (blood?.length)
          this.spawnAnimFx(blood[(Math.random() * blood.length) | 0], Position.x[e], Position.y[e], (Enemy.radius[e] * 2.6) / 64, 0.5);
      }
      // permanent pooled blood left on the street
      const edec = this.env?.decals;
      if (died && edec?.length && this.decalC.children.length < 700) {
        const ds = new Sprite(edec[(Math.random() * edec.length) | 0]);
        ds.anchor.set(0.5);
        ds.position.set(Position.x[e], Position.y[e]);
        ds.rotation = Math.random() * Math.PI * 2;
        ds.scale.set(0.7 + Math.random() * 0.6);
        ds.alpha = 0.85;
        this.decalC.addChild(ds);
      }
      this.kills++;
      removeEntity(this.world, e);
    }
    this.killList.length = 0;
    this.dead.clear();
  }

  private playerContact(): void {
    const p = this.player;
    if (this.invulnerable()) return;
    this.hash.queryRadius(p.x, p.y, p.radius + 30, this.cand);
    for (const e of this.cand) {
      const er = Enemy.radius[e];
      const dx = Position.x[e] - p.x;
      const dy = Position.y[e] - p.y;
      if (dx * dx + dy * dy < (p.radius + er) * (p.radius + er)) {
        p.hp -= Enemy.dmg[e] * this.mods.dmgTakenMul;
        p.invuln = C.PLAYER_INVULN;
        audio.playerHurt();
        this.addShake(8);
        break;
      }
    }
  }

  private updateGems(dt: number): void {
    const p = this.player;
    const pr = C.BASE_PICKUP_RADIUS * this.mods.pickupMul;
    for (const e of gemQuery(this.world)) {
      Gem.life[e] -= dt;
      if (Gem.life[e] <= 0) {
        this.gemDead.add(e);
        continue;
      }
      const dx = p.x - Position.x[e];
      const dy = p.y - Position.y[e];
      const d = Math.hypot(dx, dy) || 1;
      if (Gem.magnet[e] || d < pr) {
        Gem.magnet[e] = 1;
        const sp = 300 + Math.max(0, pr - d) * 3;
        Position.x[e] += (dx / d) * sp * dt;
        Position.y[e] += (dy / d) * sp * dt;
      }
    }
  }

  private collectGems(): void {
    const p = this.player;
    for (const e of gemQuery(this.world)) {
      if (this.gemDead.has(e)) continue;
      const dx = Position.x[e] - p.x;
      const dy = Position.y[e] - p.y;
      if (dx * dx + dy * dy < C.COLLECT_RADIUS * C.COLLECT_RADIUS) {
        if (Gem.kind[e] === 3) {
          p.hp = Math.min(p.maxHp, p.hp + 40);
        } else {
          this.xp += Gem.value[e] * this.mods.xpMul;
        }
        if (this.time - this.lastPickSfx > 0.04) {
          audio.pickup();
          this.lastPickSfx = this.time;
        }
        this.gemDead.add(e);
      }
    }
    for (const e of this.gemDead) {
      this.releaseSprite(e);
      removeEntity(this.world, e);
    }
    this.gemDead.clear();
  }

  private updateTelegraphs(dt: number): void {
    for (let i = this.tele.length - 1; i >= 0; i--) {
      const tg = this.tele[i];
      tg.t += dt;
      if (tg.t >= tg.delay) {
        const dx = this.player.x - tg.x;
        const dy = this.player.y - tg.y;
        if (dx * dx + dy * dy < tg.r * tg.r && !this.invulnerable()) {
          this.player.hp -= tg.dmg * this.mods.dmgTakenMul;
          this.player.invuln = C.PLAYER_INVULN;
          audio.playerHurt();
          this.addShake(10);
        }
        this.spawnNovaRing(tg.x, tg.y, tg.r, 0xff4444);
        tg.g.destroy();
        this.tele.splice(i, 1);
      }
    }
  }

  private updateDmgNums(dt: number): void {
    for (let i = this.dmgNums.length - 1; i >= 0; i--) {
      const d = this.dmgNums[i];
      d.life -= dt;
      d.t.position.y += d.vy * dt;
      d.t.alpha = Math.max(0, d.life / d.max);
      if (d.life <= 0) {
        d.t.visible = false;
        this.freeText.push(d.t);
        this.dmgNums.splice(i, 1);
      }
    }
  }

  private updateFx(dt: number): void {
    for (let i = this.fx.length - 1; i >= 0; i--) {
      const f = this.fx[i];
      f.life -= dt;
      f.g.alpha = Math.max(0, f.life * 6);
      if (f.life <= 0) {
        f.g.destroy();
        this.fx.splice(i, 1);
      }
    }
  }

  // ---- animated sprite FX (explosions / blood from the art pack) -------------
  // Plays a one-shot frame sequence at (x, y); pooled so deaths/hits are cheap.
  private spawnAnimFx(frames: Texture[], x: number, y: number, scale: number, dur: number): void {
    let s = this.fxPool.pop();
    if (!s) {
      s = new Sprite();
      s.anchor.set(0.5);
    }
    s.texture = frames[0];
    s.position.set(this.isoX(x, y), this.isoY(x, y));
    s.scale.set(scale);
    s.alpha = 1;
    s.rotation = Math.random() * Math.PI * 2;
    s.visible = true;
    this.worldC.addChild(this.fxC); // keep FX above any enemies pooled since boot
    this.fxC.addChild(s);
    this.animFx.push({ s, frames, t: 0, dur });
  }

  private updateAnimFx(dt: number): void {
    for (let i = this.animFx.length - 1; i >= 0; i--) {
      const f = this.animFx[i];
      f.t += dt;
      const k = (f.t / f.dur) * f.frames.length;
      if (k >= f.frames.length) {
        this.fxC.removeChild(f.s);
        f.s.visible = false;
        this.fxPool.push(f.s);
        this.animFx.splice(i, 1);
        continue;
      }
      f.s.texture = f.frames[k | 0];
    }
  }

  // ---- progression ----------------------------------------------------------
  private recompute(): void {
    const m = baseMods();
    const cm = this.character.mods;
    if (cm) for (const k of Object.keys(cm) as (keyof Mods)[]) m[k] += cm[k] ?? 0;
    const eq = meta.getEquipped();
    for (const slot of Object.keys(eq)) {
      const g = GEAR[eq[slot]];
      if (g?.mods) for (const k of Object.keys(g.mods) as (keyof Mods)[]) m[k] += g.mods[k] ?? 0;
    }
    for (const [id, lvl] of this.passives) PASSIVES[id].apply(lvl, m);
    this.mods = m;
    this.player.maxHp = 100 * m.maxHpMul;
    if (this.player.hp > this.player.maxHp) this.player.hp = this.player.maxHp;
  }

  // Auto-evolve any maxed weapon whose evolution catalyst is owned.
  private tryEvolve(): void {
    for (const w of this.weapons) {
      if (w.level < w.def.maxLevel) continue;
      for (const r of EVOLUTIONS) {
        if (r.base !== w.def.id || this.ownedWeapons.has(r.result)) continue;
        const have =
          r.catalyst.kind === 'passive'
            ? this.passives.has(r.catalyst.id)
            : this.ownedWeapons.has(r.catalyst.id);
        if (!have) continue;
        const evDef = WEAPONS[r.result];
        if (!evDef) continue;
        this.ownedWeapons.delete(w.def.id);
        w.def = evDef;
        w.level = 1;
        w.timer = 0;
        w.angle = 0;
        this.ownedWeapons.set(evDef.id, w);
        for (const b of w.blades) b.destroy();
        w.blades = [];
        if (evDef.orbit) this.rebuildBlades(w);
        audio.levelUp();
        this.flash('#ffffff', 0.6);
        this.addShake(12);
        this.hitstop = 0.06;
        this.spawnNovaRing(this.player.x, this.player.y, 150, evDef.color);
        this.particles.ring(this.player.x, this.player.y, evDef.color, 150);
        break;
      }
    }
  }

  private checkLevelUp(): void {
    if (this.state !== 'play') return;
    if (this.xp >= this.xpNext) this.openLevelUp();
  }

  private openLevelUp(): void {
    audio.levelUp();
    this.flash('#9bbcff', 0.22);
    this.state = 'paused';
    this.input.enabled = false;
    this.hud.showLevelUp(this.buildOptions(), (o) => this.applyOption(o));
  }

  private buildOptions(): LevelOption[] {
    const opts: LevelOption[] = [];
    for (const w of this.weapons) {
      if (w.level < w.def.maxLevel)
        opts.push({
          kind: 'weapon-up',
          id: w.def.id,
          title: `${w.def.name} Lv${w.level + 1}`,
          sub: w.def.desc,
          icon: w.def.icon,
        });
    }
    for (const [id, lvl] of this.passives) {
      const d = PASSIVES[id];
      if (lvl < d.maxLevel)
        opts.push({ kind: 'passive-up', id, title: `${d.name} Lv${lvl + 1}`, sub: d.desc, icon: d.icon });
    }
    if (this.weapons.length < MAX_WEAPONS) {
      for (const id in WEAPONS) {
        if (!this.ownedWeapons.has(id) && !WEAPONS[id].hidden)
          opts.push({ kind: 'weapon-new', id, title: `${WEAPONS[id].name}`, sub: WEAPONS[id].desc, icon: WEAPONS[id].icon });
      }
    }
    if (this.passives.size < MAX_PASSIVES) {
      for (const id in PASSIVES) {
        if (!this.passives.has(id))
          opts.push({ kind: 'passive-new', id, title: `${PASSIVES[id].name}`, sub: PASSIVES[id].desc, icon: PASSIVES[id].icon });
      }
    }
    // shuffle and take 3, padding with heal if needed
    for (let i = opts.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    const out = opts.slice(0, 3);
    while (out.length < 3) out.push({ kind: 'heal', title: 'Field Ration', sub: 'Restore 40 HP', icon: '❤' });
    return out;
  }

  private applyOption(o: LevelOption): void {
    switch (o.kind) {
      case 'weapon-new':
        if (o.id) this.addWeapon(o.id);
        break;
      case 'weapon-up': {
        const w = o.id ? this.ownedWeapons.get(o.id) : undefined;
        if (w) {
          w.level++;
          if (w.def.type === 'orbit') this.rebuildBlades(w);
        }
        break;
      }
      case 'passive-new':
      case 'passive-up':
        if (o.id) this.passives.set(o.id, (this.passives.get(o.id) ?? 0) + 1);
        break;
      case 'heal':
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 40);
        break;
    }
    this.recompute();
    this.tryEvolve();
    this.xp -= this.xpNext;
    this.level++;
    this.xpNext = C.xpForLevel(this.level);
    if (this.xp >= this.xpNext) {
      this.hud.showLevelUp(this.buildOptions(), (n) => this.applyOption(n));
    } else {
      this.hud.hideLevelUp();
      this.state = 'play';
      this.input.enabled = true;
    }
  }

  private checkEnd(): void {
    if (this.state === 'over') return;
    if (this.dying) {
      // let the survivor's Die animation play out before the game-over card
      if (this.time - this.deathStart >= DEATH_DUR) this.end('You Died');
      return;
    }
    if (this.player.hp <= 0) {
      if (this.survivor?.die) {
        this.dying = true;
        this.deathStart = this.time;
        this.input.enabled = false;
      } else {
        this.end('You Died');
      }
    } else if (this.win) {
      this.end('You Survived!');
    }
  }

  private end(title: string): void {
    this.state = 'over';
    if (this.dashBtn) this.dashBtn.style.display = 'none';
    this.input.enabled = false;
    audio.setBossMode(false);
    meta.recordRun({ timeSec: this.time, kills: this.kills, level: this.level });
    const mm = Math.floor(this.time / 60);
    const ss = Math.floor(this.time % 60);
    this.hud.showEnd(
      title,
      `Time ${mm}:${ss.toString().padStart(2, '0')}   ·   Kills ${this.kills}   ·   Level ${this.level}`,
      () => this.reset(),
    );
  }

  // ---- lifecycle ------------------------------------------------------------
  private reset(): void {
    for (const e of enemyQuery(this.world).slice()) {
      this.releaseSprite(e);
      removeEntity(this.world, e);
    }
    for (const e of projQuery(this.world).slice()) {
      this.releaseSprite(e);
      removeEntity(this.world, e);
    }
    for (const e of gemQuery(this.world).slice()) {
      this.releaseSprite(e);
      removeEntity(this.world, e);
    }
    for (const d of this.dmgNums) d.t.destroy();
    this.dmgNums = [];
    this.freeText = [];
    for (const t of this.tele) t.g.destroy();
    this.tele = [];
    for (const f of this.fx) f.g.destroy();
    this.fx = [];
    for (const f of this.animFx) {
      this.fxC.removeChild(f.s);
      f.s.visible = false;
      this.fxPool.push(f.s);
    }
    this.animFx = [];
    this.animClock = 0;
    this.enemyWalk = [];
    this.enemyZ = [];
    this.enemyAtk = [];
    this.enemyDie = [];
    this.enemyIdle = [];
    this.enemyGait = [];
    this.enemySpawnT = [];
    this.enemyHitT = [];
    this.enemyTauntEnd = [];
    for (const d of this.zDeaths) {
      d.s.visible = false;
      d.s.alpha = 1;
      this.freeSprites.push(d.s);
    }
    this.zDeaths = [];
    this.scatterProps();
    for (const w of this.weapons) for (const b of w.blades) b.destroy();

    this.weapons = [];
    this.ownedWeapons.clear();
    this.passives.clear();
    this.dead.clear();
    this.killList.length = 0;
    this.projDead.clear();
    this.gemDead.clear();

    this.player.x = 0;
    this.player.y = 0;
    this.player.hp = 100;
    this.player.maxHp = 100;
    this.player.invuln = 0;
    this.player.dashT = 0;
    this.player.dashCd = 0;
    this.dying = false;
    this.deathStart = 0;
    if (this.dashBtn) this.dashBtn.style.display = 'flex';
    this.time = 0;
    this.kills = 0;
    this.level = 1;
    this.xp = 0;
    this.xpNext = C.xpForLevel(1);
    this.spawnAcc = 0;
    this.bossSpawned = false;
    this.bossEid = -1;
    this.win = false;
    this.acc = 0;
    this.state = 'play';
    this.input.enabled = true;

    this.addWeapon(this.character.startingWeapon);
    if (this.character.exclusiveSkill && this.character.exclusiveSkill !== this.character.startingWeapon)
      this.addWeapon(this.character.exclusiveSkill);
    // Real pixel-art player shows untinted; a per-character colour multiply would
    // discolour the sprite. (Procedural mode still tints to tell characters apart.)
    this.playerSprite.tint = this.artUpright ? 0xffffff : (this.character.tint ?? 0xffffff);
    this.bg.tint = this.env ? 0x16181c : (this.stage.tint ?? 0xffffff); // dark void behind the iso ground
    if (this.pet) {
      this.petSprite.visible = true;
      this.petSprite.tint = this.pet.color;
      this.petSprite.scale.set(1.5);
      this.petPos.x = this.player.x + 64;
      this.petPos.y = this.player.y;
      this.petTimer = 0;
    } else {
      this.petSprite.visible = false;
    }
    this.recompute();
    this.hud.hideEnd();
    this.hud.hideLevelUp();
    this.minimap.setVisible(true);
    audio.setBossMode(false);
    audio.startMusic();
  }

  private step(dt: number): void {
    this.time += dt;
    this.animClock += dt;
    this.animFrame = (this.animClock * ANIM_FPS) | 0;
    this.shakeMag = Math.max(0, this.shakeMag - 50 * dt);
    this.input.update();
    this.movePlayer(dt);
    this.spawnDirector(dt);
    this.bossCheck();
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateGems(dt);

    this.hash.clear();
    for (const e of enemyQuery(this.world)) this.hash.insert(e, Position.x[e], Position.y[e]);

    this.fireWeapons(dt);
    this.updatePet(dt);
    this.collideProjectiles();
    this.playerContact();
    this.collectGems();
    this.flushKills();

    this.updateTelegraphs(dt);
    this.updateDmgNums(dt);
    this.updateFx(dt);
    this.updateAnimFx(dt);
    this.updateZDeaths(dt);
    this.particles.update(dt);

    this.checkLevelUp();
    this.checkEnd();
  }

  private createDashButton(): void {
    const b = document.createElement('div');
    b.setAttribute('data-ui', ''); // the joystick ignores [data-ui] targets
    b.title = 'Dash (Space)';
    b.textContent = '🏍️';
    b.style.cssText =
      'position:fixed;right:30px;bottom:124px;width:78px;height:78px;border-radius:50%;' +
      'display:flex;align-items:center;justify-content:center;font-size:34px;z-index:6;' +
      'border:2px solid rgba(255,255,255,0.45);box-shadow:0 2px 10px rgba(0,0,0,0.45);' +
      'user-select:none;touch-action:none;cursor:pointer;transition:transform .06s;';
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.input.queueDash();
      b.style.transform = 'scale(0.9)';
    });
    const up = (): void => {
      b.style.transform = 'scale(1)';
    };
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    document.body.appendChild(b);
    this.dashBtn = b;
  }

  // Reflect the dash cooldown on the button: a radial fill that completes when ready.
  private syncDashButton(): void {
    const b = this.dashBtn;
    if (!b) return;
    const cd = this.player.dashCd;
    const ready = cd <= 0;
    const deg = ready ? 360 : 360 * (1 - cd / DASH_CD);
    b.style.background = `conic-gradient(rgba(90,200,255,0.6) ${deg}deg, rgba(40,48,68,0.5) ${deg}deg)`;
    b.style.borderColor = ready ? 'rgba(130,225,255,0.95)' : 'rgba(255,255,255,0.3)';
    b.style.opacity = ready ? '1' : '0.75';
  }

  // True while damage should be ignored: post-hit i-frames, mid-dash, or mid-death.
  private invulnerable(): boolean {
    return this.player.invuln > 0 || this.player.dashT > 0 || this.dying;
  }

  // Drive the 8-direction HD survivor sprite: face the aim direction (nearest enemy,
  // else movement), choose idle/run/hit, and advance the correct frame. No horizontal
  // flipping — the 8 directional rows already carry facing.
  private updateSurvivorSprite(): void {
    const sv = this.survivor!;
    const p = this.player;
    const s = this.playerSprite;
    // Death animation overrides everything else.
    if (this.dying && sv.die) {
      const f = Math.min(sv.die.count - 1, Math.floor((this.time - this.deathStart) * sv.die.fps));
      s.texture = sv.die.frames[dirRow(this.survFacing)][f];
      s.scale.set(1.15);
      s.alpha = 1;
      return;
    }
    // Bike dash overrides the pose + facing: ride in the dash direction.
    if (p.dashT > 0 && sv.rideRun) {
      const ride = sv.rideRun;
      const dr = dirRow(Math.atan2(p.dashDy, p.dashDx));
      s.texture = ride.frames[dr][Math.floor(this.time * ride.fps) % ride.count];
      s.scale.set(1.15);
      s.alpha = 1;
      return;
    }
    const t = this.nearestEnemy(p.x, p.y, 1000);
    if (t >= 0) this.survFacing = Math.atan2(Position.y[t] - p.y, Position.x[t] - p.x);
    else if (this.input.dir.x || this.input.dir.y)
      this.survFacing = Math.atan2(this.input.dir.y, this.input.dir.x);
    const row = dirRow(this.survFacing);

    const moving = Math.abs(p.x - this.prevPx) + Math.abs(p.y - this.prevPy) > 0.02;
    this.prevPx = p.x;
    this.prevPy = p.y;

    const sinceHit = C.PLAYER_INVULN - p.invuln; // seconds since last damage
    let anim: DirAnim;
    let frame: number;
    if (p.invuln > 0 && sinceHit < sv.hit.count / sv.hit.fps) {
      anim = sv.hit;
      frame = Math.min(anim.count - 1, Math.floor(sinceHit * anim.fps));
    } else {
      anim = moving ? sv.run : sv.idle;
      frame = Math.floor(this.time * anim.fps) % anim.count;
    }
    s.texture = anim.frames[row][frame];
    s.scale.set(1.15); // 128px cell -> ~46px figure; tune for desired hero size
    s.alpha = p.invuln > 0 ? 0.6 : 1;
  }

  private render(): void {
    const p = this.player;
    const sh = settings.reduceMotion ? 0 : this.shakeMag;
    const ox = sh ? (Math.random() * 2 - 1) * sh : 0;
    const oy = sh ? (Math.random() * 2 - 1) * sh : 0;
    this.worldC.x = this.app.screen.width / 2 - this.isoX(p.x, p.y) + ox;
    this.worldC.y = this.app.screen.height / 2 - this.isoY(p.x, p.y) + oy;
    this.renderGround();

    this.place(this.playerSprite, p.x, p.y);
    if (this.survivor) {
      this.updateSurvivorSprite();
    } else {
      this.playerSprite.alpha = p.invuln > 0 ? 0.55 : 1;
      if (this.artUpright) {
        // upright top-down art: keep level, mirror horizontally by aim direction
        const fx = this.input.facing.x;
        if (fx < -0.01) this.playerSprite.scale.x = -Math.abs(this.playerSprite.scale.x);
        else if (fx > 0.01) this.playerSprite.scale.x = Math.abs(this.playerSprite.scale.x);
      }
      if (this.playerWalk) {
        // Cycle the walk frames while moving; rest on frame 0 when standing still.
        const moving = Math.abs(p.x - this.prevPx) + Math.abs(p.y - this.prevPy) > 0.02;
        this.prevPx = p.x;
        this.prevPy = p.y;
        this.playerSprite.texture = moving
          ? this.playerWalk[this.animFrame % this.playerWalk.length]
          : this.playerWalk[0];
      }
    }
    this.syncDashButton();

    // muzzle flash + bright tracer beam at the gun while firing at a nearby target
    const mz = this.env?.muzzle;
    if (mz?.length && this.survivor) {
      if (!this.muzzleSprite) {
        this.muzzleSprite = new Sprite(mz[0]);
        this.muzzleSprite.anchor.set(0.5, 0.95);
        this.muzzleSprite.zIndex = 1e6 + 2;
        this.fxC.addChild(this.muzzleSprite);
      }
      if (!this.tracer) {
        this.tracer = new Graphics();
        this.tracer.zIndex = 1e6 + 1;
        this.fxC.addChild(this.tracer);
      }
      const tgt = this.dying ? -1 : this.nearestEnemy(p.x, p.y, 820);
      const firing = tgt >= 0;
      this.muzzleSprite.visible = firing;
      this.tracer.visible = firing;
      if (firing) {
        const gx = p.x + Math.cos(this.survFacing) * 26;
        const gy = p.y + Math.sin(this.survFacing) * 26;
        const gsx = this.isoX(gx, gy);
        const gsy = this.isoY(gx, gy) - 12;
        this.muzzleSprite.position.set(gsx, gsy - 2);
        this.muzzleSprite.rotation = this.survFacing + Math.PI / 2;
        this.muzzleSprite.texture = mz[Math.floor(this.time * 26) % mz.length];
        this.muzzleSprite.scale.set(1.1);
        const tx = this.isoX(Position.x[tgt], Position.y[tgt]);
        const ty = this.isoY(Position.x[tgt], Position.y[tgt]) - 18;
        this.tracer.clear();
        this.tracer
          .moveTo(gsx, gsy)
          .lineTo(tx, ty)
          .stroke({ width: 2.2, color: 0xffd060, alpha: 0.35 + Math.random() * 0.4 });
        this.tracer.moveTo(gsx, gsy).lineTo(tx, ty).stroke({ width: 0.8, color: 0xffffff, alpha: 0.85 });
      }
    }

    if (this.pet) this.place(this.petSprite, this.petPos.x, this.petPos.y);

    for (const e of enemyQuery(this.world)) {
      const s = this.spr[e];
      if (!s) continue;
      const ex = Position.x[e];
      const ey = Position.y[e];
      this.place(s, ex, ey);
      const za = this.enemyZ[e];
      if (za) {
        // HD zombie: 8-direction facing via 5 stored rows + horizontal mirror. Swing the
        // Attack cycle when in reach, else shamble (Walk) or run by speed. Per-entity
        // frame offset + attack variant keep the horde from marching in lockstep.
        s.tint = Enemy.flash[e] > 0 ? 0xff7777 : 0xffffff;
        const dx = p.x - ex;
        const dy = p.y - ey;
        const m = dir5(dirRow(Math.atan2(dy, dx)));
        const reach = Enemy.radius[e] + p.radius + 8;
        const age = this.time - this.enemySpawnT[e];
        let anim: DirAnimZ;
        let shot = -1; // >=0 => play once over this many elapsed seconds
        if (age < WAKE_DUR && za.wakeUp) {
          anim = za.wakeUp; // emerge
          shot = age;
        } else if (Enemy.knock[e] > 0 && za.idle.length) {
          anim = za.idle[this.enemyIdle[e] % za.idle.length]; // reel while knocked back
        } else if (za.attack.length && dx * dx + dy * dy < reach * reach) {
          anim = za.attack[this.enemyAtk[e] % za.attack.length]; // melee variant
        } else if (this.enemyHitT[e] > 0 && za.takeDamage) {
          anim = za.takeDamage; // flinch
          shot = 0.2 - this.enemyHitT[e];
        } else if (this.enemyTauntEnd[e] > this.time && za.taunt) {
          anim = za.taunt; // occasional roar
        } else {
          anim = Enemy.speed[e] < 78 ? za.walk : this.enemyGait[e] ? za.crouch : za.run; // gait
        }
        const f =
          shot >= 0
            ? Math.min(anim.count - 1, Math.max(0, Math.floor(shot * anim.fps)))
            : Math.floor(this.time * anim.fps + e) % anim.count;
        s.texture = anim.frames[m.row][f];
        const sc = (Enemy.radius[e] * Z_DISPLAY_K) / ORIG_CELL;
        s.scale.set(m.flip ? -sc : sc, sc);
        s.anchor.set(0.5, anim.anchorY);
        continue;
      }
      const k = Enemy.kind[e];
      s.tint =
        Enemy.flash[e] > 0
          ? 0xff7777
          : this.artUpright
            ? 0xffffff
            : (ENEMY_DEFS[k].tint ?? 0xffffff);
      // upright top-down art: stay level, face the player by horizontal mirror
      if (this.artUpright)
        s.scale.x = p.x < Position.x[e] ? -Math.abs(s.scale.x) : Math.abs(s.scale.x);
      // Walk-cycle animation, offset per entity so the horde isn't in lockstep.
      const fr = this.enemyWalk[e];
      if (fr) s.texture = fr[(this.animFrame + e) % fr.length];
    }
    for (const e of projQuery(this.world)) {
      const s = this.spr[e];
      if (s) {
        this.place(s, Position.x[e], Position.y[e]);
        s.zIndex += 40; // bullets fly above the cast
      }
    }
    for (const e of gemQuery(this.world)) {
      const s = this.spr[e];
      if (s) this.place(s, Position.x[e], Position.y[e]);
    }
    // animate scattered flaming barrels
    if (this.env?.firebarrel.length && this.fireBarrels.length) {
      const fr = this.env.firebarrel;
      const base = Math.floor(this.time * 13);
      for (let i = 0; i < this.fireBarrels.length; i++) {
        this.fireBarrels[i].s.texture = fr[(base + i * 4) % fr.length];
      }
    }

    // orbit blades
    for (const w of this.weapons) {
      if (w.def.type !== 'orbit') continue;
      const s = w.def.stats(w.level);
      const n = w.blades.length;
      const scale = s.radius / 11;
      for (let i = 0; i < n; i++) {
        const a = w.angle + (i / n) * Math.PI * 2;
        const b = w.blades[i];
        this.place(b, p.x + Math.cos(a) * s.range, p.y + Math.sin(a) * s.range);
        b.scale.set(scale);
      }
    }

    // telegraphs (expanding danger ring) — drawn flat on the iso ground (squashed to 2:1)
    for (const tg of this.tele) {
      const prog = tg.t / tg.delay;
      tg.g.clear();
      tg.g.circle(0, 0, tg.r).fill({ color: 0xff3344, alpha: 0.1 + 0.25 * prog });
      tg.g.circle(0, 0, tg.r).stroke({ width: 3, color: 0xff5566, alpha: 0.85 });
      tg.g.position.set(this.isoX(tg.x, tg.y), this.isoY(tg.x, tg.y));
      tg.g.scale.set(1, 0.5);
    }

    const boss =
      this.bossSpawned && this.bossEid >= 0 && Enemy.boss[this.bossEid] === 1 && !this.win
        ? { hp: Math.max(0, Enemy.hp[this.bossEid]), maxHp: Enemy.maxHp[this.bossEid] }
        : null;

    this.hud.update({
      time: this.time,
      hp: Math.max(0, p.hp),
      maxHp: p.maxHp,
      level: this.level,
      xp: this.xp,
      xpNext: this.xpNext,
      kills: this.kills,
      weapons: this.weapons.map((w) => ({ icon: w.def.icon, level: w.level })),
      passives: [...this.passives].map(([id, lvl]) => ({ icon: PASSIVES[id].icon, level: lvl })),
      joy: this.input.joy,
      boss,
    });

    // minimap snapshot (cheap: sample up to ~60 enemies)
    const ents = enemyQuery(this.world);
    const mmBlips: { x: number; y: number; kind: 0 | 1 | 2 }[] = [];
    const stride = Math.max(1, Math.ceil(ents.length / 60));
    for (let i = 0; i < ents.length && mmBlips.length < 60; i += stride) {
      const e = ents[i];
      if (Enemy.boss[e]) continue;
      mmBlips.push({ x: Position.x[e], y: Position.y[e], kind: Enemy.kind[e] as 0 | 1 | 2 });
    }
    this.minimap.update({
      px: p.x,
      py: p.y,
      range: 1100,
      blips: mmBlips,
      boss: boss ? { x: Position.x[this.bossEid], y: Position.y[this.bossEid] } : null,
    });
  }

  private frame(): void {
    const dt = Math.min(this.app.ticker.deltaMS / 1000, C.MAX_FRAME_DT);
    if (this.hitstop > 0) {
      this.hitstop -= dt;
      this.render();
      return;
    }
    if (this.state === 'play') {
      this.acc += dt;
      while (this.acc >= C.FIXED_DT) {
        this.step(C.FIXED_DT);
        this.acc -= C.FIXED_DT;
        if (this.state !== 'play') {
          this.acc = 0;
          break;
        }
      }
    }
    this.render();
  }
}
