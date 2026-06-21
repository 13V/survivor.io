// Meta-progression / save module.
//
// Persists a small versioned profile in localStorage so progress survives
// reloads. Everything that touches localStorage is wrapped in try/catch so
// private-browsing mode, disabled storage, or quota errors can never crash
// the game — we silently fall back to an in-memory copy of the profile.
//
// Self-contained: zero dependencies, pure TS. See the INTEGRATION notes at the
// bottom of this file for how Game.ts and the title/end screen hook in.

import { ACHIEVEMENTS, STARTER_WEAPONS, type AchievementDef } from './achievements';

/** Persisted player profile. Bump `CURRENT_VERSION` when this shape changes. */
export interface Profile {
  version: number;
  bestTimeSec: number;
  totalKills: number;
  totalRuns: number;
  coins: number;
  equipped: Record<string, string>; // slot -> gear id
  unlocked: string[]; // weapon ids earned via achievements (starters are implicit)
  done: string[]; // completed achievement ids
  stats: Record<string, number>; // lifetime counters that drive achievement progress
  metaUpgrades: Record<string, number>; // permanent power-up id -> purchased level
}

/** Stats reported at the end of a single run (drives achievement progress). */
export interface RunStats {
  timeSec: number;
  kills: number;
  level: number;
  crits?: number;
  eliteKills?: number;
  bossKills?: number;
  evolutions?: number;
  won?: boolean;
  noHit?: boolean; // true if the player took zero damage the whole run
}

/** Result of committing a run: what newly completed / unlocked, for the reveal. */
export interface RunResult {
  profile: Profile;
  newAchievements: AchievementDef[];
  newWeapons: string[];
}

type ChangeListener = (profile: Profile) => void;

const STORAGE_KEY = 'survivor.io:profile';
const CURRENT_VERSION = 4;

/** A fresh, zeroed profile at the current schema version. */
function defaultProfile(): Profile {
  return {
    version: CURRENT_VERSION,
    bestTimeSec: 0,
    totalKills: 0,
    totalRuns: 0,
    coins: 0,
    equipped: {},
    unlocked: [],
    done: [],
    stats: {},
    metaUpgrades: {},
  };
}

/** Coerce any value to a finite, non-negative integer (used when loading). */
function safeInt(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.floor(n);
}

