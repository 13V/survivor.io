// Between-runs Collection / Achievements screen. Shows the weapon arsenal (earned
// vs locked silhouettes with their unlock hint) and the achievement ladder with
// live progress bars — the completionist surface that drives "one more run".
import { WEAPONS, PASSIVES, EVOLUTIONS } from '../game/data';
import { meta } from '../meta/save';
import { ACHIEVEMENTS, allUnlockableWeapons } from '../meta/achievements';

const CSS = `
.col-btn {
  position: fixed; top: 12px; left: 60px; z-index: 22;
  width: 40px; height: 40px; border-radius: var(--r-sm);
  background: var(--surface-1); border: 1px solid var(--stroke);
  color: var(--ink); font-size: 20px; cursor: pointer;
  box-shadow: var(--e1);
  transition: background 0.15s, border-color 0.15s;
}
.col-btn:hover {
  background: var(--surface-2); border-color: var(--stroke-strong);
}
.col-btn[hidden] { display: none; }
.col-overlay {
  position: fixed; inset: 0; z-index: 25; overflow-y: auto;
  background: rgba(5,7,12,0.82); backdrop-filter: blur(var(--glass-blur));
  display: flex; align-items: flex-start; justify-content: center; padding: var(--s5) var(--s3);
}
.col-overlay[hidden] { display: none; }
.col-panel { width: min(760px, 96vw); display: flex; flex-direction: column; gap: var(--s3); }
.col-panel h2 {
  margin: var(--s2) 0 0;
  color: var(--accent);
  letter-spacing: 2px;
  text-align: center;
  font-size: var(--fz-lg);
  text-shadow: 0 0 18px rgba(201, 162, 78,0.35);
}
.col-sub { text-align: center; font-size: var(--fz-xs); opacity: 0.55; margin-bottom: var(--s1); color: var(--ink); }
.col-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: var(--s2); }
.col-w {
  background: var(--surface-1); border: 1px solid var(--stroke); border-radius: var(--r-md);
  padding: var(--s2) var(--s1); display: flex; flex-direction: column; align-items: center; gap: 3px; min-height: 78px;
  box-shadow: var(--e1), var(--bevel);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.col-w.unlocked {
  border-color: var(--accent);
  box-shadow: var(--e1), var(--bevel), 0 0 10px rgba(201, 162, 78,0.18);
}
.col-w.locked { opacity: 0.45; }
.cw-ico { font-size: 24px; }
.col-w.locked .cw-ico { filter: grayscale(1) brightness(0.45); }
.cw-name { font-size: var(--fz-xs); font-weight: 700; text-align: center; color: var(--ink); }
.col-w.unlocked .cw-name { color: var(--accent); }
.cw-hint { font-size: 9px; opacity: 0.55; text-align: center; line-height: 1.15; color: var(--ink); }
.col-achs { display: flex; flex-direction: column; gap: var(--s1); }
.col-ach {
  display: flex; align-items: center; gap: var(--s3); padding: var(--s2) var(--s3);
  background: var(--surface-1); border-radius: var(--r-md);
  border: 1px solid var(--hairline); border-left: 3px solid var(--stroke);
  box-shadow: var(--e1), var(--bevel);
  transition: border-left-color 0.15s, background 0.15s;
}
.col-ach.done {
  border-left-color: var(--hp);
  background: var(--surface-2);
  border-color: var(--stroke);
}
.ca-ico { font-size: 22px; width: 26px; text-align: center; }
.col-ach.done .ca-ico { filter: none; }
.col-ach:not(.done) .ca-ico { filter: grayscale(0.5) brightness(0.7); }
.ca-body { flex: 1; min-width: 0; }
.ca-name { font-size: var(--fz-sm); font-weight: 700; color: var(--ink); }
.col-ach:not(.done) .ca-name { opacity: 0.75; }
.ca-name .ca-rew { color: var(--accent); font-weight: 600; }
.ca-desc { font-size: var(--fz-xs); opacity: 0.55; color: var(--ink); }
.ca-bar {
  height: 5px; border-radius: var(--r-pill);
  background: var(--rail); margin-top: var(--s1); overflow: hidden;
}
.ca-bar > i {
  display: block; height: 100%;
  background: var(--accent); border-radius: var(--r-pill);
  transition: width 0.4s ease;
}
.col-ach.done .ca-bar > i { background: var(--hp); }
.ca-num { font-size: var(--fz-xs); opacity: 0.7; min-width: 54px; text-align: right; color: var(--ink); }
.col-ach.done .ca-num { color: var(--hp); opacity: 1; font-weight: 700; }
.col-evos { display: flex; flex-direction: column; gap: var(--s1); }
.col-evo {
  display: flex; align-items: center; gap: var(--s2); flex-wrap: wrap;
  background: var(--surface-1); border-radius: var(--r-md);
  border: 1px solid var(--hairline);
  padding: var(--s2) var(--s3); font-size: var(--fz-sm);
  box-shadow: var(--e1), var(--bevel);
  transition: opacity 0.15s;
}
.col-evo.locked { opacity: 0.32; }
.col-evo .ev-w { font-weight: 700; color: var(--ink); }
.col-evo .ev-cat { color: var(--xp); }
.col-evo .ev-res { font-weight: 700; color: var(--accent); margin-left: auto; }
.col-evo .ev-op { opacity: 0.38; color: var(--ink); }
.col-done { align-self: center; margin-top: var(--s2); }
`;

