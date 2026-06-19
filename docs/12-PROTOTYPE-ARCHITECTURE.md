# 12 — Prototype Architecture

A precise map of the **M1 core-loop prototype** in `src/`, written so a new
contributor can extend it without reverse-engineering `Game.ts` first.

Stack: **Vite + TypeScript (strict) + PixiJS v8 (`pixi.js@^8.6.0`) + bitECS
(`bitecs@0.3.40`)**, with a **DOM/CSS HUD overlay** above the canvas. World units
are pixels; the camera is 1:1 (see `src/config.ts`). The simulation is a
**fixed-timestep 60 Hz accumulator** decoupled from render, matching the design
in `docs/01-CORE-GAMEPLAY.md` and the architecture in `docs/09-TECH-STACK.md`.

---

## 1. Module map (`src/`)

| File | Role |
|---|---|
| `main.ts` | Entry point. `async main()` boots PixiJS (`Application.init` — background `#0e1016`, `antialias`, `resizeTo: window`, `resolution` capped at 2, `autoDensity`), mounts `app.canvas` into `#app`, constructs `Hud`, then `new Game(app, hud)`. |
| `config.ts` | Global tuning constants + curves. `FIXED_DT = 1/60`, `MAX_FRAME_DT = 0.25`, `ARENA_HALF`, `PLAYER_RADIUS`, `BASE_PICKUP_RADIUS`, `COLLECT_RADIUS`, `PLAYER_INVULN`, `RUN_TIME`, `BOSS_TIME`. Functions: `difficultyMul(t)` (enemy stat ramp) and `xpForLevel(level)`. |
| `ecs/components.ts` | bitECS Struct-of-Arrays components: `Position`, `Velocity`, `Enemy`, `Projectile`, `Gem`. Access fields as `Position.x[eid]`. |
| `game/Game.ts` | The whole live game: bitECS world, fixed-timestep loop, spawn director, weapons, collisions, gems, level-up draft, boss, VFX, camera + render. **This is the only module `main.ts` wires up today.** |
| `game/data.ts` | All data-driven content: `WEAPONS`, `PASSIVES`, `ENEMIES`, `BOSS`, the `Mods` stat block + `baseMods()`, and caps `MAX_WEAPONS = 6` / `MAX_PASSIVES = 6`. New content is added here. |
| `game/textures.ts` | `createTextures(renderer)` generates all primitive textures at runtime (circles/diamonds via `Graphics` → `renderer.generateTexture`) so the prototype ships no art. Returns a `Textures` struct; `enemy[]` and `gem[]` are **indexed by kind**. |
| `core/input.ts` | `Input`: unified keyboard (WASD/arrows) + floating touch/mouse joystick. Produces `dir` (normalized, magnitude 0..1) and `facing` (last non-zero direction). Ignores pointer events on `[data-ui]` elements. Has an `enabled` flag the game toggles during pauses. |
| `core/spatialHash.ts` | `SpatialHash`: uniform-grid broad-phase (default 120px cells). `clear()`, `insert(eid,x,y)`, `queryRadius(x,y,r,out)` — `out` is a reused array (no per-call allocation). |
| `core/rng.ts` | Math/RNG helpers: `rand`, `randInt`, `chance`, `pick`, `shuffle`, `clamp`, `len`. (`Game.ts` uses `rand`; it inlines its own crit/draft rolls with `Math.random()`.) |
| `ui/hud.ts` | `Hud`: the in-run DOM/CSS overlay (timer, kills, XP bar, HP bar, skill chips, boss bar, joystick echo) plus the level-up card draft (`showLevelUp`) and end screen (`showEnd`). Consumes a `HudState` each render. |
| `ui/styles.css` | HUD styling (CSS variables `--green`, `--gold`, `--blue`, `--panel`; topbar, bars, cards, joystick, overlays). Imported by `main.ts`. |
| `ui/menu.ts` | `TitleScreen`: title/main-menu overlay (injects its own CSS, `data-ui`-tagged). `onPlay(cb)`, `setStats(text)`, `show()/hide()`. Wired in `main.ts` — gates run start. |
| `ui/settings.ts` | Reactive `settings` store + `SettingsPanel` (gear → pause/settings overlay): `sfxVolume`, `musicVolume`, `muted`, `reduceMotion`, `showDamageNumbers`, persisted to `localStorage`. `Game.ts` reads `settings.showDamageNumbers`. |
| `ui/minimap.ts` | `Minimap`: small DOM `<canvas>` of nearby-enemy blips + an off-screen boss arrow. `Game.render()` feeds it a sampled snapshot (≤60 blips). |
| `audio/sfx.ts` | `audio` singleton: 100% procedural Web Audio SFX + looping music bed (`unlock()`, `shoot()/hit()/...`, `startMusic()`, `setBossMode()`). Wired into `main.ts` (unlock on first gesture) + `Game.ts` hooks (hit/pickup throttled). |
| `meta/save.ts` | `meta` singleton + `Profile`: versioned `localStorage` save (best time, kills, runs, coins). `Game.end()` calls `recordRun()`; `main.ts` shows best time on the title. |
| `pwa.ts` | `registerSW()` (prod-only) + `enableTapFullscreen()`, called from `main.ts`. |

