# Environment Pack Analysis — "2D HD Zombie City Tileset"

Multi-agent read-only analysis of the purchased pack (characters in `Animations/`,
environment in `Isometric Tiles/`). Each section below is one analyst agent's report.


---
## 01_survivor_sheets

# SURVIVOR Character Spritesheet Analysis

**Source:** `/tmp/envpack/anim/Animations/Spritesheets/With shadow/Survivor/`
**Sheets found:** 20 PNG animation sheets
**Analyzed:** 2026-06-19 (read-only)

---

## 1. Grid / Format Summary

Every sheet is a uniformly-sized atlas: **1920 × 1024 px, 8-bit RGBA, non-interlaced PNG.**

With 128 px cells:
- **cols = 1920 / 128 = 15** → up to 15 animation **frames** per direction
- **rows = 1024 / 128 = 8** → 8 **directions** (8-way facing)
- Grid = **15 frames × 8 directions** per sheet (max 120 cells)

Layout convention: **rows = direction, columns = animation frame** (the figure's facing rotates row-to-row; the pose progresses left-to-right within a row). All cells are 128 px square; the actual character occupies roughly the lower-center ~40–70 px of each cell, with a soft drop shadow on the ground below it (consistent with the "With shadow" folder).

---

## 2. Full Animation Roster (20 sheets)

All sheets are 1920×1024 unless the frame count differs. "Frames used / dir" measured by detecting non-empty cells per row.

| # | Sheet | Dimensions | Grid (cols×rows) | Frames used / dir | Notes |
|---|-------|-----------|------------------|-------------------|-------|
| 1 | Attack1.png | 1920×1024 | 15×8 | 15 | Aim + fire/melee variant A |
| 2 | Attack2.png | 1920×1024 | 15×8 | 15 | Attack variant B |
| 3 | Attack3.png | 1920×1024 | 15×8 | 15 | Attack variant C |
| 4 | Attack4.png | 1920×1024 | 15×8 | 15 | Attack variant D |
| 5 | AttackRun.png | 1920×1024 | 15×8 | 15 | **Unusual:** attacking while running (move + shoot) |
| 6 | CrouchAttack.png | 1920×1024 | 15×8 | 15 | **Unusual:** crouched firing pose |
| 7 | CrouchIdle.png | 1920×1024 | 15×8 | 15 | **Unusual:** crouched idle |
| 8 | CrouchRun.png | 1920×1024 | 15×8 | 15 | **Unusual:** crouch-walk/sneak |
| 9 | Die.png | 1920×1024 | 15×8 | 15 | Death (full 15-frame collapse, per-direction) |
| 10 | GunFire.png | 1920×1024 | 15×8 | **10** | **Unusual + shorter loop** (only 10 frames/dir, cols 11–15 empty) |
| 11 | Idle.png | 1920×1024 | 15×8 | 15 | Idle A |
| 12 | Idle2.png | 1920×1024 | 15×8 | 15 | Idle B (genuinely distinct from Idle, different MD5) |
| 13 | Run.png | 1920×1024 | 15×8 | 15 | Forward run cycle |
| 14 | RunBackwards.png | 1920×1024 | 15×8 | 15 | **Unusual:** retreating/backpedal run |
| 15 | RunBackwardsAttack.png | 1920×1024 | 15×8 | 15 | **Unusual:** backpedal while firing |
| 16 | StrafeLeft.png | 1920×1024 | 15×8 | 15 | **Unusual:** lateral strafe left |
| 17 | StrafeLeftAttack.png | 1920×1024 | 15×8 | 15 | **DUPLICATE of StrafeLeft (identical MD5)** |
| 18 | StrafeRight.png | 1920×1024 | 15×8 | 15 | **Unusual:** lateral strafe right |
| 19 | StrafeRightAttack.png | 1920×1024 | 15×8 | 15 | **DUPLICATE of StrafeRight (identical MD5)** |
| 20 | Taunt.png | 1920×1024 | 15×8 | 15 | Taunt / emote |

### Unusual / noteworthy animations
- **Tactical movement set:** `Strafe Left/Right`, `RunBackwards`, `AttackRun`, `RunBackwardsAttack` — a full twin-stick "move in any direction while aiming forward" rig, well beyond a basic idle/run/attack/die set.
- **Crouch set:** `CrouchIdle`, `CrouchRun`, `CrouchAttack` — a complete secondary stance (cover/stealth).
- **`GunFire.png`** is the only sheet with a shortened cycle (**10 frames/direction** vs 15); a tight muzzle-flash recoil loop.
- **Two idles** (`Idle`, `Idle2`) for variety/fidgets.
- **Duplicate files (data-identical):**
  - `StrafeLeftAttack.png` == `StrafeLeft.png` (md5 `550afd18…`)
  - `StrafeRightAttack.png` == `StrafeRight.png` (md5 `5dce7ed3…`)
  These "…Attack" strafe variants are byte-for-byte copies of the base strafes (placeholder/aliased assets, **not** distinct firing animations). Effectively **18 unique sheets** of art across 20 files.

---

## 3. Art Style — sampled cells (Run & Attack1, full-res 128px cells, 4× nearest-neighbor)

**Subject:** A lone foot-soldier / survivor — a hooded or helmeted figure in a long dark coat/cloak, gripping a long firearm (rifle/SMG) that extends out in the aim direction. A small **teal/cyan harness, strap, or backpack rig** breaks up the silhouette across the shoulders/chest (the only saturated accent on the model). A soft elliptical **ground shadow** sits under the feet in every frame.

**Resolution feel:** True **pixel art**, low-res and chunky. The effective character footprint is only ~40–70 px tall inside the 128 px cell, so individual pixels are large and readable — a deliberately retro, low-fidelity look rather than smooth hi-res sprites. Hard 1px near-black outlines, minimal interior shading (roughly 2–3 tones per material), and dithered/soft shadow edges.

**Colorway (sampled dominant body pixels, approximate RGB):**
- Outline / darkest: `(0,0,0)` near-black
- Coat/cloth mid: olive-khaki `(48,48,24)` and muddy brown `(72,48,48)` / `(48,24,24)`
- Neutral darks: `(24,24,24)`
- Accent: **teal** `(0,48,48)` / `(0,24,24)` (the harness/pack)

Overall palette is **dark, desaturated, earthy** — browns, olive/khaki, charcoal, with a single cold teal pop. No bright primaries.

**Comparison to a "gritty top-down survivor":**
- **Strong match in tone:** the muted earth-tone palette, hooded/cloaked lone-gunner silhouette, drop shadows, and the full tactical move-set (strafe/backpedal/crouch/fire-on-the-move) read exactly like a gritty top-down shooter/survivor (think a Hotline-Miami-meets-survival-horror foot soldier, or a Vampire-Survivors-style hero rendered for a more serious, military/apocalyptic skin).
- **Caveat on fidelity:** it is *deliberately* low-res pixel art, not detailed hi-res illustration. "Grit" comes from the dark palette and pose vocabulary, not from rendered surface detail. At in-game zoom the small sprite + soft shadow will read as a competent, atmospheric top-down survivor; up close it is coarse and pixelated.

---

## 4. Quality Verdict

A coherent, production-style **8-direction pixel-art character set** with an unusually rich roster (20 sheets / 18 unique) covering idles, 4 attack variants, a full crouch stance, and a complete tactical movement rig (strafe, backpedal, run-and-gun). Uniform, clean 15×8 / 128px-cell packing makes it engine-friendly. Tone (dark earthy palette, hooded gunman, soft shadows) fits a gritty top-down survivor well; the main caveats are the coarse low-resolution sprite size and the two byte-identical Strafe*Attack duplicate files (placeholders, not real fire-while-strafing art).


---
## 02_cityzombie1

# CityZombie 1 — Spritesheet Analysis (With shadow)

Source directory:
`/tmp/envpack/anim/Animations/Spritesheets/With shadow/CityZombie 1/`

## Summary
A humanoid "city" zombie rendered in a soft, painterly / pre-rendered 2.5D style
(not crisp pixel art) and downsampled into small sprites. Pale grey-white skin and
tattered light shirt, dark grey/black trousers, with moderate red blood splatter on
the chest/torso and around the mouth. Each sheet includes a soft grey drop shadow
beneath the figure. 15 animations total. Every sheet is a uniform 1920 x 1024 grid of
128px cells = 15 columns (frames) x 8 rows (facing directions) = 120 cells.

## Grid format (applies to ALL 15 sheets)
- Sheet pixel size: **1920 x 1024** (identical for every file)
- Cell size: **128 x 128 px**
- Columns = 1920 / 128 = **15** (animation frames per direction)
- Rows = 1024 / 128 = **8** (facing directions — 8-way isometric/top-down rotation)
- Total cells = 15 x 8 = **120**, and all 120 are populated (no blank padding cells)
- Layout: each ROW is one facing direction; reading left->right within a row plays the
  animation for that direction. The 8 rows step the character through a full 360° of
  facings (toward camera, away, left/right profiles, and the four diagonals — confirmed
  from a column-0 montage across all 8 rows).
- Interpretation: rows = frames? NO. **rows = directions (8), cols = frames (15)**.
  (The task phrasing "rows = frames × directions" resolves here as: the row axis carries
  the 8 directions and the column axis carries the 15 frames.)

## Animation roster (15 sheets)
All are 1920x1024 / 15x8 / 128px cells.

| File           | Size        | Cols x Rows | Notes                          |
|----------------|-------------|-------------|--------------------------------|
| Idle.png       | 1920 x 1024 | 15 x 8      | standing idle                  |
| Idle2.png      | 1920 x 1024 | 15 x 8      | alternate idle (smaller file)  |
| Walk.png       | 1920 x 1024 | 15 x 8      | walk cycle                     |
| Run.png        | 1920 x 1024 | 15 x 8      | run cycle (sampled)            |
| CrouchRun.png  | 1920 x 1024 | 15 x 8      | hunched/crouched run           |
| Attack1.png    | 1920 x 1024 | 15 x 8      | melee attack (sampled)         |
| Attack2.png    | 1920 x 1024 | 15 x 8      | melee attack variant           |
| Attack3.png    | 1920 x 1024 | 15 x 8      | melee attack variant           |
| Attack4.png    | 1920 x 1024 | 15 x 8      | melee attack variant           |
| Attack5.png    | 1920 x 1024 | 15 x 8      | melee attack variant           |
| TakeDamage.png | 1920 x 1024 | 15 x 8      | hit reaction                   |
| Taunt.png      | 1920 x 1024 | 15 x 8      | taunt / roar                   |
| WakeUp.png     | 1920 x 1024 | 15 x 8      | get-up / spawn-from-ground     |
| Die.png        | 1920 x 1024 | 15 x 8      | death (largest file ~347 KB)   |
| Die2.png       | 1920 x 1024 | 15 x 8      | alternate death                |

Roster grouping: 2 idles, Walk, Run, CrouchRun (5 locomotion), 5 Attacks (Attack1-5),
TakeDamage, Taunt, WakeUp, and 2 deaths (Die, Die2).

## Appearance / art description (from Run.png and Attack1.png, upscaled cells)
- **Subject:** an upright humanoid zombie of normal adult build (not bloated, not a
  special/boss type) — a generic shambling "city" infected civilian.
- **Colorway:** desaturated. Pale grey-white skin and a torn off-white/light-grey
  shirt up top; dark charcoal/near-black trousers on the legs. Overall reads as a
  low-saturation grey silhouette with small color accents.
- **Gore level:** moderate but not extreme. Distinct red blood splatter/stains across
  the chest and torso and a reddish smear around the mouth/jaw; small red flecks on the
  arms. No exposed guts, dismemberment, or pooling — it's "bloodied undead," PG-horror
  rather than splatter-gore.
- **Style:** soft pre-rendered / painted 3D look that has been scaled down to a small
  sprite. Edges are anti-aliased and slightly blurry (smooth gradients, soft shadow),
  NOT hand-placed hard-edged pixel art.
- **Shadow:** every frame has a soft grey elliptical drop shadow beneath the feet
  (this is the "With shadow" variant of the set).
- **Pose readability:** Run shows a clear lunging stride; Attack1 shows a wind-up/strike
  with the arms; CrouchRun (by name) is the hunched sprint.

## Resolution / effective detail
- Cell canvas is 128 x 128 px, but the character only occupies a small portion of it.
  Measured non-transparent content bounding boxes across Run.png (120 cells):
  - content width ~ **20–38 px** (median **31 px**)
  - content height ~ **31–53 px** (median **40 px**, incl. shadow)
- So the usable character art is roughly a **30 x 45 px** footprint centered in a 128px
  cell — i.e. tiny sprites with large transparent margins (built to allow for big attack
  reach / extreme poses without clipping). Effective detail is low; fine features like
  the face are only a few pixels.
- Color depth: 8-bit/channel RGBA, non-interlaced PNG (true-color with alpha).

## Notes
- File sizes vary 131 KB (Idle2) to 347 KB (Die) but all share identical dimensions and
  grid; size differences reflect frame content/blood/pose complexity, not layout.
- This is the "With shadow" variant; a "No shadow" sibling set likely exists elsewhere
  under Spritesheets/.


---
## 03_cityzombie2

# CityZombie 2 — Spritesheet Analysis

**Source:** `/tmp/envpack/anim/Animations/Spritesheets/With shadow/CityZombie 2/`
**Variant:** "With shadow" (sprites are baked with a drop/contact shadow)
**Cell size:** 128 x 128 px

## Grid summary

Every sheet in this folder is uniformly **1920 x 1024 px**.

- cols = 1920 / 128 = **15**
- rows = 1024 / 128 = **8**
- total cells = 15 x 15... = **120 cells** (15 cols x 8 rows)

The **8 rows = 8 facing directions** (standard octa-directional / isometric: E, NE, N, NW, W, SW, S, SE). The **15 columns = up to 15 animation frames** per direction. Not every animation necessarily fills all 15 frame slots; trailing columns may be blank/padding for shorter clips, but the canvas is allocated for the maximum (15) so every sheet shares the same dimensions.

So for each sheet: **frames x directions = 15 x 8**, with directions on the vertical axis and the time/frame progression reading left-to-right within each row.

## Full animation roster (15 sheets)

| # | Sheet | Dimensions (px) | Grid (cols x rows) | Frames x Dirs | File size |
|---|-------------------|-----------------|--------------------|---------------|-----------|
| 1 | Attack1.png       | 1920 x 1024     | 15 x 8             | 15 x 8        | 261 KB |
| 2 | Attack2.png       | 1920 x 1024     | 15 x 8             | 15 x 8        | 269 KB |
| 3 | Attack3.png       | 1920 x 1024     | 15 x 8             | 15 x 8        | 268 KB |
| 4 | Attack4.png       | 1920 x 1024     | 15 x 8             | 15 x 8        | 251 KB |
| 5 | Attack5.png       | 1920 x 1024     | 15 x 8             | 15 x 8        | 221 KB |
| 6 | CrouchRun.png     | 1920 x 1024     | 15 x 8             | 15 x 8        | 262 KB |
| 7 | Die.png           | 1920 x 1024     | 15 x 8             | 15 x 8        | 346 KB |
| 8 | Die2.png          | 1920 x 1024     | 15 x 8             | 15 x 8        | 271 KB |
| 9 | Idle.png          | 1920 x 1024     | 15 x 8             | 15 x 8        | 198 KB |
| 10| Idle2.png         | 1920 x 1024     | 15 x 8             | 15 x 8        | 133 KB |
| 11| Run.png           | 1920 x 1024     | 15 x 8             | 15 x 8        | 264 KB |
| 12| TakeDamage.png    | 1920 x 1024     | 15 x 8             | 15 x 8        | 247 KB |
| 13| Taunt.png         | 1920 x 1024     | 15 x 8             | 15 x 8        | 247 KB |
| 14| WakeUp.png        | 1920 x 1024     | 15 x 8             | 15 x 8        | 273 KB |
| 15| Walk.png          | 1920 x 1024     | 15 x 8             | 15 x 8        | 289 KB |

**Roster by category:**
- **Locomotion (4):** Walk, Run, CrouchRun, Idle (+ Idle2 secondary idle)
- **Attacks (5):** Attack1, Attack2, Attack3, Attack4, Attack5 — a full melee combo set / varied strike animations
- **Hit reactions / death (3):** TakeDamage, Die, Die2
- **Spawn / flavor (3):** WakeUp (spawn-from-ground / rising), Taunt, Idle2

This is a complete, combat-ready enemy actor set: spawn (WakeUp), idles, full locomotion, a 5-move attack suite, damage reaction, and two death variants.

## Appearance & art direction (from Run.png and Attack1.png)

- **Subject:** A slim, lanky humanoid zombie rendered in a top-down / high-angle 3/4 (isometric-style) perspective, consistent with a twin-stick survivor/horde shooter (survivor.io-style).
- **Style:** Pre-rendered 3D model captured to 2D sprite frames (not hand-pixeled). Clean, smooth shading with a soft baked contact shadow beneath each frame (this is the "With shadow" variant).
- **Colorway:** Predominantly **pale tan / off-white skin** on the head and limbs, paired with **dark olive / khaki-brown clothing** (torn shirt and pants) — reads as a ragged "city" civilian-turned-zombie. Muted, desaturated earth-tone palette; small bright/yellowish highlights on the body. No bright costume accents.
- **Silhouette/pose:** In Run, the figure shows an exaggerated forward-leaning running gait with swinging limbs across the 15 frames; arms and legs cycle clearly. In Attack1, the figure winds up and lunges/swings (arm-forward striking poses), reading as a clawing/grabbing melee attack.
- **Gore level:** **Low to mild.** The figures are recognizably zombie (ragged clothing, shambling/aggressive posture) but at this render scale there is no visible blood spray, dismemberment, or exposed-viscera detail baked into the idle/run/attack frames. It is a "stylized mobile zombie" rather than a graphic-horror gore asset. (Die/Die2 sheets likely contain the most damage-state framing, but the locomotion/attack sheets are clean.)
- **Resolution / fidelity:** Each character occupies a **128 x 128 px cell**, but the actual rendered sprite fills only a fraction of the cell (small character footprint with generous transparent padding around it for motion headroom). Effective character resolution is modest — appropriate for small on-screen mobile enemies viewed at distance, not for close-up hero detail. 8-bit RGBA PNG with full alpha transparency.

## Technical notes

- **Format:** 8-bit/color RGBA, non-interlaced PNG, transparent background.
- **Consistency:** All 15 sheets are byte-for-byte identical in canvas geometry (1920x1024, 15x8 @ 128px), so a single uniform slicing rule (128px cells, 15 cols x 8 rows) drives every animation — easy to drive from one atlas configuration.
- **Directionality:** 8 baked directions means no runtime sprite rotation is needed; the engine selects a row by facing angle and steps columns by frame.


---
## 04_cityzombie3

# CityZombie 3 — Spritesheet Analysis

**Source:** `/tmp/envpack/anim/Animations/Spritesheets/With shadow/CityZombie 3/`
**Variant:** "With shadow" (each frame includes a baked drop-shadow under the character)
**Cell size:** 128 x 128 px

## Sheet roster, dimensions & grid

All 15 sheets are uniformly **1920 x 1024 px**.

- cols = 1920 / 128 = **15**
- rows = 1024 / 128 = **8**
- Grid interpretation: **15 frames x 8 directions** (8-way isometric facings; up to 15 animation frames per facing). Total 120 cells per sheet.

| Sheet | Dimensions (px) | Cols (frames) | Rows (dirs) | Cells |
|-------|-----------------|---------------|-------------|-------|
| Attack1.png    | 1920 x 1024 | 15 | 8 | 120 |
| Attack2.png    | 1920 x 1024 | 15 | 8 | 120 |
| Attack3.png    | 1920 x 1024 | 15 | 8 | 120 |
| Attack4.png    | 1920 x 1024 | 15 | 8 | 120 |
| Attack5.png    | 1920 x 1024 | 15 | 8 | 120 |
| CrouchRun.png  | 1920 x 1024 | 15 | 8 | 120 |
| Die.png        | 1920 x 1024 | 15 | 8 | 120 |
| Die2.png       | 1920 x 1024 | 15 | 8 | 120 |
| Idle.png       | 1920 x 1024 | 15 | 8 | 120 |
| Idle2.png      | 1920 x 1024 | 15 | 8 | 120 |
| Run.png        | 1920 x 1024 | 15 | 8 | 120 |
| TakeDamage.png | 1920 x 1024 | 15 | 8 | 120 |
| Taunt.png      | 1920 x 1024 | 15 | 8 | 120 |
| WakeUp.png     | 1920 x 1024 | 15 | 8 | 120 |
| Walk.png       | 1920 x 1024 | 15 | 8 | 120 |

> Note: 15 columns is the maximum frame allotment; shorter animations (e.g. Idle, Taunt) likely leave trailing columns blank/duplicated within a row. The grid (15x8) is consistent across every sheet, so a single uniform slicer (128px cells, 15 cols, 8 rows) works for the whole character.

## Full animation roster (15 animations)

- **Locomotion:** Walk, Run, CrouchRun
- **Idle/flavor:** Idle, Idle2, Taunt
- **Combat (offense):** Attack1, Attack2, Attack3, Attack4, Attack5 (5 attack variants)
- **Hit reaction:** TakeDamage
- **Death:** Die, Die2 (2 death variants)
- **Spawn/get-up:** WakeUp

## Character appearance (from Run.png and Attack1.png, zoomed 6x)

**Subject:** A humanoid "city" zombie — clearly a re-animated civilian rather than a monster. Reads as a slim adult human figure with a hunched, shambling posture typical of zombie locomotion (head lurched forward, arms reaching out in the attack/run poses).

**Outfit / silhouette:**
- **Top:** A **magenta / rose-pink** short-sleeve shirt or t-shirt — the dominant identifying color. Sampled palette: `#701030`, `#903050`, `#501020` (the shirt is the single most saturated element on the sprite).
- **Bottoms:** **Dark charcoal/black** trousers/jeans (`#000000`, `#202020`, `#101010`).
- **Waist:** A pale tan/khaki band at the waistline (`#908070`, `#807060`) — exposed midriff or a light belt/waistband where the shirt rides up.
- **Feet:** Dark **maroon/oxblood** shoes (the dark-red clusters at the feet).
- **Hair/head:** Brown hair (`#605040` range), small head, no hat.

**Colorway summary:** Magenta-pink + black + tan/khaki, on greyish desaturated zombie skin (`#b0b0a0`, `#908070`). A muted, semi-realistic palette — not cartoon-bright. The pink shirt is the one pop of color against an otherwise dark/neutral body.

**Gore level:** **Mild.** No dismemberment, exposed organs, or heavy splatter. Evidence of injury is limited to small **dark-red blood/wound accents** — on the hands (attack frames show red-tipped reaching fingers), and small red marks on the torso/face. In the sampled attack cell, ~11% of opaque pixels (56 of 524) fall in the saturated dark-red range, concentrated at the hands/wounds. Overall: a "freshly turned" civilian with bloodied hands rather than a rotting/mutilated corpse. This appears to be a tier/recolor in the CityZombie family (the "3" variant = pink-shirt colorway).

**Art style:** Pixel-art rendering of a 3D-style isometric character (pre-rendered look), top-down-ish 3/4 (isometric) camera, 8-directional. Hard-edged pixels (nearest-neighbor scaling preserves blocky steps). Soft grey baked drop-shadow beneath each frame (this is the "With shadow" set).

**Resolution / footprint:** 128 x 128 px cells, but the character only occupies a **small portion** of each cell. Measured non-transparent bounding boxes within sampled cells:
- Run, col7/row0: ~156 x 246 px of content
- Run, col7/row4: ~156 x 240 px
- Attack1, col7/row0: ~222 x 288 px (arms extended widens the box)
- Attack1, col9/row4: ~150 x 228 px

So the actual character art is roughly **150–290 px tall** across a 768px (6x) upscale, i.e. ~25–48 px tall at native resolution — a **small, low-resolution sprite** with generous transparent padding around it inside the 128px cell (padding accommodates wide attack/death poses and the shadow).

## Practical slicing notes

- Uniform slicer: **128 x 128**, **15 columns**, **8 rows**, origin top-left, no margin/spacing.
- Rows = directions (8-way). Determine facing order (commonly S, SW, W, NW, N, NE, E, SE) empirically from one sheet.
- Trim transparent padding per-frame at runtime (or pre-trim) since content is small and off-center within the cell; keep the baked shadow if using this "With shadow" set.


---
## 05_cityzombie4

# CityZombie 4 — Animation Sheet Analysis

## IMPORTANT: Target directory is EMPTY

The requested path:

```
/tmp/envpack/anim/Animations/Spritesheets/With shadow/CityZombie 4/
```

**contains 0 files.** It exists as an empty directory. All sibling "With shadow"
folders are populated (CityZombie 1, 2, 3, 5 each contain 15 PNG sheets), so the
"With shadow" build of CityZombie 4 appears to be **missing / not exported** in
this pack.

### Fallback source used
The **Shadowless** counterpart is fully populated and was analyzed in its place
so the asset could still be characterized:

```
/tmp/envpack/anim/Animations/Spritesheets/Shadowless/CityZombie 4/
```

All dimensions, grids, and visual descriptions below come from the Shadowless
sheets. The "With shadow" sheets, if/when present, would normally share the same
frame/direction grid and pose set (only adding a baked drop shadow), but this
could not be verified because those files do not exist.

---

## Animation roster (15 sheets, Shadowless/CityZombie 4)

| # | Sheet | Animation |
|---|-------|-----------|
| 1 | Attack1_Shadowless.png | Attack variant 1 |
| 2 | Attack2_Shadowless.png | Attack variant 2 |
| 3 | Attack3_Shadowless.png | Attack variant 3 |
| 4 | Attack4_Shadowless.png | Attack variant 4 |
| 5 | Attack5_Shadowless.png | Attack variant 5 |
| 6 | CrouchRun_Shadowless.png | Crouched run |
| 7 | Die_Shadowless.png | Death variant 1 |
| 8 | Die2_Shadowless.png | Death variant 2 |
| 9 | Idle_Shadowless.png | Idle variant 1 |
| 10 | Idle2_Shadowless.png | Idle variant 2 |
| 11 | Run_Shadowless.png | Run |
| 12 | TakeDamage_Shadowless.png | Take damage / hit reaction |
| 13 | Taunt_Shadowless.png | Taunt |
| 14 | WakeUp_Shadowless.png | Wake up / rise (spawn) |
| 15 | Walk_Shadowless.png | Walk |

Animation categories: 5 Attacks, 2 Deaths, 2 Idles, plus Run, Walk, CrouchRun,
TakeDamage, Taunt, WakeUp. This matches the standard "City Zombie" roster shared
across the CityZombie 1–5 set.

---

## Dimensions & grid (all 15 sheets identical)

`file` reports every sheet as:

```
PNG image data, 1920 x 1024, 8-bit/color RGBA, non-interlaced
```

Cell size: 128 px.

- **Columns** = 1920 / 128 = **15** → 15 animation frames
- **Rows**    = 1024 / 128 = **8**  → 8 facing directions
- **Cells per sheet** = 15 × 8 = **120**

So each sheet is a **15 frames × 8 directions** grid (8-way directional, full
360° in 45° steps; rows top→bottom step through the compass directions).

Per-sheet summary (all uniform):

| Sheet | Width | Height | Cols (frames) | Rows (dirs) |
|-------|-------|--------|---------------|-------------|
| Attack1..5 | 1920 | 1024 | 15 | 8 |
| CrouchRun | 1920 | 1024 | 15 | 8 |
| Die / Die2 | 1920 | 1024 | 15 | 8 |
| Idle / Idle2 | 1920 | 1024 | 15 | 8 |
| Run | 1920 | 1024 | 15 | 8 |
| TakeDamage | 1920 | 1024 | 15 | 8 |
| Taunt | 1920 | 1024 | 15 | 8 |
| WakeUp | 1920 | 1024 | 15 | 8 |
| Walk | 1920 | 1024 | 15 | 8 |

---

## Visual description (Read: Run, Attack1; cross-checked with Idle, Taunt)

**Subject / appearance**
- A single humanoid zombie — a civilian-styled "city" undead. Adult male
  proportions, **hunched and stooped** posture typical of a shambling/charging
  zombie; head juts forward of the shoulders.
- Wears **dark, full-body clothing**: a dark jacket/top and dark trousers that
  read as near-black. Exposed **lighter flesh tones** are visible at the head
  and hands, giving a pale-head / dark-body silhouette.
- No visible weapon — attacks are unarmed (lunging/swiping melee), consistent
  with the lurching arm poses in the Attack1 sheet.

**Style**
- **Pre-rendered 3D** sprites (rendered model captured to 2D frames), **not**
  hand-drawn pixel art. Smooth shaded forms with anti-aliased edges.
- Captured from a **top-down / high three-quarter (isometric-ish) angle**,
  rendered for all **8 compass directions** so the unit can face any way on a
  top-down play field.
- Transparent background (RGBA); this is the **Shadowless** variant so there is
  **no baked drop shadow** under the feet.

**Colorway**
- Low-saturation / near-monochrome: dominant **black-to-dark-grey** clothing,
  with muted desaturated **grey-tan flesh** highlights on head and hands.
  Overall a grim, desaturated dark palette with no bright accent colors.

**Gore level**
- **Low / minimal at this resolution.** No obvious blood pools, exposed wounds,
  bright red gore, or dismemberment are discernible in the downsampled sheets.
  The "zombie" read comes from posture and the pale head rather than visible
  gore. (Fine detail such as small wounds/stains cannot be ruled out — sprites
  occupy only a fraction of each 128 px cell and no per-frame crop tool was
  available in this read-only environment.)

**Resolution / fidelity**
- Sheet resolution is high (1920×1024) but each **character sprite occupies only
  a small portion of its 128 px cell** (roughly a third to half of the cell
  height), so effective on-screen character detail is modest. Frames are clean
  with smooth shading and crisp alpha edges.

---

## Notes / caveats
- Primary deliverable directory (`With shadow/CityZombie 4`) is **empty** — the
  shadowed sheets for this character do not exist in the pack. Flag for the
  asset owner: likely a missing export.
- Analysis performed READ-ONLY. Dimensions obtained via `file`; grid inferred
  arithmetically (width/128 × height/128). Visuals from the Read tool on the
  Run, Attack1, Idle, and Taunt sheets.
- No ImageMagick / ffmpeg available, so individual frames could not be cropped
  and upscaled; appearance notes are from the full (downsampled) sheets.


---
## 06_cityzombie5

# CityZombie 5 — Spritesheet Analysis (With shadow)

**Source directory:** `/tmp/envpack/anim/Animations/Spritesheets/With shadow/CityZombie 5/`

## Overview

- 15 animation sheets, all PNG (8-bit/color RGBA, non-interlaced).
- **Every sheet is uniformly 1920 × 1024 px.**
- Cell size: **128 × 128 px**.
- Grid for every sheet: **15 columns × 8 rows = 120 cells**.
  - **8 rows = 8 facing directions** (standard 8-way octant: down, down-left, left, up-left, up, up-right, right, down-right, etc.).
  - **15 columns = up to 15 animation frames** per direction (some animations may use fewer than 15 and pad/repeat the trailing cells).
- All sheets carry a baked-in soft drop **shadow** beneath each sprite (this is the "With shadow" variant).

## Per-sheet dimensions & inferred grid

| Sheet         | Dimensions (px) | Cols (w/128) | Rows (h/128) | Cells | Interpretation (frames × directions) |
|---------------|-----------------|--------------|--------------|-------|--------------------------------------|
| Attack1.png   | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| Attack2.png   | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| Attack3.png   | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| Attack4.png   | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| Attack5.png   | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| CrouchRun.png | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| Die.png       | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| Die2.png      | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| Idle.png      | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| Idle2.png     | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| Run.png       | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| TakeDamage.png| 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| Taunt.png     | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| WakeUp.png    | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |
| Walk.png      | 1920 × 1024     | 15           | 8            | 120   | 15 frames × 8 directions             |

All 15 sheets share identical geometry, so they can be sliced with a single 128px grid (15×8) without per-file special-casing.

## Full animation roster (15)

1. **Idle** — standing idle loop
2. **Idle2** — alternate/variant idle (lighter file weight, likely a subtler idle)
3. **Walk** — slow locomotion
4. **Run** — fast locomotion
5. **CrouchRun** — hunched/crouched fast locomotion
6. **WakeUp** — getting up / spawn-in (rise from ground)
7. **Taunt** — gesture/provoke
8. **TakeDamage** — hit reaction (flinch)
9. **Attack1** — melee attack variant 1
10. **Attack2** — melee attack variant 2
11. **Attack3** — melee attack variant 3
12. **Attack4** — melee attack variant 4
13. **Attack5** — melee attack variant 5
14. **Die** — death variant 1 (heavy blood spray)
15. **Die2** — death variant 2

Coverage: a complete enemy actor set — spawn (WakeUp), two idles, three locomotion modes (Walk/Run/CrouchRun), a taunt, a damage flinch, five distinct attacks, and two deaths.

## Character appearance (from Run.png + Attack1.png, plus Die.png for gore)

Sheets read at native resolution and inspected via per-cell crops upscaled 8× (nearest-neighbor) for detail.

- **Subject:** A bipedal humanoid **city/urban zombie** in a top-down 3/4 (isometric-ish) perspective, rendered hunched forward with a shambling, aggressive posture.
- **Sprite footprint:** Small within the 128px cell — a single standing frame occupies roughly a 27 × 46 px bounding box (centered, with the shadow extending below). The figure is small relative to the cell, leaving generous transparent margins.
- **Outfit / colorway:** Wears a **blue hooded top / hoodie-jacket** (dominant medium-blue, RGB ≈ 40–60 / 60–80 / 110–140) over **dark charcoal/black trousers**. The hood frames the head.
- **Skin / flesh:** Exposed head, arms and hands are a **pale gray-green rotting flesh tone** — clearly undead rather than living skin.
- **Gore level:** **Moderate to high.** Blood is visible as **dark-red smears on the hands, forearms and torso** in idle/attack/run poses. The **Die** animation escalates to a pronounced **red blood-spray / splatter particle burst** scattered around the body (death gibbing effect), making it the goriest frame in the set. Red pixels (RGB ≈ 32,0,0 / dark crimson) appear consistently in the opaque palette.
- **Overall palette (sampled, opaque pixels):** dominated by dark grays (≈32,32,32), near-black (0,0,0), dark blue (≈32,32,64 and 0,32,64) for the hoodie, gray-green flesh midtones, and crimson accents for blood.
- **Style:** Low-resolution **pixel-art look** (reads as small pre-rendered/down-rezzed 3D sprites). Limited palette, hard pixel edges when magnified, soft semi-transparent **drop shadow** baked beneath each frame. Mobile-game survivor/horde aesthetic (e.g. survivor.io-style top-down enemy art).
- **Resolution:** Per-frame art is **low-res** (effective character height only ~46 px inside a 128px cell). Sheets themselves are large (1920×1024) but that space is the 15×8 grid, not high per-sprite fidelity.

## Notes / caveats

- Column count (15) is the maximum frame budget; individual clips may animate fewer frames and leave trailing cells empty or duplicated. Exact active-frame counts per clip would require scanning each row for the last non-empty cell.
- "With shadow" denotes a baked shadow; a sibling shadowless variant set likely exists elsewhere in the pack for engines that render dynamic shadows.
- File sizes vary (Idle2 smallest at ~133 KB, Die largest at ~385 KB), tracking the amount of opaque/animated content (Die includes extra blood-spray pixels; Idle2 is sparse).


---
## 07_animated_tiles

# Animated Tiles — Spritesheet Analysis

Source pack: `/tmp/envpack/anim/`
Category: **Animated Tiles** (environment / world-object animations)

## Locations

- With shadow sheets: `/tmp/envpack/anim/Animations/Spritesheets/With shadow/Animated Tiles/`
- Shadowless sheets:  `/tmp/envpack/anim/Animations/Spritesheets/Shadowless/Animated Tiles/`
- Individual sprite frames: `/tmp/envpack/anim/Animations/Individual sprites/Animated Tiles/` (referenced in `/tmp/pack_all.txt`; per-frame PNGs are NOT present on disk in `/tmp/envpack`, only directory/listing entries exist)

## Sheet inventory

There are **4 distinct animations**, each provided as a "With shadow" sheet and a matching "_Shadowless" sheet (8 spritesheet files total).

| Animation | With-shadow file | Shadowless file | Dimensions | Bytes (shadow / shadowless) |
|---|---|---|---|---|
| Fire barrel | `Fire barrel.png` | `Fire barrel_Shadowless.png` | 1920 x 256 | 83,611 / 24,133 |
| Large Chest | `Large Chest.png` | `Large Chest_Shadowless.png` | 1920 x 256 | 208,095 / 86,474 |
| Small Chest Right | `Small Chest Right.png` | `Small Chest Right_Shadowless.png` | 1920 x 256 | 157,985 / 63,807 |
| Small Chest left | `Small Chest left.png` | `Small Chest left_Shadowless.png` | 1920 x 256 | 155,511 / 63,971 |

All eight sheets: **PNG, 8-bit/color RGBA, non-interlaced, 1920 x 256.**

## Grid inference

- Sheet width 1920, height 256.
- Each sheet shows **15 sprites laid out left-to-right in a single horizontal row**.
- 1920 / 15 = **128 px** -> **frame size = 128 x 256**, grid = **15 columns x 1 row = 15 frames**.
- Layout is a single strip (no second row). Frames read left -> right as the animation timeline.

### Note on frame count vs. listing
`/tmp/pack_all.txt` lists the per-animation `Individual sprites` folders with only ODD frame numbers `0001, 0003, ... 0029` (15 entries each). This implies the original source animation had **30 frames (0001–0030)**, and the listing is a sampled/decimated view (every other frame). The baked spritesheets, however, contain exactly **15 frames** each (one row of 128 px cells). So:
- Spritesheet playback = 15 frames/cell strip.
- Original authored animation ≈ 30 frames (per the individual-sprite naming).
The per-frame PNG files themselves are not extractable from this copy of the pack (only the sheets and the text listing exist locally).

## What each tile animates (identified by reading the sheets)

1. **Fire barrel** — A black/dark steel barrel (oil-drum style) with a **flickering orange-yellow flame** burning on top. The 15 frames cycle the flame shape/height to give a looping fire-flicker effect (a lit brazier / burning barrel prop). The barrel body is static; only the flame animates. Shadowless version is identical minus the ground shadow ellipse.

2. **Large Chest** — A wooden/brown **treasure chest opening animation**. Frames progress from a **closed lid** through the lid hinging open to **fully open**, revealing the interior. This is a one-shot "open" sequence (can be played forward to open, reversed to close), not a continuous loop.

3. **Small Chest Right** — A smaller **green/olive treasure chest, right-facing isometric**, opening sequence. Lid lifts to expose a **blue/teal interior**. Same closed -> open progression as the large chest, smaller footprint.

4. **Small Chest left** — Same small green/olive chest open animation, **mirrored to the left-facing isometric orientation**. Closed -> lid up -> open, blue/teal interior.

## Summary of animated environment tiles present

- **Flickering fire prop:** 1 (Fire barrel — looping flame on a steel drum).
- **Openable treasure chests:** 3 (1 large brown chest + 2 small green chests, left- and right-facing variants), each a closed→open lid sequence.

No water, blood-pool, electrical/spark, or flickering-light tiles are present in this category — the "Animated Tiles" set consists of a burning barrel and opening loot chests. All assets are isometric, RGBA, 128x256 per frame, 15 frames per strip, available with and without baked ground shadows.


---
## 08_shadow_compare

# Spritesheet Variant Comparison: "With shadow" vs "Shadowless"

Source root: `/tmp/envpack/anim/Animations/Spritesheets/`
Cross-reference listing: `/tmp/pack_all.txt`
Date: 2026-06-19

## 1. Summary / Recommendation

Both variants ship the **same 7 subfolders**, the **same animation set**, and **byte-for-byte identical frame dimensions** (e.g. character sheets are 1920 x 1024, tile sheets 1920 x 256). The only pixel-level difference is that **"With shadow" has a dark elliptical drop shadow baked into every frame**, fused with the character into one dark mass, whereas **"Shadowless" stores the clean character sprite on full alpha transparency with no shadow**.

**Recommendation: use the "Shadowless" variant.** For a top-down game where we draw our own ground and our own shadows, a baked shadow is a hard liability — it cannot be repositioned, recolored, softened, or removed; it double-shadows against our own shadow blob; and it darkens/contaminates the alpha edges of the sprite. Shadowless gives us a clean cutout that composites correctly over any ground tile and lets us render a runtime blob/projected shadow under full art-direction control. Shadowless is also the more complete set on disk (see caveat below).

## 2. Folder count confirmation

Both top-level variant folders exist and contain the **same 7 subfolders**:

| Subfolder       | In Shadowless | In With shadow |
|-----------------|:-------------:|:--------------:|
| Animated Tiles  | yes           | yes            |
| CityZombie 1    | yes           | yes            |
| CityZombie 2    | yes           | yes            |
| CityZombie 3    | yes           | yes            |
| CityZombie 4    | yes           | yes (EMPTY)    |
| CityZombie 5    | yes           | yes            |
| Survivor        | yes           | yes            |

Folder structure matches. **File counts do NOT fully match**, see below.

## 3. File-count detail (from disk AND /tmp/pack_all.txt — they agree)

Clean PNG counts (matched between `find` on disk and `*.png$` lines in `pack_all.txt`):

| Variant      | PNG files |
|--------------|:---------:|
| Shadowless   | **99**    |
| With shadow  | **84**    |

Per-subfolder file counts:

| Subfolder       | Shadowless | With shadow |
|-----------------|:----------:|:-----------:|
| Animated Tiles  | 4          | 4           |
| CityZombie 1    | 15         | 15          |
| CityZombie 2    | 15         | 15          |
| CityZombie 3    | 15         | 15          |
| CityZombie 4    | 15         | **0 (empty)** |
| CityZombie 5    | 15         | 15          |
| Survivor        | 20         | 20          |
| **Total**       | **99**     | **84**      |

**Caveat / data finding:** The 99 vs 84 gap (exactly 15 files) is entirely due to **`With shadow/CityZombie 4/` being empty** — the directory exists but contains no PNGs, both on disk and in `pack_all.txt`. Every other folder matches exactly, 1:1. So aside from that one missing folder's contents, the two variants are a complete mirror of each other. If CityZombie 4 with a baked shadow is ever needed, it is simply absent from this pack; the Shadowless CityZombie 4 (15 frames) is present and intact.

(Note: raw `grep -c` over `pack_all.txt` returns 106 vs 91 because the listing also includes one directory-header line per subfolder. Filtering to lines ending in `.png` yields the true 99 vs 84.)

## 4. Filename convention difference

- **Shadowless** files carry a `_Shadowless` suffix, e.g. `CityZombie 1/Run_Shadowless.png`.
- **With shadow** files have no suffix, e.g. `CityZombie 1/Run.png`.

Stem names and folder layout otherwise correspond 1:1, so the variants can be matched programmatically by stripping `_Shadowless`.

## 5. Dimensions are identical

Verified with `file` across multiple matched sheets — all MATCH:

| Sheet                         | Shadowless     | With shadow    | Result |
|-------------------------------|----------------|----------------|--------|
| CityZombie 1/Run              | 1920 x 1024    | 1920 x 1024    | MATCH  |
| CityZombie 1/Walk             | 1920 x 1024    | 1920 x 1024    | MATCH  |
| CityZombie 1/Attack1          | 1920 x 1024    | 1920 x 1024    | MATCH  |
| Survivor/Run                  | 1920 x 1024    | 1920 x 1024    | MATCH  |
| Survivor/Idle                 | 1920 x 1024    | 1920 x 1024    | MATCH  |
| Animated Tiles/Large Chest    | 1920 x 256     | 1920 x 256     | MATCH  |

All are 8-bit/color **RGBA**, non-interlaced PNG. Frame grid is identical (character sheets read as a 15-column x 8-row layout with matching poses per cell). Because dimensions and grid match, the same atlas slicing / frame-index logic works for either variant with no code change.

## 6. Visual difference (Read tool, sampled sheets)

Sampled `CityZombie 1/Run` and `Survivor/Idle` in both variants:

- **With shadow:** Each frame renders the character **plus a baked dark drop shadow** directly under/around it. At sheet scale the character and its shadow merge into a single near-solid dark blob; the shadow is part of the opaque pixel data and part of the sprite's alpha footprint.
- **Shadowless:** Each frame is the **clean character cutout only** — lit/colored sprite (you can make out armor/skin/weapon tones) sitting on fully transparent background with **no ground shadow** at all.

Corroborating signal: identically-dimensioned "With shadow" PNGs are roughly **2.2x larger on disk** than their Shadowless twins (e.g. CityZombie 1/Run: 261,590 vs 112,379 bytes; Survivor/Run: 262,614 vs 119,985 bytes), consistent with the extra baked-in opaque shadow pixels.

## 7. Why Shadowless wins for a top-down, self-shadowed game

1. **No double shadows.** We draw our own shadow blob/projection; a baked shadow would stack on top of it, producing an obvious dark smear under every entity.
2. **Art-direction control.** Runtime shadows can be offset by light direction, scaled by entity height, softened, tinted, faded by depth, or disabled (e.g. indoors / on water). A baked shadow is frozen — wrong angle, wrong softness, fixed opacity, always present.
3. **Clean compositing over any ground.** A baked elliptical shadow assumes a flat neutral floor. Over our own varied ground tiles it reads as a hard dark patch and breaks on slopes, edges, water, and decals.
4. **Tighter, cleaner alpha.** Shadowless edges are the character silhouette only, so hit-flash/outline/tint shaders, recoloring, and silhouette-based effects act on the character — not on a shadow halo. Selection outlines and palette swaps stay clean.
5. **Smaller footprint.** ~2x smaller PNGs => less VRAM / atlas pressure for the same animations.
6. **Completeness.** Shadowless is the more complete set here (99 vs 84 files); `With shadow/CityZombie 4` is empty, so choosing "With shadow" would also mean missing an entire enemy variant's frames.

The only situation favoring "With shadow" is a quick prototype with no shadow system of its own — not our case.


---
## 09_grid_format

# Spritesheet Grid Format — "With shadow" pack (Survivor + CityZombie 1–5)

Source root: `/tmp/envpack/anim/Animations/Spritesheets/With shadow/<Char>/*.png`

## TL;DR

- **Cell size:** 128 × 128 px (uniform).
- **Grid:** **15 cols × 8 rows** for every character sheet (1920 × 1024 px).
- **Columns = frames per direction = 15.** **Rows = directions = 8.** Confirmed 8 distinct facings by reading the sheets.
- **Row → direction order (top → bottom, clockwise):** `E, SE, S, SW, W, NW, N, NE`.
- **All character anims are the same size** (1920×1024 = 15×8). No per-anim width/frame-count variation. (The only non-1920×1024 PNGs in the whole "With shadow" tree are 4 prop sheets under `Animated Tiles/`, which are 1920×256 = 15×2 — not characters.)

## Dimensions measured (`file`)

All 20 Survivor sheets and all 15 sheets each of CityZombie 1/2/3/5:
`PNG image data, 1920 x 1024, 8-bit/color RGBA, non-interlaced`.

- **CityZombie 4 is an EMPTY directory** (no PNGs).
- Full-tree scan of all 84 PNGs under "With shadow":
  - 80 × `1920 x 1024`  (all character sheets)
  - 4 × `1920 x 256`    (`Animated Tiles/`: Large Chest, Small Chest left, Small Chest Right, Fire barrel — props, not characters)

Per character (each PNG is 1920×1024):
- Survivor (20): Attack1–4, AttackRun, CrouchAttack, CrouchIdle, CrouchRun, Die, GunFire, Idle, Idle2, Run, RunBackwards, RunBackwardsAttack, StrafeLeft/Right(+Attack), Taunt
- CityZombie 1/2/3/5 (15 each): Attack1–5, CrouchRun, Die, Die2, Idle, Idle2, Run, TakeDamage, Taunt, WakeUp, Walk

## Grid math

- cols = 1920 / 128 = **15**
- rows = 1024 / 128 = **8**
- 15 × 8 = 120 cells per sheet.

## Direction count & row order (verified visually)

Read `Survivor/Run.png`, `Survivor/Idle.png`, and `Survivor/GunFire.png` by cropping column 0 (and a mid-frame) of each of the 8 rows, upscaled. The character carries a rifle, so the barrel/aim — and for GunFire, the orange muzzle flash — unambiguously indicates facing. Going down the rows the facing rotates a steady 45° clockwise:

| Row | Facing | Evidence (gun/aim/muzzle) |
|-----|--------|----------------------------|
| 0 | **E**  (right)      | barrel points right |
| 1 | **SE** (down-right) | barrel points down-right |
| 2 | **S**  (toward cam) | seen front/below, barrel low/forward |
| 3 | **SW** (down-left)  | barrel points down-left |
| 4 | **W**  (left)       | barrel points left |
| 5 | **NW** (up-left)    | barrel points up-left |
| 6 | **N**  (away)       | seen from behind, barrel up/away |
| 7 | **NE** (up-right)   | barrel points up-right |

=> **8 directions**, full set stored (no mirroring needed), clockwise starting at East: `E, SE, S, SW, W, NW, N, NE`.

## Comparison to our existing slicer

Existing code: `/home/user/survivor.io/src/game/zombieSprite.ts`
```
const COLS = 15;
const ROWS = 5;            // stored directions: 0=E 1=SE 2=S 3=N 4=NE
export const ORIG_CELL = 64; // source cell size before trimming
const DIR5  = [0,1,2,1,0,4,3,4];                 // 8-dir -> stored row
const FLIP5 = [false,false,false,true,true,true,false,false];
```

Important nuance: that code does **NOT** consume raw source sheets like this pack. It reads a **pre-processed** asset set (`public/assets/sprites/zombies/`) that was already (a) downscaled so the cell is **64 px**, (b) alpha-trimmed to the figures' bounding box, and (c) reduced to **5 stored rows** (E, SE, S, N, NE) with W/SW/NW reconstructed at runtime by horizontal mirroring. The "E, SE, S, N, NE" order quoted in the task is that *5-row reduced* order, not a raw-sheet order.

The task framed the reference as a hypothetical **COLS=15, ROWS=8, 128px** slicer with row order **E, SE, S, N, NE…**. Against THIS pack:

- **Geometry — MATCHES:** 15 columns, 128 px cells, 1920-px width, uniform across anims. The raw cell pitch is 128 px (the engine's 64 px is a post-downscale value).
- **Row count — DIFFERS in intent:** this pack has a full **8 rows = 8 directions**; the engine stores **5**. A plain 15×8/128px slicer would read all 8 rows fine, but our pipeline expects 5.
- **Row → direction order — DIFFERS:** this pack is clockwise `E, SE, S, SW, W, NW, N, NE`. The reference `E, SE, S, N, NE` is NOT this pack's row order (it skips SW/W/NW and puts N in slot 3). So a slicer hard-coded to map row index → that 5-entry order would mis-assign facings.

### Verdict
A generic **15×8, 128px** grid slicer drops straight in on the geometry. But it does **NOT** match our existing zombie pipeline as-is, because that pipeline (1) works on 64px trimmed cells, not 128px raw, and (2) assumes 5 stored rows in `E,SE,S,N,NE` order. To use this raw pack you'd slice 15×8 @128px and map rows directly with the order `E,SE,S,SW,W,NW,N,NE` (all 8 present, no mirroring needed) — i.e. a different row map than `DIR5`, and you'd add the trim/downscale step if feeding the existing renderer.

## Notes / caveats
- CityZombie 4 has no sheets — skip or source elsewhere.
- `Animated Tiles/` holds 15×2 (1920×256) prop animations — different format, handle separately.
- Frame *count* per anim is the grid width (15 columns); whether all 15 columns are non-empty for short anims (e.g. Idle/Die) was not exhaustively checked, but the canvas is always 15 wide. Trailing columns may be transparent padding for shorter clips.


---
## 10_effects

# Effect Animations Analysis — `/tmp/envpack/anim/Animations/Effects/`

## Overview

| Asset    | Type                  | Frames | Per-frame dims | Format          |
|----------|-----------------------|--------|----------------|-----------------|
| Blood1   | Frame sequence (PNGs) | 15     | 128 x 128      | 8-bit RGBA      |
| Blood2   | Frame sequence (PNGs) | 15     | 128 x 128      | 8-bit RGBA      |
| Blood3   | Frame sequence (PNGs) | 15     | 128 x 128      | 8-bit RGBA      |
| Blood4   | Frame sequence (PNGs) | 15     | 128 x 128      | 8-bit RGBA      |
| Blood5   | Frame sequence (PNGs) | 15     | 128 x 128      | 8-bit RGBA      |
| GunFire  | Sprite SHEET (1 PNG)  | ~128 cells | 1920 x 1024 | 8-bit RGBA      |

- 5 blood effects, each a sequence of 15 individually-numbered PNG frames.
- Frame files are named `0001.png, 0003.png, 0005.png … 0029.png` (odd numbers, step of 2 → 15 files). The naming implies the source was a 30-frame (or "2s skip") render exported at every other frame.
- All blood frames verified uniformly **128 x 128, 8-bit/color RGBA, non-interlaced** (checked first, mid, and last frames of every folder).
- GunFire is a single **1920 x 1024** RGBA sheet (NOT a sequence).

## Per-effect descriptions

### Blood1 — directional spray → settling splatter
- **0001 (early):** a single small, compact dark-red blob near center (impact point).
- **0015 (mid):** blood throws upward/outward — a horizontal arc of dark-red droplets with a faint grey/desaturated secondary spray (looks like bone/dust or a fading mist component). Reads as an impact spray jetting away from the hit.
- **0029 (late):** disperses into a wide field of scattered droplets and a denser clump low-center — i.e. spray that has spread out and started settling into a loose splatter pattern.
- Character: **blood spray / spatter burst** with directional motion.

### Blood2 — small spatter burst
- **0001 (early):** tiny tri-lobe dark-red speck at center (just the seed of the hit).
- **0017 (mid):** expands into a small, tight cluster of red streaks/droplets around center-left — a modest spatter burst. Smaller spatial footprint than Blood1.
- Character: **compact spatter burst**, good for a light/small hit.

### Blood3 — wide horizontal spray streak
- **0001 (early):** small red dot, center.
- **0017 (mid):** stretches into a broad, thin horizontal smear/streak of droplets running left-to-right across the lower-mid of the frame — reads as blood flung sideways (a swipe or graze spray).
- Character: **horizontal spray streak / fling** — the most "linear/directional" of the set.

### Blood4 — heavy central splatter (biggest/densest)
- **0001 (early):** small red blob, center.
- **0017 (mid):** the largest, most opaque mass of the five — a dense dark-red splatter clump filling much of the lower-center with solid coverage and ragged edges.
- Character: **heavy splatter / large hit or death gore**. Best candidate for a kill/death impact because of its mass and opacity.

### Blood5 — scattered droplet burst (widest dispersal)
- **0001 (early):** small red blob, center.
- **0017 (mid):** explodes into many small, well-separated droplets scattered widely across the frame (diagonal scatter, lower-left to right) — a fine particulate burst rather than a solid mass.
- Character: **dispersed droplet burst / fine spatter** — good for a "pop" of many small flecks.

### Visual summary of the 5
All five are the **same colorway**: a single dark crimson / maroon red (no bright arterial highlights, no pink rim), on full transparency. They differ mainly in **shape and dispersal pattern**:
- Blood1 = directional spray that settles
- Blood2 = small tight burst
- Blood3 = sideways streak
- Blood4 = big dense splatter (heaviest)
- Blood5 = wide fine-droplet scatter

This variety (5 distinct silhouettes) is exactly what you want to avoid repetitive-looking hits.

## GunFire.png — muzzle-flash SPRITE SHEET
- **1920 x 1024**, single RGBA PNG. It is a **flipbook/sprite sheet**, NOT a standalone image.
- Contents: a grid of many small **muzzle-flash** puffs — yellow / orange / warm-white bursts with a soft, fiery, slightly star/cone shape and some directional "kick" to the right on several cells. Particle/grainy look (fire + sparks).
- Grid: laid out roughly **16 columns x 8 rows** (= ~128 cells) of individual flash frames. Each cell is approximately **120 x 128 px** (1920/16 ≈ 120, 1024/8 = 128). Each row appears to be one animation variant/sequence of a flash igniting and fading; multiple rows = multiple flash variations.
- Colorway: warm muzzle-flash palette (white-hot core → yellow → orange edges), transparent background. Reads correctly as a gunshot flash.

## Usefulness as HD impact FX in a top-down game

### Blood (zombie hit / death) — HIGHLY USABLE
- **Resolution:** 128 x 128 per frame is solid for a top-down hit effect where the FX is small on screen. It is "HD enough" for per-hit blood; for a giant boss-death gore burst you'd want larger, but for standard zombie hits/deaths it is appropriate.
- **Format:** clean RGBA with full alpha → drops straight onto sprites; can be tinted/recolored if a different blood color is ever needed.
- **Frame count:** 15 frames is plenty for a quick 0.2–0.4s impact; play once and destroy.
- **Variety:** 5 distinct patterns let you randomize per hit (e.g. Blood2/Blood5 for normal hits, Blood4 for kills, Blood1/Blood3 for directional/grazing hits) — kills visual repetition.
- **Integration note:** these are pre-rendered frame sequences, so in-engine you'd either pack them into a sheet/animation clip or play the numbered sequence via a flipbook component. The odd-number/step-2 naming (0001,0003,…) must be handled (don't assume contiguous numbering).
- **Caveat:** all one dark-maroon color — fine for blood, but no built-in "fresh vs old" or arterial variety beyond shape; recolor/tint at runtime if needed. No persistent ground-pool frame (these are airborne bursts/spatter, not a spreading pool that stays), so for a lingering blood decal on the floor you'd capture/use a late frame as a static decal rather than relying on the animation.

### GunFire (muzzle flash on player fire) — HIGHLY USABLE, IDEAL FORMAT
- Already a **sprite sheet**, which is the preferred runtime format for a muzzle flash (cheap, one texture, flipbook UV-scroll).
- Warm white/yellow/orange flash reads perfectly for a gun in a top-down view; mount at the barrel tip, orient to aim direction, play one row per shot (and randomize the row for variety).
- 1920 x 1024 gives crisp HD flashes; each ~120x128 cell is large enough to look sharp even when scaled.
- **Integration note:** you must know/define the exact rows x cols and per-cell size to slice it (estimated **16 x 8**, ~120 x 128 per cell). Confirm by importing and slicing, since a couple of edge cells look faint/partial.

## Bottom line
- **5 blood effects**, 15 frames each, 128x128 RGBA, dark-crimson, five distinct dispersal shapes (spray, small burst, streak, heavy splatter, fine scatter) — very usable for zombie hit/death FX, randomize per hit; pack the numbered (step-2) sequences into clips.
- **GunFire** is a **1920x1024 muzzle-flash sprite sheet** (~16x8 grid of warm flash frames), the ideal format for player-fire flashes — slice and flipbook it.


---
## 11_ground

# Ground Floor Tiles — Analysis

Source: `/tmp/envpack/iso/Isometric Tiles/Ground {A–E}{n}_{N,E,S,W}.png`
Samples read: `_S` (south-facing) variants — one+ per group.

## Inventory & Dimensions

| Group | Count (per direction) | _S files |
|-------|----------------------|----------|
| Ground A | A1–A7 (7) | 7 |
| Ground B | B1–B8 (8) | 8 |
| Ground C | C1 (1) | 1 |
| Ground D | D1 (1) | 1 |
| Ground E | E1 (1) | 1 |
| **Total** | **18 tiles** | 18 `_S` |

Each tile ships in 4 rotations (`_N _E _S _W`) → 72 PNGs total in the Ground set.

- **Canvas:** every Ground `_S` is **128 × 256** px, 8-bit RGBA.
- **Actual art:** opaque pixels occupy only **y ≈ 176–255** (bottom ~80 px). The top **~176 px is empty transparent padding** (tall canvas reserved for stacking/wall height in the isometric set).
- **Top face geometry:** standard **2:1 isometric diamond** — apex centered at x≈63, full **128 px** width at the equator (y≈207), bottom apex at y≈255. Below the equator the extruded **front/side walls** (the block's "height") are visible (~32 px of side wall).

## Surfaces (what each group is)

- **Ground A — dark COBBLESTONE / paver setts.** Charcoal-grey square/blocky stones with grout lines and per-stone tonal variation (A1 = clean grid; A4 = irregular weathered setts; A7 = setts with a small inset patch/manhole detail). Reads as old stone-block street paving.
- **Ground B — black ASPHALT / ROAD, the markings family.** Fine-grain matte black asphalt top. This is the road-marking set:
  - B1 = plain blank asphalt
  - B2 = asphalt with **double yellow center lines**
  - B4 = asphalt with a single light/white edge stripe
  - B6 = asphalt with a small inset detail (drain/marker stud)
  - B8 = asphalt with a **curved white corner/lane line**
  - (B3,B5,B7 = additional marking variants — white lane lines / dashes)
- **Ground C — CHECKERBOARD / tiled concrete.** Light-and-dark grey alternating large squares (plaza / checker-tile floor look). Glossier than A.
- **Ground D — DIRT / soil.** Dark reddish-brown speckled granular dirt, no markings. Rough natural ground.
- **Ground E — CONCRETE / weathered slab.** Dark brown-grey smooth concrete with subtle horizontal scoring/cracks. Plain solid pavement.

**Distinct surface materials = 5** (cobblestone, asphalt-road, checker-tile, dirt, concrete). No grass/sidewalk-curb tile in this set. Variety within a group is mostly road markings (B) and stone-pattern variation (A).

## Top-face usability for a TOP-DOWN arena

- These are **3D extruded blocks**, NOT flat ground sprites. As-is they show a diamond top **plus** ~32 px of front/side wall — placing them flat in a top-down view would look blocky and show fake height/shadow at tile edges.
- However the top face is a **clean, regular 2:1 iso diamond** (un-rotated apex-centered, 128 px wide). It is **un-skewable**: a deterministic inverse-iso transform (shear + 2× vertical scale, or `transform(AFFINE)` per the apex/equator coords above) recovers a flat **128 × 128** top-down square texture per tile. The textures themselves (asphalt grain, cobble grid, dirt speckle) are detailed and tileable enough to look good flat.
- The yellow/white road markings on B run along the diamond axes, so after un-skew they become clean straight/curved lines on a square — usable for road decals.

## Recommendation

For a top-down arena, **do NOT drop these blocks in as-is** (the visible extruded sides break the top-down illusion).

Ranked options:
1. **Un-skew the top faces (recommended).** Inverse-iso the diamond into flat 128×128 squares for a small set: take **B1 (asphalt base)** as the primary arena floor, plus **A1 (cobble)**, **E1 (concrete)**, **D1 (dirt)**, **C1 (checker)** as zone variants, and the **B2/B4/B8** markings as straight/edge/corner road decals. Cheap, gives a cohesive matte asphalt arena that matches the rest of this iso pack's art style, and reuses existing detail. Tiling needs an edge check (designed for iso seams, not 4-way wrap) — blend/overlap or detile if a visible repeat appears.
2. **Custom asphalt texture** — only if you want seamless 4-way tiling and exact color control beyond what un-skewing gives. More work; loses the pack's matching grain/markings.
3. **Use blocks as-is** — only viable if the camera is actually isometric, not pure top-down. Not recommended for a flat arena.

**Bottom line:** best value is option 1 — un-skew ~5 top faces (asphalt B1 as the main floor) + the B-series markings as decals. 128 px source, output 128×128 flat tiles. 5 distinct surfaces available; no grass.


---
## 12_structural

# Structural Iso Tiles — Catalog & Top-Down Usability

Source: `/tmp/envpack/iso/Isometric Tiles/`
Scope: Structural groups — Roof A/B, Ramp A, Stairs A, WallHalf A/B, WallSurface A/B, WallDetail, Pillar A.
Method: dims via `file`; ~14 representative `_S` (south-facing) samples read as images.

## Naming convention note
There is no separate "_S structural set." Every tile ships in 4 directional orientations:
`_E / _N / _S / _W`. The task's "_S variants" = the **South-facing render** of each tile.
All samples below are the `_S` orientation. Other orientations are the same asset rotated.

## Universal dimensions
**Every** structural tile is **128 x 256 px** (PNG, RGBA). This is a classic 2:1 isometric
footprint (128-wide diamond) on a **double-height (256) canvas** so vertical geometry — walls,
pillars, roof thickness, stair rise — can extend upward above the ground diamond. Confirmed
identical across all 31 base tiles checked (Roof, Ramp, Stairs, WallHalf, WallSurface, WallDetail, Pillar).

---

## Group-by-group

### Roof A* (A1–A3) — 128x256
- **What:** Low, flat slab "roof/platform" blocks rendered as solid 3D isometric boxes. A1 reads as
  a stepped/low curb-like dark block; the slab sits on a visible vertical side face.
- **Read:** Pure isometric 3D — top diamond + extruded side wall with directional shading. The
  thickness and side face only make sense at the iso camera angle.
- **Verdict:** **decorative-only** for top-down. Could pass as a flat dark floor/roof patch if the
  side skirt is cropped, but as-is the extrusion breaks a true top-down view.

### Roof B* (B1) — 128x256
- **What:** A ribbed/corrugated roof slab (parallel groove texture across the top face) on a
  thin extruded base. More clearly a "roof panel" than Roof A.
- **Read:** Isometric 3D slab; the corrugation lines run along the iso axes.
- **Verdict:** **decorative-only**. The ribbed top texture is attractive and the profile is shallow,
  so a cropped top face could serve as a top-down roof/metal-deck tile, but the 3D edge is visible.

### Ramp A* (A1–A3) — 128x256
- **What:** Sloped inclined surfaces (a flat plane tilted along the iso axis), used to connect
  height levels. Read as a large angled quad of tiled stone.
- **Read:** **Strongly isometric** — the entire asset is a perspective slope. Almost no usable
  flat footprint; it is essentially a tilted plane that only resolves as a ramp at the iso angle.
- **Verdict:** **skip for top-down.** A slope conveys nothing in a true top-down projection; it
  would look like a stretched/skewed floor blob.

### Stairs A* (A1–A3) — 128x256
- **What:** Stepped staircases — explicit individual treads/risers climbing diagonally, with a
  solid side wall.
- **Read:** **Strongly isometric 3D.** The stepped silhouette and side wall are the whole point and
  exist only in the iso projection.
- **Verdict:** **skip for top-down.** Steps don't read top-down (you'd just see stacked lines);
  pure iso structure.

### WallHalf A* / B* (A1–A2, B1–B2) — 128x256
- **What:** Half-height wall segments — short rectangular wall "bricks" standing on a tile.
  A = brown/stone, B = grey/concrete tone. Solid blocks with two visible vertical faces + a top.
- **Read:** **Pure isometric 3D wall.** Two lit/shaded side faces and a top cap; clearly a standing
  vertical wall.
- **Verdict:** **decorative-only / skip.** A standing wall has essentially no useful top-down
  footprint (top-down would show only the thin top edge). Use as iso scenery, not top-down.

### WallSurface A* / B* (A1, B1) — 128x256
- **What:** A single flat **wall face / cladding panel** (one vertical plane of tiled stone), no
  thickness box — just the surface. A = brown stone, B = grey concrete.
- **Read:** A flat textured **parallelogram** (the iso-projected vertical face). It is a 2D-ish skin
  rendered at the iso skew.
- **Verdict:** **decorative-only.** Because it's a flat textured quad, the texture itself is reusable,
  but the parallelogram skew reads as a wall seen from the side, not a top-down surface. Could be
  re-projected/squared into a top-down wall texture in an editor, but not drop-in usable.

### WallDetail* (2–11) — 128x256
- **What:** Small wall-mounted **props / fixtures** on (mostly transparent) canvas — e.g. WallDetail 2
  is a tiny vent/window; WallDetail 7 is a bright magenta/purple+red panel (vent/grate or graffiti/
  decal, possibly an emissive or placeholder-tinted detail). Sparse — most of the 128x256 frame is
  empty alpha with one small object.
- **Read:** Mixed. Objects are small and roughly front-facing; the iso skew is mild because they're
  tiny. Some (the magenta one) look like accent/emissive decals.
- **Verdict:** **decorative-only.** As small standalone accent sprites they can be reused as top-down
  detail props/decals (vents, hatches, markings), but they are meant to attach to iso walls and
  several have odd/placeholder coloring (bright magenta). Cherry-pick individually.

### Pillar A* (A1–A6) — 128x256
- **What:** Vertical columns/posts. A1 is a tall slender pillar (cap + shaft + base) standing upright;
  A4 is a broken/rubble cluster of pillar chunks. Brown stone.
- **Read:** **Tall isometric 3D columns** — the vertical extent (a thin tall sprite up the 256 canvas)
  is the defining feature and only makes sense standing up in iso.
- **Verdict:** **skip for top-down.** A standing pillar shows only a small cap dot from directly above;
  pure iso scenery. (Broken variants like A4 could maybe be a rubble pile decal, but weak.)

---

## Summary verdict table

| Group        | Variants | Dims     | Reads as          | Top-down verdict        |
|--------------|----------|----------|-------------------|-------------------------|
| Roof A       | A1–A3    | 128x256  | iso 3D slab/box   | decorative-only         |
| Roof B       | B1       | 128x256  | iso 3D ribbed slab| decorative-only         |
| Ramp A       | A1–A3    | 128x256  | iso slope plane   | skip for top-down       |
| Stairs A     | A1–A3    | 128x256  | iso 3D stepped    | skip for top-down       |
| WallHalf A/B | A1–2,B1–2| 128x256  | iso 3D wall block | decorative-only / skip  |
| WallSurface A/B | A1,B1 | 128x256  | iso flat wall face| decorative-only         |
| WallDetail   | 2–11     | 128x256  | small wall props  | decorative-only (cherry-pick) |
| Pillar A     | A1–A6    | 128x256  | tall iso column   | skip for top-down       |

**Overall:** This is a **pure-isometric structural kit** (walls, columns, ramps, stairs, roofs) on a
uniform 128x256 / 2:1 double-height canvas, designed for a fixed iso camera. **None are drop-in
usable for true top-down** scenery. Best reuse for a top-down game = harvest **flat textures**
(WallSurface panels, Roof B corrugation, Roof A top faces) by cropping/re-squaring, and **small
WallDetail props** as decals. Ramp, Stairs, Pillar, and standing WallHalf blocks should be skipped —
their geometry only reads at the iso angle.


---
## 13_survivor_individual

# Survivor — Individual Sprites Catalog

Source: `/tmp/pack_all.txt` (full listing; frames analyzed from path strings only, not extracted).
Root: `Animations/Individual sprites/Survivor/`

## File / entry accounting (the "2581")

The 2581 figure counts **directory lines plus PNG lines** in the listing, not just images:

| Entry type | Path depth (`/`-segments) | Count |
|---|---|---|
| `Survivor` parent folder line itself | 3 | 1 |
| Animation subfolder lines (`.../Survivor/<Anim>`) | 4 | 20 |
| Direction subfolder lines (`.../<Anim>/<Dir>`) | 5 | 160 (= 20 × 8) |
| Actual PNG frame files (`.../<Anim>/<Dir>/<file>.png`) | 6 | 2400 (= 20 × 8 × 15) |
| **Total listing entries under (and incl.) Survivor** | | **2581** |

- `grep -F "Animations/Individual sprites/Survivor/"` (trailing slash) returns **2580** — it excludes the bare `Survivor` folder line (line 13608). Add that one line → **2581**.
- **Actual sprite frames: 2400 PNGs.**

## Directory layout

**anim → direction → frame** (3-level), e.g.:
```
Survivor/Attack1/E/Attack1_0_001.png
Survivor/<Anim>/<Direction>/<Anim>_<angle>_<NNN>.png
```
Filename encodes the animation name, a direction **angle code**, and a zero-padded 3-digit frame index.

## Animation subfolders (20 total) — all identical structure

Every one of the 20 animations has **8 directions × 15 frames = 120 frames**. Uniformity verified: no anim/direction has a frame count other than 15.

| # | Animation | Dirs | Frames/dir | Total frames |
|---|---|---|---|---|
| 1 | Attack1 | 8 | 15 | 120 |
| 2 | Attack2 | 8 | 15 | 120 |
| 3 | Attack3 | 8 | 15 | 120 |
| 4 | Attack4 | 8 | 15 | 120 |
| 5 | Die | 8 | 15 | 120 |
| 6 | Idle | 8 | 15 | 120 |
| 7 | Idle2 | 8 | 15 | 120 |
| 8 | Run | 8 | 15 | 120 |
| 9 | Taunt | 8 | 15 | 120 |
| 10 | **AttackRun** *(extra)* | 8 | 15 | 120 |
| 11 | **CrouchAttack** *(extra)* | 8 | 15 | 120 |
| 12 | **CrouchIdle** *(extra)* | 8 | 15 | 120 |
| 13 | **CrouchRun** *(extra)* | 8 | 15 | 120 |
| 14 | **GunFire** *(extra)* | 8 | 15 | 120 |
| 15 | **RunBackwards** *(extra)* | 8 | 15 | 120 |
| 16 | **RunBackwardsAttack** *(extra)* | 8 | 15 | 120 |
| 17 | **StrafeLeft** *(extra)* | 8 | 15 | 120 |
| 18 | **StrafeLeftAttack** *(extra)* | 8 | 15 | 120 |
| 19 | **StrafeRight** *(extra)* | 8 | 15 | 120 |
| 20 | **StrafeRightAttack** *(extra)* | 8 | 15 | 120 |
| | **TOTAL** | | | **2400** |

## Directions — all 8 present in every animation

E, N, S, W, NE, NW, SE, SW — **8/8 directions present for all 20 animations** (160 direction folders total, no gaps).

Direction → angle-code mapping embedded in the filenames (counter-clockwise from East):

| Dir | Angle code in filename |
|---|---|
| E | 0 |
| NE | 45 |
| N | 90 |
| NW | 135 |
| W | 180 |
| SW | 225 |
| S | 270 |
| SE | 315 |

Example: `Attack1/NW/Attack1_135_001.png`. Confirmed identical for the extra tactical anims (e.g. `StrafeLeft`, `GunFire`, `CrouchRun` all use angles `0,45,90,135,180,225,270,315`).

## Frame-numbering scheme

- Pattern: `<Anim>_<angle>_<NNN>.png`, `NNN` zero-padded to 3 digits.
- **Odd numbers only, step 2:** `001, 003, 005, 007, 009, 011, 013, 015, 017, 019, 021, 023, 025, 027, 029`.
- Exactly **15 frames** per direction, range **001–029**. Same set used by every animation and every direction (each of the 15 values appears 160 times = 20 anims × 8 dirs). The even-numbered intermediates (002, 004, …) are not exported — likely the source was rendered/baked at half rate.

## The EXTRA tactical animations — how they differ from a "standard set"

The non-player **CityZombie 1–5** characters in the same pack each ship **15** animations:
`Attack1–5, CrouchRun, Die, Die2, Idle, Idle2, Run, TakeDamage, Taunt, WakeUp, Walk`.

Survivor ships **20** animations. Diffing Survivor against the CityZombie baseline, the Survivor-only additions (the **11 EXTRA tactical anims** called out in the task) are exactly:

```
AttackRun, CrouchAttack, CrouchIdle, CrouchRun, GunFire,
RunBackwards, RunBackwordsAttack→RunBackwardsAttack,
StrafeLeft, StrafeLeftAttack, StrafeRight, StrafeRightAttack
```
(All 11 task-named extras confirmed present: StrafeLeft, StrafeRight, StrafeLeftAttack, StrafeRightAttack, RunBackwards, RunBackwardsAttack, AttackRun, CrouchIdle, CrouchAttack, CrouchRun, GunFire.)

Note: `CrouchRun` also exists on the zombies, but `CrouchIdle`/`CrouchAttack`, all four Strafe variants, both RunBackwards variants, `AttackRun`, and `GunFire` are Survivor-exclusive — these are twin-stick/top-down shooter movement primitives (independent aim vs. move direction: strafing, backpedaling, firing on the move, crouch stance) that an AI-driven zombie doesn't need.

**Key point: the extras do NOT differ structurally.** They follow the identical convention — 8 directions, 15 odd-stepped frames (001–029), same `<Anim>_<angle>_<NNN>.png` naming and same angle codes (0–315). The only difference is the *set membership* (which animations exist) and the *motion they depict*; the per-animation layout, direction coverage, frame count, and numbering are uniform across all 20.


---
## 14_cityzombie_individual

# CityZombie — Individual Sprites Catalog

Source: `/tmp/pack_all.txt` (full pack listing; individual frames analyzed from path listing, not extracted).
Root: `Animations/Individual sprites/CityZombie 1/` … `CityZombie 5/`

Method: `grep` + `awk` on the listing. All 5 variants live under
`Animations/Individual sprites/CityZombie <N>/`.

---

## 1. Reference variant: CityZombie 1 (full breakdown)

### Folder hierarchy
```
CityZombie <N>/
├── <Anim>/              ← 15 animation folders
│   ├── E/  N/  NE/  NW/  S/  SE/  SW/  W/   ← 8 direction subfolders
│   │   └── <Anim>_<angle>_<NNN>.png         ← 15 frames each
├── <Anim>.png            ← sprite-sheet (with shadow)      [top level]
└── <Anim>_Shadowless.png ← sprite-sheet (shadowless)       [top level]
```

### Animation roster — exactly 15 (matches expected list)
Attack1, Attack2, Attack3, Attack4, Attack5, Walk, Run, CrouchRun, Idle, Idle2,
TakeDamage, Taunt, WakeUp, Die, Die2

### Direction layout — 8 directions, present for EVERY animation
`E, N, NE, NW, S, SE, SW, W` (full 8-way isometric set; no anim is missing any direction).

### Frames per animation
- **15 frames per direction** for every anim and every direction.
- 15 anims × 8 directions × 15 frames = **1800 individual frame PNGs per variant**.
- Every animation totals 120 frames (8 × 15). Verified uniform — no per-anim variation.

### Numbering scheme
Filename pattern: `<Anim>_<angle>_<index>.png`

- `<angle>` = compass angle encoding the direction (constant within a direction folder):
  | Direction | Angle token |
  |-----------|-------------|
  | E  | 0   |
  | NE | 45  |
  | N  | 90  |
  | NW | 135 |
  | W  | 180 |
  | SW | 225 |
  | S  | 270 |
  | SE | 315 |

  (Counter-clockwise from E=0°; note S=270 / N=90, i.e. screen-up = N = 90°.)

- `<index>` = 3-digit, **zero-padded, odd numbers only**: `001, 003, 005, …, 029`
  (15 values, step of 2). Same odd 001–029 sequence for every direction and every anim
  (spot-checked Attack1, Die, Idle2, WakeUp — all identical).

Examples:
```
CityZombie 1/Attack1/E/Attack1_0_001.png  … Attack1_0_029.png
CityZombie 1/Attack1/N/Attack1_90_001.png … Attack1_90_029.png
CityZombie 1/Die/E/Die_0_001.png          … Die_0_029.png
CityZombie 1/WakeUp/SW/WakeUp_225_001.png … WakeUp_225_029.png
```

### Top-level sprite-sheet PNGs (not individual frames)
30 per variant = 15 anims × {`<Anim>.png`, `<Anim>_Shadowless.png`}.

### Line-count accounting (CityZombie 1 = 1965 listing lines)
| Component | Count |
|-----------|-------|
| Individual frame PNGs | 1800 |
| Top-level sheet PNGs (sheet + shadowless) | 30 |
| Directory entries (15 anims × (8 dir + 1 anim-root)) | 135 |
| **Total lines** | **1965** |

> Note: the task brief's "1936 files each" does not match the listing. Actual figures are
> **1800 individual frames**, **1830 PNGs** (incl. sheets), or **1965 total listing lines** per
> variant (1950 for variant 4 — see below).

---

## 2. Cross-variant consistency (CityZombie 1–5)

Normalized each variant's individual-frame paths (stripped the `CityZombie <N>` segment) and
diffed against variant 1:

| Variant | Individual frames | diff vs v1 |
|---------|-------------------|------------|
| CityZombie 1 | 1800 | — (reference) |
| CityZombie 2 | 1800 | **0 differing lines** |
| CityZombie 3 | 1800 | **0 differing lines** |
| CityZombie 4 | 1800 | **0 differing lines** |
| CityZombie 5 | 1800 | **0 differing lines** |

➡ All 5 variants have **byte-identical** individual-frame structure: same 15-anim roster, same
8-direction layout, same 15-frame counts, same `_<angle>_<index>.png` numbering. **Consistent.**

Per-anim frame totals (all = 120) confirmed identical across v1–v5 for every one of the 15 anims.

### Only difference — top-level sheet PNGs
| Variant | Sheet PNGs | Total lines |
|---------|------------|-------------|
| v1 | 30 | 1965 |
| v2 | 30 | 1965 |
| v3 | 30 | 1965 |
| **v4** | **15** | **1950** |
| v5 | 30 | 1965 |

Variant 4 ships **only the `_Shadowless` sheet sprites** (15) — it is missing the 15 shadowed
`<Anim>.png` sheets. This affects sprite-SHEETS only; variant 4's **individual frames are
complete and identical to the others** (1800, 0 diffs). The 15-line / 1950-vs-1965 gap is fully
explained by these 15 absent shadowed sheets.

---

## Summary
- 5 variants, each: **15 animations × 8 directions × 15 frames = 1800 individual sprites**.
- Roster (15): Attack1–5, Walk, Run, CrouchRun, Idle, Idle2, TakeDamage, Taunt, WakeUp, Die, Die2. ✔ matches expected.
- Directions: full 8-way `E/N/NE/NW/S/SE/SW/W`, encoded as angle tokens 0/45/90/135/180/225/270/315.
- Numbering: `<Anim>_<angle>_<index>.png`, index = odd 001–029 (15 frames).
- All 5 variants are **structurally identical** (0 path diffs) for individual frames. Only variant 4 differs at the sheet level (missing the 15 shadowed sheet PNGs; shadowless sheets present).


---
## 15_animated_pickups

# Animated Tiles + Isometric Interactive Props — Analysis

Source pack: `/tmp/envpack/`
Read-only analysis. Date: 2026-06-19

---

## 1. Animated Tiles (sprite sheets)

Two identical variant sets exist:

- `/tmp/envpack/anim/Animations/Spritesheets/Shadowless/Animated Tiles/`
- `/tmp/envpack/anim/Animations/Spritesheets/With shadow/Animated Tiles/`

Each set contains **4 sheets**. The earlier note ("fire barrel + treasure chests") is confirmed — there are 3 chests, not one.

### Common format (all 4 sheets, both variants)

| Property | Value |
|---|---|
| Sheet dimensions | **1920 x 256** px |
| Layout | Single **horizontal strip** |
| Frame count | **15 frames** |
| Frame size | **128 x 256** px (1920 / 15 = 128) |
| Format | PNG, 8-bit RGBA, non-interlaced, transparent background |
| Projection | Isometric (2:1-style dimetric), object sits in lower portion of the 128x256 cell with vertical headroom for the open lid / flame |

> Note: 128 x 256 frame size is **identical** to the static iso `Object*` tile size (see §2), so animated and static props are drop-in interchangeable on the same grid/anchor.

### Sheet-by-sheet

**Fire barrel** (`Fire barrel_Shadowless.png` / `Fire barrel.png`)
- Black/dark metal drum (burn-barrel) with a flame burning out of the open top.
- Animation = **looping flame flicker** (the barrel itself is static; the fire wisps/licks change shape across the 15 frames). Designed to loop seamlessly.
- Colorway: near-black barrel body; flame is yellow -> orange -> red gradient. High contrast, reads well on dark/rubble ground.
- Use as an **ambient looping animation** (play on repeat, no state).

**Large Chest** (`Large Chest_Shadowless.png` / `Large Chest.png`)
- Large military/ammo-style crate. Animation = **lid-open sequence**: frames 1–~6 closed, then lid hinges up through ~frame 15 fully open.
- Colorway: weathered olive/khaki-tan crate; interior revealed on opening is darker.
- This is a **one-shot state animation** (closed -> open), NOT a loop.

**Small Chest Right** & **Small Chest left** (`Small Chest Right_Shadowless.png`, `Small Chest left_Shadowless.png` + with-shadow)
- Smaller hard-case / footlocker. Same **lid-open one-shot** sequence (closed frame 1 -> fully open frame 15).
- Colorway: olive-green exterior; interior lining is a bright **teal/cyan** that pops on opening (clear "loot revealed" read).
- "Right" vs "left" = the two are mirrored / hinge-and-facing variants so a chest can face either iso diagonal. Pick per placement orientation; otherwise functionally identical (same 15-frame open).

### Animation playback notes
- Closed-state idle = hold frame 0. Opening = play 0->14 once, then hold frame 14 (open/emptied).
- Suggested rate ~12 fps -> chest opens in ~1.25 s; fire barrel loops ~12–15 fps for a lively flicker.
- Shadowless vs with-shadow: use **shadowless** if you draw your own dynamic blob shadow or stack props; use **with-shadow** for a quick baked-in grounded look matching the static iso tiles (which have baked shadows).

---

## 2. Isometric Tiles — interactive / lootable / hazard candidates

Folder: `/tmp/envpack/iso/Isometric Tiles/` (1004 files total).
Naming is **generic** (`Object1..28`, `Car1..12`, `Splat 1..8`, `StreetLamp 1..2`), each with `_N/_S/_E/_W` (4 iso facings). No descriptive filenames, so contents were identified by reading the `_S` sprite of each.

- Static iso tile size: **128 x 256** px (Objects, Splats, StreetLamps); **Cars 256 x 512**. RGBA, baked soft shadow.

### `Object*` catalog (28 props x 4 dirs = 112 files) — identified visually

| # | What it is | Prop role |
|---|---|---|
| 1 | Yellow/rust **oil drum** (single) | Hazard / lootable barrel |
| 2 | Metal **barrier railing** | Obstacle / cover |
| 3 | **Satellite dish** | Scenery / objective marker |
| 4 | Industrial **HVAC / rooftop AC unit** (caged) | "Generator" prop |
| 5 | **AC condenser** unit (twin-fan) | "Generator" prop |
| 6 | **Blue barrel/drum** with clamp lid | Lootable barrel / water/fuel |
| 7 | Wire-mesh **trash bin** | Minor breakable / scatter |
| 8 | Rusted **pipe / hydrant-style fixture** | Scenery / hazard valve |
| 9 | Small **vent / hatch cover** | Scenery |
| 10 | Green **dumpster (closed)** | Lootable / cover |
| 11 | Green **dumpster (open lid)** | Looted/empty variant of #10 |
| 12 | Small dark **debris/junk** | Scatter decal |
| 13 | **Rubble pile** | Scatter / destroyed-prop |
| 14 | Park **bench** | Scenery / obstacle |
| 15 | **Curb / speed bump** | Ground detail |
| 16 | **Concrete (jersey) barrier** | Obstacle / cover |
| 17 | Brown **wooden crate/box** | **Loot crate** |
| 18 | **Rock / boulder** on tile | Obstacle |
| 19 | **Stacked oil barrels** (cluster of 3) | Hazard cluster / fuel dump |
| 20 | **Stop sign** | Scenery |
| 21 | **Sign post / board** | Scenery |
| 22 | Black **equipment case** (handled) | **Loot case / supply drop** |
| 23 | **Wooden pallet / planks** | Ground detail / breakable |
| 24 | **Caged generator / AC** unit | "Generator" prop / objective |
| 25 | Burnt/charred **crate** | Destroyed loot variant |
| 26 | Black **shipping crate/box** | **Loot crate** |
| 27 | **Traffic cone** | Scenery / minor scatter |
| 28 | Red **fire hydrant** | Hydrant prop (interactable) |

### Other groups of note
- **Splat 1..8** — **blood splatter decals** (ground-flat). Ready-made gore/kill-feedback decals or hazard markers.
- **StreetLamp 1..2** — lamp posts (tall scenery; could be light source / minimap landmark).
- **Car 1..12** — full vehicles (256x512). Large obstacles; pair naturally with the fire-barrel/oil-drum hazards for a wrecked-city look. (Detailed in a separate vehicles analysis if needed.)

### Cross-reference: animated vs static equivalents
- The **fire barrel (animated)** is the lively counterpart to static drums Object1 / Object6 / Object19 — same drum silhouette, plus live flame.
- The **animated chests** are the openable counterparts to static crates/cases Object17, Object22, Object26 (and burnt Object25 as an "already looted/destroyed" state). You can litter the map with cheap static crates and swap in the animated chest only for actual interactable loot.

---

## 3. Proposed in-game usage (top-down survivors)

Concrete, role-by-role:

### A. Flaming barrel — ambient hazard + atmosphere
- **Asset:** Fire barrel animated sheet (loop frames 0–14).
- **Ambient/atmosphere mode:** purely decorative looping prop scattered in the arena to sell a burning post-apoc city. No collision needed, or thin collision so the player walks around it. Place near wrecked Cars / oil drums / rubble for set dressing.
- **Hazard mode:** give it a small radial "fire" trigger — entities (player and/or enemies) standing in the flame footprint take damage-over-time / burn. Cheap area-denial that channels enemy paths or punishes greedy movement.
- **Stretch:** emit a flickering light/glow (matches the bright flame colorway) for a day/night or fog-of-war look; spawn a few embers/smoke particles above the 256-tall cell (the frame already reserves vertical headroom).
- Because it's a one-piece looping sheet, it's trivial to instance many of them with random phase offsets so they don't flicker in sync.

### B. Chests — loot / crate drops
- **Assets:** Large Chest (big reward), Small Chest left/right (common drop; pick facing per iso orientation).
- **Spawn:** as **enemy/elite/boss death drops** or pre-placed in the arena. Idle = closed (hold frame 0).
- **Interaction:** on player overlap (or pickup magnet, classic survivors style), play the **15-frame open one-shot**, hold open on frame 14, then grant contents and fade/despawn. The teal interior reveal gives a clear "opened" visual beat; sync the reward pop (XP gems, gold, weapon, chest UI) to ~frame 10–12 when the lid clears.
- **Tiering by sheet:** Small chest = common (gold/XP/minor pickup); Large chest = rare/elite (weapon, evolution item, big cache). Reuse the burnt static crate (Object25) as a "destroyed/empty" decoy that gives nothing.
- **Cheap dressing vs real loot:** scatter static crates (Object17/22/26) as non-interactive props; only the animated chest sheets are interactable — players quickly learn the animated/opening one is the real pickup.

### C. Supporting interactive props from the iso set
- **Generators (Object4 / 5 / 24):** "repair/activate" objectives, hold-to-channel points, or destructibles that, when destroyed, drop loot or trigger an event (lights/door). Natural fit for a "defend/activate the generator" wave objective.
- **Oil drums (Object1 / 6 / 19):** **explosive/breakable hazards.** Shoot/walk into -> explode for AoE damage (hits enemies too), optionally igniting into the fire-barrel loop for a lingering fire patch. Object19 (3-stack cluster) = bigger blast.
- **Dumpster (Object10 closed -> Object11 open):** lootable container faked with a 2-state swap (closed static -> open static) when there's no animated sheet — search for a chance drop. Doubles as cover/obstacle.
- **Crates/cases (Object17 / 22 / 26):** breakable supply boxes — destroy for minor pickups (ammo/health/gold), low-value counterpart to chests.
- **Fire hydrant (Object28):** classic interactable — "burst" to create a brief water plume that slows/pushes enemies, or just flavor scenery.
- **Blood splats (Splat 1..8):** spawn under killed enemies as persistent kill-feedback decals; cheap, high-impact gore atmosphere.
- **Cars / barriers / cones / benches (Object2,14,16,20,27 / Cars):** static collision props to shape the arena, build lanes/chokepoints, and provide cover — combine with flaming barrels for hazardous chokes.

### Implementation conveniences
- Every static prop ships in 4 iso facings (`_N/_S/_E/_W`) — rotate placement freely. Chests additionally have left/right hinge variants.
- **Uniform 128x256 frame/tile size** across animated sheets and static `Object*` tiles means one anchor/pivot convention works for the whole set; animated and static props snap to the same grid and depth-sort consistently.
- Slice animated sheets at stride 128px, 15 cells. Use shadowless for stacking/custom shadows; with-shadow to match the baked-shadow static iso tiles out of the box.


---
## 16_census

# Pack Census — `tileset.rar` (survivor.io environment / sprite pack)

_Generated 2026-06-19. Sources: full listing `/tmp/pack_all.txt` (13,615 entries) and the
archive `/tmp/envpack/tileset.rar` (179 MB on disk). All counts cross-checked between the two._

## Headline numbers

| Metric | Value |
|---|---|
| Total entries in listing | 13,615 |
| **PNG files** | **12,723** |
| Directory entries (no extension) | 892 |
| **File formats present** | **PNG only** — 100%. No JPG/TGA/PSD/JSON/atlas/meta files. |
| Top-level folders | 2 (`Animations/`, `Isometric Tiles/`) |
| **Uncompressed footprint** | **185,883,230 bytes = 177.3 MiB (185.9 MB)** |
| Compressed (.rar on disk) | 178,950,339 bytes (~171 MiB) — only ~4% smaller; PNGs are already compressed |
| Average PNG size | 14.3 KiB |

Cross-check: 12,723 PNGs + 892 dirs = 13,615 entries (listing == archive, exact).

## Split: Animations vs Isometric Tiles

| Branch | Role | PNGs | % of PNGs | Uncompressed |
|---|---|---|---|---|
| `Animations/` | Characters + FX (animation frames, spritesheets, effects) | 11,719 | 92.1% | 143.6 MiB |
| `Isometric Tiles/` | Environment (static iso props/terrain) | 1,004 | 7.9% | 33.7 MiB |
| **Total** | | **12,723** | 100% | **177.3 MiB** |

## Second-level breakdown

### `Animations/` (11,719 PNG)
| Sub-branch | PNGs | Uncompressed | Avg | Notes |
|---|---|---|---|---|
| `Individual sprites/` | 11,460 | 111.1 MiB | 9.9 KiB | per-frame loose sprites (the bulk of the pack) |
| `Spritesheets/` | 183 | 31.7 MiB | 177.6 KiB | packed sheets; two variants `Shadowless/` (99) + `With shadow/` (84) |
| `Effects/` | 76 | 0.7 MiB | 10.0 KiB | Blood1–Blood5 (15 frames each = 75) + `GunFire.png` (1) |

### `Isometric Tiles/` (1,004 PNG)
Flat folder (no sub-folders). Every tile rendered in 4 isometric facings — **251 base tiles × {N,S,E,W} = 1,004**. Avg 34.4 KiB.

## Characters — 6 distinct (Survivor + CityZombie 1–5)

Under `Animations/Individual sprites/`:

| Subject | Anim states | Frames | Detail |
|---|---|---|---|
| **Survivor** (player) | 20 | 2,400 | richest set: Attack1–4, AttackRun, CrouchAttack/Idle/Run, Die, GunFire, Idle, Idle2, Run, RunBackwards(+Attack), StrafeLeft(+Attack), StrafeRight(+Attack), Taunt |
| **CityZombie 1** | 15 | 1,800 | Attack1–5, CrouchRun, Die, Die2, Idle, Idle2, Run, TakeDamage, Taunt, WakeUp, Walk |
| **CityZombie 2** | 15 | 1,800 | (same shape as CZ1) |
| **CityZombie 3** | 15 | 1,800 | |
| **CityZombie 4** | 15 | 1,800 | |
| **CityZombie 5** | 15 | 1,800 | |
| _Animated Tiles_ (non-character) | 4 clips | 60 | Fire barrel, Large Chest, Small Chest left, Small Chest Right (15 frames each) |

Per-state framing is perfectly uniform: **8 directions × 15 frames = 120 frames per state**.
Character frame total = 2,400 + 5×1,800 = **11,400**; +60 Animated Tiles = 11,460 (matches "Individual sprites").

Spritesheets cover the same subjects: CityZombie (75 Shadowless / 60 With-shadow), Survivor (20/20), Animated Tiles (4/4).

## Environment tile categories — ~16 families (31 lettered sub-groups)

By base name (each count already ×4 directions):

| Family | Base tiles ×4 | Sub-groups |
|---|---|---|
| **Wall** | 328 | Wall A (104), Wall B (104), Wall D (104), Wall C (16) |
| **Flora** | 260 | Flora A–G (A 28, B 44, C 36, D 36, E 44, F 36, G 36) |
| **Object** | 112 | Object1–28 |
| **Ground** | 72 | Ground A (28), B (32), C (4), D (4), E (4) |
| **Car** | 48 | Car1–12 |
| **WallDetail** | 40 | |
| **Splat** | 32 | (decals/ground splatter) |
| **Pillar** | 24 | Pillar A |
| **WallHalf** | 16 | WallHalf A (8), B (8) |
| **Roof** | 16 | Roof A (12), B (4) |
| **Stairs** | 12 | Stairs A |
| **Ramp** | 12 | Ramp A |
| **Fence** | 12 | Fence A |
| **WallSurface** | 8 | WallSurface A (4), B (4) |
| **StreetLamp** | 8 | StreetLamp 1–2 |
| **Tree** | 4 | Tree A |

(Family subtotals sum to 1,004.)

## Naming conventions

- **Format:** every asset is `*.png`, RGBA sprites. No metadata/atlas sidecars.
- **Individual sprite frames:** `<State>_<angle>_<frame>.png`
  - path: `Animations/Individual sprites/<Subject>/<State>/<Dir>/<file>`
  - `<angle>` = compass degrees, fixed mapping to the 8 direction folders:
    `0→S, 45→SE, 90→N`*, `135→…, 180, 225, 270, 315` — 8 codes, 300 frames each per character.
    (Each direction subfolder `N,NE,E,SE,S,SW,W,NW` holds the matching angle.)
  - `<frame>` = zero-padded **odd numbers only** `001,003,…,029` ⇒ 15 frames/state (renderer kept every 2nd frame).
  - e.g. `Survivor/Run/N/Run_90_001.png`.
- **Effects:** `Animations/Effects/Blood1/0001.png` … `0029.png` (4-digit, odd, 15 each); plus `GunFire.png`.
- **Animated Tiles:** `FireBarrel0001.png …` (name + 4-digit odd index, 15 frames).
- **Spritesheets:** `<State>_Shadowless.png` / `<State> With shadow.png` under `Spritesheets/<variant>/<Subject>/`.
- **Isometric tiles:** `<Category><n>_<DIR>.png`, DIR ∈ {N,S,E,W} (4-way), letter sub-groups e.g. `Wall A19_S.png`, `Flora C5_E.png`, `Object12_N.png`, `Car10_W.png`, `StreetLamp 1_E.png`.
- Spaces appear in names (`Wall A`, `Flora B`, `Small Chest left`, `Fire barrel`) — case is inconsistent (`left` vs `Right`).

## Footprint estimate

Already exact from the archive: **177.3 MiB uncompressed** across 12,723 PNGs.
Distribution: Individual sprites 111.1 MiB (63%) · Isometric Tiles 33.7 MiB (19%) · Spritesheets 31.7 MiB (18%) · Effects 0.7 MiB (<1%).

## Tree-with-counts — table of contents

```
tileset.rar  ──  12,723 PNG · 177.3 MiB uncompressed (PNG-only)
│
├── Animations/                              11,719 PNG · 143.6 MiB
│   ├── Individual sprites/                  11,460 PNG · 111.1 MiB
│   │   ├── Survivor/                         2,400   (20 states × 8 dir × 15 frames)
│   │   ├── CityZombie 1/                     1,800   (15 states × 8 dir × 15 frames)
│   │   ├── CityZombie 2/                     1,800
│   │   ├── CityZombie 3/                     1,800
│   │   ├── CityZombie 4/                     1,800
│   │   ├── CityZombie 5/                     1,800
│   │   └── Animated Tiles/                      60   (Fire barrel, Large Chest,
│   │                                                  Small Chest left, Small Chest Right — 15 ea)
│   ├── Spritesheets/                           183 PNG ·  31.7 MiB
│   │   ├── Shadowless/                           99   (CityZombie 75, Survivor 20, Anim.Tiles 4)
│   │   └── With shadow/                          84   (CityZombie 60, Survivor 20, Anim.Tiles 4)
│   └── Effects/                                  76 PNG ·   0.7 MiB
│       ├── Blood1 … Blood5/                      75   (15 frames each)
│       └── GunFire.png                            1
│
└── Isometric Tiles/                          1,004 PNG ·  33.7 MiB   (251 base tiles × 4 facings N/S/E/W)
    ├── Wall A/B/C/D                             328
    ├── Flora A–G                                260
    ├── Object (1–28)                            112
    ├── Ground A–E                                72
    ├── Car (1–12)                                48
    ├── WallDetail                                40
    ├── Splat                                     32
    ├── Pillar A                                  24
    ├── WallHalf A/B                              16
    ├── Roof A/B                                  16
    ├── Stairs A                                  12
    ├── Ramp A                                    12
    ├── Fence A                                   12
    ├── WallSurface A/B                            8
    ├── StreetLamp (1–2)                           8
    └── Tree A                                     4
```
\* Angle→direction note: degree codes 0/45/90/135/180/225/270/315 each appear 300×/character and correspond
one-to-one with the eight `N..NW` folders; the exact code↔compass pairing is consistent within each subject.


---
## 17_conventions

# Spritesheet Slicing Conventions (Shadowless character pack)

Source verified:
- Sheets: `/tmp/envpack/anim/Animations/Spritesheets/Shadowless/<Character>/<Anim>_Shadowless.png`
- Full file listing (individual pre-sliced frames): `/tmp/pack_all.txt`
- Dimensions read with `file`. No pixel decode was possible (read-only), so row-to-direction
  *order* is the only inferred item -- flagged below.

Characters present (each is its own folder of sheets):
`Survivor`, `CityZombie 1`, `CityZombie 2`, `CityZombie 3`, `CityZombie 4`, `CityZombie 5`,
plus non-character `Animated Tiles` (props, see end).

---

## 1. Cell size and grid

- **Cell = 128 x 128 px.**
- **Every character sheet is exactly 1920 x 1024** (verified for all 6 characters, all anims).
  - `1920 / 128 = 15` columns -> **15 frames per direction**
  - `1024 / 128 = 8`  rows    -> **8 directions**
- Frame (col, row) -> source rect: `x = col*128`, `y = row*128`, `w = h = 128`,
  with `col in [0..14]`, `row in [0..7]`.

## 2. Eight directions + row order

8 directions confirmed three ways: 1024/128 = 8 rows, and the individual-sprite tree has
exactly 8 direction subfolders per animation: `E, N, NE, NW, S, SE, SW, W`.

Direction is encoded as a **compass angle** in the individual filenames
(`<Clip>_<angle>_<frame>.png`), with this exact mapping (verified on Survivor AND CityZombie,
so it is character-independent):

| Dir | Angle code |
|-----|-----------|
| E   | 0   |
| NE  | 45  |
| N   | 90  |
| NW  | 135 |
| W   | 180 |
| SW  | 225 |
| S   | 270 |
| SE  | 315 |

So angle = CCW degrees from East (standard math convention), step 45 deg.

**Row order within the packed sheet (NOT pixel-verified -- see caveat):**
The conventional packing order for this asset family is by increasing angle, i.e.
```
row 0 = E  (0)
row 1 = NE (45)
row 2 = N  (90)
row 3 = NW (135)
row 4 = W  (180)
row 5 = SW (225)
row 6 = S  (270)
row 7 = SE (315)
```
CAVEAT: directory listings prove *which* directions exist and their angle labels, but not the
vertical ordering of rows inside the composite PNG. A programmer should spot-check ONE sheet
(e.g. open `Survivor/Idle_Shadowless.png`) and confirm row 0 faces East; if the artist packed in
a different order, only this row<->angle lookup table changes -- all other rules hold.
Recommended-safe alternative: ignore the sheets and consume the per-direction `Individual sprites`
folders directly, where direction is unambiguous from the path.

## 3. Frame numbering / step

Per-direction frames are numbered **001, 003, 005, ... 029** -> **odd numbers, step 2, 15 frames**.
(Verified: `Survivor/Run/E` = 001 003 005 007 009 011 013 015 017 019 021 023 025 027 029.)
The numbering is the original 30 fps timeline sampled every other frame; the *sheet column index*
is simply `0..14` left-to-right. Mapping: `column = (frameNumber - 1) / 2`.

Individual-file name format: `<SourceClip>_<angle>_<NNN>.png`
e.g. `Run_0_001.png`, `Walk_315_029.png`.
Note `<SourceClip>` is the source animation clip name, which can differ from the SHEET name:
the Survivor **GunFire** sheet's individual frames are named `Attack1_0_001.png` ... (GunFire was
exported from the "Attack1" clip). Do not assume sheet name == filename prefix.

