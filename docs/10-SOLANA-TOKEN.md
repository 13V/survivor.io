# 10 — Solana Companion Token

> **⚠️ INFORMATIONAL ONLY — NOT LEGAL OR FINANCIAL ADVICE.** Tying a tradable token to a game economy can implicate **securities law**, **gambling/loot-box law**, and **money-transmission/AML** regimes, with severe penalties. The law is fast-moving, fact-specific, and jurisdictional. **Engage qualified securities, gaming, and money-transmission counsel — to review token structure AND all marketing copy — before issuing, selling, or marketing any token or NFT.** Nothing here is advice.

This is a **separate, later phase** from the game. Ship and retain players with a fun game first; the token is meaningless without it.

## The architecture that keeps you sane (and lower-risk): off-chain game, on-chain settlement
Standard Web3-gaming pattern: **gameplay runs off-chain** (latency, cost, anti-cheat) and only **ownership + economically meaningful outcomes settle on-chain** (purchases, item ownership, reward claims). Putting real-time combat on-chain is infeasible. The smaller the on-chain surface, the lower the cost, the UX friction, AND the regulatory/security surface. (Canonical example: Axie ran battles off-chain, settled assets on-chain.)

## Launching the token

### SPL Token vs Token-2022
- **Original SPL Token Program + Metaplex metadata** → maximum wallet/DEX/launchpad compatibility. **Recommended for a public companion token.**
- **Token-2022 / Token Extensions** (transfer fees, on-chain metadata, non-transferable/"soulbound", permanent delegate, transfer hooks) → reserve for **closed in-game assets** (e.g. soulbound achievements) where an extension genuinely helps and your wallets/marketplaces support it. A fee-on-transfer can break DEX/aggregator routing.

### Mint mechanics
A token = a **mint account** (decimals, supply, mint authority, freeze authority) + per-holder **Associated Token Accounts (ATAs)**. Standard sequence:
```
spl-token create-token --decimals 9      # create mint
spl-token create-account <MINT>          # your ATA
spl-token mint <MINT> <SUPPLY>           # mint full supply
spl-token authority <MINT> mint --disable    # revoke mint authority → fixed supply
spl-token authority <MINT> freeze --disable  # revoke freeze authority
```
Tooling: `@solana/web3.js` (legacy v1, still `latest`) **or** the modern **`@solana/kit`** (the renamed "web3.js v2", now v6.x) + `@solana-program/token`; `@solana/spl-token` for the classic `createMint` helper; **Metaplex Token Metadata** for name/symbol/image/URI.

### Launchpad vs DIY
| | Launchpad (pump.fun) | DIY (mint + seed DEX pool) |
|---|---|---|
| Upfront capital | ~0 (bonding curve provides liquidity) | seeded liquidity (~5–20+ SOL) + ~1–4 SOL fees |
| Control / allocation | low (fixed 1B/6-dec template, fair launch, no dev allocation) | full (supply, decimals, vesting) |
| Distribution | viral, permissionless; mercenary buyers | you bootstrap demand |
| Credibility | "fair launch" but **strong memecoin/rug association** | looks like a "real project" with locks + transparency |

pump.fun (2026 facts): **free creation**, **1.25% curve fee** (0.95% protocol / 0.30% creator), graduates at ~$69k mcap, **auto-migrates to its own PumpSwap DEX** (0.015 SOL fee). Alternatives: **bonk.fun/LetsBONK** (on Raydium LaunchLab, funds BONK buyback-burn), **Moonshot** (mobile-first + fiat onramp), **Raydium LaunchLab** (DIY-ish, deep liquidity), **Believe** (tweet-to-launch).
**For a companion token to a game you'll maintain, DIY (or a "serious" launch) gives control + vesting + narrative**; the pump.fun brand is double-edged (instant reach, but reads "memecoin until proven otherwise").

### Three credibility levers (do at launch)
1. **Revoke mint authority** → supply can never inflate.
2. **Revoke freeze authority** → you can't freeze holders.
3. **Burn or long-lock LP** (≥80–100%, 6–12 mo; burn > time-lock). Plus transparent tokenomics + vesting. All are publicly visible on DexScreener/Birdeye/RugCheck — which is exactly why legitimate projects do them and rugs don't.

## Wallet + game integration
- **Connect/sign:** `@solana/wallet-adapter` (React) — wrap app in `ConnectionProvider` → `WalletProvider` → `WalletModalProvider`; `useWallet()` exposes `publicKey` + signing. Supports Phantom/Solflare/Backpack via the **Wallet Standard** (per-wallet adapters are being deprecated in favor of it). Modern alternative: `@solana/kit` + `@solana/react` Wallet-Standard hooks. **The private key never leaves the wallet — your app only gets signatures; your backend never holds user keys.**
- **Purchases:** **Solana Pay** (`@solana/pay`, now on `@solana/kit`) — "Transaction Request" lets your backend define exactly what the user pays (price, recipient, `reference`), then verify on-chain that the referenced payment landed.
- **Token-gating:** verify ownership by mint address. **Enforce server-side** — client-side gating is cosmetic (anyone can edit a browser). Pattern: wallet signs a challenge message → backend verifies signature **and** re-checks the on-chain holding at access time → issues a short-lived session.
- **NFT items:** **Metaplex Core** (single-account, ~80% cheaper than Token Metadata) for standard items; **compressed NFTs (cNFTs) via Metaplex Bubblegum** for mass/low-value items (~100k for ~4 SOL; 1M for ~$110–500) — gaming is a primary cNFT adopter. cNFTs rely on RPC/DAS indexers (Helius).
- **Infra:** develop on **devnet** (free airdrops) → swap RPC for **mainnet-beta**. Use a **dedicated RPC** (Helius for native token/DAS APIs, QuickNode, Triton) — the public endpoint is rate-limited and not for production. Add a **priority-fee** strategy for congestion. Treasury + any retained authority behind a **multisig** (e.g. Squads).

