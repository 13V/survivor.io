import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch02_marksman',
  name: 'Marksman',
  desc: 'He stopped running the day he realized a bullet travels faster than any dead thing. Planted, patient, and cold behind the scope — every shot a verdict. He trades footwork for kill shots, and he has never missed one that mattered.',
  icon: '🎯',
  tint: 0x4a6a8a,
  startingWeapon: 'nova',
  mods: {
    critRate: 0.05,
    critDmg: 0.3,
    moveMul: -0.05,
  },
});
