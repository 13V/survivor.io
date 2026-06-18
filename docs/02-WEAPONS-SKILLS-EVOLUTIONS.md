# 02 — Weapons, Active Skills & Evolutions

> **Critical taxonomy:** survivor.io has **two separate damage systems** that casual tier lists blur. Model them differently.
> 1. **WEAPON** — your *single equipped main weapon*, chosen before the run from your gear collection (upgraded as gear outside runs). You bring exactly **one**. It also levels up inside the run.
> 2. **ACTIVE SKILLS** — *in-run pickups* drafted on level-up. Up to **6** stacked per run.
>
> Both share a **Lv1→Lv5 + EVO (★6)** structure, and both can evolve by combining a maxed entry with a specific **support/passive** (or, in a few cases, a second maxed active).

## Equipped weapons

| Weapon | Behavior | Targeting | Role |
|---|---|---|---|
| **Kunai** | Thrown line, pierces; +1 kunai per level | `NEAREST` (homing) | **Premier boss-killer**; scales with ATK |
| **Lightchaser** | Fast omnidirectional light-slashes + arrays | Area around player | **S-tier wave-clear** |
| **Void Power** | Black holes that pull + damage; track bosses | Areas/orbit | Often rated #1 overall (range + CC) |
| **Sword of Disorder** | Close energy arcs | Area | S/Tier-0 DPS bruiser |
| **Starforged Havoc** | Newest SS-grade premium weapon | Auto | Top-end meta (details thin) |
| **Katana** | Front/back slashes releasing ki blasts | Directional | Mid; lifesteal on evo |
| **Baseball Bat** | Circular swing, knockback + bleed | Area | Strong early/mobs, falls off vs bosses |
| **Shotgun** | Cone spread, reloads | `FACING` cone | B-tier; "hard to manage" |
| **Revolver** | Single aimed shot, reloads | `FACING` | High single-target, poor AoE; D-tier |

**Meta loadout repeated across guides:** *Lightchaser for waves + Kunai for bosses.* Current S-tier weapons: Void Power, Lightchaser, Sword of Disorder, Starforged Havoc.

## In-run active skills (max 6)

| Active Skill | Behavior | Role |
|---|---|---|
| **Forcefield** | Damaging aura/ring around player | Defense + light CC |
| **Guardian** | Orbiting blades | Defense + contact DPS |
| **Molotov** | Thrown bottles → fire DoT puddles | Zone control |
| **Lightning Emitter** | Periodic bolts to nearby enemies | Top all-around |
| **Laser Launcher** | Criss-cross beams; cleanses poison | DPS + utility |
| **RPG** | Rockets that explode (AoE) | Burst AoE |
| **Soccer Ball** | Bouncing/ricochet balls | AoE bounce |
| **Boomerang** | Out-and-back, hits both legs | Wave DPS |
| **Brick** | Hurled bricks | Impact DPS |
| **Durian** | Bouncing spiky fruit | Area denial |
| **Drill Shot** | Piercing drill projectile | Single-target |
| **Type-A / Type-B Drone** | Auto-firing companion drones | Summon DPS (combine → Destroyer) |
| **Modular Mine** | Proximity mines | Branching evo (see below) |

## Evolution mechanic

**Trigger:** base active at **Lv5 (max)** + own the **required support/passive** (Lv1 is enough). The evolved weapon is then **delivered via a boss golden chest** (or offered on a subsequent level-up). Each entry = 5 levels + 1 EVO.

**Delivery confirmed:** boss-dropped **golden chest** auto-grants the evolved form when conditions are met.

### The 21 evolution recipes

