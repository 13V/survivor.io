# 11 — Build Roadmap

A milestone plan from prototype → MVP → live-ops → (optional) token. Each milestone is shippable and de-risks the next. Treat game first; token last.

## M0 — Project scaffold (days)
- Vite + TypeScript repo; PixiJS world canvas + DOM/CSS HUD overlay; Howler audio; ESLint/Prettier; CI build.
- Virtual-resolution scaling (1080×1920, letterbox) + pointer/touch input + floating joystick + WASD fallback.
- **Exit:** a sprite moves with the joystick on a scrolling tiled ground at 60fps; HUD overlay renders.

## M1 — Core loop prototype (the 80/20) ⭐
The single most important milestone — proves the game is fun. Build doc 01's fixed-timestep 10-step loop.
- Player auto-attacks (1 starter weapon, `NEAREST` targeting); enemies seek player; contact damage.
- **Spatial hash** collision + **object pooling** (enemies/projectiles/gems/damage numbers) from day one.
- Edge spawner driven by a **data-driven stage timeline**; XP gems → XP bar → **pause + pick 1 of 3 cards**; permanent in-run slots (≤6 active + ≤6 passive).
- 5–6 active skills + the ~12 passives (doc 02/03) as JSON; basic damage model + crit (doc 01).
- One boss at 5:00 with a telegraph + the **board-wipe** + golden chest.
- Core juice: damage numbers, hit flash, hitstop, magnet, level-up flash (doc 08).
- **Exit:** a ~5-min run that's fun to play and holds 60fps with ~300+ enemies. *Get this in front of testers before building anything else.*

## M2 — Vertical slice (weeks)
- Full **evolution system** (doc 02's 21-recipe data + boss-chest delivery + ordering traps).
- Full active/passive rosters; behavior enum complete; 1 full 15-min chapter with 3 bosses + elites + formations.
- Enemy variety (runners/tanks/ranged/exploders); telegraph component generalized.
- Win/lose + reward tally; settings (graphics quality, reduce-motion, hide-damage, hide-joystick).
- **Exit:** one complete, polished chapter start-to-boss-kill with evolutions firing.

## M3 — Meta-progression & content (weeks)
- **6-slot equipment** (rarity + level + merge; weapon slot sets starting weapon + biases draft — doc 03). Defer Astral Forge/Tech Parts/Collectibles.
- **Characters** as data (exclusive skills + star tiers + `Modifiers` stack — doc 06); **pets** (1 deployed + 2 assist).
- Chapter chain (linear, escalating curve, **no difficulty selector**); **Idle Patrol** + Quick Patrol; **Daily Challenge + Daily Event** (doc 05).
- Economy: Gold/Gems/Energy/Shards/Designs + equipment gacha with **published, provably-fair odds** (doc 07).
- **Exit:** a retain-able game loop (runs → currency → upgrades → harder chapters → dailies/idle).

## M4 — Backend, accounts & live-ops (weeks)
- Server backend: auth, persistence, **authoritative leaderboards** (never trust the client for value).
- **Ender's Echo** (boss-rush DPS race + leaderboard) and **Mega Challenge** (stat-normalized) — reuse the engine via `{winCondition, statNormalization}` config (doc 05).
- Survivor Pass / seasons / events scaffolding; PWA install + offline.
- **Exit:** server-backed accounts, ranked leaderboards, a season's worth of live-ops hooks.

## M5 — Original art & audio pass (parallel, ongoing)
- Commission/produce **original** assets in the documented style (doc 08): hero + alt archetypes, zombie swarm + elites + bosses, projectile/VFX atlases (palette-swappable), UI kit, OST (combat/boss/menu) + SFX. **No Habby IP.**
- Pick the **game name + brand** (also needed for any token).

## M6 — Token (optional, separate, counsel-gated) 🔒
Only after the game retains players. Follow doc 10 exactly.
- **Legal review of token structure AND marketing first.**
- Devnet: mint (original SPL) + Metaplex metadata; wallet-adapter connect; Solana Pay purchase; **server-side token-gating**; cNFT items; off-chain leaderboard → on-chain batch settlement.
- Mainnet: mint + seed liquidity → **revoke mint + freeze authorities + burn/lock LP** → publish tokenomics → multisig treasury.
- **Design rule:** fixed-supply **spending/access** token with real sinks; **no P2E emissions faucet**; keep grind currency off-chain/non-convertible.

## Cross-cutting non-negotiables
- **Performance first:** spatial hash + object pooling before content; 60fps @ ~300–500 enemies on mid-range mobile is the bar (doc 09).
- **Everything data-driven:** weapons/skills/evos/enemies/stages/characters as append-only JSON.
- **Server-authoritative for anything of value;** client is presentation only.
- **Original assets + own name** throughout; mechanics-clone, not asset-clone.

## Suggested immediate next steps
1. Confirm the **engine choice** (recommended: PixiJS + bitECS; Phaser if optimizing for prototype speed) and the **game name/brand**.
2. Scaffold **M0** and build the **M1 core-loop prototype** — that's where we learn if it's fun.
3. Study the MIT reference repos in doc 09 (especially `canvas-vampire-survivors` for pooling + spatial hash) before writing the hot paths.
