// Global tuning constants for the prototype. World units == pixels (camera is 1:1).

export const FIXED_DT = 1 / 60; // fixed simulation timestep (seconds)
export const MAX_FRAME_DT = 0.25; // clamp huge stalls so we don't spiral

export const ARENA_HALF = 2200; // soft arena bound (half-extent)
export const PLAYER_RADIUS = 18;
export const BASE_PICKUP_RADIUS = 95;
export const COLLECT_RADIUS = 28;
export const PLAYER_INVULN = 0.5; // seconds of i-frames after a contact hit

// (Run/boss timing lives per-stage on StageDef.bossTime, not as globals.)

// Difficulty ramp: enemy stat multiplier grows with elapsed time.
export function difficultyMul(t: number): number {
  // Accelerating ramp: a linear floor plus a quadratic term so late-run pressure visibly
  // builds in felt steps rather than a flat drizzle (≈1.0 at 0:00, ≈1.8 at 1:00, ≈3.0 at 2:00).
  const m = t / 60;
  return 1 + m * 0.7 + m * m * 0.14;
}

// XP needed to reach the next level (1-indexed level).
export function xpForLevel(level: number): number {
  return Math.floor(5 + level * 4 + level * level * 0.7);
}
