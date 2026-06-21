// Stage/mode picker shown on the title screen (above the survivor picker).
import type { StageDef } from '../game/types';

const CSS = `
.stageselect {
  position: fixed;
  left: 50%;
  top: 14%;
  transform: translateX(-50%);
  z-index: 21;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s2);
  pointer-events: none;
}
.stageselect[hidden] { display: none; }
.ss-title {
  font-size: var(--fz-xs);
  letter-spacing: 3px;
  font-weight: 700;
  color: var(--ink);
  opacity: 0.7;
  text-transform: uppercase;
}
.ss-row {
  display: flex;
  gap: var(--s2);
  flex-wrap: wrap;
  justify-content: center;
  max-width: 92vw;
}
.ss-chip {
  pointer-events: auto;
  min-width: 96px;
  background: var(--surface-1);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--stroke);
  border-radius: var(--r-md);
  color: var(--ink);
  cursor: pointer;
  padding: var(--s2) var(--s3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s1);
  box-shadow: var(--e1), var(--bevel);
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
}
.ss-chip:hover {
  transform: translateY(-2px);
  background: var(--surface-2);
  border-color: var(--stroke-strong);
  box-shadow: var(--e2), var(--bevel);
}
.ss-chip:active {
  transform: translateY(0);
  box-shadow: var(--e1), var(--bevel);
}
.ss-chip.sel {
  border-color: var(--accent);
  background: var(--surface-2);
  box-shadow: var(--e2), 0 0 18px rgba(255, 210, 74, 0.28), var(--bevel);
}
.ss-chip.sel .ss-name { color: var(--accent); }
.ss-ico { font-size: var(--fz-xl); line-height: 1; }
.ss-name {
  font-size: var(--fz-xs);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color 0.15s ease;
}
.ss-desc {
  font-size: var(--fz-xs);
  opacity: 0.55;
  text-align: center;
  line-height: 1.3;
}
`;

export class StageSelect {
  private el: HTMLElement;
  selected: StageDef;

  constructor(root: HTMLElement, stages: StageDef[]) {
    this.selected = stages[0];

    if (!document.getElementById('stageselect-css')) {
      const st = document.createElement('style');
      st.id = 'stageselect-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }

    const wrap = document.createElement('div');
    wrap.className = 'stageselect';
    wrap.setAttribute('data-ui', '');
    wrap.hidden = true;
    wrap.innerHTML = `<div class="ss-title">SELECT STAGE</div><div class="ss-row"></div>`;
    const row = wrap.querySelector('.ss-row') as HTMLElement;

    stages.forEach((s, i) => {
      const b = document.createElement('button');
      b.className = 'ss-chip' + (i === 0 ? ' sel' : '');
      b.setAttribute('data-ui', '');
      b.innerHTML = `<div class="ss-ico">${s.icon}</div><div class="ss-name">${s.name}</div><div class="ss-desc">${s.desc}</div>`;
      b.onclick = () => {
        this.selected = s;
        row.querySelectorAll('.ss-chip').forEach((x) => x.classList.remove('sel'));
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