| Evolved Weapon | Base (→Lv5) | + Support (or 2nd active*) | Effect |
|---|---|---|---|
| **Defender** | Guardian | Exo-Bracer | Permanent orbiting blades; **blocks enemy projectiles** |
| **Pressure Forcefield** | Forcefield | Energy Drink | Aura damages + knockback + **slows ~50%** |
| **Supercell** | Lightning Emitter | Energy Cube | Many bolts, each shatters into shockwaves |
| **Thunderbolt Bomb** | Modular Mine | Lightning Emitter* | Mines release 6 electric shocks |
| **Inferno Bomb** | Modular Mine | Molotov* | Mines explode + leave fire puddles |
| **Fuel Barrel** | Molotov | Oil Bond | Barrels spiral out, big flame AoE |
| **Destroyer** | Type-A Drone | Type-B Drone* (both Lv5) | Massive multi-directional missile barrage |
| **Divine Destroyer** | **Destroyer** (evolved) | Medi-Drone (Lv5) | Destroyer + healing zone (*secondary evo*, Catnips-locked) |
| **Gloom Nova** | Void Power | Exo-Bracer | Black holes + exploding shield dome |
| **Death Ray** | Laser Launcher | Energy Cube | Lasers spiral inward from screen edges |
| **Sharkmaw Gun** | RPG | HE Fuel | One huge missile, massive AoE |
| **Whistling Arrow** | Drill Shot | Ammo Thruster | Permanent arrow circling the map |
| **Quantum Ball** | Soccer Ball | Sports Shoes | More balls that split on impact |
| **Caltrops** | Durian | HE Fuel | Big spiked ball + periodic spike spray |
| **Magnetic Rebounder** | Boomerang | Hi-Power Magnet | Two rebounders in tight orbit |
| **1-Ton Iron** | Brick | Fitness Guide | 8 piercing dumbbells spread out |
| **Demon Blade** | Katana | Ronin Oyoroi | Slashes + HP regen/lifesteal on kill |
| **Eternal Light** | Lightchaser | Ronin Oyoroi | Twin heavy AoE sword swipes |
| **Spirit Shuriken** | Kunai | Koga Ninja Scroll | Faster, piercing, auto-target, +dmg |
| **Gatling Gun** | Shotgun | Hi-Power Bullet | Continuous fire, no reload |
| **Reaper** | Revolver | Hi-Power Bullet | Second revolver, higher fire rate |

\* = catalyst is a **second active at Lv5** — it's consumed and **frees a weapon slot**.

**Gotchas to encode:**
- **Ordering trap:** if a weapon that's also a catalyst (Molotov, Lightning Emitter) is evolved down its own path first, it's consumed and the dual recipe (Inferno/Thunderbolt Bomb) becomes unreachable that run.
- **Shared passives** feed two evos each: Exo-Bracer (Defender/Gloom Nova), Energy Cube (Supercell/Death Ray), HE Fuel (Sharkmaw/Caltrops), Ronin Oyoroi (Demon Blade/Eternal Light), Hi-Power Bullet (Gatling/Reaper).
- **Slots:** 6 active + 6 passive grid. No hard cap on number of evolutions; fusions that consume a partner free slots. **Divine Destroyer is the only secondary (super) evolution** and is character-gated to Catnips (who brings Medi-Drone).

## Data schema (data-driven, not hardcoded)

```jsonc
// Skill/weapon entity
{
  "id": "lightning_emitter",
  "category": "active_skill",          // weapon | active_skill | support
  "behavior": "self_aura",             // see enum below
  "targeting": "nearest_random",       // nearest | random | aimed | orbit | self_aura | ground_drop | bounce | returning
  "levels": [ { "damage": 30, "cooldown": 2.0, "count": 1, "area": 1.0 }, /* …Lv2-5 */ ],
  "scalesWith": ["atk", "cooldownReduction", "area"]
}

// Evolution recipe
{
  "result": "InfernoBomb",
  "base": { "skill": "ModularMine", "minStars": 5 },
  "catalyst": { "skill": "Molotov", "type": "active", "minStars": 5 }, // type: passive(minLevel 1) | active(consumed) | evolved
  "consumesCatalyst": true,
  "characterLock": null,               // e.g. "Catnips" for DivineDestroyer
  "delivery": ["levelup", "bossChest"],
  "sharesUpgradesWith": ["molotov"]    // cross-skill upgrade inheritance
}
```

**Behavior enum (covers the whole catalog):** `orbit`, `self_aura`, `projectile_straight`, `projectile_spread`, `projectile_bounce`, `projectile_return`, `thrown_ground_zone`, `melee_arc`, `beam`, `mine`, `summon`, `field_pull`.

Keep **targeting orthogonal to behavior** (a `projectile_straight` can be `nearest` for Kunai or `aimed` for Revolver). Treat EVO as a **stat/behavior override patch**, and the schema as **append-only** so Habby-style new weapons drop in as JSON.

---
### Sources
Pro Game Guides; WriterParty (full evo list); One Chilled Gamer (slots/scaling); BlueStacks; MrGuider; Gfinity (current meta); MedievalFun; Inven Global; mturbogamer (Modular Mine / Divine Destroyer). Per-level numeric values are not reliably published — capture in-game and treat the above as directional.
