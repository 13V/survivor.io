import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch12_stalker',
  name: 'Nightstalker',
  desc: 'She moves without sound and kills without warning. A silent prowler who strikes from the shadows, she exploits every blind spot and vanishes before her prey can react — faster than fear, deadlier than darkness.',
  icon: '🐈‍⬛',
  tint: 0x44485a,
  startingWeapon: 'shuriken',
  mods: {
    critRate: 0.06,
    moveMul: 0.1,
    maxHpMul: -0.05,
  },
});
