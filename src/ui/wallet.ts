// $ZOMBIE wallet panel — DEVNET SCAFFOLD UI.
// Floating launcher + modal (same pattern as the other between-runs screens).
// Lets the player connect a Solana wallet and sign an ownership challenge (the
// client half of server-authoritative settlement). Deliberately demoable but
// inert: it moves no real value and the claim is explicitly not wired.
import { meta } from '../meta/save';
import { ZOMBIE, estimateTokens, buildChallenge, requestClaim } from '../web3/zombie';
import { WalletConnector } from '../web3/wallet';

const CSS = `
.wal-btn {
  position: fixed; top: 12px; left: 156px; z-index: 22;
  width: 40px; height: 40px; border-radius: var(--r-sm);
  background: var(--surface-1); border: 1px solid var(--stroke);
  color: var(--hp); font-size: 20px; cursor: pointer;
  box-shadow: var(--e1), var(--bevel);
  -webkit-backdrop-filter: blur(var(--glass-blur)); backdrop-filter: blur(var(--glass-blur));
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.wal-btn:hover { background: var(--surface-2); border-color: var(--stroke-strong); }
.wal-btn:active { transform: scale(0.93); }
.wal-btn[hidden] { display: none; }

.wal-overlay {
  position: fixed; inset: 0; z-index: 25; overflow-y: auto;
  background: rgba(5,7,12,0.84); -webkit-backdrop-filter: blur(var(--glass-blur)); backdrop-filter: blur(var(--glass-blur));
  display: flex; align-items: flex-start; justify-content: center; padding: var(--s5) var(--s3);
}
.wal-overlay[hidden] { display: none; }
.wal-panel { width: min(520px, 96vw); display: flex; flex-direction: column; gap: var(--s3); }
.wal-head { display: flex; align-items: center; justify-content: center; gap: var(--s2); margin-top: var(--s2); }
.wal-head h2 { margin: 0; color: var(--hp); letter-spacing: 2px; font-size: var(--fz-lg); text-shadow: 0 0 18px rgba(123,160,82,0.35); }
.wal-net { font-size: var(--fz-xs); font-weight: 800; letter-spacing: 1px; padding: 2px 8px; border-radius: var(--r-pill); background: var(--surface-2); border: 1px solid var(--boss); color: var(--boss); }
.wal-warn {
  font-size: var(--fz-xs); line-height: 1.4; text-align: center; opacity: 0.7;
  background: var(--surface-1); border: 1px solid var(--hairline); border-radius: var(--r-sm); padding: var(--s2) var(--s3);
}
.wal-card { background: var(--surface-1); border: 1px solid var(--stroke); border-radius: var(--r-md); padding: var(--s3); box-shadow: var(--e1), var(--bevel); }
.wal-row { display: flex; justify-content: space-between; align-items: center; font-size: var(--fz-sm); padding: 3px 0; font-variant-numeric: tabular-nums; }
.wal-row .k { opacity: 0.6; }
.wal-row .v { font-weight: 700; }
.wal-row .v.mono { font-family: ui-monospace, monospace; font-size: var(--fz-xs); opacity: 0.85; }
.wal-row .v.tok { color: var(--hp); }
.wal-status { font-size: var(--fz-xs); text-align: center; opacity: 0.8; min-height: 14px; }
.wal-actions { display: flex; gap: var(--s2); justify-content: center; flex-wrap: wrap; }
.wal-bn {
  pointer-events: auto; padding: 9px 16px; border-radius: var(--r-sm); cursor: pointer;
  font: inherit; font-weight: 800; font-size: var(--fz-sm); border: 1px solid var(--stroke);
  background: var(--surface-2); color: #ece4d2; transition: filter 0.12s, transform 0.08s, opacity 0.12s;
}
.wal-bn:hover:not(:disabled) { filter: brightness(1.12); border-color: var(--stroke-strong); }
.wal-bn:active:not(:disabled) { transform: translateY(1px) scale(0.98); }
.wal-bn:disabled { opacity: 0.45; cursor: default; }
.wal-bn.primary { background: linear-gradient(180deg, #9bc274, var(--hp) 60%, var(--hp-deep)); color: #10210a; border-color: var(--hp); }
.wal-link { color: var(--accent); }
.wal-done { align-self: center; margin-top: var(--s1); }
`;

const short = (s: string): string => (s.length > 12 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s);

export class WalletPanel {
  private btn: HTMLButtonElement;
  private overlay: HTMLElement;
  private wallet = new WalletConnector();
  private status = '';
  private signed = '';