## 4. FRAME-COUNT table (frames per direction)

`width / 128` for every sheet:

| Character    | Animation            | Sheet WxH   | Frames/dir |
|--------------|----------------------|-------------|-----------|
| Survivor     | Attack1              | 1920x1024   | 15 |
| Survivor     | Attack2              | 1920x1024   | 15 |
| Survivor     | Attack3              | 1920x1024   | 15 |
| Survivor     | Attack4              | 1920x1024   | 15 |
| Survivor     | AttackRun            | 1920x1024   | 15 |
| Survivor     | CrouchAttack         | 1920x1024   | 15 |
| Survivor     | CrouchIdle           | 1920x1024   | 15 |
| Survivor     | CrouchRun            | 1920x1024   | 15 |
| Survivor     | Die                  | 1920x1024   | 15 |
| Survivor     | **GunFire**          | 1920x1024   | **15** |
| Survivor     | Idle                 | 1920x1024   | 15 |
| Survivor     | Idle2                | 1920x1024   | 15 |
| Survivor     | Run                  | 1920x1024   | 15 |
| Survivor     | RunBackwards         | 1920x1024   | 15 |
| Survivor     | RunBackwardsAttack   | 1920x1024   | 15 |
| Survivor     | StrafeLeft           | 1920x1024   | 15 |
| Survivor     | StrafeLeftAttack     | 1920x1024   | 15 |
| Survivor     | StrafeRight          | 1920x1024   | 15 |
| Survivor     | StrafeRightAttack    | 1920x1024   | 15 |
| Survivor     | Taunt                | 1920x1024   | 15 |
| CityZombie 1-5 | Attack1..Attack5, CrouchRun, Die, Die2, Idle, Idle2, Run, TakeDamage, Taunt, WakeUp, Walk | 1920x1024 | 15 |

