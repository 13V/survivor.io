// DOM/CSS HUD overlay (kept out of the Pixi canvas for crisp text + easy layout).
import type { JoyState } from '../core/input';

export interface LevelOption {
  kind: 'weapon-new' | 'weapon-up' | 'passive-new' | 'passive-up' | 'heal';
  id?: string;
  title: string;
  sub: string;
  icon: string;
}

/** Draft state for the level-up screen (cards + remaining reroll/banish + lock). */
export interface LevelUpView {
  options: LevelOption[];
  rerolls: number;
  banishes: number;
  lockedId: string | null;
}

/** Player actions on the level-up screen. */
export interface LevelUpHandlers {
  pick: (o: LevelOption) => void;
  reroll: () => void;
  banish: (o: LevelOption) => void;
  lock: (o: LevelOption) => void;
}

export interface HudState {
  time: number;
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpNext: number;
  kills: number;
  weapons: { icon: string; level: number }[];
  passives: { icon: string; level: number }[];
  joy: JoyState;
  boss: { hp: number; maxHp: number } | null;
}

function fmtTime(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export class Hud {
  private timer: HTMLElement;
  private kills: HTMLElement;
  private xpBar: HTMLElement;
  private lvl: HTMLElement;
  private hpBar: HTMLElement;
  private hpText: HTMLElement;
  private skills: HTMLElement;
  private bossWrap: HTMLElement;
  private bossBar: HTMLElement;
  private joy: HTMLElement;
  private joyKnob: HTMLElement;
  private levelup: HTMLElement;
  private cards: HTMLElement;
  private lvlActions: HTMLElement;
  private end: HTMLElement;
  private endTitle: HTMLElement;
  private endStats: HTMLElement;
  private endExtra: HTMLElement;
  private endBtn: HTMLElement;

  constructor(root: HTMLElement) {
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="hud">
        <div class="topbar">
          <div class="timer">0:00</div>
          <div class="kills">☠ 0</div>
        </div>
        <div class="xpwrap"><div class="xpbar"></div><div class="lvl">Lv 1</div></div>
        <div class="bosswrap" hidden><div class="bossbar"></div></div>
        <div class="skills"></div>
        <div class="hpwrap"><div class="hpbar"></div><div class="hptext"></div></div>
      </div>
      <div class="joystick" hidden><div class="joyknob"></div></div>
      <div class="overlay levelup" data-ui hidden>
        <h2>LEVEL UP</h2>
        <div class="cards"></div>
        <div class="lvl-actions"></div>
      </div>
      <div class="overlay end" data-ui hidden>
        <h1 class="end-title"></h1>
        <p class="end-stats"></p>
        <div class="end-extra"></div>
        <button class="btn end-btn" data-ui>Play again</button>
        <p class="hint">WASD / arrows or drag to move · attacks are automatic</p>
      </div>`;
    root.appendChild(el);

    const q = (s: string) => el.querySelector(s) as HTMLElement;
    this.timer = q('.timer');
    this.kills = q('.kills');
    this.xpBar = q('.xpbar');
    this.lvl = q('.lvl');
    this.hpBar = q('.hpbar');
    this.hpText = q('.hptext');
    this.skills = q('.skills');
    this.bossWrap = q('.bosswrap');
    this.bossBar = q('.bossbar');
    this.joy = q('.joystick');
    this.joyKnob = q('.joyknob');
    this.levelup = q('.levelup');
    this.cards = q('.cards');
    this.lvlActions = q('.lvl-actions');
    this.end = q('.end');
    this.endTitle = q('.end-title');
    this.endStats = q('.end-stats');
    this.endExtra = q('.end-extra');
    this.endBtn = q('.end-btn');
  }

  update(s: HudState): void {
    this.timer.textContent = fmtTime(s.time);
    this.kills.textContent = `☠ ${s.kills}`;
    this.xpBar.style.width = `${Math.min(100, (s.xp / s.xpNext) * 100)}%`;
    this.lvl.textContent = `Lv ${s.level}`;
    const hpPct = Math.max(0, (s.hp / s.maxHp) * 100);
    this.hpBar.style.width = `${hpPct}%`;
    this.hpBar.style.background = hpPct < 30 ? '#ff4d5e' : '#46d17a';
    this.hpText.textContent = `${Math.ceil(s.hp)} / ${Math.round(s.maxHp)}`;

    let html = '';
    for (const w of s.weapons) html += `<span class="chip wpn">${w.icon}<b>${w.level}</b></span>`;
    for (const p of s.passives) html += `<span class="chip pas">${p.icon}<b>${p.level}</b></span>`;
    this.skills.innerHTML = html;

    if (s.boss) {
      this.bossWrap.hidden = false;
      this.bossBar.style.width = `${(s.boss.hp / s.boss.maxHp) * 100}%`;
    } else {
      this.bossWrap.hidden = true;
    }

    if (s.joy.active) {
      this.joy.hidden = false;
      this.joy.style.left = `${s.joy.baseX}px`;
      this.joy.style.top = `${s.joy.baseY}px`;
      this.joyKnob.style.transform = `translate(${s.joy.knobX - s.joy.baseX}px, ${s.joy.knobY - s.joy.baseY}px)`;
    } else {
      this.joy.hidden = true;
    }
  }

  showLevelUp(view: LevelUpView, h: LevelUpHandlers): void {
    this.cards.innerHTML = '';
    for (const o of view.options) {
      const wrap = document.createElement('div');
      const locked = !!o.id && o.id === view.lockedId;
      wrap.className = `card ${o.kind.startsWith('weapon') ? 'wpn' : o.kind === 'heal' ? 'heal' : 'pas'}${locked ? ' locked' : ''}`;

      const pick = document.createElement('button');
      pick.className = 'card-pick';
      pick.setAttribute('data-ui', '');
      pick.innerHTML = `<div class="card-ico">${o.icon}</div><div class="card-title">${o.title}</div><div class="card-sub">${o.sub}</div>`;
      pick.onclick = () => h.pick(o);
      wrap.appendChild(pick);

      // Per-card controls: lock (keep on reroll) and banish (drop from this run).
      if (o.kind !== 'heal' && o.id) {
        const ctrls = document.createElement('div');
        ctrls.className = 'card-ctrls';
        const lock = document.createElement('button');
        lock.className = `card-ctrl lock${locked ? ' on' : ''}`;
        lock.setAttribute('data-ui', '');
        lock.title = locked ? 'Locked (kept on reroll)' : 'Lock this card';
        lock.textContent = '🔒';
        lock.onclick = (e) => {
          e.stopPropagation();
          h.lock(o);
        };
        ctrls.appendChild(lock);
        if ((o.kind === 'weapon-new' || o.kind === 'passive-new') && view.banishes > 0) {
          const ban = document.createElement('button');
          ban.className = 'card-ctrl banish';
          ban.setAttribute('data-ui', '');
          ban.title = 'Banish from this run';
          ban.textContent = '✕';
          ban.onclick = (e) => {
            e.stopPropagation();
            h.banish(o);
          };
          ctrls.appendChild(ban);
        }
        wrap.appendChild(ctrls);
      }
      this.cards.appendChild(wrap);
    }

    // Reroll action (disabled at 0 charges).
    this.lvlActions.innerHTML = '';
    const reroll = document.createElement('button');
    reroll.className = 'lvl-reroll';
    reroll.setAttribute('data-ui', '');
    reroll.disabled = view.rerolls <= 0;
    reroll.innerHTML = `🎲 Reroll <b>${view.rerolls}</b>`;
    reroll.onclick = () => h.reroll();
    this.lvlActions.appendChild(reroll);
    if (view.banishes > 0) {
      const hint = document.createElement('span');
      hint.className = 'lvl-hint';
      hint.textContent = `✕ banish ${view.banishes}`;
      this.lvlActions.appendChild(hint);
    }

    this.levelup.hidden = false;
  }

  hideLevelUp(): void {
    this.levelup.hidden = true;
  }

  showEnd(title: string, stats: string, onRestart: () => void, extraHtml = ''): void {
    this.endTitle.textContent = title;
    this.endStats.textContent = stats;
    this.endExtra.innerHTML = extraHtml;
    this.endBtn.onclick = () => onRestart();
    this.end.hidden = false;
  }

  hideEnd(): void {
    this.end.hidden = true;
  }
}
