# 06 — Characters & Pets

## Characters are FUNCTIONAL, not cosmetic

The game calls them **Survivors**. One default, the rest unlocked. The key mechanic:
- **Each survivor carries a unique always-on "Exclusive Skill"** into every run (occupies a skill slot; other survivors can't get it). E.g. Catnips' healing Medi-Drone, King's crit-stacking Sixth Sense, Tsukuyomi's Moonshade Slash.
- Some bring a **unique starting weapon** (SpongeBob's Spatula, Wesson's grenade, Yelena's pistol).
- **Star progression (1★→6★)** via that survivor's **Shards**: unlocks an exclusive weapon, then flat +ATK/+HP/+Crit/+MoveSpeed bonuses, then an evolved exclusive skill. Extra passives commonly at character level 40 & 80.

There is **no pure cosmetic-skin system** — visual identity and mechanics are bundled. (Crossover characters like SpongeBob are the closest to skins, but even they ship a unique weapon — and are **trademarked IP we must not copy**; build original archetypes.)

### Representative roster (build original equivalents)
| Character | Signature | Archetype |
|---|---|---|
| **Common** ("The Survivor") | +3% all stats / +3% range / +3% CDR passives; well-rounded | Baseline (all-zero balance reference) |
| **Tsukuyomi** | Moonshade Slash (growing area slashes), dual-blade | Offense |
| **Catnips** | Medi-Drone (healing zone); enables Divine Destroyer | Sustain/support |
| **King** | Sixth Sense (+crit rate/dmg) → Lucky Kill (re-roll failed crit) | Crit build |
| **Yelena** | Survivor Instinct (+crit/level), Automatic Pistol | Crit/offense |
| **Worm** | Listening Bug (weak points → more damage) | Debuff |
| **Wesson** | Electromagnetic grenade (splash + blocks attacks) | Control |

**Unlock currencies:** per-hero **Shards** (typical full unlock 80, Catnips 50) from events/Special-Ops/Ender's Echo; **Gems** (Catnips 6,000); **Survivor Pass** (primary seasonal route); direct **cash** (~$30) post-season; **event-only** for crossovers.

## Pet system

- **1 deployed pet** follows the player and **auto-attacks** with a %-of-ATK skill; it has **HP and can faint** at 0 (revive by standing over it).
- **2 Assist Pets** don't fight — they grant passive **Assist Skills** (buffs); **can't stack two of the same**. Assist skills unlock once a pet reaches "Better" quality.
- **Leveling:** spend **Pet Cookies** (from ads/coins/gems/shop) to raise base ATK/HP. Pets come from **Pet Chests** (gacha; 3 free daily via ads).
- **Endgame layer (defer):** **Awakening** (Awakening Crystals, yellow→red stars) and the **Xeno Pet** system (Xeno Cores, randomized assist-skill rolls with Reforge). Community view: assist-skill rolls matter more than base tier.

| Pet (examples) | Deploy attack | Role |
|---|---|---|
| Crabobble | Water Shot (500% ATK, pierces 2) | High single-hit |
| DD-6 | Laser (400% ATK, 3 burning lasers) | Multi-target |
| Murica | Dervish (350% ATK whirlwind) | AoE melee |
| Shelly | Turtle Surge (300% ATK shockwave) | AoE |
| Xeno: Puffo / Cappy | Support / hybrid | Top-tier buffs |

Example assist skills: **Boost** (+10% pet ATK & range per 5 owner levels), **Durable** (+15% shot duration), **Penetration** (+1 pierce).

## Implications for the clone — model both as data + modifiers

```jsonc
// Character / Survivor
{
  "id": "catnips",
  "rarity": "epic",
  "exclusiveSkillId": "medi_drone",   // granted at run start, occupies a slot; not in others' draft pool
  "startingWeaponId": null,           // e.g. "spatula" for a unique opener
  "baseModifiers": { "atkPct": 0, "hpPct": 0, "critRatePct": 0, "moveSpeedPct": 0 },
  "starTiers": [
    { "star": 1, "grants": { "type": "weapon", "id": "..." } },
    { "star": 2, "grants": { "type": "stats", "atkPct": 5, "hpPct": 5 } },
    { "star": 3, "grants": { "type": "skillEvolve", "from": "survivor_instinct", "to": "sixth_sense" } }
  ],
  "levelBonuses": { "40": {/* */}, "80": {/* */} },
  "unlock": { "shards": 50, "gems": 6000, "pass": null, "eventOnly": false }
}
```

- **Default character = neutral modifiers + generic passive** — the baseline every balance pass measures against.
- **Exclusive skill = a normal skill-registry entry** flagged "granted on spawn, not in others' draft pool." Cheapest way to differentiate heroes without bespoke code.
- **Pets = a parallel lighter system:** one deployed pet (`deploySkill`, `hp`, `atk`, can be downed/revived) + 2 assist slots feeding named buffs into the same global **`Modifiers`** stack (with per-type uniqueness). Cookie soft-currency leveling; treat Awakening/Xeno as a later star-multiplier.

**Bottom line:** both characters and pets reduce to *"a sprite + a fixed exclusive skill + a bag of stat modifiers + an unlock cost."* If the combat loop reads one merged `Modifiers` object (character base + star + level + pet + assists + gear), you add unlimited heroes/pets purely as data.

---
### Sources
WriterParty (characters/exclusive skills); WhatIfGaming (unlocks); Pro Game Guides; mturbogamer (Tsukiyomi/Catnips/King/Yelena); AppGamer (King/Sixth Sense); One Chilled Gamer (pet guide); grindnstrat (Xeno pets); Clashiverse (Xeno tiers); BlueStacks. Shard/gem/price numbers are patch- and region-dependent; live roster has grown beyond this list.