**Result: there is NO animation with a frame count other than 15.** GunFire is 15 too.
This was cross-checked three independent ways and all agree:
1. sheet width 1920 / 128 = 15 for every sheet;
2. individual-sprite file count per direction = 15 for every (character, anim, direction);
3. frame numbering runs 001..029 step 2 = 15 for every clip.

A global scan of the entire `Individual sprites` tree found **zero** directional folders with a
count != 15. The task hint that "GunFire is NOT 15" does not hold for this pack -- GunFire sheets
are simply mostly transparent padding (file is ~28 KB vs ~120 KB for busier clips), but the canvas
and the exported frame count are a full 15. Slice it like everything else; trailing frames may be
blank/hold frames.

## 5. Animated Tiles (non-character) -- different layout

`Animated Tiles/<name>_Shadowless.png` are **1920 x 256** = 15 cols x **2 rows**, and are
**non-directional**. Their individual sprites are a flat list `<Name><NNNN>.png` (e.g.
`LargeChest 10001.png`, `FireBarrel0001.png`), 15 frames, numbered 0001..0029 step 2.
(2 rows here is a packing artifact, not 2 directions -- treat as a single 15-frame loop.)
Members: `Fire barrel`, `Large Chest`, `Small Chest Right`, `Small Chest left`.

