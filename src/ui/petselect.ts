// Pet picker on the title screen (includes a "None" option). The selection is
// read by main.ts when Play is pressed.
import type { PetDef } from '../game/types';

const CSS = `
.petselect {
  position: fixed; left: 50%; bottom: 17%; transform: translateX(-50%);
  z-index: 21; display: flex; flex-direction: column; align-items: center; gap: var(--s2);
  pointer-events: none;
}
.petselect[hidden] { display: none; }
.pet-title {
  font-size: var(--fz-xs);
  letter-spacing: 3px;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  opacity: 0.9;
  text-shadow: 0 0 8px rgba(255,210,74,.4);
}
.pet-row {
  display: flex; gap: var(--s2); flex-wrap: wrap; justify-content: center; max-width: 92vw;
}
.pet-chip {
  pointer-events: auto;
  min-width: 70px;
  background: var(--surface-1);
  border: 1px solid var(--stroke);
  border-radius: var(--r-md);
  color: var(--ink, #fff);
  cursor: pointer;
  padding: var(--s2) var(--s2);
  display: flex; flex-direction: column; align-items: center; gap: var(--s1);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--e1), var(--bevel, inset 0 1px 0 rgba(255,255,255,.08));
  transition: transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  outline: none;
}
.pet-chip:hover {
  transform: translateY(-3px);
  background: var(--surface-2);
  border-color: var(--stroke-strong);
  box-shadow: var(--e2), var(--bevel, inset 0 1px 0 rgba(255,255,255,.12));
}
.pet-chip:active {
  transform: translateY(-1px);
  box-shadow: var(--e1), var(--bevel, inset 0 1px 0 rgba(255,255,255,.08));
}
.pet-chip.sel {
  border-color: var(--accent);
  background: rgba(255,210,74,.10);
  box-shadow: 0 0 0 1px var(--accent), var(--e2), inset 0 1px 0 rgba(255,210,74,.18);
}
.pet-chip.sel .pet-name {
  color: var(--accent);
}
.pet-ico { font-size: 22px; line-height: 1; }
.pet-name {
  font-size: var(--fz-xs);
  font-weight: 700;
  letter-spacing: .5px;
  transition: color 0.12s ease;
}
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
