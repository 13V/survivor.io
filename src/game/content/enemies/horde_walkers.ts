// Horde: the slow, shambling backbone of the zombie swarm.
// texKind 0 (zombie sprite) recolored into distinct rotting hues. Early-game
// fodder that builds pressure through sheer numbers.
import { registerEnemy } from '../../registry';

// Slow baseline swarm unit. Present from the very start of the run.
registerEnemy({
  id: 'walker',
  name: 'Walker',
  speed: 50,
  hp: 16,
  dmg: 8,
  radius: 16,
  xp: 1,
  texKind: 0,
  tint: 0x6b8e23, // sickly olive green
  spawn: { minTime: 0, weight: 1.1 },
});

// Tiny, slow, dirt-cheap fodder. Pads out early waves.
registerEnemy({
  id: 'crawler',
  name: 'Crawler',
  speed: 38,
  hp: 7,
  dmg: 5,
  radius: 11,
  xp: 1,
  texKind: 0,
  tint: 0x9acd32, // pale yellow-green
  spawn: { minTime: 0, weight: 0.9 },
});

// Bigger, tankier shambler. Joins the swarm later as a slow wall of flesh.
registerEnemy({
  id: 'lurcher',
  name: 'Lurcher',
  speed: 44,
  hp: 90,
  dmg: 14,
  radius: 26,
  xp: 5,
  texKind: 0,
  tint: 0x4f6228, // dark mossy green
  spawn: { minTime: 75, weight: 0.3 },
});