Also note `Animations/Effects/GunFire.png` is a single static muzzle-flash decal (1 file),
and `Animations/Effects/Blood1..Blood5` are 15-frame non-directional effect loops
(`0001.png..0029.png`). These are unrelated to the character `GunFire` animation.

---

## Implementation summary (pseudocode)

```
CELL = 128
COLS = 15           # frames per direction, ALL anims (incl. GunFire)
ROWS = 8            # directions
# row -> direction (CAVEAT: confirm row0==E visually once; else just use Individual sprites/)
ROW_DIR = ["E","NE","N","NW","W","SW","S","SE"]   # angles 0,45,90,135,180,225,270,315

def frame_rect(col, row):
    return (col*CELL, row*CELL, CELL, CELL)        # col 0..14, row 0..7

def column_from_filename_number(n):                # n in {1,3,...,29}
    return (n - 1) // 2                             # -> 0..14
```


---
## 19_topdown_ranking

# Iso Tileset — Top-Down Suitability Ranking

Source: `/tmp/envpack/iso/Isometric Tiles/` (1004 PNGs, 4 facings N/S/E/W per item).
Goal: rate each environment category for use as scenery in our **top-down** game, where the cast walks
*around* props on a flat field. The art is rendered in a ~2:1 isometric (dimetric) projection, so the
key question per category is **how much vertical 3D mass the sprite shows** once dropped onto a
top-down floor.

