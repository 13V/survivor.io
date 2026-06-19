// Pet companions: follow the player and auto-fire bolts at the nearest enemy.
import { registerPet } from '../../registry';

registerPet({
  id: 'drone_pet',
  name: 'Recon Drone',
  icon: '🛸',
  desc: 'Steady bolts at the nearest foe.',
  color: 0x9be7ff,
  cooldown: 0.8,
  dmg: 8,
  range: 480,
  count: 1,
  speed: 520,
});

registerPet({
  id: 'wisp',
  name: 'Wisp',
  icon: '✨',
  desc: 'Rapid, weak shots.',
  color: 0xfff3b0,
  cooldown: 0.45,
  dmg: 4,
  range: 420,
  count: 1,
  speed: 560,
});

registerPet({
  id: 'turret',
  name: 'Mini Turret',
  icon: '🔫',
  desc: 'Triple shot, slower.',
  color: 0xff9a6b,
  cooldown: 1.3,
  dmg: 9,
  range: 500,
  count: 3,
  speed: 540,
});

registerPet({
  id: 'hound',
  name: 'Cyber Hound',
  icon: '🐕',
  desc: 'Heavy single shots.',
  color: 0xb89cff,
  cooldown: 1.0,
  dmg: 14,
  range: 460,
  count: 1,
  speed: 600,
});