## Risk & compliance (read before anything)
- **Securities (Howey):** a token can be an "investment contract" if there's investment of money in a common enterprise with **expectation of profit from others' efforts**. The **March 2026 SEC interpretive release** (supersedes the 2019 framework) carves out **digital commodities, digital collectibles (NFTs/memecoins), and digital tools** as generally non-securities — but **Howey still binds**, "efforts of others" representations must be explicit, and **anti-fraud liability survives even after a token "separates" from any investment contract**. A consumer-utility, non-investment-marketed token is more defensible; **marketing and economic design are as load-bearing as the code.** State "blue-sky" laws + non-US regimes (EU MiCA, etc.) still apply.
- **Gambling / loot boxes:** paid randomized rewards **convertible to real-world value** trigger gambling law. Because tokens/NFTs are inherently convertible, a token-bought loot box minting **tradable** NFTs is far more exposed than one yielding **non-transferable** cosmetics (Belgium/Netherlands ban paid loot boxes; Apple requires disclosed odds).
- **Money transmission (FinCEN + state):** the pivot is **convertibility**. A **closed-loop** in-game currency spent only inside the game keeps you a "user" (outside MSB rules). The moment the token is **convertible/cashable/exchange-listed** and you issue or facilitate exchange, you risk being an **administrator/exchanger** → FinCEN registration + BSA/AML duties + a patchwork of state licenses. This is the strongest reason to keep in-game currency non-convertible.
- **App-store rules** (if you ever wrap the web game natively): Apple **prohibits NFT ownership unlocking app features** (kills token-gating in a native iOS app) and bars "currency for completing tasks"; Google Play bars promoting earnings and un-vetted chance-to-win-NFT mechanics. **A major reason such games stay browser/web-based.**
- **Play-to-earn death spiral:** emitting a token faster than it's sunk hyperinflates supply and collapses price (**Axie's SLP**: minted via play, few sinks, ~99% collapse; the Ronin bridge $625M hack compounded it). **Lesson: don't mint tokens as a gameplay reward at launch.** Use a **fixed-supply spending/access currency** with real sinks and hard caps.
- **Reputation:** Solana memecoins are dominated by pump-and-dumps/rugs (Chainalysis: ~3.6% of 2024 tokens showed pump-and-dump signs; ~94% of related pools creator-manipulated). Legitimacy = revoked authorities + locked/burned LP + transparent tokenomics + **real shipping utility**.

## Recommended minimal path (synthesized — get counsel to review)
1. **Narrow purpose:** a **fixed-supply, original-SPL utility token** as an **in-game spending/access currency** (cosmetics, gear, mode access, seasonal entry). **Not** an investment; **not** a P2E emissions faucet.
2. **Sinks-first tokenomics:** fixed supply, public allocations + vesting (team/treasury), concrete sinks (purchases/entry fees/upgrades — e.g. the gear-merge burn from doc 07). No earning faucet at launch.
3. **Build on devnet:** mint + Metaplex metadata; test wallet-adapter connect → build tx → sign → confirm, plus token-gating and a purchase flow.
4. **Wire the game:** wallet-adapter (Phantom/Solflare/Backpack); **server-side signed-message verification** for gating/rewards; **off-chain gameplay, on-chain settlement**; **cNFTs (Bubblegum)** for cheap items; Helius RPC + priority fees.
5. **Mainnet launch** with seeded DEX liquidity (DIY Raydium pool) — or a launchpad only if you specifically want virality and accept the memecoin framing.
6. **Lock trust signals immediately:** revoke mint, revoke freeze, burn/long-lock LP; verify on DexScreener/Birdeye; publish tokenomics; multisig treasury.
7. **Legal review of structure AND marketing** in every jurisdiction you'll distribute to, before launch.

**Build order:** devnet → mint + metadata → wallet connect → purchase tx (Solana Pay) → server-side token-gating → cNFT items → off-chain leaderboard + on-chain batch settlement → scale RPC → **mainnet mint + seed liquidity → revoke authorities + lock/burn LP → publish tokenomics → multisig → legal review.**

---
### Sources
Solana docs (tokens, extensions, clusters, frontend), Anza (kit/web3.js), Metaplex (Token Metadata, Core, Bubblegum), Helius (compression, token-gating, RPC), pump.fun/docs, Raydium/Backpack/Bitget (launchpads); FinCEN 2013/2019 CVC guidance; SEC 2019 framework + March 2026 interpretive release (Sidley, Greenberg Traurig, WilmerHale, Skadden, Fuse no-action); Promise Legal / Apple / Google Play (loot boxes & app-store); Chainlink/Kaleido/Sequence (on/off-chain architecture); Axie/Ronin post-mortems (Molly White, Decrypt, CoinDesk); Chainalysis (scam stats). Full URLs in the research transcripts. **This summary is informational; verify with counsel.**
