import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch05_runner',
  name: 'Runner',
  desc: 'She never stood and fought — she ran, and that made her the last one breathing. Fleet-footed and hollow-eyed, she scouts ahead of every group she joins, slipping through hordes that would grind anyone slower to nothing. She hits hard bruises easier than most, and she knows it.',
  icon: '🏃',
  tint: 0x5a8a6a,
  startingWeapon: 'shuriken',
  mods: {
    moveMul: 0.25,
    cdMul: -0.05,
    maxHpMul: -0.08,
  },
});
