// Meta-progression / save module.
//
// Persists a small versioned profile in localStorage so progress survives
// reloads. Everything that touches localStorage is wrapped in try/catch so
// private-browsing mode, disabled storage, or quota errors can never crash
// the game — we silently fall back to an in-memory copy of the profile.
//
// Self-contained: zero dependencies, pure TS. See the INTEGRATION notes at the
// bottom of this file for how Game.ts and the title/end screen hook in.

/** Persisted player profile. Bump `CURRENT_VERSION` when this shape changes. */
export interface Profile {
  version: number;
  bestTimeSec: number;
  totalKills: number;
  totalRuns: number;
  coins: number;
}

/** Stats reported at the end of a single run. */
export interface RunStats {
  timeSec: number;
  kills: number;
  level: number;
}

type ChangeListener = (profile: Profile) => void;

const STORAGE_KEY = 'survivor.io:profile';
const CURRENT_VERSION = 1;

/** A fresh, zeroed profile at the current schema version. */
function defaultProfile(): Profile {
  return {
    version: CURRENT_VERSION,
    bestTimeSec: 0,
    totalKills: 0,
    totalRuns: 0,
    coins: 0,
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
  // Future migrations key off r.version here. For v1 we just coerce fields.
  return {
    version: CURRENT_VERSION,
    bestTimeSec: safeNum(r.bestTimeSec, base.bestTimeSec),
    totalKills: safeInt(r.totalKills, base.totalKills),
    totalRuns: safeInt(r.totalRuns, base.totalRuns),
    coins: safeInt(r.coins, base.coins),
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
   * Record the result of a finished run: updates best time, lifetime kills and
   * run count, and awards coins (1 per kill). Safe to call once per `end()`.
   */
  recordRun(stats: RunStats): Profile {
    const timeSec = safeNum(stats?.timeSec);
    const kills = safeInt(stats?.kills);
    // `level` isn't persisted in v1's profile shape, but is accepted for the
    // caller's convenience and reserved for future coin/bonus formulas.

    this.profile.totalRuns += 1;
    this.profile.totalKills += kills;
    if (timeSec > this.profile.bestTimeSec) this.profile.bestTimeSec = timeSec;
    this.profile.coins += kills; // coins += kills

    this.save();
    this.notify();
    return this.getProfile();
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
