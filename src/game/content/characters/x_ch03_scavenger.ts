import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch03_scavenger',
  name: 'Scavenger',
  desc: 'Nothing gets left behind — not a spent casing, not a rotting ration, not a cracked battery leaking acid on the asphalt. She has outlasted cleaner survivors by eating their scraps. Her pack is heavier than most people\'s hope, and every piece of junk in it has a use she already planned three days ago.',
  icon: '🎒',
  tint: 0x8a7a4a,
  startingWeapon: 'drone',
  mods: {
    pickupMul: 0.4,
    xpMul: 0.1,
  },
});
