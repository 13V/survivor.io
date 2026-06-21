// DOM/CSS HUD overlay (kept out of the Pixi canvas for crisp text + easy layout).
import type { JoyState } from '../core/input';

// Combo meter colours, indexed by streak tier (0 = warming up → 6 = GODLIKE).
const COMBO_COLORS = ['#8aa0a0', '#9bb05a', '#c9a24e', '#c98a3e', '#b5462f', '#a06a86', '#d8c9a8'];

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
  private hpLoss: HTMLElement;
  private hpWrap: HTMLElement;
  private hpText: HTMLElement;
  private lvlBadge: HTMLElement;
  private skills: HTMLElement;
  private bossWrap: HTMLElement;
  private bossBar: HTMLElement;
  private joy: HTMLElement;
  private joyKnob: HTMLElement;
  private combo: HTMLElement;
  private comboNum: HTMLElement;
  private comboBarF: HTMLElement;
  private bannerWrap: HTMLElement;
  private levelup: HTMLElement;
  private cards: HTMLElement;
  private lvlActions: HTMLElement;
  private end: HTMLElement;
  private endTitle: HTMLElement;
  private endStats: HTMLElement;
  private endExtra: HTMLElement;
  private endBtn: HTMLElement;
  // Per-frame diff state so update() only touches the DOM when values change.
  private prevLevel = 1;
  private hpGhost = 1; // eased HP for the draining "damage trail" bar
  private hpLow = false;
  private skillSig = '';
  private prevW: { icon: string; level: number }[] = [];
  private prevP: { icon: string; level: number }[] = [];

  constructor(root: HTMLElement) {
    const el = document.createElement('div');
    el.innerHTML = `
      <div class="hud">
        <div class="topbar">
          <div class="hud-mod timer-mod"><span class="mod-ico">⏱</span><span class="timer">0:00</span></div>
          <div class="hud-mod kills-mod"><span class="mod-ico">☠</span><span class="kills">0</span></div>
        </div>
        <div class="xprow">
          <div class="lvl-badge"><span class="lvl-lab">LV</span><span class="lvl">1</span></div>
          <div class="xpwrap"><div class="xpbar"></div></div>
        </div>
        <div class="bosswrap" hidden>
          <div class="boss-head"><span class="boss-skull">☠</span><span class="boss-name">BOSS</span></div>
          <div class="bosstrack"><div class="bossbar"></div></div>
        </div>
        <div class="skills"></div>
        <div class="hpwrap">
          <span class="hp-ico">❤</span>
          <div class="hptrack">
            <div class="hpbar-loss"></div>
            <div class="hpbar"></div>
            <span class="hptext"></span>
          </div>
        </div>
      </div>
      <div class="combo" hidden><span class="combo-num"></span><span class="combo-bar"><i></i></span></div>
      <div class="banner-wrap"></div>
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
    this.lvlBadge = q('.lvl-badge');
    this.hpBar = q('.hpbar');
    this.hpLoss = q('.hpbar-loss');
    this.hpWrap = q('.hpwrap');
    this.hpText = q('.hptext');
    this.skills = q('.skills');
    this.bossWrap = q('.bosswrap');
    this.bossBar = q('.bossbar');
    this.joy = q('.joystick');
    this.joyKnob = q('.joyknob');
    this.combo = q('.combo');
    this.comboNum = q('.combo-num');
    this.comboBarF = q('.combo-bar i');
    this.bannerWrap = q('.banner-wrap');
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
    this.kills.textContent = `${s.kills}`;
    this.xpBar.style.width = `${Math.min(100, (s.xp / s.xpNext) * 100)}%`;
    if (s.level !== this.prevLevel) {
      this.lvl.textContent = `${s.level}`;
      if (s.level > this.prevLevel) this.pop(this.lvlBadge);
      this.prevLevel = s.level;
    }

    // HP bar + a "damage trail" that lags behind, plus a low-HP danger state.
    const hpPct = Math.max(0, Math.min(1, s.hp / s.maxHp));
    this.hpBar.style.width = `${hpPct * 100}%`;
    if (hpPct >= this.hpGhost) this.hpGhost = hpPct;
    else this.hpGhost += (hpPct - this.hpGhost) * 0.08;
    this.hpLoss.style.width = `${this.hpGhost * 100}%`;
    const low = hpPct > 0 && hpPct < 0.3;
    if (low !== this.hpLow) {
      this.hpWrap.classList.toggle('low', low);
      this.hpLow = low;
    }
    this.hpText.textContent = `${Math.ceil(s.hp)} / ${Math.round(s.maxHp)}`;

    this.renderSkills(s.weapons, s.passives);

    if (s.boss) {
      if (this.bossWrap.hidden) {
        this.bossWrap.hidden = false;
        this.bossWrap.classList.remove('boss-in');
        void this.bossWrap.offsetWidth; // restart the entrance animation
        this.bossWrap.classList.add('boss-in');
      }
      this.bossBar.style.width = `${(s.boss.hp / s.boss.maxHp) * 100}%`;
    } else if (!this.bossWrap.hidden) {
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

  // Re-trigger a one-shot CSS animation on an element.
  private pop(el: HTMLElement): void {
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
  }

  // Rebuild the chip tray only when it actually changes; freshly gained or
  // levelled chips get a `pop` so the upgrade reads.
  private renderSkills(
    weapons: { icon: string; level: number }[],
    passives: { icon: string; level: number }[],
  ): void {
    const sig =
      weapons.map((w) => w.icon + w.level).join(',') + '|' + passives.map((p) => p.icon + p.level).join(',');
    if (sig === this.skillSig) return;
    let html = '';
    weapons.forEach((w, i) => {
      const fresh = !this.prevW[i] || this.prevW[i].level < w.level;
      html += `<span class="chip wpn${fresh ? ' pop' : ''}">${w.icon}<b>${w.level}</b></span>`;
    });
    passives.forEach((p, i) => {
      const fresh = !this.prevP[i] || this.prevP[i].level < p.level;
      html += `<span class="chip pas${fresh ? ' pop' : ''}">${p.icon}<b>${p.level}</b></span>`;
    });
    this.skills.innerHTML = html;
    this.skillSig = sig;
    this.prevW = weapons.map((w) => ({ ...w }));
    this.prevP = passives.map((p) => ({ ...p }));
  }

  /** Drive the live kill-streak meter. `frac` is the remaining streak time (0..1). */
  setCombo(count: number, frac: number, tier: number): void {
    if (count < 5) {
      if (!this.combo.hidden) this.combo.hidden = true;
      return;
    }
    this.combo.hidden = false;
    this.comboNum.textContent = `${count}× COMBO`;
    this.comboBarF.style.width = `${Math.max(0, Math.min(1, frac)) * 100}%`;
    const col = COMBO_COLORS[Math.min(tier, COMBO_COLORS.length - 1)];
    this.comboNum.style.color = col;
    this.comboBarF.style.background = col;
  }

  /** Pop a big centre-screen callout (e.g. "RAMPAGE ×25"); auto-removes. */
  banner(text: string, tier: number): void {
    const b = document.createElement('div');
    b.className = `banner bt${Math.min(tier, 6)}`;
    b.textContent = text;
    this.bannerWrap.appendChild(b);
    window.setTimeout(() => b.remove(), 1500);
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
