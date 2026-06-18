# 07 — Economy, Currencies & Live-Ops

## Currencies & resources

| Currency | Earned by | Spent on |
|---|---|---|
| **Gold (Coins)** | Run completion, Patrol/AFK, ads | Leveling/enhancing equipment & tech parts (soft sink) |
| **Gems (Diamonds)** — premium | Level-ups, Trials first-clears, achievements, dailies, mailbox, Ender's Echo, IAP | Equipment summons, energy refills, gold, character shards. **Primary premium sink** |
| **Energy (Stamina)** | Regen ~1/20min, ads (+5, 3×/day), gem refill, login | Stage runs (**~5 energy/run**), Quick Patrol (15) |
| **Special-Op Tickets** | Events/missions, codes, mailbox | Free-track equipment summons |
| **Equipment Designs** | Survivor Pass, daily shop, events, Patrol | Upgrading/leveling equipment (with gold) |
| **Energy Essence** | Patrol, Survivor Pass, Ender's Echo, dailies | Leveling characters (XP) |
| **Tech Parts** (7 grades) | Chapters, Ender's Echo, dailies, shop | Boost stats + enhance specific skills |
| **Character/S Shards** | Levels, bosses, Special Ops, events | Unlock & star-up characters |
| **Astral Forge stones** | Endgame/events | Astral Forge (Red/Legend gear only) |
| **Event Tokens** | Event missions, daily ad-pull, IAP | Limited-time event gacha |
| **In-run XP orbs** | Killing enemies (in-run) | In-run level-ups; **resets every run** |

**Two structural separations to preserve:** in-run XP (ephemeral) vs Energy Essence (persistent char level); and free summon currency (Tickets) vs premium (Gems).

## Equipment gacha / summon

- Chest types: **Army Crate** (~80 gems), **EDF Supplies**, **Large Depot** (10-pull guarantees ≥1 Excellent), **S-Grade Supplies** (300 gems/1, 2,680/10).
- **Pity:** **Excellent guaranteed every 10 opens**; the counter **resets to 10 if you pull an Excellent/S-grade earlier**. **Per-rarity % rates are not publicly disclosed by Habby** (you'll have to set your own — and on-chain you'd *need* to).
- **Merge** drives rarity: **3→1** at low tiers, escalating at Purple+ (S-grade reached mostly by merging up, not pulling).

## Persistent progression (separate tracks)
Character roster + star upgrades; character level (Essence); equipment collection (level + merge — the dominant power vector); Tech Parts; in-run skill evolution; Trials/Adventure first-clears; achievements. **No traditional PvP** — the only "competition" is score-attack leaderboards (Ender's Echo).

## Energy gating (the core throttle)
~5 energy/run; regen ~1/20min; refills via ads (+5, 3×/day) then gems. **Quick Patrol** is a second sink (15 energy → 5h idle, 3×/day). **Patrol/AFK** accrues gold + materials, capped 24h. Energy caps active play; ads/gems are the release valves — the single most important live-ops dial.

## Monetization model (Habby's "progressive" design)
Features unlock sequentially so players are hooked before friction. Spend drivers, by leverage: energy friction → Gold Piggy Bank (earn-then-pay-to-claim) → recurring ad packs (habit) → Survivor Pass ($20/season) → event gacha (sunk-cost) → equipment gem-gacha (whale sink) → monthly card/subscription → starter packs. "Almost every action can be accelerated by an ad."

## Implications for the clone + token economy

**Map cleanly to a token (good faucet/sink candidates):**
- Keep **soft currency (Gold) off-chain**; mirror only a **premium token (Gems-equivalent)** on-chain. Run-loop currency stays off-chain for speed/cost.
- **Equipment merge (3→1) = natural deflationary NFT burn** — the cleanest economic primitive to port; gives the token a real sink + a secondary market.
- Battle Pass / event gacha purchasable in token = recurring demand.
- Astral Forge stones = high-end low-supply burn for whales.

**Pitfalls (critical — see also doc 10):**
- **Undisclosed gacha odds won't fly on-chain** — you'll need **verifiable published rates + provably-fair RNG (VRF)**. Don't copy Habby's opacity.
- **Ad-reward faucets don't translate** — "watch ad for energy/gold" becomes unbounded **bot-farmable inflation**. Replace with task/quest faucets.
- **AFK/Patrol = passive emission** → play-to-earn death-spiral risk if idle rewards mint tradable tokens. Keep idle rewards in a **non-transferable soft currency**.
- **Energy-for-token = pay-to-play optics** that contradict "browser-accessible." Keep energy soft-only; reserve token for cosmetics/gear NFTs/pass.
- **Dual-currency discipline:** only the **premium tier + tradable gear** should touch the chain; putting grind currency on-chain guarantees inflation.
- **No PvP = no built-in competitive token sink.** If you want sustained demand you must **add** a ranked/seasonal sink survivor.io lacks.

---
### Sources
One Chilled Gamer (equipment); survivor.io Fandom (Equipment, Tech Parts, Survivor Pass, S-grade); mturbogamer (pass, S-grade, gem spend, Patrol); gamigion (monetization masterclass); WriterParty (supplies merge, energy); Pocket Gamer (gems/patrol); AppGamer/Pro Game Guides (Ender's Echo). Exact gacha %s, high-tier merge ratios, subscription specifics, and Patrol per-hour rates are loosely documented and version-dependent.