/** Coerce any value to a finite, non-negative number (kept as float). */
function safeNum(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

/**
 * Normalize raw parsed JSON into a valid Profile, migrating older versions
 * forward. Unknown / missing fields fall back to defaults so a corrupt or
 * partial blob never produces NaN/undefined downstream.
 */
function migrate(raw: unknown): Profile {
  const base = defaultProfile();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  // Future migrations key off r.version here. Missing fields (older saves) fall
  // back to defaults, so v2 profiles gain empty unlock/achievement state.
  const strArr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  const numMap = (v: unknown): Record<string, number> => {
    const out: Record<string, number> = {};
    if (v && typeof v === 'object')
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = safeNum(val, 0);
    return out;
  };
  return {
    version: CURRENT_VERSION,
    bestTimeSec: safeNum(r.bestTimeSec, base.bestTimeSec),
    totalKills: safeInt(r.totalKills, base.totalKills),
    totalRuns: safeInt(r.totalRuns, base.totalRuns),
    coins: safeInt(r.coins, base.coins),
    equipped:
      r.equipped && typeof r.equipped === 'object'
        ? { ...(r.equipped as Record<string, string>) }
        : {},
    unlocked: strArr(r.unlocked),
    done: strArr(r.done),
    stats: numMap(r.stats),
    metaUpgrades: numMap(r.metaUpgrades),
  };
}

/** Format a duration in seconds as "m:ss" (e.g. 75 -> "1:15"). */
export function formatTime(sec: number): string {
  const total = Math.max(0, Math.floor(safeNum(sec)));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

class Meta {
  private profile: Profile;
  private listeners = new Set<ChangeListener>();

  constructor() {
    this.profile = this.load();
    // Grant any achievements an existing/migrated profile already qualifies for
    // (e.g. a returning player with thousands of lifetime kills).
    if (this.applyAchievements().newAchievements.length) this.save();
  }

  // ---- persistence ---------------------------------------------------------

  /** Load + migrate the stored profile, falling back to defaults on any error. */
  private load(): Profile {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultProfile();
      return migrate(JSON.parse(raw));
    } catch {
      // Storage unavailable (private mode), blocked, or corrupt JSON.
      return defaultProfile();
    }
  }

  /** Write the current profile to storage. Failures are swallowed. */
  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
    } catch {
      // Quota exceeded / storage disabled — keep the in-memory copy and move on.
    }
  }

  // ---- subscription --------------------------------------------------------

  /**
   * Subscribe to profile changes. Returns an unsubscribe function. The callback
   * receives a fresh copy of the profile; throwing listeners can't break others.
   */
  onChange(cb: ChangeListener): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(): void {
    const snapshot = this.getProfile();
    for (const cb of this.listeners) {
      try {
        cb(snapshot);
      } catch {
        // A misbehaving UI listener must not corrupt save state.
      }
    }
  }

  // ---- public API ----------------------------------------------------------

  /** A defensive copy of the current profile (mutating it won't affect state). */
  getProfile(): Profile {
    return { ...this.profile };
  }

  /**
   * Record the result of a finished run: folds the run's stats into the lifetime
   * counters, awards coins (1 per kill), then evaluates achievements — unlocking
   * any newly-earned weapons. Returns what newly completed, for the end-screen
   * reveal. Safe to call once per `end()`.
   */
  recordRun(stats: RunStats): RunResult {
    const timeSec = safeNum(stats?.timeSec);
    const kills = safeInt(stats?.kills);
    const level = safeInt(stats?.level);
    const p = this.profile;
    p.totalRuns += 1;
    p.totalKills += kills;
    if (timeSec > p.bestTimeSec) p.bestTimeSec = timeSec;
    p.coins += kills; // coins earned = kills

    const add = (k: string, n: number): void => {
      if (n) p.stats[k] = (p.stats[k] ?? 0) + n;
    };
    const max = (k: string, n: number): void => {
      p.stats[k] = Math.max(p.stats[k] ?? 0, n);
    };
    add('crits', safeInt(stats?.crits));
    add('eliteKills', safeInt(stats?.eliteKills));
    add('bossKills', safeInt(stats?.bossKills));
    add('evolutions', safeInt(stats?.evolutions));
    add('wins', stats?.won ? 1 : 0);
    add('coinsEarned', kills);
    max('bestLevel', level);
    max('bestKillsRun', kills);
    max('noHitWin', stats?.won && stats?.noHit ? 1 : 0);

    const { newAchievements, newWeapons } = this.applyAchievements();
    this.save();
    this.notify();
    return { profile: this.getProfile(), newAchievements, newWeapons };
  }

  // ---- achievements & unlocks ----------------------------------------------

  /** Current lifetime value backing an achievement's progress. */
  statValue(key: string): number {
    switch (key) {
      case 'kills':
        return this.profile.totalKills;
      case 'runs':
        return this.profile.totalRuns;
      case 'bestTimeSec':
        return this.profile.bestTimeSec;
      case 'weaponsUnlocked':
        return this.unlockedWeaponCount();
      default:
        return this.profile.stats[key] ?? 0;
    }
  }

  private unlockedWeaponCount(): number {
    const set = new Set(STARTER_WEAPONS);
    for (const id of this.profile.unlocked) set.add(id);
    return set.size;
  }

  /** Has this weapon been earned (or is it a starter)? */
  isWeaponUnlocked(id: string): boolean {
    return STARTER_WEAPONS.includes(id) || this.profile.unlocked.includes(id);
  }

  /** Every weapon id currently available in the draft pool. */
  getUnlockedWeapons(): string[] {
    return Array.from(new Set([...STARTER_WEAPONS, ...this.profile.unlocked]));
  }

  /** Progress view of all achievements, for the Collection UI. */
  getAchievements(): { def: AchievementDef; progress: number; goal: number; done: boolean }[] {
    return ACHIEVEMENTS.map((a) => ({
      def: a,
      progress: Math.min(this.statValue(a.stat), a.goal),
      goal: a.goal,
      done: this.profile.done.includes(a.id),
    }));
  }

  /** The n nearest-to-complete unfinished achievements (the "almost there" nudge). */
  nextClosest(n: number): { def: AchievementDef; progress: number; goal: number }[] {
    return this.getAchievements()
      .filter((a) => !a.done && a.goal > 0)
      .sort((x, y) => y.progress / y.goal - x.progress / x.goal)
      .slice(0, n)
      .map(({ def, progress, goal }) => ({ def, progress, goal }));
  }

  /**
   * Mark every achievement whose goal is now met as complete, granting its
   * weapon/coins. Loops to a fixpoint so a grant that completes another (e.g. the
   * last weapon completing the "unlock everything" capstone) resolves in one pass.
   * Does not persist — callers batch the save.
   */
  private applyAchievements(): { newAchievements: AchievementDef[]; newWeapons: string[] } {
    const newAchievements: AchievementDef[] = [];
    const newWeapons: string[] = [];
    const done = new Set(this.profile.done);
    let changed = true;
    while (changed) {
      changed = false;
      for (const a of ACHIEVEMENTS) {
        if (done.has(a.id) || this.statValue(a.stat) < a.goal) continue;
        done.add(a.id);
        this.profile.done.push(a.id);
        newAchievements.push(a);
        if (a.unlock?.kind === 'weapon' && !this.isWeaponUnlocked(a.unlock.id)) {
          this.profile.unlocked.push(a.unlock.id);
          newWeapons.push(a.unlock.id);
        }
        if (a.coins) this.profile.coins += a.coins;
        changed = true;
      }
    }
    return { newAchievements, newWeapons };
  }

  /** Add coins (e.g. rewards). Non-positive / invalid amounts are ignored. */
  addCoins(n: number): void {
    const amt = safeInt(n);
    if (amt <= 0) return;
    this.profile.coins += amt;
    this.save();
    this.notify();
  }

  /**
   * Spend coins. Returns true and deducts if affordable; returns false and
   * leaves the balance untouched otherwise (so callers can gate purchases).
   */
  spendCoins(n: number): boolean {
    const amt = safeInt(n);
    if (amt <= 0) return false;
    if (this.profile.coins < amt) return false;
    this.profile.coins -= amt;
    this.save();
    this.notify();
    return true;
  }

  /** Purchased level of a permanent meta upgrade (0 if never bought). */
  getUpgradeLevel(id: string): number {
    return safeInt(this.profile.metaUpgrades[id], 0);
  }

  /** Set a meta upgrade's level (clamped to >= 0). Persists immediately. */
  setUpgradeLevel(id: string, level: number): void {
    this.profile.metaUpgrades[id] = Math.max(0, safeInt(level, 0));
    this.save();
    this.notify();
  }

  /** The equipped gear map (slot -> gear id). Defensive copy. */
  getEquipped(): Record<string, string> {
    return { ...this.profile.equipped };
  }

  /** Equip (or, with null, clear) a gear id in a slot. Persists immediately. */
  equip(slot: string, id: string | null): void {
    if (id === null) delete this.profile.equipped[slot];
    else this.profile.equipped[slot] = id;
    this.save();
    this.notify();
  }

  /** Wipe all progress back to a fresh profile. */
  reset(): void {
    this.profile = defaultProfile();
    this.save();
    this.notify();
  }
}

