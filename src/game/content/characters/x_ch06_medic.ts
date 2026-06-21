import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch06_medic',
  name: 'Field Medic',
  desc: 'She has stitched wounds by the light of burning vehicles and set bones in the dark with nothing but zip ties and spite. The dead keep coming and she keeps patching the living, not out of hope, but because dying is the one thing she has never once agreed to do.',
  icon: '⛑',
  tint: 0x6a9a8a,
  startingWeapon: 'nova',
  mods: {
    maxHpMul: 0.3,
    dmgMul: -0.05,
  },
});
