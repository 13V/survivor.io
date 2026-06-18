# 01 — Core Gameplay Loop

The heartbeat of the game. This is the single most important doc for the engine.

## Run structure (macro loop)

- **A run = one stage**, structured as **timed survival** (not score- or kill-count based).
- Standard stage length **~15 minutes** (some special/later stages ~8 min). Make per-stage duration configurable.
- **A boss spawns every 5 minutes.** A 15-min stage has bosses at **5:00, 10:00, and 15:00**; the final one is the stage boss.
- **Mini-bosses (elites)** appear throughout, marked by a **red aura + larger size**.
- **Run ends when:** (a) player HP hits 0 with no revive → fail, or (b) the final boss is killed → win (bonus XP/gold). The timer reaching 0 does **not** end the run; it triggers the final boss.

## Controls & targeting (defining simplification)

- **One input: a virtual joystick for movement only.** One finger, no buttons.
- **The player never manually fires.** All weapons auto-attack on their own cooldowns. There is **no aim/fire button**.
- **Targeting is per-weapon, not one global rule.** Model a `targetingMode` enum:
  - `NEAREST` — acquire closest enemy in range (optionally homing). *e.g. Kunai.*
  - `FACING` — fire along the current move/facing vector (player "aims" by steering). *e.g. Shotgun, Revolver, Lightchaser.*
  - `ORBIT` / `AURA` — positional, no target. *e.g. Guardian, Forcefield.*
  - `RANDOM_SPREAD` / ground-drop / bounce / returning — per behavior.
- Up to **6 active skills** fire in parallel on independent cooldowns.

## Camera

Top-down, **player-locked follow camera** (character centered, world scrolls under it), fixed zoom. The visible screen defines "on-screen" for screen-wide effects (Magnet/Bomb). Pick a zoom that shows enough incoming enemies to dodge.

## Core entities & pickups

| Entity | Behavior |
|---|---|
| **Player** | Centered, joystick-moved, auto-attacks; takes **contact damage** on enemy overlap |
| **EXP gems** | Dropped by kills; tiered by color **green < blue < gold**; walked over to collect → fill XP bar |
| **Pickup/magnet radius** | Circle around player; gems inside lerp toward player. Extended by Hi-Power Magnet passive (+100%→+500%) |
| **Magnet (drop)** | Pulls **all on-screen drops** to player, after a deliberate short delay (reposition to vacuum wider) |
| **HP/meat drops** | Primary healing source; instant heal on pickup |
| **Coins/gold** | Most common drop; meta-currency, tallied for end-of-run |
| **Bomb (drop)** | One-shot **screen clear** of all visible enemies |
| **Chests (elite/boss)** | Grant **1/3/5 upgrades** (to skills you already own) + gold lump; boss "golden chest" also delivers an **evolved weapon** if conditions are met |

## Survivability

- **No passive regen by default.** Healing comes from **meat drops** and the **Energy Drink** passive (1%→5% HP / 5s). Fitness Guide passive adds **+20%→+100% Max HP**.
- **Contact damage** is on-touch (tick while overlapping); assume periodic ticks (~0.5–1s) and tune. *(Exact i-frame timing not documented.)*
- **Invuln windows** are confirmed for: the **level-up screen** (game pauses + brief invuln), Stylish Belt (chance on hit), Eternal Suit (1s invuln at 0 HP, 15s CD).
- **Revive/continue:** limited per run — typically 1 free/ad revive then gem-gated.
- **No active dodge/dash** — repositioning via joystick is the only evasion. Dodge exists only as a passive % stat. **No rage/fever meter** exists in the base game.

## Level-up flow (micro loop — the core feel)

1. Collect EXP gems → fill XP bar.
2. Bar fills → **game pauses** (this is the brief invuln window) → show level-up cards.
3. Player **picks 1 of 3 cards**: a new active, a new passive, or +1 level to something owned. Early offers include new skills; pool narrows as the 6 active / 6 passive slots fill.
4. Resume.

- **Cards cannot be skipped/declined; picks are permanent within a run** (no drop/replace). Bad early picks are sticky.
- **No reroll by default.** A "Refresh" (one reroll/level) appears only after unlocking the Rogue skill. No banish/lock in standard mode. Steamroll Mode grants unlimited rerolls.

## Damage model & stat vocabulary

Damage = `base × (1 + ΣATK%) × (crit ? critDmg : 1) × areaMods …`. Each weapon declares which global stats it `scalesWith`; the combat loop applies the player's aggregated stat block uniformly.

Stat axes (with representative passive sources): ATK/Damage% (Hi-Power Bullet +10→50%), Crit Rate, Crit Damage, Cooldown reduction (Energy Cube −8→−40%), Projectile speed (Ammo Thruster +10→50%), Area/Range (HE Fuel +10→50%), Duration (Exo-Bracer +10→50%), Projectile count, Max HP (Fitness Guide +20→100%), HP regen (Energy Drink), Move speed (Sports Shoes +10→50%), Pickup range (Hi-Power Magnet +100→500%), EXP gain (Koga Ninja Scroll +8→40%), Gold gain (Oil Bond +8→40%), Damage reduction (Ronin Oyoroi −10→−50%), Dodge.

## Implications for the browser clone — the per-frame loop

Fixed-timestep (~60 Hz). Each tick:
1. **Input → movement:** read joystick; move player; derive facing vector for `FACING` weapons.
2. **Spawn director:** advance a per-stage **timeline cursor**; spawn scripted waves/elites; fire boss triggers at 5/10/15-min.
3. **Enemy AI:** seek player; resolve enemy–enemy separation (swarm, not stack).
4. **Weapon cooldowns:** per equipped weapon, tick CD; on ready, acquire target per `targetingMode` and spawn projectiles/hitboxes with stat-multiplied damage/area/count/speed/duration.
5. **Projectile/hit resolution:** move, collide, apply damage (crit roll), pierce, knockback, on-hit effects.
6. **Contact damage:** enemy overlap → tick damage (respect dodge, active invuln).
7. **Pickups:** spawn gems/coins/HP/magnet/bomb on kill; lerp loot within pickup range; apply on contact; handle Magnet vacuum and Bomb clear.
8. **Level-up gate:** XP full → pause sim, grant invuln, present 3 cards, apply pick, resume.
9. **Boss/evolution hooks:** on boss death drop chest (1/3/5 upgrades + gold) and grant evolved weapon if conditions met.
10. **End conditions:** HP ≤ 0 → death/continue; final boss dead → victory + reward tally.

**Constraints that preserve the feel:** one-finger control, no fire button, permanent in-run choices, 3-card level-ups, evolution as the run goal, scarce healing (survival is kiting not tanking).

---
### Sources
Level Winner; BlueStacks beginner & skills guides; GamingonPhone; Pocket Gamer; Inven Global (targeting); WriterParty (reroll/revive); survivor.io Fandom (Steamroll Mode). Exact contact-tick/i-frame timing, camera zoom, and free-revive counts are uncertain and should be set by tuning.
