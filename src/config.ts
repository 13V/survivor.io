// Global tuning constants for the prototype. World units == pixels (camera is 1:1).

export const FIXED_DT = 1 / 60; // fixed simulation timestep (seconds)
export const MAX_FRAME_DT = 0.25; // clamp huge stalls so we don't spiral

export const ARENA_HALF = 2200; // soft arena bound (half-extent)
export const PLAYER_RADIUS = 18;
export const BASE_PICKUP_RADIUS = 95;
export const COLLECT_RADIUS = 28;
export const PLAYER_INVULN = 0.5; // seconds of i-frames after a contact hit

export const RUN_TIME = 120; // total run length (s)
export const BOSS_TIME = 90; // boss spawns / final push (s)

// Difficulty ramp: enemy stat multiplier grows with elapsed time.
export function difficultyMul(t: number): number {
  return 1 + (t / 60) * 0.65;
}

// XP needed to reach the next level (1-indexed level).
export function xpForLevel(level: number): number {
  return Math.floor(5 + level * 4 + level * level * 0.7);
}
