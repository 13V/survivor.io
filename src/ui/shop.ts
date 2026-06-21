// Power-Ups shop: spend coins earned from runs/achievements on permanent stat
// upgrades that apply at the start of every run (see meta/upgrades.ts). This is
// the core meta loop — a coin sink that makes every future run stronger.
// Same self-contained pattern as the other between-runs screens: a floating
// launcher button + a modal overlay, styled with the global design tokens.
import { meta } from '../meta/save';
import { META_UPGRADES, nextCost, buyUpgrade, type MetaUpgradeDef } from '../meta/upgrades';
import { audio } from '../audio/sfx';

const CSS = `
.shop-btn {
  position: fixed; top: 12px; left: 108px; z-index: 22;
  width: 40px; height: 40px; border-radius: var(--r-sm);
  background: var(--surface-1); border: 1px solid var(--stroke);
  color: var(--accent); font-size: 20px; cursor: pointer;
  box-shadow: var(--e1), var(--bevel);
  -webkit-backdrop-filter: blur(var(--glass-blur)); backdrop-filter: blur(var(--glass-blur));
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.shop-btn:hover { background: var(--surface-2); border-color: var(--stroke-strong); }
.shop-btn:active { transform: scale(0.93); }
.shop-btn[hidden] { display: none; }

.shop-overlay {
  position: fixed; inset: 0; z-index: 25; overflow-y: auto;
  background: rgba(5,7,12,0.84); -webkit-backdrop-filter: blur(var(--glass-blur)); backdrop-filter: blur(var(--glass-blur));
  display: flex; align-items: flex-start; justify-content: center; padding: var(--s5) var(--s3);
}
.shop-overlay[hidden] { display: none; }
.shop-panel { width: min(760px, 96vw); display: flex; flex-direction: column; gap: var(--s3); }
.shop-head {
  display: flex; align-items: center; justify-content: space-between; gap: var(--s3);
  margin-top: var(--s2);
}
.shop-head h2 {
  margin: 0; color: var(--accent); letter-spacing: 2px; font-size: var(--fz-lg);
  text-shadow: 0 0 18px rgba(201, 162, 78,0.35);
}
.shop-coins {
  display: inline-flex; align-items: center; gap: var(--s2);
  font-weight: 800; font-size: var(--fz-md); font-variant-numeric: tabular-nums;
  padding: 6px var(--s3); border-radius: var(--r-pill);
  background: var(--surface-2); border: 1px solid var(--accent);
  box-shadow: var(--bevel), 0 0 12px rgba(201, 162, 78,0.25);
  text-shadow: var(--ink);
}
.shop-sub { text-align: center; font-size: var(--fz-xs); opacity: 0.55; margin: -4px 0 var(--s1); }
.shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--s2); }
.shop-card {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: var(--s3);
  padding: var(--s3); border-radius: var(--r-md);
  background: var(--surface-1); border: 1px solid var(--stroke);
  box-shadow: var(--e1), var(--bevel);
  -webkit-backdrop-filter: blur(var(--glass-blur)); backdrop-filter: blur(var(--glass-blur));
  transition: border-color 0.15s, box-shadow 0.15s;
}
.shop-card.maxed { border-color: var(--accent); box-shadow: var(--e1), var(--bevel), 0 0 12px rgba(201, 162, 78,0.2); }
.su-ico {
  grid-row: span 2; font-size: 26px; width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--r-sm); background: var(--surface-2); border: 1px solid var(--hairline);
  box-shadow: var(--bevel);
}
.su-name { font-weight: 800; font-size: var(--fz-md); }
.su-desc { grid-column: 2; font-size: var(--fz-xs); opacity: 0.6; }
.su-pips { grid-column: 2; display: flex; gap: 4px; margin-top: 3px; }
.su-pip { width: 16px; height: 5px; border-radius: var(--r-pill); background: var(--rail); border: 1px solid var(--hairline); }
.su-pip.on { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 6px rgba(201, 162, 78,0.5); }
.su-buy {
  grid-row: span 2; pointer-events: auto;
  min-width: 78px; padding: 8px 12px; border-radius: var(--r-sm);
  font-weight: 800; font-size: var(--fz-sm); font-variant-numeric: tabular-nums;
  cursor: pointer; border: 1px solid var(--accent);
  background: linear-gradient(180deg, #dcc06a, var(--accent) 60%, #a8842a);
  color: var(--accent-ink); box-shadow: var(--bevel), var(--e1);
  transition: filter 0.12s, transform 0.08s, opacity 0.12s;
}
.su-buy:hover:not(:disabled) { filter: brightness(1.07); }
.su-buy:active:not(:disabled) { transform: translateY(1px) scale(0.98); }
.su-buy:disabled { cursor: default; }
.su-buy.poor { background: var(--surface-2); color: #fff; border-color: var(--stroke); opacity: 0.7; }
.su-buy.maxed { background: var(--surface-2); color: var(--accent); border-color: var(--accent); opacity: 1; cursor: default; }
.shop-done { align-self: center; margin-top: var(--s2); }
`;

