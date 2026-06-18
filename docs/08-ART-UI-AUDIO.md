# 08 — Art Direction, UI/HUD & Audio

Goal: recreate the look & feel with **original assets** (no copied art). survivor.io is a brighter, glossier, F2P-gacha take on the Vampire Survivors formula — "same systems, different skin."

## Art direction
- **Camera:** fixed **top-down with a slight ~3/4 tilt**, locked to player at screen center; world scrolls under it. No rotation/zoom in normal play.
- **Render look:** **2D sprites** on a flat tiled ground + soft drop shadows to fake grounding (faux-3D). WebGL recommended for hundreds of additive-glow sprites.
- **Palette:** desaturated cool ground (grey asphalt, muted urban) so **hyper-saturated emissive VFX** (cyan/white lasers, orange fire, yellow lightning, green poison, magenta orbs) pop. Figure/ground separation is the whole point — readability under 100s of enemies.
- **Theme:** post-apocalyptic city under zombie siege; biomes expand (rural, military, lab, desert, volcano, forest).
- **Characters:** compact, readable silhouettes (~4.5–5 heads tall, oversized weapon read) at ~64px. Default = grounded human survivor in hooded/tactical gear with a 1–2 color accent (cyan/teal). Alternates theme around cyber/neon, ninja/samurai, military, arcane.
- **Enemies:** signature **green/grey zombie horde** — keep base zombies low-detail and same-y (the *swarm* is texture); reserve detail/color for elites and bosses. Variety: runners, shamblers, fat bruisers, ranged spitters.
- **Rarity color ladder** reused everywhere (cards, gear, glints): **grey → green → blue → purple → gold → red → (eternal)**.

## In-run HUD (minimal, pushed to edges)

```
┌───────────────────────────────────────────────┐
│ [⏸ pause TL]    ⏱ 03:27        💰1240  💎5  ⚡  │ ← pause top-left; timer top-center; currencies
│ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░  Lv.14                   │ ← full-width XP bar
│ [🔫][🪃][⚡][🛡][❄][💥]  acquired-skill icons   │ ← skill icon row (≤6 active + ≤6 passive)
│                                                 │
│            🧟  🧟   🧟   🧟  🧟                  │
│        🧟      ╔═══════╗      🧟                │
│   🧟           ║ ▮HP▮  ║          🧟            │ ← player LOCKED at center; HP bar under avatar
│        🧟      ║ HERO  ║      🧟                │
│            🧟   ╚═══════╝   🧟                   │
│                  💥 ✦ ✦                          │ ← auto-fired projectiles radiate
│      ◯                                          │
│     (◉) ← floating joystick (spawns at thumb)   │
└───────────────────────────────────────────────┘
```
Verified placements: timer **top-center above XP bar**; XP bar **full-width top**; currencies **top cluster**; **floating joystick** bottom (spawns where thumb presses; hideable); **pause = square button top-left**; **movement only — no fire button**. HP-bar and skill-row exact pixels are genre-convention (confirm vs screenshots).

## Level-up card screen
- Action **pauses**; choose **1 of exactly 3** cards (large, vertical, icon-forward, tap-to-select).
- **Card border = type:** **gold = weapon (active)**, **green = passive item**. Shows current→next level + short description. (A flashier "Lucky Train" bonus pop-up also exists.)

## Menus / lobby
- **Persistent bottom tab bar:** Battle/Stage-Select · Equipment · Skills/Evolve · Shop · Characters.
- **Stage select** has a Patrol (AFK) button + green Claim. **Equipment** = 6-slot paper-doll + rarity-sorted grid + Merge. **Shop** = premium crates + ad-chests. **Gacha** = shards + limited events (also a character power screen, not pure cosmetics).
- Per-screen pattern: big central content, top currency bar, bottom tabs, high-saturation green/gold CTAs.

## VFX "juice" (prioritize — this is where it feels good)
- **Floating damage numbers** (crit = bigger/different color), **hit flash** (white tint ~60–80ms), **hitstop/freeze** on big hits & level-up.
- **Skill VFX = the spectacle** (additive glow + particles + trails); evolved weapons are "visually overwhelming."
- **Ground telegraphs** = flat bright shapes under units (red danger circles, lines) that grow/pulse before the hit. **Boss/miniboss = colored (red) aura.**
- **Evolution beat** = golden-chest burst + new glowing weapon. **Level-up** = flash + freeze + "LEVEL UP" banner + 3 cards slide in.
- **Pickup feel** = gems fly to player + ping on collect. **Screen shake** sparingly (respect reduce-motion).
- Design VFX to be **palette-swappable** (skill "skins" are a monetized feature).

## Audio
- **Driving upbeat electronic** combat loop (~120–140 BPM feel) that builds with the swarm; a tenser **boss layer**; a lighter **menu/lobby** theme. (No public composer credit; lobby vs battle tracks confirmed distinct.)
- **Key SFX (redundant feedback on every visual beat):** level-up chime, pitch-stacking pickup blips, punchy per-weapon shots, boss-spawn warning sting, evolution flourish, snappy UI clicks, chest "claim" jingle.

## Orientation
**Portrait-first** (one-thumb, floating joystick, top-edge HUD). Target **9:16–9:20** (1080×1920 baseline). Desktop-web: **letterbox the portrait field** (lowest risk) + provide **WASD/arrow movement** so no on-screen joystick needed.

## Implications for the browser clone
- **World = WebGL canvas** (PixiJS/Phaser); **HUD + menus = DOM/CSS overlay** above it (crisp text, flexbox tab bar, free responsive scaling, easy buttons). Drive HUD from game state.
- **Camera:** translate the world container; never move the player sprite for camera.
- **Virtual resolution** (1080×1920) uniformly scaled to viewport (`min(vw/1080, vh/1920)`), letterbox remainder; anchor HUD with CSS `env(safe-area-inset-*)`.
- **Touch:** floating joystick on `touchstart` in lower area; unify with **pointer events**; `touch-action: none` on canvas. Desktop = keyboard.
- **Asset pipeline:** texture atlases per category; base zombies low-detail/palette-limited/few frames; reserve fidelity for hero/elites/bosses. Damage flash via tint shader, not extra frames. Particle system + additive sprites, color-swappable.
- **Cheap juice:** pooled damage numbers (tween up+fade), white-tint hit flash, hitstop, decaying screen-shake offset, magnet lerp+blip, CSS level-up flash. **Object-pool** enemies/projectiles/gems/numbers. **Howler.js** for SFX/music layers; pitch-vary repeats; crossfade boss layer on spawn.

---
### Sources
Axios, TheGamer (clone/art lineage); TalkAndroid, MedievalFun, Level Winner (HUD, card type colors, miniboss aura); BlueStacks (skills/evolution, menus); One Chilled Gamer, AppGamer (equipment); Pocket Gamer, WriterParty (shop, bosses); survivor.io OST YouTube uploads (audio); App Store / Kotaku / MobyGames / RAWG galleries (visual ground-truth). Exact HUD pixel placement, character proportions, damage-number/crit colors, and screen-shake are genre-inferred — verify against screenshots/gameplay video.
