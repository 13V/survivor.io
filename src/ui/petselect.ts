// Pet picker on the title screen (includes a "None" option). The selection is
// read by main.ts when Play is pressed.
import type { PetDef } from '../game/types';

const CSS = `
.petselect {
  position: fixed; left: 50%; bottom: 17%; transform: translateX(-50%);
  z-index: 21; display: flex; flex-direction: column; align-items: center; gap: 6px;
  pointer-events: none;
}
.petselect[hidden] { display: none; }
.pet-title { font-size: 12px; letter-spacing: 3px; opacity: 0.8; font-weight: 700; }
.pet-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; max-width: 92vw; }
.pet-chip {
  pointer-events: auto; min-width: 70px;
  background: rgba(14,18,26,0.85); border: 2px solid #2c3445; border-radius: 10px;
  color: #fff; cursor: pointer; padding: 6px; display: flex; flex-direction: column;
  align-items: center; gap: 2px; transition: transform 0.08s ease, border-color 0.08s ease;
}
.pet-chip:hover { transform: translateY(-2px); }
.pet-chip.sel { border-color: #86f7ff; box-shadow: 0 0 12px rgba(134,247,255,0.35); }
.pet-ico { font-size: 22px; }
.pet-name { font-size: 11px; font-weight: 700; }
`;

export class PetSelect {
  private el: HTMLElement;
  selected: PetDef | null;

  constructor(root: HTMLElement, pets: PetDef[]) {
    this.selected = pets[0] ?? null;

    if (!document.getElementById('petselect-css')) {
      const st = document.createElement('style');
      st.id = 'petselect-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    const wrap = document.createElement('div');
    wrap.className = 'petselect';
    wrap.setAttribute('data-ui', '');
    wrap.hidden = true;
    wrap.innerHTML = `<div class="pet-title">PET</div><div class="pet-row"></div>`;
    const row = wrap.querySelector('.pet-row') as HTMLElement;

    const makeChip = (def: PetDef | null, sel: boolean): void => {
      const b = document.createElement('button');
      b.className = 'pet-chip' + (sel ? ' sel' : '');
      b.setAttribute('data-ui', '');
      b.innerHTML = `<div class="pet-ico">${def ? def.icon : '🚫'}</div><div class="pet-name">${def ? def.name : 'None'}</div>`;
      b.onclick = () => {
        this.selected = def;
        row.querySelectorAll('.pet-chip').forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel');
      };
      row.appendChild(b);
    };

    makeChip(null, this.selected === null);
    pets.forEach((p) => makeChip(p, this.selected === p));

    root.appendChild(wrap);
    this.el = wrap;
  }

  setVisible(v: boolean): void {
    this.el.hidden = !v;
  }
}
