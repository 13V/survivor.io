# 13 — $ZOMBIE Web3 Scaffold (devnet only)

> **Status: scaffold/plumbing only.** No mainnet, no real mint, no value moves.
> Read doc 10 first — it's the law/risk/architecture brief. This file just
> documents the seams that are now in the codebase.

## What's wired

| Piece | File | Does |
|---|---|---|
| Token config + settlement contract | `src/web3/zombie.ts` | `$ZOMBIE` constants (devnet), claim request/response types, `buildChallenge`, `requestClaim` (stub), `fetchOnchainBalance` (stub), `estimateTokens` |
| Wallet connector | `src/web3/wallet.ts` | Detect injected wallets (Phantom/Solflare/Backpack), `connect`, `signMessage`, `disconnect` — no SDK dependency |
| Wallet UI | `src/ui/wallet.ts` | Floating 👛 panel: DEVNET badge, token info, connect → sign challenge → (stub) claim |

The soft **coins** currency stays off-chain and is **never trusted by the client**
(it's `localStorage` — editable). Coins are display/estimate only here.

## The settlement contract (client → server)

The client connects a wallet, signs a single-use challenge, and asks the backend
to settle. The **backend is authoritative** for how much (if anything) mints.

```
POST /api/zombie/claim
{ wallet, message, signature, coinsRequested }   // ClaimRequest
→ { ok, reason?, txSig?, minted? }               // ClaimResult
```

Server MUST: verify `signature` against `wallet` for `message`; look up the
player's authoritative off-chain balance (NOT `coinsRequested`); apply the daily
cap; debit the ledger; then mint/transfer devnet `$ZOMBIE` to the wallet's ATA
and return the tx signature. Treasury/mint authority lives server-side (multisig),
never in the client.

## To take it to devnet (build order, per doc 10)

1. `spl-token create-token --decimals 9` on devnet; add Metaplex metadata; set
   `ZOMBIE.mint`.
2. Stand up the `/api/zombie/claim` backend: ed25519 signature verify → ledger →
   `@solana/kit` + `@solana-program/token` mint/transfer → return `txSig`. Enable
   the commented `fetch` in `requestClaim`.
3. Implement `fetchOnchainBalance` via a dedicated RPC (Helius) reading the ATA.
4. (Production) swap the injected-provider detection for the Wallet Standard
   (`@wallet-standard/app`), add priority fees, and put the treasury behind a
   multisig (Squads).

## What is deliberately NOT here

Mainnet, a real mint, mint authority/keys, and any cash-out path. Per doc 10,
a convertible/cashable currency implicates money-transmission / AML / securities /
gambling law — keep it closed-loop and get counsel before issuing anything real.