  constructor(root: HTMLElement) {
    if (!document.getElementById('wallet-css')) {
      const st = document.createElement('style');
      st.id = 'wallet-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    this.btn = document.createElement('button');
    this.btn.className = 'wal-btn';
    this.btn.setAttribute('data-ui', '');
    this.btn.textContent = '👛';
    this.btn.title = '$ZOMBIE Wallet (devnet)';
    this.btn.hidden = true;
    this.btn.onclick = () => this.open();
    root.appendChild(this.btn);

    this.overlay = document.createElement('div');
    this.overlay.className = 'wal-overlay';
    this.overlay.setAttribute('data-ui', '');
    this.overlay.hidden = true;
    root.appendChild(this.overlay);
  }

  setVisible(v: boolean): void {
    this.btn.hidden = !v;
  }

  private open(): void {
    this.render();
    this.overlay.hidden = false;
  }

  private close(): void {
    this.overlay.hidden = true;
  }

  private render(): void {
    const coins = meta.getProfile().coins;
    const est = estimateTokens(coins);
    const connected = this.wallet.isConnected();
    const wallets = this.wallet.detected();

    let connectHtml: string;
    if (connected) {
      connectHtml =
        `<div class="wal-row"><span class="k">Wallet</span><span class="v">${this.wallet.name}</span></div>` +
        `<div class="wal-row"><span class="k">Address</span><span class="v mono">${short(this.wallet.publicKey!)}</span></div>` +
        `<div class="wal-actions">` +
        `<button class="wal-bn" data-act="sign" data-ui>Sign ownership challenge</button>` +
        `<button class="wal-bn primary" data-act="claim" data-ui>Claim ${est} $ZOMBIE</button>` +
        `<button class="wal-bn" data-act="disconnect" data-ui>Disconnect</button>` +
        `</div>`;
    } else if (wallets.length) {
      connectHtml = `<div class="wal-actions"><button class="wal-bn primary" data-act="connect" data-ui>Connect ${wallets[0].name}</button></div>`;
    } else {
      connectHtml = `<div class="wal-status">No Solana wallet detected. Install <a class="wal-link" href="https://phantom.app" target="_blank" rel="noopener">Phantom</a> to try the connect + sign flow.</div>`;
    }

    this.overlay.innerHTML =
      `<div class="wal-panel">` +
      `<div class="wal-head"><h2>$ZOMBIE WALLET</h2><span class="wal-net">DEVNET</span></div>` +
      `<div class="wal-warn">Prototype scaffold — <b>not real money</b>. Coins stay off-chain; any claim is settled <b>server-side</b> (not deployed). See docs/10-SOLANA-TOKEN.md.</div>` +
      `<div class="wal-card">` +
      `<div class="wal-row"><span class="k">Token</span><span class="v tok">$${ZOMBIE.symbol}</span></div>` +
      `<div class="wal-row"><span class="k">Cluster</span><span class="v">${ZOMBIE.cluster}</span></div>` +
      `<div class="wal-row"><span class="k">Mint</span><span class="v mono">${short(ZOMBIE.mint)}</span></div>` +
      `<div class="wal-row"><span class="k">Your coins</span><span class="v">🪙 ${coins}</span></div>` +
      `<div class="wal-row"><span class="k">Estimated claim</span><span class="v tok">${est} $ZOMBIE</span></div>` +
      `<div class="wal-row"><span class="k">Rate · daily cap</span><span class="v">${ZOMBIE.coinsPerToken}/tok · ${ZOMBIE.dailyClaimCap}/day</span></div>` +
      `</div>` +
      `<div class="wal-card">${connectHtml}<div class="wal-status">${this.signed || this.status}</div></div>` +
      `<button class="btn wal-done" data-ui>Done</button>` +
      `</div>`;

    this.bind();
  }

  private bind(): void {
    const on = (act: string, fn: () => void) => {
      const el = this.overlay.querySelector(`[data-act="${act}"]`) as HTMLButtonElement | null;
      if (el) el.onclick = fn;
    };
    on('connect', () => void this.doConnect());
    on('disconnect', () => void this.doDisconnect());
    on('sign', () => void this.doSign());
    on('claim', () => void this.doClaim());
    const done = this.overlay.querySelector('.wal-done') as HTMLButtonElement | null;
    if (done) done.onclick = () => this.close();
  }

  private async doConnect(): Promise<void> {
    this.status = 'Connecting…';
    this.signed = '';
    this.render();
    try {
      await this.wallet.connect();
      this.status = '';
    } catch (e) {
      this.status = `Connect failed: ${(e as Error).message}`;
    }
    this.render();
  }

  private async doDisconnect(): Promise<void> {
    await this.wallet.disconnect();
    this.status = '';
    this.signed = '';
    this.render();
  }

  private async doSign(): Promise<void> {
    try {
      const sig = await this.wallet.signMessage(buildChallenge(this.wallet.publicKey!));
      this.signed = `✓ Challenge signed (${short(sig)}). A backend would verify this before settling.`;
    } catch (e) {
      this.signed = `Sign failed: ${(e as Error).message}`;
    }
    this.render();
  }

  private async doClaim(): Promise<void> {
    this.status = 'Requesting settlement…';
    this.render();
    const msg = buildChallenge(this.wallet.publicKey!);
    let signature = '';
    try {
      signature = await this.wallet.signMessage(msg);
    } catch (e) {
      this.status = `Sign failed: ${(e as Error).message}`;
      this.render();
      return;
    }
    const result = await requestClaim({
      wallet: this.wallet.publicKey!,
      message: msg,
      signature,
      coinsRequested: meta.getProfile().coins,
    });
    this.status = result.ok ? `Settled: ${result.minted} $ZOMBIE (${short(result.txSig ?? '')})` : result.reason ?? 'Claim failed';
    this.signed = '';
    this.render();
  }
}