Static assets: `index.html` (`#app` root, mobile viewport + PWA meta), `public/manifest.webmanifest` + `public/icon*.svg` + `public/sw.js` (a hand-rolled cache-first service worker, registered via `src/pwa.ts`). Tests live in `tests/` (see CONTRIBUTING.md).

> **Wiring status:** `main.ts` constructs `Hud`, `Minimap`, `SettingsPanel`, and
> `TitleScreen`, registers the service worker, unlocks audio on first gesture, and
> creates `Game` when Play is pressed. `Game.ts` calls the `audio`, `meta`, and
> `settings` modules at the relevant hooks (hit/pickup SFX throttled). Keep new
> subsystems out of the hot loop.

---

## 2. bitECS components (`src/ecs/components.ts`)

bitECS stores each field as a typed array; you index by entity id (`eid`).
Components are attached with `addComponent(world, Comp, eid)` and entities are
created/destroyed with `addEntity` / `removeEntity`.

| Component | Fields | Notes |
|---|---|---|
| `Position` | `x: f32`, `y: f32` | World-space (pixels). |
| `Velocity` | `x: f32`, `y: f32` | Used by projectiles; enemies/gems move via direct position math. |
| `Enemy` | `speed`, `hp`, `maxHp`, `dmg`, `radius`, `kind: ui8`, `xp`, `flash`, `boss: ui8`, `atkCd`, `knock`, `knx`, `kny` | `flash` = hit-flash timer; `boss` = 0/1; `atkCd` = boss special cooldown; `knock` = knockback speed (decays), `knx/kny` = knockback direction. `kind` indexes `ENEMIES[]` and `tex.enemy[]`. |
| `Projectile` | `dmg`, `life`, `radius`, `pierce: i16`, `crit: ui8` | `life` counts down (seconds); `pierce` is remaining hits; `crit` 0/1. |
| `Gem` | `value`, `kind: ui8`, `magnet: ui8`, `life` | `kind`: 0 green, 1 blue, 2 gold, **3 heal**; `magnet` latches to 1 once vacuuming begins; `life` despawn timer. Indexes `tex.gem[]`. |

The player is **not** an ECS entity — it's a plain object literal on `Game`
(`this.player = { x, y, hp, maxHp, moveSpeed, invuln, radius }`). Likewise weapons
(`WeaponInst[]`), damage numbers (`DmgNum[]`), telegraphs (`Telegraph[]`), and FX
lines (`FxLine[]`) are plain arrays of JS objects, not ECS data.

Three queries are defined once at module load and reused every step:

```ts
const enemyQuery = defineQuery([Enemy, Position]);
const projQuery  = defineQuery([Projectile, Position, Velocity]);
const gemQuery   = defineQuery([Gem, Position]);
```

---

## 3. The fixed-timestep loop + render split

Registered once in the constructor: `app.ticker.add(() => this.frame())`.

### `frame()` — runs every rendered frame (variable rate)
```ts
const dt = Math.min(this.app.ticker.deltaMS / 1000, C.MAX_FRAME_DT); // clamp stalls
if (this.state === 'play') {
  this.acc += dt;
  while (this.acc >= C.FIXED_DT) {           // 1/60 s steps
    this.step(C.FIXED_DT);
    this.acc -= C.FIXED_DT;
    if (this.state !== 'play') { this.acc = 0; break; } // pause/death mid-batch
  }
}
this.render();                                // always render, even when paused
```
- `MAX_FRAME_DT = 0.25` prevents a "spiral of death" after a tab stall.
- `step()` only runs in state `'play'`; opening the level-up draft sets state
  `'paused'` (and an end sets `'over'`), so the `while` loop drains and stops.
  `render()` still runs so the overlay and HUD draw.
