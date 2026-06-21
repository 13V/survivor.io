import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch13_packrat',
  name: 'Packrat',
  desc: 'Every XP gem on the ground is an insult to him if he doesn\'t grab it first. He doesn\'t kill smarter or hit harder — he just hoovers up every glowing shard the horde drops and levels while everyone else is still reloading. Drones do the dirty work; he\'s too busy sprinting for the next pickup to bother aiming.',
  icon: '🦝',
  tint: 0x7a6a5a,
  startingWeapon: 'drone',
  mods: {
    xpMul: 0.25,
    pickupMul: 0.2,
    dmgMul: -0.05,
  },
});