Rating key:
- **GOOD** — reads as flat / near-flat ground scenery; minimal vertical face; the cast can plausibly walk past it without the iso projection screaming "3D".
- **OK** — usable as a decorative 3/4 prop (short, has some height/cast shadow but small footprint of "wrongness"); fine sprinkled sparsely as set dressing.
- **POOR** — tall vertical iso volume; obvious isometric 3D massing that fights a top-down camera and looks tilted/wrong on a flat field.

## Ranked table (best → worst for top-down)

| Rank | Category | Rating | One-line reason |
|------|----------|--------|-----------------|
| 1 | Splat | **GOOD** | Pure flat blood/grime decal, zero height — ideal top-down ground overlay. |
| 2 | Ground A | **GOOD** | Flat paving slab; only a thin iso side lip, reads as floor. |
| 3 | Ground B | **GOOD** | Flat dark slab, minimal edge thickness — clean walkable floor. |
| 4 | Ground C | **GOOD** | Flat checker tile; thin side face, reads as floor. |
| 5 | Ground D | **GOOD** | Flat asphalt/dirt slab, low lip — fine as ground. |
| 6 | Ground E | **GOOD** | Flat concrete slab, low lip — fine as ground. |
| 7 | Flora (flat variants: B, D, E, G) | **GOOD** | Flat diamond ground-cover patches (moss/grass/leaf litter); lie flat like decals. |
| 8 | Roof B | **GOOD** | Very low corrugated slab; near-flat, passes as a floor/grate panel. |
| 9 | Ramp A | **GOOD/OK** | Shallow angled slab, almost flat top; reads as a sloped ground patch more than a 3D ramp. |
| 10 | Roof A | **OK** | Mostly flat roof slab but has a raised lip/parapet block — slight 3D edge. |
| 11 | Car | **OK** | Low, ground-hugging wrecks with cast shadow; classic 3/4 prop, scatters convincingly. |
| 12 | Object (low/debris items, e.g. curbs, planks, barrels) | **OK** | Mostly small props — flat debris reads fine; barrels/signs add modest height. Use sparsely. |
| 13 | Flora A (upright tufts) | **OK** | Small upright grass clumps; short enough to pass as 3/4 set-dressing. |
| 14 | Fence A | **OK** | Thin flat chain-link plane; little volume, but visibly stands vertical — okay as a low divider. |
| 15 | WallSurface A | **OK** | Flat wall *panel* (no top/side block) shown on the iso skew — a tilted plane; works as decal-ish overlay, reads slightly off. |
| 16 | WallSurface B | **OK** | Same: flat skewed wall plane, no massing; borderline but usable as a flat texture decal. |
| 17 | WallDetail | **OK/POOR** | Iso-extruded signage (e.g. "HOTEL"): a flat-ish sign but clearly 3D-extruded text on the skew. |
| 18 | StreetLamp | **POOR** | Tall thin vertical pole with overhang; pure iso height, leans wrong top-down. |
| 19 | Pillar A | **POOR** | Tall slender column; strong vertical iso volume. |
| 20 | WallHalf A | **POOR** | Half-height wall block — still a chunky 3D box with top + side faces on the skew. |
| 21 | WallHalf B | **POOR** | Same: short wall cube, obvious iso massing. |
| 22 | Tree A | **POOR** | Full upright tree with trunk + canopy; maximal vertical 3D, totally iso. |
| 23 | Flora (hedge variants: C, F) | **POOR** | Tall hedge blocks — solid vertical iso volumes, read as 3D bushes. |
| 24 | Stairs A | **POOR** | Stepped 3D staircase; iso treads/risers, unmistakably isometric. |
| 25 | Wall A | **POOR** | Tall full-height wall block; top + two side faces, textbook iso 3D. |
| 26 | Wall B | **POOR** | Tall full-height stone wall block; same heavy iso massing. |
| 27 | Wall C | **POOR** | Tall corrugated-metal wall slab on the skew; clearly vertical iso. |
| 28 | Wall D | **POOR** | Tall full-height brick wall block; full iso top + side faces. |

