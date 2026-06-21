import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch08_engineer',
  name: 'Engineer',
  desc: 'She never trusted the factory tolerances — too slow, too cautious, built for soldiers who expected to come home. So she stripped the limiters, re-timed the cycling mechanisms, and wired the whole mess together with solder and spite. The guns run hot. They always run hot. She prefers it that way.',
  icon: '🔧',
  tint: 0x7a8090,
  startingWeapon: 'drone',
  mods: {
    cdMul: -0.1,
    xpMul: 0.1,
  },
});