- `step()` always receives the constant `FIXED_DT`, so simulation is
  frame-rate independent and deterministic given the same RNG draws.

### `step(dt)` — one fixed simulation tick
Deterministic ordered update (section 4).

### `render()` — pure presentation, no simulation mutation
Camera + sprite sync + HUD push (section 5). It reads ECS/state but never
changes gameplay.

`State = 'play' | 'paused' | 'over'`.

---

## 4. System order inside `step()` and the deferred-removal pattern

`step(dt)` runs these in exactly this order:

1. `this.time += dt`
2. `input.update()` — recompute `dir`/`facing` from current keys/joystick.
3. `movePlayer(dt)` — integrate player, clamp to `±ARENA_HALF`, decay `invuln`.
4. `spawnDirector(dt)` — accumulate spawn budget (`rate = 2 + time*0.2`), spawn up to a `cap = 700` enemy count; `spawnOne()` picks `kind` by elapsed time and spawns just off-screen on a ring. No-op once the boss has spawned.
5. `bossCheck()` — at `time ≥ BOSS_TIME`, set `bossSpawned`, **board-wipe** every normal enemy (`releaseSprite` + `removeEntity`), then spawn the boss above the player; store `bossEid`.
6. `updateEnemies(dt)` — seek the player; apply + decay knockback (`knock`, `knx/kny`); decay `flash`; boss ticks `atkCd` and drops a telegraph.
7. `updateProjectiles(dt)` — integrate by `Velocity`, decay `life`; expired → `projDead`.
8. `updateGems(dt)` — decay `life` (expired → `gemDead`); within pickup radius latch `magnet` and accelerate toward the player.
9. **Build the spatial hash (mid-step):**
   ```ts
   this.hash.clear();
   for (const e of enemyQuery(this.world)) this.hash.insert(e, Position.x[e], Position.y[e]);
   ```
10. `fireWeapons(dt)` — per weapon, by `def.type` (queries the hash for targets — see section 6).
11. `collideProjectiles()` — hash-query enemies near each live projectile, damage + decrement pierce; then **drain `projDead`** (release sprites, remove entities, `clear()`).
12. `playerContact()` — if not invulnerable, hash-query enemies near the player; first overlap deals `Enemy.dmg`, sets `invuln`.
13. `collectGems()` — gems within `COLLECT_RADIUS` grant XP (or +40 HP for heal gems); then **drain `gemDead`**.
14. `flushKills()` — for each enemy in `killList`: drop a gem (4% heal-gem chance, else an XP gem whose `kind` scales with `Enemy.xp`/`kind`), set `win` if it was the boss, `kills++`, release sprite + remove entity; then clear `killList` **and `dead`**.
15. `updateTelegraphs(dt)` — when a telegraph's timer hits `delay`, deal its damage if the player is inside (and not invulnerable), then destroy it.
16. `updateDmgNums(dt)` — float + fade pooled damage `Text`; recycle into `freeText`.
17. `updateFx(dt)` — fade + destroy zap/nova `Graphics`.
18. `checkLevelUp()` — if `xp ≥ xpNext`, open the draft (sets state `'paused'`, disables input).
19. `checkEnd()` — `hp ≤ 0` → "You Died"; `win` → "You Survived!".

### Why the spatial hash is built mid-step (step 9)

The hash is a **broad-phase index of enemy positions**. It must be rebuilt
*after* everything that moves enemies (`updateEnemies`, plus knockback) and
*before* every consumer that needs "what's near point P": `fireWeapons` (target
acquisition for projectile/zap/nova/orbit), `collideProjectiles`,
`playerContact`, and `nearestEnemy`. Building it earlier would query stale
positions; building it per-consumer would rebuild it several times per step.
Gems and projectiles are **not** inserted — only enemies are queried against, so
only enemies go in. `SpatialHash` is GC-free: `queryRadius` fills a single reused
`this.cand` array (`out.length = 0` then `push`).

### The deferred-removal pattern (`dead` / `killList` / `projDead` / `gemDead`)