## Notes / caveats
- **Flora is split** and should be treated per-variant, not as one bucket: B/D/E/G are flat ground patches (GOOD), A is a short tuft (OK), C/F are tall hedges (POOR).
- **Object (112 files / 28 unique)** is heterogeneous: includes flat curbs/planks (GOOD-ish), barrels, traffic cones, STOP/road signs (OK 3/4 props). Cherry-pick the low/flat ones; avoid tall signage if strict top-down read is wanted.
- **Roof A vs Roof B**: B is the flatter, more floor-like of the two.
- **WallSurface** is the only "wall" family that isn't a solid block — it's a single flat panel, so it degrades to OK (a skewed plane) rather than POOR. The four solid Wall families (A/B/C/D), WallHalf, and Pillar are all hard POOR.
- All "POOR" items are still fine if you ever switch to / fake an iso or 3/4 hero camera; they are only POOR *against a flat top-down camera*.

## Practical guidance for scatter
- **Scatter freely (floor layer):** Splat, all Ground A–E, flat Flora (B/D/E/G), Roof B, Ramp A.
- **Scatter sparingly (3/4 props):** Car, low Objects, Flora A, Fence A, Roof A, WallSurface A/B.
- **Avoid for top-down (reserve for walls/buildings only):** Wall A/B/C/D, WallHalf A/B, Pillar A, Tree A, hedge Flora (C/F), Stairs A, StreetLamp, WallDetail signage.


