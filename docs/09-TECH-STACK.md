# 09 — Tech Stack & Architecture

For a bullet-heavy survivors-like in the browser, the two systems that make or break it (three independent open-source clones converge on this) are **(a) spatial-hash/uniform-grid broad-phase collision** and **(b) object pooling** for projectiles/particles/damage-numbers.

## Engine / renderer options

| Option | Notes |
|---|---|
| **PixiJS** | WebGL/WebGPU renderer with **automatic multi-texture sprite batching**; bring your own game logic. The standard pick for thousands of sprites. (Bunnymark = the canonical stress test.) |
| **bitECS** | Minimal **data-oriented ECS** (Struct-of-Arrays TypedArrays, zero-GC, hundreds of thousands of entities/frame). Pair with a renderer. |
| **LittleJS** | Zero-dep engine, WebGL2+Canvas2D hybrid, markets ~100k+ sprites @ 60fps. All-in-one alternative if you'd rather not assemble Pixi+ECS. |
| **Phaser 3** | Batteries-included (scenes, input, physics, tweens); custom WebGL batching. What most browser VS-clones and the original Vampire Survivors used. Easiest ramp. |
| **Plain Canvas2D** | Viable for a smaller swarm; simplest, but you'll hit a ceiling under heavy additive VFX. |

### Recommendation
**MVP stack: Vite + TypeScript + PixiJS (WebGL world) + bitECS (entities) + DOM/CSS HUD overlay + Howler.js (audio).**
- PixiJS gives the sprite-count ceiling and additive-glow batching the genre needs.
- bitECS keeps hundreds of enemies + thousands of projectiles/gems GC-free.
- HUD/menus as a **DOM/CSS layer** above the canvas (crisp text, responsive, easy buttons) — see doc 08.
- **Alternative if you want speed-to-prototype over ceiling:** Phaser 3 (or LittleJS as all-in-one). Phaser is the fastest way to a playable prototype; you can migrate hot paths to Pixi+ECS later.

## Architecture
- **Fixed-timestep simulation** (e.g. 60 Hz accumulator) decoupled from render; deterministic update order (see doc 01's 10-step loop).
- **ECS** (bitECS): components = `Position, Velocity, Sprite, Health, Weapon, Cooldown, Lifetime, Hitbox, Faction, AIState`; systems = `Input, Spawn, EnemyAI, WeaponFire, Projectile, Collision, Pickup, Damage, Render, HUD`.
- **Object pooling** for enemies, projectiles, gems, damage numbers — never allocate per frame.
- **Spatial hash** (uniform grid, ~64px cells) for broad-phase collision + nearest-target acquisition. Never O(n²).
- **Data-driven content:** weapons/skills/evolutions/enemies/stages/characters all as JSON (schemas in docs 02/06). Append-only.
- **Renderer hygiene:** texture atlases, sprite batching, cull off-screen, merge distant gems, cap concurrent entities via the spawn timeline.
- **Save/state:** off-chain. Local (IndexedDB) for prototype; a small server backend (auth + persistence + authoritative leaderboards) before any token/economy work — never trust the client for anything that grants value.
- **Mobile-web/touch + PWA:** pointer events, `touch-action: none`, virtual-resolution scaling, safe-area insets, service worker for offline/install.

## Open-source references to study (browser-native, by relevance)
1. **`bklee/survivors-game-project` (Magicka Survivors)** — Phaser + **bitECS**, 583 commits; the architecture blueprint (system split, synergy system, PWA, leaderboard). License: ISC.
2. **`ricardo-foundry/canvas-vampire-survivors`** — **MIT**, zero-dep Canvas; the cleanest reference for **object pooling (`pool.js`) + spatial hash (`spatial-hash.js`) + wave director** (~60fps @ 500+ enemies).
3. **`mttetc/CrystalSurvivors`** — Phaser+TS; best **data-driven weapons/jobs/synergy/elemental** content model. (No license stated — study, don't copy.)
4. **`giovanneluna/poke-survivors`** — **MIT**, live demo; pluggable `Attack` interface, `SpatialHashGrid`, projectile pooling, 100% **procedural Web Audio SFX**.
5. **`nusr/wukong-survivors`** — **MIT**, live demo; Phaser **inside React + Zustand** (good if menus/meta are heavy).
6. **`ape1121/Godot4-Multiplayer-Survivor-IO-Game`** — MIT, 47★; server-authoritative **multiplayer** pattern (Godot→WebGL) — reference only if you go multiplayer.
7. **`matthiasbroske/VampireSurvivorsClone`** — Unity/C#, 253★; highest-quality *architecture* reference (spawning, pooling, evolution) to read then port.

Engines/libs: PixiJS (`pixijs/pixijs`), bitECS (`NateTheGreatt/bitECS`), LittleJS (`KilledByAPixel/LittleJS`), Phaser (`phaserjs/phaser`). Tutorial: Emanuele Feronato's "Vampire Survivors prototype with Phaser" (TS, auto-fire-at-nearest, edge spawning — full source).

> Licensing: borrow only from MIT/ISC repos (canvas-vampire-survivors, poke-survivors, wukong-survivors, the Godot repo, and all engines). Study unlicensed repos for ideas; don't copy their code/assets.

## Performance baseline / definition of done
Hold **60fps with ~300–500 active enemies + ~1–2k projectiles/gems** on a mid-range phone browser. Use PixiJS Bunnymark / LittleJS stress test as the sprite-count baseline; profile with the spatial hash + pooling in place before adding content.

---
### Sources
Open-source survey of browser VS-clones + engine docs (PixiJS, bitECS, LittleJS, Phaser); the repos and patterns above were cross-verified from their GitHub READMEs/source. License notes per repo as listed.
