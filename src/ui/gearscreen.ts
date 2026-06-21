// Between-runs loadout screen. Equip one gear piece per slot; choices persist in
// the save profile and are applied to the player's stats at the start of each run.
import { GEAR } from '../game/data';
import { GEAR_SLOTS, type GearSlot } from '../game/types';
import { meta } from '../meta/save';

const CSS = `
.gear-btn {
  position: fixed; top: 12px; left: 12px; z-index: 22;
  width: 44px; height: 44px; border-radius: var(--r-md);
  background: var(--surface-2); border: 1px solid var(--stroke);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--e2), var(--bevel);
  color: var(--accent); font-size: 20px; cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
}
.gear-btn:hover {
  background: var(--surface-1);
  box-shadow: var(--e3), var(--bevel);
}
.gear-btn:active { transform: scale(0.93); }
.gear-btn[hidden] { display: none; }

.gear-overlay {
  position: fixed; inset: 0; z-index: 25; overflow-y: auto;
  background: rgba(5,7,12,0.78); backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: flex-start; justify-content: center; padding: 24px 12px;
}
.gear-overlay[hidden] { display: none; }

.gear-panel { width: min(720px, 96vw); display: flex; flex-direction: column; gap: var(--s3); }

.gear-panel h2 {
  margin: var(--s1) 0 var(--s2);
  color: var(--accent);
  font-size: var(--fz-xl);
  letter-spacing: 3px;
  text-align: center;
  text-shadow: 0 0 24px rgba(201, 162, 78,0.45);
}

.gear-slot {
  background: var(--surface-1);
  border: 1px solid var(--hairline);
  border-radius: var(--r-lg);
  padding: var(--s3) var(--s4);
  box-shadow: var(--e1);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
}

.gear-slot-name {
  font-size: var(--fz-xs);
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--ink);
  opacity: 0.55;
  margin-bottom: var(--s2);
}

.gear-chips { display: flex; gap: var(--s2); flex-wrap: wrap; }

.gear-chip {
  min-width: 88px;
  background: var(--surface-2);
  border: 1px solid var(--stroke);
  border-radius: var(--r-md);
  color: #fff;
  cursor: pointer;
  padding: var(--s2) var(--s3);
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  box-shadow: var(--e1), var(--bevel);
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s;
  position: relative;
}
.gear-chip:hover {
  background: var(--surface-1);
  border-color: var(--stroke-strong);
  box-shadow: var(--e2), var(--bevel);
}
.gear-chip:active { transform: scale(0.95); }

/* Selected chip — gold glow */
.gear-chip.sel {
  border-color: var(--accent);
  background: rgba(201, 162, 78,0.10);
  box-shadow: 0 0 0 1px var(--accent), 0 0 14px rgba(201, 162, 78,0.35), var(--e2);
}
.gear-chip.sel .gc-name { color: var(--accent); }

/* Rarity accent tints — sit on glass surface */
.gear-chip[data-rarity="common"]    { --_r: var(--stroke); }
.gear-chip[data-rarity="rare"]      { border-color: var(--xp); box-shadow: var(--e1), 0 0 8px rgba(138,166,255,0.25); }
.gear-chip[data-rarity="epic"]      { border-color: #c084fc; box-shadow: var(--e1), 0 0 8px rgba(192,132,252,0.25); }
.gear-chip[data-rarity="legendary"] { border-color: var(--accent); box-shadow: var(--e1), 0 0 10px rgba(201, 162, 78,0.30); }
.gear-chip[data-rarity="rare"].sel,
.gear-chip[data-rarity="epic"].sel,
.gear-chip[data-rarity="legendary"].sel {
  box-shadow: 0 0 0 1px var(--accent), 0 0 18px rgba(201, 162, 78,0.40), var(--e2);
  border-color: var(--accent);
}

.gc-ico { font-size: 22px; line-height: 1; }
.gc-name { font-size: var(--fz-sm); font-weight: 700; }
.gc-mods { font-size: var(--fz-xs); opacity: 0.65; text-align: center; }

.gear-done {
  align-self: center;
  margin-top: var(--s2);
}
`;

export class GearScreen {
  private btn: HTMLButtonElement;
  private overlay: HTMLElement;

  constructor(root: HTMLElement) {
    if (!document.getElementById('gearscreen-css')) {
      const st = document.createElement('style');
      st.id = 'gearscreen-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    this.btn = document.createElement('button');
    this.btn.className = 'gear-btn';
    this.btn.setAttribute('data-ui', '');
    this.btn.textContent = '🎒';
    this.btn.title = 'Loadout';
    this.btn.hidden = true;
    this.btn.onclick = () => this.open();
    root.appendChild(this.btn);

    this.overlay = document.createElement('div');
    this.overlay.className = 'gear-overlay';
    this.overlay.setAttribute('data-ui', '');
    this.overlay.hidden = true;
    root.appendChild(this.overlay);
  }

  private open(): void {
    const eq = meta.getEquipped();
    let html = `<div class="gear-panel"><h2>LOADOUT</h2>`;
    for (const slot of GEAR_SLOTS) {
      const pieces = Object.values(GEAR).filter((g) => g.slot === slot);
      html += `<div class="gear-slot"><div class="gear-slot-name">${slot}</div><div class="gear-chips" data-slot="${slot}">`;
      html += `<button class="gear-chip${eq[slot] ? '' : ' sel'}" data-id="" data-ui>None</button>`;
      for (const g of pieces) {
        const mods = Object.entries(g.mods)
          .map(([k, v]) => `${k} ${(v as number) > 0 ? '+' : ''}${v}`)
          .join('<br>');
        html += `<button class="gear-chip${eq[slot] === g.id ? ' sel' : ''}" data-id="${g.id}" data-ui><div class="gc-ico">${g.icon}</div><div class="gc-name">${g.name}</div><div class="gc-mods">${mods}</div></button>`;
      }
      html += `</div></div>`;
    }
    html += `<button class="btn gear-done" data-ui>Done</button></div>`;
    this.overlay.innerHTML = html;

    this.overlay.querySelectorAll('.gear-chips').forEach((row) => {
      const slot = (row as HTMLElement).dataset.slot as GearSlot;
      row.querySelectorAll('.gear-chip').forEach((chip) => {
        (chip as HTMLElement).onclick = () => {
          meta.equip(slot, (chip as HTMLElement).dataset.id || null);
          row.querySelectorAll('.gear-chip').forEach((c) => c.classList.remove('sel'));
          chip.classList.add('sel');
        };
      });
    });
    (this.overlay.querySelector('.gear-done') as HTMLElement).onclick = () => {
      this.overlay.hidden = true;
    };
    this.overlay.hidden = false;
  }

  setVisible(v: boolean): void {
    this.btn.hidden = !v;
  }
}
