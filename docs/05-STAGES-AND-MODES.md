# 05 — Stages, Chapters, Difficulty & Modes

## Campaign structure

- **One long linear chain of single-stage "Chapters."** **One stage per chapter, no sub-stages.** Beat chapter N to unlock N+1.
- **Count drifts with every patch:** ~290 (Oct 2025) → 330+ (early 2026). Habby ships ~5–10 chapters/patch. Pin to a date.
- **Run anatomy:** survive a timer (early ~10–12 min, standard ~15, some 8-min), ~3 bosses, tens of thousands of mobs; final boss at the end → XP reward on clear.
- **Steamroll Mode** (unlocks after clearing Ch.20): over-leveled players auto-clear/compress runs (15-min → ~5-min, unlimited rerolls at run start). A good "fast-farm" mode for later.

### Biome arc (≈30 named chapters; the rest recycle/extend these)
City (1–5: Wild Streets, City Park, Basement Parking, Financial Center, City Bridge) → Rural (6–10) → Military/Armory (11–13) → Lab (14–15) → Desert (16–20) → Volcano (21–22) → Mountain (23–25) → Forest (26–30). No dedicated "subway" theme; closest is Basement Parking.

## Difficulty — reality check

⚠️ **There is NO per-chapter Easy/Normal/Hard/Nightmare selector** (this corrects a common assumption). Difficulty is delivered as:
1. **Progression-based scaling** — every chapter raises enemy HP/ATK/density + recommended power.
2. **Challenge Chapters** — harder, modifier-laden re-runs of cleared chapters for better loot.
3. **Mega Challenge** — "hardest" content where **your gear stats are normalized** → a pure in-run draft/skill test.
4. **"Nightmare"** is a difficulty rung on the **Challenge** track, *not* the campaign.

## Game modes

| Mode | Unlock | Objective | Duration / cost | Distinctiveness |
|---|---|---|---|---|
| **Campaign Chapters** | — | Survive timer → kill final boss; linear chain | ~8–15 min; energy scales | Core loop; account power carries |
| **Main/Regular Challenge** | after Ch.2 | Curated harder stages (has Nightmare rung) | run-based | Evo materials, gear, tech parts |
| **Mega Challenge** | after Ch.2 | Survive ~15 min, **gear stats normalized**; sub-maps (City/Ferry/Beach/Factory/Farm) | ~15 min | Stat-equalized skill test |
| **Local Co-Op** | after stage 10 | 2-player co-op survival, same LAN | run-based | Only multiplayer mode (local) |
| **Daily Challenge** | daily | Fixed stage + daily buff/debuff | 6 min, 3 bosses; 10 energy, 2/day | Reliable tech-part faucet |
| **Daily Event** | daily | Farm one featured resource | 3 min; no energy, 2/day | Single-resource farm (rotating) |
| **Patrol (idle)** | stage select | Auto-accrue offline rewards (rate ∝ highest chapter) | caps at 24h | Idle income |
| **Quick Patrol** | stage select | Instantly claim 5h of patrol | 15 energy, 3×/day | Energy→loot converter |
| **Ender's Echo** | v1.8+ | **Max damage to an invincible boss** in time limit; weekly bosses, 28-day seasons | 3 min; free, 2/day | DPS race + ranked leaderboard (the real "boss-rush") |
| **Path of Trials** | v2.4.1+ | **Endless** escalating gauntlet | endless | Closest to "Endless/Survivor's Path" |
| **Limited Events** | event hub | Themed/crossover (e.g. Deepsea Survivor) | windows | FOMO/monetization |
| **Survivor Pass** | — | Battle pass (30 ranks, free + $19.99) | seasonal | Progression meta-layer |

⚠️ **Modes that do NOT exist** (drop from scope): **Throne of Time, Mega Drop, Lucky Drop, Brawl, Hunt.** The boss-rush mode is **Ender's Echo**.

## Map / arena design
Camera follows player; world scrolls underneath; enemies spawn from all edges; tactic is **kite in circles near center**. Per-chapter format is tagged **Open / Closed (bounded) / Vertical** (interiors trend closed/vertical, outdoor biomes open). Practically a **soft-bounded scrolling field** ("walls but never fully walled"). Threat is **enemy/boss-driven**, not floor-trap-driven (environmental hazards lightly documented).

## Implications for the clone — what to ship first

**MVP (the 80/20):**
1. **Campaign Chapters loop** — linear single-stage runs: fixed timer, escalating waves, mid + final boss, XP-on-clear, sequential unlock. Bake difficulty into the chapter curve — **no difficulty selector**.
2. **Idle Patrol** — offline-time × rate-from-highest-chapter, 24h cap, + Quick Patrol instant-claim. Cheap; huge for retention/economy.
3. **Daily Challenge + Daily Event** — two daily run variants = engine + modifier layer + daily-reset gate. High engagement per effort.

**Phase 2 (reuse the engine):**
4. **Ender's Echo** — single invincible boss, 3-min damage race, leaderboard. Swap win-condition to a score.
5. **Mega/Main Challenge** — same engine, **zero out account power** → pure draft test; 4–5 themed sub-maps. Easy to balance (no power creep).

**Phase 3+:** Path of Trials (endless), Local Co-Op (networking — defer), Events + Survivor Pass (live-ops).

**Engine note:** build the run as a **camera-follow scrolling arena with edge-spawning + soft bounds**, parameterized by `{timer, spawnTables, bossScript, modifierSet, statNormalization, winCondition (survive|score)}`. Every mode is a config of that one engine.

---
### Sources
survivor.io Fandom (Chapters, Update History, Steamroll Mode, Ender's Echo, Survivor Pass — via api.php to bypass 403); AppGamer per-chapter; TheClashify; Pocket Gamer (co-op, mega-challenge); LDPlayer; mturbogamer (daily, patrol, path-of-trials); BlueStacks; 9to5gaming. Chapter count & per-run energy are version-sensitive; "Nightmare" unlock/reward deltas under-documented.