bitECS invalidates query iteration if you `removeEntity` while looping, and the
same enemy can be hit by multiple weapons/projectiles in one step. So **nothing
is destroyed at the point of damage**; it's deferred:

- **`dead: Set<number>`** — enemies whose `hp` dropped ≤ 0 *this step*. `damageEnemy` adds to `dead` (and pushes to `killList`) the instant HP crosses 0. Every consumer (`nearestEnemy`, `fireWeapons`, `collideProjectiles`) checks `this.dead.has(e)` and skips, so a corpse can't be hit, retargeted, or counted twice within the same step. Cleared at the end of `flushKills`.
- **`killList: number[]`** — the ordered list of dead enemies to actually process (drop gems, tally, free) in `flushKills`. Separate from `dead` because `dead` is the fast membership test and `killList` is the iteration list.
- **`projDead: Set<number>`** — projectiles that expired or ran out of pierce. Populated in `updateProjectiles` and `collideProjectiles`; **drained and cleared at the end of `collideProjectiles`** (release sprite + `removeEntity`).
- **`gemDead: Set<number>`** — gems that expired (`updateGems`) or were collected (`collectGems`); **drained and cleared at the end of `collectGems`**.

The rule: *mark during iteration, mutate the world only at a safe drain point,
clear the set after draining.* This keeps queries valid and makes multi-hit
behavior (pierce, orbit, nova hitting a cluster) correct and idempotent.

---

## 5. Rendering & camera (`render()`)

The world lives in one PixiJS `Container` (`worldC`) holding the player sprite,
all pooled entity sprites, orbit blades, damage-number `Text`, telegraph and FX
`Graphics`. A `bg` `TilingSprite` sits behind it.

**Camera = translate `worldC`** so the player is screen-centered:
```ts
this.worldC.x = this.app.screen.width / 2 - p.x;
this.worldC.y = this.app.screen.height / 2 - p.y;
this.bg.tilePosition.set(-p.x, -p.y);   // parallax-free ground scroll
```
Entity sprites store **world coordinates** (`s.position.set(Position.x[e], ...)`);
the container translation turns them into screen space. The `bg` is a full-screen
`TilingSprite` whose `tilePosition` scrolls opposite the player, faking infinite
ground from a single 64×64 generated tile (`makeGroundTexture`). On resize, `bg`
is stretched to the new screen size.

Per render, `render()` walks `enemyQuery`/`projQuery`/`gemQuery` and copies ECS
positions onto the pooled sprites; enemies also tint red while `flash > 0`. Orbit
blades are positioned on a circle around the player from `w.angle`. Telegraphs are
redrawn as an expanding danger ring. Finally a `HudState` is pushed to
`hud.update(...)`, including a computed `boss` HP snapshot (or `null`).

### Sprite pooling

