import { describe, it, expect, beforeEach } from 'vitest';
import { meta } from '../src/meta/save';
import { STARTER_WEAPONS, TOTAL_UNLOCKABLE_WEAPONS } from '../src/meta/achievements';

// The meta singleton falls back to an in-memory profile under the node test env
// (no localStorage), so reset() gives each test a clean slate.
beforeEach(() => meta.reset());

describe('weapon unlock gating', () => {
  it('starts with exactly the starter weapons unlocked', () => {
    for (const id of STARTER_WEAPONS) expect(meta.isWeaponUnlocked(id)).toBe(true);
    expect(meta.isWeaponUnlocked('kunai')).toBe(false);
    expect(meta.isWeaponUnlocked('railgun')).toBe(false);
    expect(meta.getUnlockedWeapons().sort()).toEqual([...STARTER_WEAPONS].sort());
  });

  it('First Blood: finishing one run unlocks the Kunai', () => {
    const res = meta.recordRun({ timeSec: 20, kills: 5, level: 1 });
    expect(res.newWeapons).toContain('kunai');
    expect(meta.isWeaponUnlocked('kunai')).toBe(true);
    expect(res.newAchievements.some((a) => a.id === 'first_blood')).toBe(true);
  });

  it('does not re-grant an already-unlocked weapon on the next run', () => {
    meta.recordRun({ timeSec: 20, kills: 5, level: 1 });
    const res2 = meta.recordRun({ timeSec: 20, kills: 5, level: 1 });
    expect(res2.newWeapons).not.toContain('kunai');
  });
});

describe('achievement thresholds', () => {
  it('cumulative kills unlock the right weapons as the lifetime total grows', () => {
    // 300 kills: under the 500 Slayer threshold -> no Fireball yet.
    let res = meta.recordRun({ timeSec: 30, kills: 300, level: 4 });
    expect(meta.isWeaponUnlocked('fireball')).toBe(false);
    // +300 = 600 lifetime -> crosses 500 -> Fireball.
    res = meta.recordRun({ timeSec: 30, kills: 300, level: 4 });
    expect(res.newWeapons).toContain('fireball');
    expect(meta.isWeaponUnlocked('fireball')).toBe(true);
  });

  it('reaching level 10 in a run unlocks the Laser (best-of, not cumulative)', () => {
    meta.recordRun({ timeSec: 30, kills: 1, level: 6 });
    expect(meta.isWeaponUnlocked('laser')).toBe(false);
    const res = meta.recordRun({ timeSec: 30, kills: 1, level: 11 });
    expect(res.newWeapons).toContain('laser');
  });

  it('Untouchable requires a win taking no damage', () => {
    meta.recordRun({ timeSec: 95, kills: 50, level: 12, won: true, noHit: false });
    expect(meta.isWeaponUnlocked('whip')).toBe(false);
    const res = meta.recordRun({ timeSec: 95, kills: 50, level: 12, won: true, noHit: true });
    expect(res.newWeapons).toContain('whip');
  });
});

describe('collection capstone', () => {
  it('unlocking every weapon completes "Master Armorer"', () => {
    const res = meta.recordRun({
      timeSec: 200,
      kills: 60000,
      level: 30,
      crits: 6000,
      eliteKills: 200,
      bossKills: 12,
      evolutions: 20,
      won: true,
      noHit: true,
    });
    expect(meta.getUnlockedWeapons().length).toBe(TOTAL_UNLOCKABLE_WEAPONS);
    expect(res.newAchievements.some((a) => a.id === 'collector')).toBe(true);
  });
});

describe('progress views', () => {
  it('reports achievement progress capped at the goal', () => {
    meta.recordRun({ timeSec: 30, kills: 250, level: 3 });
    const slayer = meta.getAchievements().find((a) => a.def.id === 'slayer_1');
    expect(slayer?.progress).toBe(250);
    expect(slayer?.done).toBe(false);
  });

  it('nextClosest surfaces unfinished achievements ranked by progress', () => {
    meta.recordRun({ timeSec: 55, kills: 1, level: 1 }); // 55/60 Survivalist = very close
    const closest = meta.nextClosest(1);
    expect(closest[0]?.def.id).toBe('survivalist');
  });
});
