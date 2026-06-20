// Between-runs Collection / Achievements screen. Shows the weapon arsenal (earned
// vs locked silhouettes with their unlock hint) and the achievement ladder with
// live progress bars — the completionist surface that drives "one more run".
import { WEAPONS, PASSIVES, EVOLUTIONS } from '../game/data';
import { meta } from '../meta/save';
import { ACHIEVEMENTS, allUnlockableWeapons } from '../meta/achievements';

const CSS = `
.col-btn {
  position: fixed; top: 12px; left: 60px; z-index: 22;
  width: 40px; height: 40px; border-radius: 10px;
  background: rgba(14,18,26,0.85); border: 1px solid rgba(255,255,255,0.18);
  color: #fff; font-size: 20px; cursor: pointer;
}
.col-btn[hidden] { display: none; }
.col-overlay {
  position: fixed; inset: 0; z-index: 25; overflow-y: auto;
  background: rgba(5,7,12,0.9); backdrop-filter: blur(3px);
  display: flex; align-items: flex-start; justify-content: center; padding: 24px 12px;
}
.col-overlay[hidden] { display: none; }
.col-panel { width: min(760px, 96vw); display: flex; flex-direction: column; gap: 10px; }
.col-panel h2 { margin: 8px 0 0; color: #ffd24a; letter-spacing: 2px; text-align: center; }
.col-sub { text-align: center; font-size: 12px; opacity: 0.65; margin-bottom: 4px; }
.col-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
.col-w {
  background: rgba(20,26,38,0.7); border: 2px solid #2c3445; border-radius: 10px;
  padding: 8px 6px; display: flex; flex-direction: column; align-items: center; gap: 3px; min-height: 78px;
}
.col-w.unlocked { border-color: #46d17a; box-shadow: 0 0 8px rgba(70,209,122,0.25); }
.cw-ico { font-size: 24px; }
.col-w.locked .cw-ico { filter: grayscale(1) brightness(0.5); }
.cw-name { font-size: 11px; font-weight: 700; text-align: center; }
.cw-hint { font-size: 9px; opacity: 0.6; text-align: center; line-height: 1.15; }
.col-achs { display: flex; flex-direction: column; gap: 6px; }
.col-ach {
  display: flex; align-items: center; gap: 10px; padding: 7px 10px;
  background: rgba(20,26,38,0.7); border-radius: 10px; border-left: 3px solid #2c3445;
}
.col-ach.done { border-left-color: #46d17a; background: rgba(28,46,36,0.6); }
.ca-ico { font-size: 22px; width: 26px; text-align: center; }
.col-ach.done .ca-ico { filter: none; }
.col-ach:not(.done) .ca-ico { filter: grayscale(0.4) brightness(0.85); }
.ca-body { flex: 1; min-width: 0; }
.ca-name { font-size: 13px; font-weight: 700; }
.ca-name .ca-rew { color: #ffd24a; font-weight: 600; }
.ca-desc { font-size: 11px; opacity: 0.6; }
.ca-bar { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.1); margin-top: 4px; overflow: hidden; }
.ca-bar > i { display: block; height: 100%; background: #46d17a; border-radius: 3px; }
.ca-num { font-size: 11px; opacity: 0.8; min-width: 54px; text-align: right; }
.col-evos { display: flex; flex-direction: column; gap: 5px; }
.col-evo {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  background: rgba(20,26,38,0.6); border-radius: 8px; padding: 6px 10px; font-size: 12px;
}
.col-evo.locked { opacity: 0.5; }
.col-evo .ev-w { font-weight: 700; }
.col-evo .ev-cat { color: #9be7ff; }
.col-evo .ev-res { font-weight: 700; color: #ffd24a; margin-left: auto; }
.col-evo .ev-op { opacity: 0.5; }
.col-done { align-self: center; margin-top: 8px; }
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
