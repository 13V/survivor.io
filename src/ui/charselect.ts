// Character picker shown on the title screen. Pure DOM; the selected character
// is read by main.ts when Play is pressed.
import type { CharacterDef } from '../game/types';

const CSS = `
.charselect {
  position: fixed;
  left: 50%;
  bottom: 7%;
  transform: translateX(-50%);
  z-index: 21;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s2);
  pointer-events: none;
}
.charselect[hidden] { display: none; }
.cs-title {
  font-size: var(--fz-sm);
  letter-spacing: 3px;
  font-weight: 700;
  color: var(--accent);
  text-shadow: 0 0 12px rgba(255, 210, 74, 0.45);
  opacity: 0.92;
}
.cs-row { display: flex; gap: var(--s3); flex-wrap: wrap; justify-content: center; }
.cs-chip {
  pointer-events: auto;
  width: 92px;
  background: var(--surface-1);
  border: 1px solid var(--stroke);
  border-radius: var(--r-md);
  color: var(--ink, #fff);
  cursor: pointer;
  padding: var(--s2) var(--s1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s1);
  box-shadow: var(--e1), var(--bevel);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}
.cs-chip:hover {
  transform: translateY(-3px);
  background: var(--surface-2);
  border-color: var(--stroke-strong);
  box-shadow: var(--e2), var(--bevel);
}
.cs-chip:active {
  transform: translateY(-1px);
  box-shadow: var(--e1), var(--bevel);
}
.cs-chip.sel {
  border-color: var(--accent);
  background: var(--surface-2);
  box-shadow:
    0 0 0 1px var(--accent),
    0 0 18px rgba(255, 210, 74, 0.25),
    var(--e2),
    var(--bevel);
}
.cs-ico { font-size: var(--fz-xl); }
.cs-name {
  font-size: var(--fz-sm);
  font-weight: 700;
  color: var(--ink, #fff);
}
.cs-chip.sel .cs-name { color: var(--accent); }
.cs-desc {
  font-size: var(--fz-xs);
  opacity: 0.65;
  text-align: center;
  line-height: 1.2;
}
`;

export class CharSelect {
  private el: HTMLElement;
  selected: CharacterDef;

  constructor(root: HTMLElement, chars: CharacterDef[]) {
    this.selected = chars[0];

    if (!document.getElementById('charselect-css')) {
      const st = document.createElement('style');
      st.id = 'charselect-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    const wrap = document.createElement('div');
    wrap.className = 'charselect';
    wrap.setAttribute('data-ui', '');
    wrap.hidden = true;
    wrap.innerHTML = `<div class="cs-title">CHOOSE SURVIVOR</div><div class="cs-row"></div>`;
    const row = wrap.querySelector('.cs-row') as HTMLElement;

    chars.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'cs-chip' + (i === 0 ? ' sel' : '');
      b.setAttribute('data-ui', '');
      b.innerHTML = `<div class="cs-ico">${c.icon}</div><div class="cs-name">${c.name}</div><div class="cs-desc">${c.desc}</div>`;
      b.onclick = () => {
        this.selected = c;
        row.querySelectorAll('.cs-chip').forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel');
      };
      row.appendChild(b);
    });

    root.appendChild(wrap);
    this.el = wrap;
  }

  setVisible(v: boolean): void {
    this.el.hidden = !v;
  }
}