---
## 20_style_cohesion

# Style & Palette Cohesion Audit — Iso Environment + Characters

**Scope:** Iso tiles (`/tmp/envpack/iso/Isometric Tiles/`, 1004 files), this pack's
CityZombie/Survivor spritesheets (`/tmp/envpack/anim/.../Shadowless/`), and the
currently-integrated game sprites (`public/assets/sprites/zombies/`, `.../survivor/`).
All numbers below are measured over **opaque pixels only** (alpha-weighted), via PIL.

---

## Verdict (TL;DR)

**They already share one rendering pedigree and they will read as one scene — this is a
genuinely cohesive starting point, not a Frankenstein.** All three groups are
**pre-rendered 3D with soft anti-aliased edges and smooth continuous-tone shading** (no
pixel-art, no cel outlines, no flat palettes). Color temperature is uniformly **warm-neutral**
across the board. The cast is even the *same authoring lineage* as the world: the game's
`ZombieCop1/` animation set is a 1:1 processed copy of the pack's `CityZombie 1/`
(identical animation names, just resized + `_Shadowless` suffix dropped).

The real cohesion problems are **not** style clashes — they are **three fixable tone issues**:
1. The environment is rendered **darker and flatter** (lower brightness, compressed highlights) than the characters, so raw characters "pop off" the floor.
2. A handful of **hot, saturated accent assets** (blood splats, radioactive/FX greens, the yellow `_fx` acid sheet) sit far outside the muted base palette and will look neon unless reined in.
3. **Lighting/contrast amplitude is inconsistent** — characters carry a much wider light-to-dark range than the tiles, so a single global grade is needed to seat everyone in the same "gritty dusk."

