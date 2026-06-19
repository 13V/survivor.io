# Outbreak Survivors (working title)

A **browser-based, top-down survivor/auto-battler** in the lineage of *Vampire Survivors* and Habby's **survivor.io**, with an optional **Solana companion token** as a later, clearly-separated phase.

> **Status:** A playable **M1 core-loop prototype** is in (PixiJS + bitECS + Vite + TypeScript) alongside the full **design bible**. See [Running the prototype](#running-the-prototype) and [`docs/11-BUILD-ROADMAP.md`](docs/11-BUILD-ROADMAP.md).

## Running the prototype

```bash
npm install
npm run dev       # open the printed localhost URL
# or: npm run build && npm run preview
```

**Controls:** WASD / arrow keys, or drag anywhere (touch/mouse) for a floating joystick. Attacks are automatic. Survive, vacuum XP, pick 1-of-3 upgrades on level-up, stack a build, and kill the boss that spawns at 1:30.

**Implemented:**
- **Core (M1):** fixed-timestep ECS loop, uniform-grid spatial-hash collision, sprite/object pooling, a data-driven spawn director, the 1-of-3 level-up draft, floating damage numbers, hit-flash + knockback juice, an enemy roster, and a telegraphed boss with a board-wipe.
- **Systems:** procedural Web-Audio SFX + music, title screen, settings/pause, minimap with off-screen boss arrow, `localStorage` save (best time/kills/coins), PWA (installable/offline), and a Vitest suite + CI.
- **Content (M2):** a data-driven **content registry** (`src/game/content/**`, auto-loaded via Vite glob) with **~25 weapons across 6 behaviors** (projectile / burst / orbit / zap / nova / beam), **~20 evolutions** (maxed weapon + catalyst → evolved form), and **8 passives**. Adding a weapon = dropping in one file. Architecture: [`docs/12-PROTOTYPE-ARCHITECTURE.md`](docs/12-PROTOTYPE-ARCHITECTURE.md).

---

## What this is

We are cloning the *genre and mechanics* of survivor.io — a one-thumb, auto-firing horde-survival game — into a performant browser game using original art and our own name. The research below reverse-engineers survivor.io's systems (weapons, evolutions, gear, enemies, modes, economy, art, audio) into a build-oriented spec.

## Documentation index

| Doc | Contents |
|---|---|
| [`docs/01-CORE-GAMEPLAY.md`](docs/01-CORE-GAMEPLAY.md) | Run structure, controls, auto-aim, level-up loop, damage model, the per-frame update loop |
| [`docs/02-WEAPONS-SKILLS-EVOLUTIONS.md`](docs/02-WEAPONS-SKILLS-EVOLUTIONS.md) | Equipped weapons, in-run active skills, the 21 evolution recipes, data schema |
| [`docs/03-PASSIVES-AND-GEAR.md`](docs/03-PASSIVES-AND-GEAR.md) | The ~12 passive skills, 6 equipment slots, rarity/merge/upgrade systems |
| [`docs/04-ENEMIES-AND-BOSSES.md`](docs/04-ENEMIES-AND-BOSSES.md) | Enemy roster, the spawn-director timeline, boss cadence & telegraphs |
| [`docs/05-STAGES-AND-MODES.md`](docs/05-STAGES-AND-MODES.md) | Chapter structure, difficulty reality-check, the real mode roster |
| [`docs/06-CHARACTERS-AND-PETS.md`](docs/06-CHARACTERS-AND-PETS.md) | Playable characters (functional, not cosmetic) and the pet system |
| [`docs/07-ECONOMY.md`](docs/07-ECONOMY.md) | Currencies, gacha, energy gating, monetization, token-mapping notes |
| [`docs/08-ART-UI-AUDIO.md`](docs/08-ART-UI-AUDIO.md) | Art direction, in-run HUD, menus, VFX "juice", audio |
| [`docs/09-TECH-STACK.md`](docs/09-TECH-STACK.md) | Engine choice, architecture, open-source references, performance |
| [`docs/10-SOLANA-TOKEN.md`](docs/10-SOLANA-TOKEN.md) | Token launch options, wallet/NFT integration, **risk & compliance** |
| [`docs/11-BUILD-ROADMAP.md`](docs/11-BUILD-ROADMAP.md) | Milestone plan from prototype → MVP → live-ops → token |

## Two important up-front caveats

**1. Intellectual property.** Game *mechanics* are not copyrightable and are fair to reimplement. survivor.io's **name, logo, art, characters, and audio are Habby's IP** — we build original equivalents "in the style of," and ship under our own name. Do **not** copy assets, the "survivor.io" name, or trademarked character/skin names (including the SpongeBob crossover content) into shipped artifacts.

**2. The token is a real legal exposure, not a side quest.** Tying a tradable token to a game economy can implicate **securities law** (Howey / the March 2026 SEC reinterpretation), **gambling/loot-box law**, and **money-transmission/AML** (FinCEN + state licensing), with severe penalties. The lowest-risk design keeps gameplay off-chain and any in-game currency non-convertible. **Engage qualified legal counsel before issuing, selling, or marketing any token or NFT.** See [`docs/10-SOLANA-TOKEN.md`](docs/10-SOLANA-TOKEN.md). Nothing in this repo is legal or financial advice.

## Sourcing note

Findings are reconstructed from community wikis, strategy guides, and developer/marketing breakdowns (the survivor.io Fandom wiki blocks automated fetching, so figures are cross-referenced from multiple guides and flagged where uncertain). Exact numeric values drift between patches — treat them as good first-pass targets to tune, not canon. Per-section sources are listed at the bottom of each doc.
