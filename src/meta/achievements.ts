// Achievement + weapon-unlock definitions for the meta-progression loop.
//
// Design (from the genre research): most weapons start LOCKED and are earned by
// completing achievements, so every run advances something and new "toys" feel
// earned. Achievements are pure data here; the tracking/persistence lives in
// meta/save.ts, and the Collection UI renders them. Progress for every
// achievement is a single number read from a lifetime stat (see `stat`), which
// keeps evaluation uniform: complete when statValue(stat) >= goal.

export type AchCategory = 'milestone' | 'mastery' | 'challenge' | 'discovery' | 'collection' | 'meta';

export interface AchievementDef {
  id: string;
  name: string;
  desc: string; // human-readable condition, also used as the locked-weapon hint
  icon: string;
  category: AchCategory;
  /** Lifetime stat key this reads for progress (see Meta.statValue). */
  stat: string;
  /** Target value; complete when statValue(stat) >= goal. */
  goal: number;
  /** What finishing it grants. Weapon unlocks add to the draftable pool. */
  unlock?: { kind: 'weapon'; id: string };
  /** Bonus coins on completion. */
  coins?: number;
  /** Hidden until earned (secret). */
  secret?: boolean;
}

// Weapons the player owns from the very start (one per archetype; covers every
// character's starting weapon). Everything else is earned.
export const STARTER_WEAPONS = ['shuriken', 'blades', 'zap', 'nova', 'drone'];

