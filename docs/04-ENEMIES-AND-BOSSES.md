# 04 — Enemies, Waves & Bosses

## The core fact: a deterministic spawn director

**Everything runs on a fixed timeline, not pure RNG.** Enemy waves, density spikes, elite spawns, and bosses are scripted to the run clock. The single most important system to build here is a **per-stage timeline/director**, not a flat random spawner. "If you memorize what comes out at what time, you're better equipped."

## Boss / mini-boss cadence (critical timing)

- **A boss spawns every 5 minutes** → bosses at 5:00 / 10:00 / 15:00 in a 15-min stage (last = stage boss).
- **Mini-bosses (elites)** appear throughout, marked by **red aura + larger size**, ~1–2 per wave; drop a **golden chest** (spin-wheel: upgrade or evolution).
- **Boss-spawn board-wipe (key mechanic):** when a main boss spawns, **all normal enemies + on-screen mini-bosses instantly die**, the arena becomes a confined fight zone, and you grab the elite chest at that moment. This converts horde survival into a clean 1v1 — and is also a **performance pressure valve** (entity count drops to ~1).
- **Telegraphs:** bosses show warning lines/shapes before attacks. Build a generic **"telegraph → resolve"** component (flat bright ground shapes — red danger circles, lines — that grow/pulse before the hit). Nearly every boss reuses it.
- **Strategy exploit to replicate:** players leave an elite alive until just before a boss, so the board-wipe drops its chest right as the duel begins.

## Common enemies

| Name | Type | Behavior |
|---|---|---|
| Regular Zombie | Basic melee swarm | Slow walk toward player; contact damage; high count (fodder) |
| Zombie Dog | Runner | Fast horde rushes from all sides |
| Construction Worker | Tank/bruiser | High HP; post-boss farm fodder |
| Purple Shooter | Ranged spitter | Fires projectiles at range |
| Armored Zombie | Armored tank | High HP wall (mini-boss tier) |
| Butterfly / Papillon | Exploder-on-death | Leaves damaging puddle when killed |
| Beetles (red/blue) | Fast/armored chaser | Color = tier |
| Pink/Green Flies | Flying swarm | Diagonal sweeps, ring formations |
| Slug | Mini-boss bruiser | Large, slow, high HP |
| Droids / Tesla units | Ranged robots (later chapters) | Variants with different attacks; some spawn minions |

**Density model:** each wave window adds a new type while stacking prior ones, sometimes arriving in **ring formations** or **multi-edge ambushes**; density spikes right before each boss, then the board-wipe clears it.

## Special drop-enemies & world pickups
- Elites → **golden chest** (1/3/5 upgrades + gold; **off-screen pointer** leads you to it — may be version-dependent).
- World boxes drop: **Gold**, **Meat** (heal), **Magnet** (vacuum all on-screen drops after short delay), **Bomb** (clear visible enemies).

## Named bosses (telegraph vocabulary to copy)

| Name | Chapter | Attacks |
|---|---|---|
| Bouncebloom | Ch.1 (5:00) | 3 spreading projectiles that bounce off walls |
| Devourer | Ch.1 (10:00) | Sudden charge/dash; later spawns mobs |
| Steel Gnasher | Ch.1 final | Red warning lines → ranged beam |
| Papillon / Queen Papillon | Ch.2 / Ch.13 | Purple orbs + spawns mini-butterflies + heat-seeking |
| Toxinator | Ch.3 | Moves leaving **poison trails (red ground circles)** |
| Sapper Worm | Ch.3+ | Follows, drops explosives |
| Rushgnasher | Ch.3 | Multi-phase: lasers + throws its head |
| Raging Bull | Ch.3 | Fast charge → vulnerable on recovery |
| Corpsehound | Ch.4/14 | Fast, shoots lasers, charges ("run in a square") |
| Director / Manager | Ch.14+ | Dodge-heavy; throws phones, blue explosions |

**Ender's Echo bosses** (boss-rush mode, see doc 05): single invincible boss, weekly rotation (Sunset Tyrant, Star of Destruction, Killer Shaun, Bouncy Bear, Ancient Megalodon). Multi-phase is firmly attested only for Rushgnasher and Queen Papillon; others are mostly single-pattern + contact.

## HP / damage scaling
No published formulas. Qualitatively: density + toughness ramp within a run; later chapters strictly higher HP/damage; recurring bosses return with multiplied stats. **Recommendation:** `HP = base_HP_for_type × chapter_multiplier × run_time_ramp`, with `chapter_multiplier` ~geometric (×1.10–1.20/chapter) and a within-run step ramp. Tune empirically.

## Implications for the clone
- **Spawn director:** data-driven timeline of `{startTime, enemyType, count, formation, spawnRate, durationWindow}` + scheduled elites + fixed boss triggers. Support ring/sweep/multi-edge formations (scripted set-pieces), not just radial-random.
- **Reproduce the board-wipe** on boss trigger (despawn all, force-drop elite chests, shrink to arena).
- **Performance is make-or-break** (hundreds of enemies + thousands of projectiles/gems):
  - Single Canvas2D/WebGL renderer with **sprite batching / atlases** — never a DOM node or self-updating sprite per entity.
  - **Object-pool** everything (enemies, projectiles, gems, damage numbers).
  - **Spatial grid / quadtree** for collision and target acquisition — never O(n²).
  - Most enemies just **seek the player** (one shared vector) — cheap; reserve per-entity AI for ranged/boss units. Cull off-screen; merge distant gems.
  - Lean on **Magnet & Bomb** as entity-count resets.
- **Telegraph layer:** reusable warning-shape component (lines/circles/cones, ~0.5–1s pre-hit).

---
### Sources
Level Winner; Pro Game Guides (chapters 1–10); simplegameguide (Ch.1); Touch Tap Play (Ch.2/3); TheClashify (Ch.12–14); BlueStacks; Pocket Gamer; mturbogamer (Ender's Echo); WriterParty. Exact HP/damage numbers, full boss roster past Ch.15, and canonical English names are uncertain (localization varies).