Sprites are pooled to avoid per-frame allocation (`docs/09`'s non-negotiable):

- `acquireSprite(tex)` pops from `freeSprites`, or creates a new `Sprite` (anchor 0.5, added to `worldC`) on miss; it resets `texture/visible/tint/rotation/scale`.
- A parallel array `spr: (Sprite|undefined)[]` maps `eid → sprite`.
- `releaseSprite(eid)` hides the sprite, pushes it back to `freeSprites`, and nulls `spr[eid]`. Every removal path (`flushKills`, `collideProjectiles`, `collectGems`, `bossCheck` board-wipe, `reset`) calls it.

Damage numbers (`Text`) pool the same way via `freeText`. Orbit blades, zap
lines, nova rings, and telegraphs are short-lived `Graphics` that are `destroy()`d
rather than pooled (low volume).

---

## 6. The four `WeaponType` behaviors (`fireWeapons`)

Each owned weapon is a `WeaponInst { def, level, timer, angle, blades }`. Per
step, stats come from `w.def.stats(w.level)`. Behavior branches on `def.type`:

| `WeaponType` | Behavior in `fireWeapons` | Hit detection |
|---|---|---|
| `'orbit'` | Spins `w.angle`; on cooldown, queries the hash in an annulus around the orbit radius and damages enemies whose distance falls within `[orbitR − radius, orbitR + radius]`. Blades are visual (positioned in `render()`). Level changes call `rebuildBlades`. | continuous (annulus check) |
| `'projectile'` | On cooldown, acquires the nearest enemy via `nearestEnemy` (falls back to `input.facing`), spawns `count` projectiles in a small spread fan. Projectiles move + collide later in the step. | `collideProjectiles` (hash) |
| `'zap'` | On cooldown, hash-queries `range`, sorts living enemies by distance, takes the closest `count`, damages each and draws a `spawnZap` bolt. | instant (queried list) |
| `'nova'` | On cooldown, hash-queries `range`, damages every enemy in radius and applies knockback (`knx/kny/knock`); draws a `spawnNovaRing`. | instant (radius check) |

Note `cdMul` (haste passive) is applied to non-orbit cooldowns; `dmgMul` and the
crit roll (`critRoll()` vs `mods.critRate`, `mods.critDmg`) apply to all damage
via `damageEnemy`.

---

## 7. HOW TO ADD CONTENT (data-driven)

> **Texture coupling — read first.** `Enemy.kind` and `Gem.kind` are array
> indices shared by both `ENEMIES[]`/`gem` data **and** `textures.ts`
> (`tex.enemy[kind]`, `tex.gem[kind]`). Add a new enemy `kind` ⇒ you must add the
> matching texture at the same index or `acquireSprite` gets `undefined`. Weapons
> are keyed by string id, not index, so weapons/passives don't have this
> constraint — they reuse the shared `tex.projectile` / `tex.blade`.

### 7a. Add a new weapon

Add an entry to `WEAPONS` in `src/game/data.ts`. It's automatically eligible in
the level-up draft (`buildOptions` iterates `for (const id in WEAPONS)`) once the
player has a free weapon slot (`< MAX_WEAPONS`). Pick one of the four `type`s —
the runtime already handles each (section 6); no `Game.ts` change is needed.

```ts
// in WEAPONS:
flame: {
  id: 'flame',
  name: 'Flamethrower',
  type: 'nova',                 // reuse an existing behavior; see notes below
  icon: '🔥',
  color: 0xff7a3c,
  maxLevel: 5,
  desc: 'A close burst that scorches and shoves.',
  stats: (l) => ({
    cooldown: clampMin(1.2 - (l - 1) * 0.07, 0.6),
    dmg: 8 + (l - 1) * 4,
    count: 0,                   // nova ignores count
    speed: 0,                   // nova ignores speed
    radius: 0,                  // nova ignores radius (uses range as aura)
    pierce: 0,
    range: 130 + (l - 1) * 14,  // aura radius
    knock: 150,
  }),
},
```

**Which fields each `type` reads** (`WeaponStats` is a shared shape; unused fields
should be 0):
- `'projectile'`: `cooldown, dmg, count, speed, radius, pierce, range` (range = target-acquisition distance; spread is fixed at 0.16 rad).
- `'orbit'`: `cooldown` (hit interval), `dmg`, `count` (blade count → `rebuildBlades`), `radius` (blade size / annulus half-width), `range` (orbit radius). `speed/pierce/knock` unused by hit logic.
- `'zap'`: `cooldown, dmg, count` (chains), `range`. Others 0.
- `'nova'`: `cooldown, dmg, range` (aura radius), `knock`. `count/speed/radius/pierce` 0.

To add a **genuinely new behavior** (not one of the four), you must (1) widen the
`WeaponType` union in `data.ts`, and (2) add an `else if (w.def.type === '...')`
branch in `Game.ts#fireWeapons` (and, if it has visuals like orbit blades, in
`render()` + `addWeapon`/`applyOption`). That is the one case requiring a code
change. The starter weapon is hard-coded in `reset()` as `this.addWeapon('shuriken')`.

### 7b. Add a new passive

Add to `PASSIVES` in `data.ts`. Passives mutate the `Mods` stat block; the engine
recomputes mods from scratch on every pick (`recompute()` calls `baseMods()` then
each owned passive's `apply(lvl, m)`), so effects must be **idempotent
functions of level**, not incremental side effects.

```ts
// in PASSIVES:
ferocity: {
  id: 'ferocity',
  name: 'Ferocity',
  icon: '☄',
  maxLevel: 5,
  desc: '+4% crit chance / level',
  apply: (l, m) => (m.critRate += 0.04 * l),
},
```

Available `Mods` fields (see `baseMods()`): `dmgMul`, `cdMul`, `moveMul`,
`maxHpMul`, `pickupMul`, `xpMul`, `critRate`, `critDmg`. To affect a stat not in
`Mods`, add the field to the `Mods` interface + `baseMods()`, then read it in the
relevant system. Passives auto-appear in the draft (capped by `MAX_PASSIVES`).

### 7c. Add a new enemy kind

This is the coupled case. Append to `ENEMIES[]` in `data.ts` **and** add the
matching texture at the **same index** in `textures.ts`:

```ts
// data.ts — kind 0 basic, 1 fast, 2 tank, 3 = new "brute"
export const ENEMIES: EnemyType[] = [
  { speed: 55,  hp: 14, dmg: 8,  radius: 16, xp: 1 },
  { speed: 116, hp: 9,  dmg: 6,  radius: 13, xp: 1 },
  { speed: 40,  hp: 66, dmg: 15, radius: 24, xp: 4 },
  { speed: 70,  hp: 40, dmg: 12, radius: 20, xp: 3 }, // 3 brute
];

// textures.ts — add at the SAME index in the enemy[] array:
enemy: [
  circle(renderer, 16, 0x6cbf4b, 0x2f5d22, 3),
  circle(renderer, 13, 0xff9a3c, 0x7a3d10, 3),
  circle(renderer, 24, 0x9b59b6, 0x4a235a, 4),
  circle(renderer, 20, 0xd94f70, 0x5a1f30, 4), // 3 brute
],
```

Then make the spawn director actually emit it: `spawnOne()` in `Game.ts`
hard-codes the kind distribution by elapsed time (e.g. `kind = r < 0.55 ? 0 : r <
0.85 ? 1 : 2`). Add your kind to that ramp. (Stats are scaled at spawn by
`difficultyMul(time)` in `spawnEnemy`.) The `BOSS` is a single `EnemyType` (not in
the array) rendered with the dedicated `tex.boss`.

---

## 8. Known limitations / TODOs vs `docs/11-BUILD-ROADMAP.md`

The prototype delivers **M1** (and a few stray M0 niceties). Large parts of M2–M6
are intentionally absent or stubbed:

- **No evolution system (M2).** `docs/02`'s 21 evolution recipes and boss-chest
  delivery are not implemented; weapons simply level to `maxLevel`.
- **No equipment / gear meta (M3).** `docs/03`'s 6 equipment slots, rarity, and
  merge/upgrade do not exist. In-run there are only ≤6 weapon + ≤6 passive slots.
- **No characters or pets (M3).** Single hard-coded player object; starter weapon
  fixed to `shuriken`.
- **One arena, one boss, fixed 90 s run.** No chapters/stages/modes (`docs/05`),
  no Idle Patrol / dailies. `BOSS_TIME = 90` and `RUN_TIME = 120` in `config.ts`;
  the boss is a single telegraphed entity with a board-wipe. (Roadmap M1 nominally
  says a 5:00 boss / ~5-min run; the prototype is tuned shorter.)
- **Thin enemy roster.** Three kinds (basic/fast/tank) + one boss; no
  ranged/exploder/elite/formation variety (M2). The telegraph is boss-specific,
  not a generalized component.
- **Spawn timeline is code, not data.** `spawnOne()`/`spawnDirector()` hard-code
  the rate curve and kind mix; `docs/09`/M1 call for a *data-driven* stage
  timeline.
- **No backend / accounts / leaderboards (M4).** `meta/save.ts` is local-only
  `localStorage`; no server, no authoritative scoring, no token (M6).
- **Subsystems built but unwired.** `ui/menu.ts` (title screen), `ui/settings.ts`
  (settings/pause + reduce-motion / hide-damage toggles), `audio/sfx.ts`
  (procedural SFX + music), `meta/save.ts` (save profile), and `public/sw.js`
  (PWA service worker) exist and are dependency-light, but `main.ts`/`Game.ts`
  don't call them yet. (A **minimap** is a candidate sibling module in this set
  but is not present in the tree at the time of writing.)
- **Render hygiene gaps.** No off-screen culling (all live sprites are positioned
  each frame), no gem-merging, no texture atlas (textures are generated
  primitives). Fine at prototype counts; revisit against `docs/09`'s 300–500
  enemy / 1–2k projectile 60 fps bar before adding heavy content.

---
*Note: documentation only — no integration required.*