// The achievement roster. Ordered roughly by difficulty so the Collection reads
// as a ladder. ~16 of these gate a base weapon; the rest are badges/coins that
// keep every run paying out and give the completionist a long tail.
export const ACHIEVEMENTS: AchievementDef[] = [
  // ---- Tier 0: instant early hooks (within the first few runs) -------------
  {
    id: 'first_blood',
    name: 'First Blood',
    desc: 'Finish your first run.',
    icon: '🩸',
    category: 'meta',
    stat: 'runs',
    goal: 1,
    unlock: { kind: 'weapon', id: 'kunai' },
  },
  {
    id: 'survivalist',
    name: 'Survivalist',
    desc: 'Survive 60 seconds in a single run.',
    icon: '⏳',
    category: 'milestone',
    stat: 'bestTimeSec',
    goal: 60,
    unlock: { kind: 'weapon', id: 'cleaver' },
  },
  {
    id: 'slayer_1',
    name: 'Slayer',
    desc: 'Kill 500 zombies (lifetime).',
    icon: '☠',
    category: 'milestone',
    stat: 'kills',
    goal: 500,
    unlock: { kind: 'weapon', id: 'fireball' },
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    desc: 'Reach level 5 in a run.',
    icon: '🌱',
    category: 'milestone',
    stat: 'bestLevel',
    goal: 5,
    coins: 100,
  },

  // ---- Tier 1: require a bit of play --------------------------------------
  {
    id: 'scholar',
    name: 'Quick Study',
    desc: 'Reach level 10 in a run.',
    icon: '📘',
    category: 'milestone',
    stat: 'bestLevel',
    goal: 10,
    unlock: { kind: 'weapon', id: 'laser' },
  },
  {
    id: 'evolving',
    name: "It's Evolving!",
    desc: 'Evolve any weapon for the first time.',
    icon: '🧬',
    category: 'discovery',
    stat: 'evolutions',
    goal: 1,
    unlock: { kind: 'weapon', id: 'halo' },
  },
  {
    id: 'elite_hunter_1',
    name: 'Elite Hunter',
    desc: 'Kill 25 elite pack-leaders.',
    icon: '👹',
    category: 'milestone',
    stat: 'eliteKills',
    goal: 25,
    unlock: { kind: 'weapon', id: 'spikeball' },
  },
  {
    id: 'marksman',
    name: 'Marksman',
    desc: 'Land 1,000 critical hits (lifetime).',
    icon: '🎯',
    category: 'milestone',
    stat: 'crits',
    goal: 1000,
    unlock: { kind: 'weapon', id: 'railgun' },
  },
  {
    id: 'slayer_2',
    name: 'Exterminator',
    desc: 'Kill 2,500 zombies (lifetime).',
    icon: '💀',
    category: 'milestone',
    stat: 'kills',
    goal: 2500,
    unlock: { kind: 'weapon', id: 'swarm' },
  },

  // ---- Tier 2: real investment --------------------------------------------
  {
    id: 'champion',
    name: 'Champion',
    desc: 'Win a run (defeat the boss).',
    icon: '🏆',
    category: 'challenge',
    stat: 'wins',
    goal: 1,
    unlock: { kind: 'weapon', id: 'chakram' },
  },
  {
    id: 'boss_slayer',
    name: 'Giant Killer',
    desc: 'Defeat a boss.',
    icon: '🦾',
    category: 'challenge',
    stat: 'bossKills',
    goal: 1,
    unlock: { kind: 'weapon', id: 'sunburst' },
  },
  {
    id: 'veteran',
    name: 'Veteran',
    desc: 'Reach level 18 in a run.',
    icon: '🎖',
    category: 'milestone',
    stat: 'bestLevel',
    goal: 18,
    unlock: { kind: 'weapon', id: 'pulse' },
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    desc: 'Evolve 5 weapons (lifetime).',
    icon: '⚗',
    category: 'mastery',
    stat: 'evolutions',
    goal: 5,
    unlock: { kind: 'weapon', id: 'frostfield' },
  },
  {
    id: 'slayer_3',
    name: 'Apocalypse',
    desc: 'Kill 10,000 zombies (lifetime).',
    icon: '🌋',
    category: 'milestone',
    stat: 'kills',
    goal: 10000,
    unlock: { kind: 'weapon', id: 'lightning' },
  },
  {
    id: 'elite_hunter_2',
    name: 'Elite Slayer',
    desc: 'Kill 150 elite pack-leaders.',
    icon: '😈',
    category: 'milestone',
    stat: 'eliteKills',
    goal: 150,
    unlock: { kind: 'weapon', id: 'javelin' },
  },

  // ---- Tier 3: mastery & challenge ----------------------------------------
  {
    id: 'crit_master',
    name: 'Deadeye',
    desc: 'Land 5,000 critical hits (lifetime).',
    icon: '🔭',
    category: 'mastery',
    stat: 'crits',
    goal: 5000,
    unlock: { kind: 'weapon', id: 'prism' },
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    desc: 'Win a run without taking any damage.',
    icon: '🛡',
    category: 'challenge',
    stat: 'noHitWin',
    goal: 1,
    unlock: { kind: 'weapon', id: 'whip' },
    coins: 500,
  },

  // ---- Badges / long tail (no weapon, just bragging + coins) ---------------
  {
    id: 'centurion',
    name: 'Centurion',
    desc: 'Kill 100 zombies (lifetime).',
    icon: '🗡',
    category: 'milestone',
    stat: 'kills',
    goal: 100,
    coins: 50,
  },
  {
    id: 'persistent',
    name: 'Persistent',
    desc: 'Play 10 runs.',
    icon: '🔁',
    category: 'meta',
    stat: 'runs',
    goal: 10,
    coins: 150,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    desc: 'Play 50 runs.',
    icon: '📅',
    category: 'meta',
    stat: 'runs',
    goal: 50,
    coins: 500,
  },
  {
    id: 'boss_hunter',
    name: 'Boss Hunter',
    desc: 'Defeat 10 bosses.',
    icon: '👑',
    category: 'challenge',
    stat: 'bossKills',
    goal: 10,
    coins: 400,
  },
  {
    id: 'long_haul',
    name: 'Long Haul',
    desc: 'Survive 120 seconds in a run.',
    icon: '🕰',
    category: 'milestone',
    stat: 'bestTimeSec',
    goal: 120,
    coins: 200,
  },
  {
    id: 'high_roller',
    name: 'Overlevelled',
    desc: 'Reach level 25 in a run.',
    icon: '🚀',
    category: 'mastery',
    stat: 'bestLevel',
    goal: 25,
    coins: 300,
  },
  {
    id: 'combo_evolver',
    name: 'Mad Scientist',
    desc: 'Evolve 15 weapons (lifetime).',
    icon: '🧪',
    category: 'mastery',
    stat: 'evolutions',
    goal: 15,
    coins: 400,
  },
  {
    id: 'genocide',
    name: 'One-Man Army',
    desc: 'Kill 50,000 zombies (lifetime).',
    icon: '🔥',
    category: 'milestone',
    stat: 'kills',
    goal: 50000,
    coins: 1000,
  },
  {
    id: 'collector',
    name: 'Master Armorer',
    desc: 'Unlock every weapon.',
    icon: '🎰',
    category: 'collection',
    stat: 'weaponsUnlocked',
    goal: 0, // filled below = starters + every weapon-granting achievement
    coins: 2000,
  },
];

// The collection capstone's goal = how many weapons exist to be unlocked
// (starters + each weapon-granting achievement). Derived so it stays correct as
// the roster grows.
export const TOTAL_UNLOCKABLE_WEAPONS =
  STARTER_WEAPONS.length + ACHIEVEMENTS.filter((a) => a.unlock?.kind === 'weapon').length;

const collector = ACHIEVEMENTS.find((a) => a.id === 'collector');
if (collector) collector.goal = TOTAL_UNLOCKABLE_WEAPONS;

/** All weapon ids that are unlockable (starters + achievement rewards). */
export function allUnlockableWeapons(): string[] {
  const ids = [...STARTER_WEAPONS];
  for (const a of ACHIEVEMENTS) if (a.unlock?.kind === 'weapon') ids.push(a.unlock.id);
  return ids;
}
