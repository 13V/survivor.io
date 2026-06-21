// Minimal, dependency-free Solana wallet connector for the devnet scaffold.
//
// Detects injected providers (Phantom / Solflare / Backpack), connects, and
// signs a challenge message so a backend can verify wallet ownership server-side
// (the auth half of "off-chain game, on-chain settlement"). Production should
// move to the Wallet Standard (`@wallet-standard/app` getWallets) + a real RPC;
// this keeps the bundle clean and works against the common injected wallets.
//
// The private key never leaves the wallet — we only ever receive a public key
// and signatures.

interface SolanaProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  publicKey?: { toString(): string } | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect?(): Promise<void>;
  signMessage?(
    message: Uint8Array,
    display?: string,
  ): Promise<{ signature: Uint8Array } | Uint8Array>;
}

export interface DetectedWallet {
  name: string;
  provider: SolanaProvider;
}

export interface WalletInfo {
  name: string;
  publicKey: string; // base58
}

function toB64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

export class WalletConnector {
  private provider: SolanaProvider | null = null;
  publicKey: string | null = null;
  name = '';

  /** Injected Solana wallets currently available in this browser. */
  detected(): DetectedWallet[] {
    const w = window as unknown as {
      solana?: SolanaProvider;
      solflare?: SolanaProvider;
      backpack?: SolanaProvider;
    };
    const out: DetectedWallet[] = [];
    const seen = new Set<SolanaProvider>();
    const add = (name: string, p?: SolanaProvider) => {
      if (p && !seen.has(p)) {
        seen.add(p);
        out.push({ name, provider: p });
      }
    };
    add(w.solana?.isPhantom ? 'Phantom' : 'Solana', w.solana);
    add('Solflare', w.solflare);
    add('Backpack', w.backpack);
    return out;
  }

  isConnected(): boolean {
    return !!this.publicKey;
  }

  /** Connect the first detected wallet (or a named one). Throws if none. */
  async connect(name?: string): Promise<WalletInfo> {
    const wallets = this.detected();
    const chosen = name ? wallets.find((x) => x.name === name) : wallets[0];
    if (!chosen) throw new Error('No Solana wallet detected');
    const res = await chosen.provider.connect();
    this.provider = chosen.provider;
    this.name = chosen.name;
    this.publicKey = res.publicKey.toString();
    return { name: this.name, publicKey: this.publicKey };
  }

  async disconnect(): Promise<void> {
    try {
      await this.provider?.disconnect?.();
    } finally {
      this.provider = null;
      this.publicKey = null;
      this.name = '';
    }
  }

  /** Sign a UTF-8 challenge; returns a base64 signature for the backend to verify. */
  async signMessage(message: string): Promise<string> {
    if (!this.provider?.signMessage) throw new Error('Wallet cannot sign messages');
    const bytes = new TextEncoder().encode(message);
    const result = await this.provider.signMessage(bytes, 'utf8');
    const sig = result instanceof Uint8Array ? result : result.signature;
    return toB64(sig);
  }
}
