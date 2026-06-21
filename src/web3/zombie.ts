// $ZOMBIE — Solana companion token, DEVNET SCAFFOLD ONLY.
// ---------------------------------------------------------------------------
// This is the *plumbing*, not a live economy. Nothing here moves real value.
//
// Architecture (see docs/10-SOLANA-TOKEN.md): the game runs OFF-CHAIN and only
// economically-meaningful outcomes settle ON-CHAIN, enforced SERVER-SIDE. In
// particular, the soft "coins" currency stays off-chain and is NOT trusted by
// the client — it lives in localStorage and is trivially editable, so a claim
// must be authorized by a backend that holds the authoritative balance. The
// client's only jobs are: (1) connect a wallet, (2) sign a challenge so the
// backend can verify ownership, (3) ask the backend to settle a claim.
//
// What is intentionally NOT here: mainnet, a real mint, mint authority, private
// keys, or any cash-out. Per the doc, a convertible/cashable currency implicates
// money-transmission / AML / securities / gambling law — keep it closed-loop and
// get counsel before issuing anything real.
// ---------------------------------------------------------------------------

export const ZOMBIE = {
  symbol: 'ZOMBIE',
  decimals: 9,
  cluster: 'devnet' as const,
  // Placeholder — replace with the real devnet mint after:
  //   spl-token create-token --decimals 9     (then Metaplex metadata)
  mint: 'ZoMBdevNETpLAcEhoLDER1111111111111111111111',
  rpc: 'https://api.devnet.solana.com',
  // Informational only (DISPLAY/ESTIMATE) — the real number is enforced
  // server-side at settlement. The client never decides how much is minted.
  coinsPerToken: 1000, // 1,000 off-chain coins ≈ 1 ZOMBIE (estimate shown to the player)
  dailyClaimCap: 50, // server-enforced anti-faucet cap, surfaced in the UI
  claimEndpoint: '/api/zombie/claim', // server-authoritative settlement seam (NOT deployed)
};

/** Estimate the claimable token amount for a coin balance (display only). */
export function estimateTokens(coins: number): number {
  if (!Number.isFinite(coins) || coins <= 0) return 0;
  return Math.floor((coins / ZOMBIE.coinsPerToken) * 100) / 100;
}

// ---- Client <-> server settlement contract --------------------------------
// The backend verifies the signature against `wallet`, re-checks the player's
// authoritative off-chain balance, applies the daily cap, then (and only then)
// mints/transfers devnet ZOMBIE to the wallet's ATA and returns the tx sig.

export interface ClaimRequest {
  wallet: string; // base58 public key
  message: string; // the exact challenge string that was signed
  signature: string; // base64 signature of `message`
  /** The player's claimed coin spend; the SERVER ignores this and uses its own
      authoritative ledger — sent only so the request is self-describing. */
  coinsRequested: number;
}

export interface ClaimResult {
  ok: boolean;
  reason?: string;
  txSig?: string; // on success, the devnet settlement transaction signature
  minted?: number; // tokens actually settled (server-decided)
}

/** A fresh, single-use challenge for the wallet to sign (replay protection). */
export function buildChallenge(wallet: string): string {
  const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `OUTBREAK SURVIVORS — authorize $ZOMBIE devnet claim\nwallet:${wallet}\nnonce:${nonce}`;
}

/**
 * Request a settlement from the backend. In this scaffold the backend is not
 * deployed, so this resolves to a clear "not wired" result instead of touching
 * the network. The real implementation is the commented fetch below.
 */
export async function requestClaim(req: ClaimRequest): Promise<ClaimResult> {
  // --- Real implementation (enable once the backend exists) ----------------
  // const res = await fetch(ZOMBIE.claimEndpoint, {
  //   method: 'POST',
  //   headers: { 'content-type': 'application/json' },
  //   body: JSON.stringify(req),
  // });
  // if (!res.ok) return { ok: false, reason: `settlement failed (${res.status})` };
  // return (await res.json()) as ClaimResult;
  void req;
  return {
    ok: false,
    reason: 'Devnet scaffold: settlement backend is not deployed. Wiring point: POST ' + ZOMBIE.claimEndpoint,
  };
}

/**
 * Read the wallet's on-chain ZOMBIE balance. Stubbed — the real version uses a
 * dedicated RPC (Helius/QuickNode) via @solana/kit + @solana-program/token to
 * read the Associated Token Account for (wallet, ZOMBIE.mint). Returns null
 * here because the mint is a placeholder and we don't ship the heavy SDK.
 */
export async function fetchOnchainBalance(wallet: string): Promise<number | null> {
  void wallet;
  return null;
}
