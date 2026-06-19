import { registerWeapon, registerEvolution } from '../../registry';

// Defensive orbit family: more, larger blades on a slower, heavier ring that
// hits hard. Evolves into Spike Storm (power catalyst): a brutal wall of spikes.

const min = (v: number, m: number): number => (v < m ? m : v);

registerWeapon({
  id: 'spikeball',
  name: 'Spikeball',
  type: 'orbit',
  orbit: true,
  icon: '🔩',
  color: 0xb06a3a,
  maxLevel: 5,
  desc: 'Heavy spiked orbs grind slowly around you.',
  stats: (l) => ({
    cooldown: min(0.6 - (l - 1) * 0.03, 0.45),
    dmg: 9 + (l - 1) * 4,
    count: 3 + (l - 1),
    speed: 0,
    radius: 26,
    pierce: 0,
    range: 86 + (l - 1) * 8,
    knock: 70,
    spin: 1.8,
  }),
});

registerWeapon({
  id: 'spike_storm',
  name: 'Spike Storm',
  type: 'orbit',
  orbit: true,
  hidden: true,
  icon: '🌑',
  color: 0x8a3f1a,
  maxLevel: 5,
  desc: 'A churning maelstrom of massive spiked orbs.',
  stats: (l) => ({
    cooldown: min(0.45 - (l - 1) * 0.02, 0.36),
    dmg: 22 + (l - 1) * 8,
    count: 6 + (l - 1),
    speed: 0,
    radius: 34,
    pierce: 0,
    range: 110 + (l - 1) * 10,
    knock: 110,
    spin: 2.4,
  }),
});

registerEvolution({
  result: 'spike_storm',
  base: 'spikeball',
  catalyst: { kind: 'passive', id: 'power' },
});
