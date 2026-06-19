# Contributing

Thanks for working on **Outbreak Survivors** — a browser-based, top-down
survivor/auto-battler prototype (Vite + TypeScript + PixiJS v8 + bitECS). This
guide covers setup, scripts, and the conventions that keep the hot loop fast.

For the architecture and a worked guide to adding content, read
[`docs/12-PROTOTYPE-ARCHITECTURE.md`](docs/12-PROTOTYPE-ARCHITECTURE.md). For the
broader design and roadmap, see [`docs/09-TECH-STACK.md`](docs/09-TECH-STACK.md)
and [`docs/11-BUILD-ROADMAP.md`](docs/11-BUILD-ROADMAP.md).

## Setup

Requires Node 18+ (for native `fetch`/ESM and Vite 5).

```bash
npm install      # install dependencies
npm run dev      # start Vite dev server; open the printed localhost URL
```

Production build / preview:

```bash
npm run build    # type-checks (tsc --noEmit) then builds with Vite to dist/
npm run preview  # serve the built dist/ locally
```

**Controls:** WASD / arrow keys, or drag anywhere (touch or mouse) for a floating
joystick. Attacks are automatic. Survive, vacuum XP, pick one of three upgrades on
each level-up, and kill the boss.

## Scripts (`package.json`)

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR. |
| `npm run build` | `tsc --noEmit` (type-check) **then** `vite build` → `dist/`. A type error fails the build. |
| `npm run preview` | Serve the production `dist/` build. |
| `npm run typecheck` | `tsc --noEmit` only. |
| `npm test` | Run unit tests once (`vitest run`). |
| `npm run test:watch` | Vitest in watch mode. |

## Tests

Unit tests live in `tests/` (`*.test.ts`) and run in a **plain Node environment —
no Pixi, no DOM** (`vitest.config.ts`). They cover the pure logic modules:
`tests/config.test.ts`, `tests/rng.test.ts`, `tests/spatialHash.test.ts`. Keep
new tests headless: test pure functions and data, not rendering. Run `npm test`
before opening a PR.

## Code conventions

- **Strict TypeScript.** `tsconfig.json` has `strict: true`, plus
  `noImplicitOverride`, `noFallthroughCasesInSwitch`, `isolatedModules`, and
  `moduleResolution: "bundler"`. Don't add `any` to dodge a type — fix the type.
  `npm run build` won't pass with type errors.
- **ESM + `.ts` everywhere.** `"type": "module"`; target ES2022. Import with
  extension-less specifiers (e.g. `'../core/rng'`).
- **Data-driven content.** Weapons, passives, and enemies are *data* in
  `src/game/data.ts`; the combat loop reads them generically. Add content there
  (and a matching texture in `src/game/textures.ts` for new enemy/gem **kinds**,
  which are array indices). Only a brand-new `WeaponType` *behavior* requires
  touching `src/game/Game.ts`. See `docs/12` §7 for worked examples.
- **bitECS access pattern.** Components are Struct-of-Arrays; read/write fields as
  `Position.x[eid]`. Reuse the module-level queries (`enemyQuery`, `projQuery`,
  `gemQuery`); never `removeEntity` while iterating a query — defer it (below).
- **Comment the *why*.** Existing modules lead with a short header explaining the
  module's role and any non-obvious invariant; match that style.

### Performance rules (non-negotiable — this is a swarm game)

The genre lives or dies on broad-phase collision + pooling (`docs/09`). Target:
60 fps with ~300–500 enemies and ~1–2k projectiles/gems on mid-range mobile.

- **No per-frame allocations in `step()`/`render()`.** Don't create arrays,
  objects, or closures inside the loop. `SpatialHash.queryRadius` fills the reused
  `this.cand` array; follow that pattern (reset length, push) instead of `map`/
  `filter` that allocate. (Where convenience code does allocate — e.g. the `zap`
  target sort — keep it bounded and off the truly hot paths.)
- **Pool everything that churns.** Sprites (`acquireSprite`/`releaseSprite` via the
  `spr[]` / `freeSprites` pool) and damage-number `Text` (`freeText`) are pooled.
  Anything you spawn per kill/shot must be pooled or cheaply `destroy()`d.
- **Use the spatial hash for "what's near P".** Never scan all enemies (O(n²)).
  Acquisition, projectile/player collisions, and AoE all go through
  `hash.queryRadius`. The hash is rebuilt once mid-step (enemies only) — read
  `docs/12` §4 for why the ordering matters.
- **Deferred removal.** Mark dead entities into the `dead` / `killList` /
  `projDead` / `gemDead` sets during iteration; mutate the world (remove entities,
  release sprites) only at the designated drain point, then clear the set. This
  keeps queries valid and multi-hit logic correct.
- **Fixed-timestep is sacred.** Simulation runs at `FIXED_DT` (1/60 s) in
  `step()`; rendering is separate in `render()`. Don't mutate gameplay state from
  `render()`, and don't read wall-clock `dt` inside `step()`.

## Project layout

```
src/
  main.ts            entry: boots Pixi, mounts canvas, starts Game
  config.ts          tuning constants + curves
  ecs/components.ts  bitECS components (Position/Velocity/Enemy/Projectile/Gem)
  game/Game.ts       the live game: loop, systems, camera, render
  game/data.ts       data-driven content (WEAPONS/PASSIVES/ENEMIES/BOSS/Mods)
  game/textures.ts   runtime-generated primitive textures
  core/              input, spatialHash, rng helpers
  ui/                hud, styles.css, menu (title), settings/pause
  audio/sfx.ts       procedural Web Audio SFX + music
  meta/save.ts       versioned localStorage save profile
public/              manifest + icons + service worker (sw.js)
tests/               headless unit tests (Vitest, Node env)
docs/                design bible + 12-PROTOTYPE-ARCHITECTURE.md
```

> **Note on standalone subsystems.** Several finished, dependency-light modules
> currently live on their own and are **not yet wired into `main.ts` / `Game.ts`**:
> audio (`src/audio/sfx.ts`), the title menu (`src/ui/menu.ts`), settings/pause
> (`src/ui/settings.ts`), the meta/save profile (`src/meta/save.ts`), and the PWA
> service worker (`public/sw.js`). (A minimap is a candidate sibling in this set
> but isn't in the tree yet.) Each documents its own integration; hook them up at
> the app shell, not inside the hot simulation loop.

## Pull requests

- Keep changes focused; prefer editing existing files over adding new ones.
- Run `npm run typecheck` and `npm test` locally first.
- Use **original assets and our own name** — never copy survivor.io's name, logo,
  art, characters, or audio (see the IP note in `README.md`).
