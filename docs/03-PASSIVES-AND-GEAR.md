# 03 — Passives & Equipment/Gear

Two systems: **(A)** in-run passive skills drafted on level-up, and **(B)** persistent out-of-run equipment.

## A. In-run passive skills (~12, the canonical set)

Passives cap at **Lv5**; they double as **evolution catalysts**. Scaling below is from One Chilled Gamer (linear L1→L5 unless noted); treat as good first-pass.

| Passive | Effect | L1 → L5 | Catalyst for |
|---|---|---|---|
| **Fitness Guide** | Max HP up | +20% → +100% | 1-Ton Iron (Brick) |
| **Hi-Power Bullet** | Attack/damage up | +10% → +50% | Gatling Gun / Reaper |
| **Energy Cube** | Cooldown reduction | −8% → −40% | Supercell / Death Ray |
| **Sports Shoes** | Move speed (+small dmg reduction) | +10% → +50% | Quantum Ball |
| **Hi-Power Magnet** | Pickup/loot range | +100% → +500% | Magnetic Rebounder |
| **Koga Ninja Scroll** | EXP gain | +8% → +40% | Spirit Shuriken |
| **Energy Drink** | HP regen | 1%/5s → 5%/5s | Pressure Forcefield / Defender |
| **Ronin Oyoroi** | Damage taken down | −10% → −50% | Eternal Light / Demon Blade |
| **Exo-Bracer** | Effect duration | +10% → +50% | Defender / Gloom Nova |
| **HE Fuel** | Weapon range/area | +10% → +50% | Sharkmaw Gun / Caltrops |
| **Ammo Thruster** | Projectile speed | +10% → +50% | Whistling Arrow |
| **Oil Bond** | Gold gain | +8% → +40% | Fuel Barrel |

**Design note:** survivor.io has **no in-run level-up card for Crit, Attack Speed (separate from cooldown), Dodge, Knockback, or extra-projectile**. Those come from gear/characters/collectibles, not the draft. This is a deliberate divergence from Vampire Survivors — decide consciously whether to keep it.

## B. Equipment / gear (persistent power)

### Six slots
**Weapon · Armor/Chest · Necklace · Belt · Gloves · Boots.** (No bracelet/wingsuit/ring — those are other games.)

### Rarity ladder
**Grey (Normal) → Green (Good) → Blue (Better) → Purple (Excellent) → Gold/Yellow (Epic) → Red (Legendary) → Eternal**, plus **S-grade** variants of Excellent. Purple+/Yellow/Red carry `+1/+2/…` merge sub-tiers. Higher rarity = higher base stat, higher level cap, and **more skills unlocked** on the piece (up to ~5).

### Five stacked progression systems (treat as separate tracks; **defer 3–5 past MVP**)
1. **Merge** — combine duplicates to raise rarity (3→1 at low tiers; escalates at Purple+).
2. **Level** — Gold + Equipment Designs raise a piece's level (cap gated by rarity); Level-Down refunds.
3. **Astral Forge** *(unlocks at Red)* — consume Red + Yellow (+Cubes; +Cores for S) to add %ATK/HP and, for S-gear, new effects.
4. **Tech Parts** *(v1.5)* — slot-in enhancers with their own 7 grades (Normal→Eternal); add stats **and modify how skills behave**.
5. **Collectibles** *(Collection Hall)* — separate ATK/HP boost via shards→stars; grouped into **Collectible Sets** — the closest thing to classic "set bonuses."

### Important: no classic 2pc/4pc set bonuses
survivor.io gear is organized into **families built around a signature weapon** (Eternal→Lightchaser, Voidwaker→Void Power, Chaos…), sharing **salvage cores** for that family's Astral Forge — *not* "wear N pieces → bonus." The only real stacking set bonus lives in **Collectibles**. You may deliberately add crisp 2pc/4pc bonuses for legibility, but flag it as a divergence.

### How gear translates into the run (key integration)
- The equipped **Weapon decides your run's starting weapon** (swap it to change your opener).
- It also **injects an extra skill into the level-up RNG**, biasing draws toward that weapon's line.
- High rarity can **start the weapon at Lv2** and carry inherited bonuses in.
- The other 5 slots feed your **persistent stat block** (ATK/HP/move/defense/crit/dodge) carried into every run + trigger live effects (revive, berserk).

Flow: **gear → (a) flat stat block, (b) starting weapon, (c) weighted level-up pool, (d) live triggered effects.**

## Implications for the clone
- Implement the ~12 passives as data (linear L1→L5, cap 5). Small, hand-authorable.
- **Passives-as-catalysts** is the core combo system — model evolutions as a recipe table (see doc 02).
- MVP equipment = **6 slots × rarity × level**, with the **weapon slot driving starting weapon + level-up bias**. That single mechanic captures most of the meta-progression feel.
- Build Astral Forge / Tech Parts / Collectibles later as **additive multiplier layers**, never prerequisites.
- A single merged **`Modifiers`** object (character + star + level + gear + pet + assists) read by the combat loop each frame keeps everything data-driven.

---
### Sources
One Chilled Gamer (skill & equipment guides); BlueStacks (skills/evolution); Pocket Gamer (gear families); MrGuider; Gamertweak (rarity); mturbogamer (Voidwaker, Collectibles); WriterParty (Astral Forge); AllClash (Astral Forge / Tech Parts). Per-level passive %s and per-piece skills are patch-sensitive.
