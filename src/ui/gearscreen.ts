// Between-runs loadout screen. Equip one gear piece per slot; choices persist in
// the save profile and are applied to the player's stats at the start of each run.
import { GEAR } from '../game/data';
import { GEAR_SLOTS, type GearSlot } from '../game/types';
import { meta } from '../meta/save';

const CSS = `
.gear-btn {
  position: fixed; top: 12px; left: 12px; z-index: 22;
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(14,18,26,0.85); border: 1px solid rgba(255,255,255,0.18);
  color: #fff; font-size: 20px; cursor: pointer;
}
.gear-btn[hidden] { display: none; }
.gear-overlay {
  position: fixed; inset: 0; z-index: 25; overflow-y: auto;
  background: rgba(5,7,12,0.86); backdrop-filter: blur(3px);
  display: flex; align-items: flex-start; justify-content: center; padding: 24px 12px;
}
.gear-overlay[hidden] { display: none; }
.gear-panel { width: min(720px, 96vw); display: flex; flex-direction: column; gap: 12px; }
.gear-panel h2 { margin: 4px 0; color: #ffd24a; letter-spacing: 2px; text-align: center; }
.gear-slot { background: rgba(20,26,38,0.7); border-radius: 12px; padding: 8px 10px; }
.gear-slot-name { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7; margin-bottom: 6px; }
.gear-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.gear-chip {
  min-width: 84px; background: rgba(14,18,26,0.9); border: 2px solid #2c3445;
  border-radius: 10px; color: #fff; cursor: pointer; padding: 6px 8px;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.gear-chip.sel { border-color: #46d17a; box-shadow: 0 0 10px rgba(70,209,122,0.35); }
.gc-ico { font-size: 20px; }
.gc-name { font-size: 11px; font-weight: 700; }
.gc-mods { font-size: 9px; opacity: 0.7; text-align: center; }
.gear-done { align-self: center; margin-top: 4px; }
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
