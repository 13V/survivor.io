import { describe, it, expect } from 'vitest';
import {
  WEAPONS,
  PASSIVES,
  ENEMY_DEFS,
  CHARACTERS,
  STAGES,
  GEAR,
  PETS,
  baseMods,
  type Mods,
} from '../src/game/data';
import { GEAR_SLOTS } from '../src/game/types';
import { xpForLevel } from '../src/config';

describe('WEAPONS stats(level)', () => {
  const ids = Object.keys(WEAPONS);

  it('defines at least one weapon', () => {
    expect(ids.length).toBeGreaterThan(0);
  });

  for (const id of ids) {
    const def = WEAPONS[id];

    describe(`weapon "${id}"`, () => {
      it('has cooldown >= its observed minimum at every level', () => {
        // The minimum cooldown is reached at (and held past) max level because
        // cooldown is clamped and non-increasing. Verify cooldown never dips
        // below the value at maxLevel.
        const minCd = def.stats(def.maxLevel).cooldown;
        for (let l = 1; l <= def.maxLevel; l++) {
          const cd = def.stats(l).cooldown;
          expect(cd).toBeGreaterThan(0);
          expect(cd).toBeGreaterThanOrEqual(minCd);
        }
      });

      it('has cooldown that never increases with level', () => {
        let prev = Infinity;
        for (let l = 1; l <= def.maxLevel; l++) {
          const cd = def.stats(l).cooldown;
          expect(cd).toBeLessThanOrEqual(prev);
          prev = cd;
        }
      });

      it('has non-decreasing damage with level', () => {
        let prev = -Infinity;
        for (let l = 1; l <= def.maxLevel; l++) {
          const dmg = def.stats(l).dmg;
          expect(dmg).toBeGreaterThan(0);
          expect(dmg).toBeGreaterThanOrEqual(prev);
          prev = dmg;
        }
      });

      it('reports strictly higher damage at max level than at level 1', () => {
        expect(def.stats(def.maxLevel).dmg).toBeGreaterThan(
          def.stats(1).dmg,
        );
      });
    });
  }
});

describe('PASSIVES apply()', () => {
  // For each passive: which Mods field changes, and in which direction.
  // direction 'up' => field increases; 'down' => field decreases.
  const expectations: Record<string, { field: keyof Mods; direction: 'up' | 'down' }> = {
    power: { field: 'dmgMul', direction: 'up' },
    haste: { field: 'cdMul', direction: 'down' },
    swift: { field: 'moveMul', direction: 'up' },
    vitality: { field: 'maxHpMul', direction: 'up' },
    magnet: { field: 'pickupMul', direction: 'up' },
    growth: { field: 'xpMul', direction: 'up' },
  };

  for (const [id, exp] of Object.entries(expectations)) {
    const def = PASSIVES[id];

    it(`"${id}" exists and targets ${exp.field}`, () => {
      expect(def).toBeDefined();
    });

    it(`"${id}" moves ${exp.field} ${exp.direction} and leaves other fields untouched`, () => {
      const before = baseMods();
      const after = baseMods();
      def.apply(1, after);

      if (exp.direction === 'up') {
        expect(after[exp.field]).toBeGreaterThan(before[exp.field]);
      } else {
        expect(after[exp.field]).toBeLessThan(before[exp.field]);
      }

      // No other field should have changed.
      for (const key of Object.keys(before) as (keyof Mods)[]) {
        if (key === exp.field) continue;
        expect(after[key]).toBe(before[key]);
      }
    });

    it(`"${id}" scales monotonically in the same direction with level`, () => {
      let prev: number | null = null;
      for (let l = 1; l <= def.maxLevel; l++) {
        const m = baseMods();
        def.apply(l, m);
        const v = m[exp.field];
        if (prev !== null) {
          if (exp.direction === 'up') expect(v).toBeGreaterThan(prev);
          else expect(v).toBeLessThan(prev);
        }
        prev = v;
      }
    });
  }
});

describe('ENEMY_DEFS registry', () => {
  it('every enemy has positive stats and a valid texKind', () => {
    expect(ENEMY_DEFS.length).toBeGreaterThan(0);
    for (const e of ENEMY_DEFS) {
      expect(e.hp).toBeGreaterThan(0);
      expect(e.dmg).toBeGreaterThan(0);
      expect(e.speed).toBeGreaterThan(0);
      expect(e.radius).toBeGreaterThan(0);
      expect(e.xp).toBeGreaterThanOrEqual(0);
      expect(e.texKind).toBeGreaterThanOrEqual(0);
      expect(e.texKind).toBeLessThanOrEqual(3);
    }
  });

  it('has at least one boss, tankier than any non-boss enemy', () => {
    const bosses = ENEMY_DEFS.filter((e) => e.boss);
    const mobs = ENEMY_DEFS.filter((e) => !e.boss);
    expect(bosses.length).toBeGreaterThan(0);
    expect(mobs.length).toBeGreaterThan(0);
    const maxMobHp = Math.max(...mobs.map((e) => e.hp));
    for (const b of bosses) expect(b.hp).toBeGreaterThan(maxMobHp);
  });
});

describe('CHARACTERS', () => {
  it('each character references weapons that exist', () => {
    const all = Object.values(CHARACTERS);
    expect(all.length).toBeGreaterThan(0);
    for (const c of all) {
      expect(WEAPONS[c.startingWeapon], `${c.id} startingWeapon`).toBeDefined();
      if (c.exclusiveSkill) expect(WEAPONS[c.exclusiveSkill], `${c.id} exclusiveSkill`).toBeDefined();
    }
  });
});

describe('STAGES', () => {
  it('each stage has a sane config', () => {
    expect(STAGES.length).toBeGreaterThan(0);
    for (const s of STAGES) {
      expect(s.spawnBase).toBeGreaterThan(0);
      expect(s.spawnRamp).toBeGreaterThanOrEqual(0);
      expect(s.enemyHpMul).toBeGreaterThan(0);
      expect(s.enemyDmgMul).toBeGreaterThan(0);
    }
  });
});

describe('GEAR', () => {
  it('each gear piece has a valid slot and non-empty mods', () => {
    const all = Object.values(GEAR);
    expect(all.length).toBeGreaterThan(0);
    for (const g of all) {
      expect(GEAR_SLOTS).toContain(g.slot);
      expect(Object.keys(g.mods).length).toBeGreaterThan(0);
    }
  });
});

describe('PETS', () => {
  it('each pet has positive attack stats', () => {
    const all = Object.values(PETS);
    expect(all.length).toBeGreaterThan(0);
    for (const p of all) {
      expect(p.cooldown).toBeGreaterThan(0);
      expect(p.dmg).toBeGreaterThan(0);
      expect(p.range).toBeGreaterThan(0);
      expect(p.count).toBeGreaterThan(0);
      expect(p.speed).toBeGreaterThan(0);
    }
  });
});

describe('xpForLevel (consumed by progression data)', () => {
  it('is strictly increasing', () => {
    let prev = xpForLevel(1);
    for (let lvl = 2; lvl <= 100; lvl++) {
      const cur = xpForLevel(lvl);
      expect(cur).toBeGreaterThan(prev);
      prev = cur;
    }
  });
});
