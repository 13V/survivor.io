import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch10_berserker',
  name: 'Madman',
  desc: 'He fights like he has nothing to lose — because he doesn\'t. Every swing lands with bone-cracking force, but one solid hit back and it\'s over. A glass cannon with a death wish and a body count to prove it.',
  icon: '😡',
  tint: 0x9a3a30,
  startingWeapon: 'blades',
  mods: {
    dmgMul: 0.25,
    maxHpMul: -0.12,
    dmgTakenMul: 0.08,
  },
});
