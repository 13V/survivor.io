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
  gap: 8px;
  pointer-events: none;
}
.charselect[hidden] { display: none; }
.cs-title {
  font-size: 12px;
  letter-spacing: 3px;
  opacity: 0.8;
  font-weight: 700;
}
.cs-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.cs-chip {
  pointer-events: auto;
  width: 92px;
  background: rgba(14, 18, 26, 0.85);
  border: 2px solid #2c3445;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: transform 0.08s ease, border-color 0.08s ease;
}
.cs-chip:hover { transform: translateY(-2px); }
.cs-chip.sel { border-color: #46d17a; box-shadow: 0 0 14px rgba(70, 209, 122, 0.35); }
.cs-ico { font-size: 28px; }
.cs-name { font-size: 12px; font-weight: 700; }
.cs-desc { font-size: 10px; opacity: 0.7; text-align: center; line-height: 1.2; }
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