export class MetaShop {
  private btn: HTMLButtonElement;
  private overlay: HTMLElement;

  constructor(root: HTMLElement) {
    if (!document.getElementById('shop-css')) {
      const st = document.createElement('style');
      st.id = 'shop-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    this.btn = document.createElement('button');
    this.btn.className = 'shop-btn';
    this.btn.setAttribute('data-ui', '');
    this.btn.textContent = '💪';
    this.btn.title = 'Power-Ups';
    this.btn.hidden = true;
    this.btn.onclick = () => this.open();
    root.appendChild(this.btn);

    this.overlay = document.createElement('div');
    this.overlay.className = 'shop-overlay';
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

  private cardHtml(u: MetaUpgradeDef): string {
    const lvl = meta.getUpgradeLevel(u.id);
    const maxed = lvl >= u.max;
    const cost = nextCost(u.id);
    const afford = cost !== null && meta.getProfile().coins >= cost;
    let pips = '';
    for (let i = 0; i < u.max; i++) pips += `<span class="su-pip${i < lvl ? ' on' : ''}"></span>`;
    const buy = maxed
      ? `<button class="su-buy maxed" data-ui disabled>MAX</button>`
      : `<button class="su-buy${afford ? '' : ' poor'}" data-id="${u.id}" data-ui ${afford ? '' : 'disabled'}>🪙 ${cost}</button>`;
    return (
      `<div class="shop-card${maxed ? ' maxed' : ''}">` +
      `<div class="su-ico">${u.icon}</div>` +
      `<div class="su-name">${u.name} <span style="opacity:.55;font-weight:600">Lv ${lvl}/${u.max}</span></div>` +
      buy +
      `<div class="su-desc">${u.desc} / level</div>` +
      `<div class="su-pips">${pips}</div>` +
      `</div>`
    );
  }

  private render(): void {
    const coins = meta.getProfile().coins;
    let html = `<div class="shop-panel">`;
    html += `<div class="shop-head"><h2>POWER-UPS</h2><span class="shop-coins">🪙 ${coins}</span></div>`;
    html += `<div class="shop-sub">permanent upgrades · applied at the start of every run</div>`;
    html += `<div class="shop-grid">`;
    for (const u of META_UPGRADES) html += this.cardHtml(u);
    html += `</div><button class="btn shop-done" data-ui>Done</button></div>`;
    this.overlay.innerHTML = html;

    this.overlay.querySelectorAll<HTMLButtonElement>('.su-buy[data-id]').forEach((b) => {
      b.onclick = () => {
        const id = b.dataset.id!;
        if (buyUpgrade(id)) {
          audio.coin();
          this.render(); // refresh pips, cost, and the coin balance
        }
      };
    });
    const done = this.overlay.querySelector('.shop-done') as HTMLButtonElement | null;
    if (done) done.onclick = () => this.close();
  }
}