/** Singleton instance — import and use directly. */
export const meta = new Meta();

// ---------------------------------------------------------------------------
// INTEGRATION (do not edit Game.ts here — these are the lines to add there)
// ---------------------------------------------------------------------------
//
// 1) Record a run when the game ends.
//    In src/game/Game.ts, add the import at the top:
//
//        import { meta, formatTime } from '../meta/save';
//
//    Then inside `end(title: string)` (around line 756), after `this.state =
//    'over';`, record the run exactly once:
//
//        meta.recordRun({ timeSec: this.time, kills: this.kills, level: this.level });
//
//    (`this.time`, `this.kills`, `this.level` already exist on Game.)
//
// 2) Show the best time on a title / end screen.
//    Anywhere with access to the profile (HUD, title screen, the `end()`
//    summary string):
//
//        const best = meta.getProfile().bestTimeSec;
//        const label = `Best ${formatTime(best)}`;   // e.g. "Best 5:42"
//
//    To live-update a coin/best-time display, subscribe:
//
//        const off = meta.onChange((p) => updateUI(p));
//        // call off() when the screen is torn down.
//
// 3) A meta shop could spend earned coins:
//
//        if (meta.spendCoins(50)) { /* grant upgrade */ }
//
// ---------------------------------------------------------------------------
