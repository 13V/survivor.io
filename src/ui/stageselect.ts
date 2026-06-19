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
  gap: 8px;
  pointer-events: none;
}
.stageselect[hidden] { display: none; }
.ss-title { font-size: 12px; letter-spacing: 3px; opacity: 0.8; font-weight: 700; }
.ss-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; max-width: 92vw; }
.ss-chip {
  pointer-events: auto;
  min-width: 96px;
  background: rgba(14, 18, 26, 0.85);
  border: 2px solid #2c3445;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  padding: 8px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transition: transform 0.08s ease, border-color 0.08s ease;
}
.ss-chip:hover { transform: translateY(-2px); }
.ss-chip.sel { border-color: #ffd24a; box-shadow: 0 0 14px rgba(255, 210, 74, 0.35); }
.ss-ico { font-size: 24px; }
.ss-name { font-size: 12px; font-weight: 700; }
.ss-desc { font-size: 10px; opacity: 0.7; text-align: center; line-height: 1.2; }
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