export class CollectionScreen {
  private btn: HTMLButtonElement;
  private overlay: HTMLElement;
  // weapon id -> the unlock-condition text shown on its locked silhouette
  private hints: Record<string, string> = {};

  constructor(root: HTMLElement) {
    if (!document.getElementById('collection-css')) {
      const st = document.createElement('style');
      st.id = 'collection-css';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    for (const a of ACHIEVEMENTS) if (a.unlock?.kind === 'weapon') this.hints[a.unlock.id] = a.desc;

    this.btn = document.createElement('button');
    this.btn.className = 'col-btn';
    this.btn.setAttribute('data-ui', '');
    this.btn.textContent = '🏆';
    this.btn.title = 'Collection & Achievements';
    this.btn.hidden = true;
    this.btn.onclick = () => this.open();
    root.appendChild(this.btn);

    this.overlay = document.createElement('div');
    this.overlay.className = 'col-overlay';
    this.overlay.setAttribute('data-ui', '');
    this.overlay.hidden = true;
    root.appendChild(this.overlay);
  }

  private open(): void {
    const weapons = allUnlockableWeapons();
    const unlockedCount = weapons.filter((id) => meta.isWeaponUnlocked(id)).length;
    const achs = meta.getAchievements();
    const doneCount = achs.filter((a) => a.done).length;

    let html = `<div class="col-panel">`;
    html += `<h2>ARSENAL</h2><div class="col-sub">${unlockedCount} / ${weapons.length} weapons unlocked</div>`;
    html += `<div class="col-grid">`;
    for (const id of weapons) {
      const w = WEAPONS[id];
      const got = meta.isWeaponUnlocked(id);
      if (got) {
        html += `<div class="col-w unlocked"><div class="cw-ico">${w?.icon ?? '🔫'}</div><div class="cw-name">${w?.name ?? id}</div></div>`;
      } else {
        html += `<div class="col-w locked"><div class="cw-ico">🔒</div><div class="cw-name">???</div><div class="cw-hint">${this.hints[id] ?? ''}</div></div>`;
      }
    }
    html += `</div>`;

    html += `<h2>ACHIEVEMENTS</h2><div class="col-sub">${doneCount} / ${achs.length} complete</div>`;
    html += `<div class="col-achs">`;
    for (const a of achs) {
      const def = a.def;
      const hidden = def.secret && !a.done;
      const name = hidden ? '???' : def.name;
      const desc = hidden ? 'Secret achievement' : def.desc;
      const ico = hidden ? '❔' : def.icon;
      const rew =
        !hidden && def.unlock ? ` <span class="ca-rew">→ ${WEAPONS[def.unlock.id]?.name ?? ''}</span>` : '';
      const pct = a.goal > 0 ? Math.min(100, Math.round((a.progress / a.goal) * 100)) : 0;
      const num = a.done ? '✓' : `${Math.floor(a.progress)}/${a.goal}`;
      html += `<div class="col-ach${a.done ? ' done' : ''}"><span class="ca-ico">${ico}</span><div class="ca-body"><div class="ca-name">${name}${rew}</div><div class="ca-desc">${desc}</div><div class="ca-bar"><i style="width:${pct}%"></i></div></div><span class="ca-num">${num}</span></div>`;
    }
    html += `</div>`;

    // Evolution codex: base weapon + catalyst -> evolved form. Recipes whose base
    // weapon you haven't unlocked yet are dimmed.
    html += `<h2>EVOLUTIONS</h2><div class="col-sub">max a weapon + hold its catalyst</div>`;
    html += `<div class="col-evos">`;
    for (const r of EVOLUTIONS) {
      const base = WEAPONS[r.base];
      const result = WEAPONS[r.result];
      if (!base || !result) continue;
      const cat = r.catalyst.kind === 'passive' ? PASSIVES[r.catalyst.id] : WEAPONS[r.catalyst.id];
      const known = meta.isWeaponUnlocked(r.base);
      html += `<div class="col-evo${known ? '' : ' locked'}"><span class="ev-w">${base.icon} ${base.name}</span><span class="ev-op">+</span><span class="ev-cat">${cat?.icon ?? '✦'} ${cat?.name ?? r.catalyst.id}</span><span class="ev-op">→</span><span class="ev-res">${known ? `${result.icon} ${result.name}` : '🔒 ???'}</span></div>`;
    }
    html += `</div>`;

    html += `<button class="btn col-done" data-ui>Done</button></div>`;

    this.overlay.innerHTML = html;
    (this.overlay.querySelector('.col-done') as HTMLElement).onclick = () => {
      this.overlay.hidden = true;
    };
    this.overlay.hidden = false;
  }

  setVisible(v: boolean): void {
    this.btn.hidden = !v;
  }
}