---

## 1. Resolution & rendering style — COHESIVE

| Group | Native asset size | Per-frame content | Rendering |
|---|---|---|---|
| Iso Ground/Wall/Object/Flora | **128×256** tiles | n/a | pre-rendered 3D |
| Iso Car | **256×512** | n/a | pre-rendered 3D |
| Pack CityZombie / Survivor | **1920×1024** sheets | ~128 px-tall character render | pre-rendered 3D |
| Game zombies (processed) | per-frame PNGs, **~360–600 × 125–230** | ~160 px-tall | downscaled from pack |
| Game survivor (processed) | **1792×1024** sheet | ~940 px-tall | from pack |

- **Not pixel art anywhere.** Content-crop unique-RGB ratios are smooth-shading-typical
  for every group: iso Wall 0.11, Car 0.10, Object 0.33; pack CityZombie 0.07, Survivor 0.08.
  Pixel art would show a tiny fixed palette (dozens of colors, hard steps). These show
  hundreds-to-thousands of unique values with soft ramps → **3D renders / painted, with AA.**
- **Edge anti-aliasing is consistent.** Semi-transparent edge fraction is high on organic
  silhouettes in *both* worlds (iso Flora 0.78, Splat 0.85, Tree 0.35; game zombies ~0.44–0.53)
  and low on hard-edged blocks (iso Ground 0.06, Roof 0.06). Same soft-edge treatment → they
  composite together cleanly.
- **One scale caveat (not a style clash):** characters are authored ~3–7× larger than they
  render in-game and the game zombies were downscaled with interpolation (raw color count
  jumped to ~1000+ from resampling). That is a *pipeline* note, not a look mismatch — but
  **downscale all characters with the same filter (and ideally the same target px-height per
  world-unit) so line weight/softness matches the tiles**, otherwise heavily-shrunk zombies
  can look slightly blurrier than lightly-shrunk ones.

**Action:** none required for style/resolution unity. Just standardize the downscale filter
(Lanczos) and a single px-per-tile character height so silhouette crispness is uniform.

---

## 2. Color temperature — COHESIVE (uniformly warm-neutral)

Warmth = mean(R) − mean(B), measured on opaque pixels. **Positive = warm.** Every base
asset lands in a tight warm band:

| Asset | Warmth (R−B) |
|---|---|
| Iso Roof / StreetLamp | **+5.5** |
| Iso Ground | +8.1 |
| Iso Car | +8.3 |
| Iso Wall A (brick) | +9.9 |
| Iso Object | +10.8 |
| Iso Pillar | +11.0 |
| Game survivor (processed) | +8.8 |
| Game ZombieCop1 (processed) | +8.2 |
| Pack CityZombie1 | +11.0 |

→ **The entire base scene is consistently warm-neutral (R−B ≈ +5 to +11).** No cool/blue
asset to fight the warm ones. This is the single biggest win: temperature already unifies
the set, so a *warm* global grade will reinforce rather than fight the source art.

**Outliers (all are intentional accents, but they run hot):**
- Iso **Splat** (blood): +36 warmth, **sat 0.64** — strong red.
- Iso **Flora / Tree**: **sat 0.69–0.79** — vivid greens.
- Pack **Survivor** body / **CityZombie3**: +25 / +28 warmth, sat 0.37–0.45.
- Game **ZombieRadioactive1**: green, **brightness 0.435** (nearly 4× the wall baseline).
- Game **`_fx/` (acid/blood)**: warmth **+74**, **sat 0.80**, brightness 0.48 — effectively neon.

---

## 3. Brightness, contrast & lighting amplitude — THE ACTUAL MISMATCH

This is where cohesion breaks without treatment. Brightness `val` = avg max-channel (0–1);
luminance percentiles p05/p95 show the dark-to-light spread.

| Asset | brightness `val` | lum p05 | lum p95 | lum range |
|---|---|---|---|---|
| Iso Flora | 0.094 | 0 | 52 | 52 |
| Iso Car | 0.118 | 0 | 84 | 84 |
| Iso Object | 0.137 | 3 | 65 | 61 |
| Iso Wall A | 0.166 | 7 | 90 | 83 |
| Iso Ground | 0.256 | 27 | 87 | 60 |
| **Iso environment (typical)** | **~0.10–0.20** | low | **~65–90** | moderate |
| **Pack CityZombie1 (raw)** | **0.348** | 12 | **172** | **160** |
| **Pack Survivor (raw)** | 0.224 | 14 | 85 | 71 |
| Game ZombieRadioactive1 | **0.435** | 0 | 173 | 173 |
| Game survivor (processed) | 0.184 | 0 | 137 | 137 |

**Problems:**
- **Characters are brighter than the world they stand on.** Raw CityZombie val 0.35 vs
  walls/ground ~0.10–0.20. Dropped onto a tile floor, raw characters look lit by a different
  (brighter) sun and visually detach.
- **Characters carry far hotter highlights.** Character p95 ≈ 137–173 vs environment p95 ≈
  65–90. Their speculars/highlights blow ~2× brighter than anything in the set, breaking the
  shared "overcast, sun-down" key the tiles imply.
- **Lighting *direction* is consistent** (top-left key, shadows fall lower-right on both tiles
  and character renders — the pack ships matching shadowed and `_Shadowless` variants, and the
  iso tiles bake the same key), so this is a **tone/exposure** mismatch, not a relighting job.

---

## 4. Recommended unifying treatment (specific & actionable)

Goal: pull everything into one **gritty, warm, slightly-underexposed "dusk" key.** Apply as a
**global post grade over the composited scene** (cheapest, guarantees unity) and bake a
lighter version of the *character* corrections into the sprite-processing step so they don't
out-shine the floor before the grade even runs.

**A. Tame the characters first (sprite-processing pass, per-sprite, before the global grade):**
1. **Highlight rolloff / exposure pull on characters:** multiply character RGB ~**0.82–0.88**
   and soft-clip highlights so character p95 drops from ~150–170 into the **~95–110** band that
   matches the environment's p95. This alone seats the cast on the floor.
2. **De-pop the radioactive/FX greens:** desaturate `ZombieRadioactive*` and the `_fx/` acid
   sheet by ~**25–35%** and dim ~10–15%, so sat falls from 0.36–0.80 toward the ~0.20–0.30
   scene norm. Keep them *readable* as hazards, just not neon.

**B. Global color-grade over the whole scene (one shader/LUT — environment + cast + FX):**
3. **Warm filmic tone curve:** lift blacks slightly (avoid crushed mud on the dark walls,
   p05 ≈ 0–7), pull highlights, add a gentle S-curve for grit. Target a **mid-key, contrasty**
   look — environment range is moderate (~60–85), so an S-curve adds the "gritty bite" the
   tiles currently lack without clipping.
4. **Warm tint / split-tone:** the set is already warm (+5 to +11); push a subtle **warm
   amber/sepia in highlights + a desaturated cool-teal in shadows** (classic post-apoc grade).
   This *unifies the saturated accents* (blood reds, foliage greens) by pulling them toward a
   common tonal envelope instead of letting each accent read as its own hue.
5. **Global saturation −10 to −15%** after tinting. Brings vivid Flora (0.69–0.79) and Splats
   (0.64) down toward the muted base (walls/ground/cars ~0.12–0.26) for a consistent grime.
6. **Dark vignette + very light unifying haze:** a radial vignette darkening the frame edges
   ~15–25% (a) focuses the action, (b) hides the tile-grid seams at screen edges, and (c) is
   the single most effective trick for making scattered iso props read as "one murky place."
   Optionally a faint low-saturation atmospheric fog tint over distance to glue depth layers.
7. **Subtle grain/dirt overlay** (low-opacity noise, ~3–6%) across everything to add shared
   "grit" texture and, importantly, to **mask the resolution gap** between native-128 tiles
   and downscaled character frames so nothing looks suspiciously cleaner than its neighbor.

**C. Anchor with the existing dark FX:** the pack's blood `Splat` tiles and the `_fx/` blood
already share the scene's warm pedigree — use blood splats liberally on the ground as connective
grime; they tie cast and floor together thematically once globally desaturated per step 5.

**Order of operations:** per-sprite character exposure pull (A) → composite → filmic curve →
warm/teal split-tone → global desaturate → vignette → grain. The character pull (A) is the
load-bearing fix; the global grade (B) is what turns "consistent" into "cohesive and gritty."

---

## 5. Clash inventory (quick reference)

| Clash | Severity | Fix |
|---|---|---|
| Pixel vs pre-rendered | **None** — all pre-rendered 3D w/ AA | — |
| Color temperature split | **None** — all warm-neutral +5..+11 | — |
| Lighting *direction* | **None** — shared top-left key | — |
| Characters brighter than environment | **High** | exposure pull on char (A1) |
| Character highlights blow ~2× hotter (p95 150–170 vs 65–90) | **High** | highlight rolloff (A1) + filmic curve (B3) |
| Radioactive/`_fx` greens & yellows neon (sat 0.36–0.80) | **Medium** | desaturate + dim (A2, B5) |
| Vivid Flora/Splat saturation vs muted base | **Medium** | global −10..15% sat (B5) |
| Resolution gap (native-128 tiles vs resampled char frames) | **Low** | uniform Lanczos downscale + grain mask (B7) |

