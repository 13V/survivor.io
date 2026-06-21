import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch16_warlord',
  name: 'Warlord',
  desc: 'He ran the compound with an iron fist long before the dead started walking. Three hundred pounds of scar tissue and bad intent, he carved out a fortress from the ruins and broke anyone who challenged it. He hits harder than anything still breathing and shrugs off wounds that would drop lesser survivors — but every step costs him, and the horde is faster than pride.',
  icon: '👑',
  tint: 0x8a7040,
  startingWeapon: 'blades',
  mods: {
    dmgMul: 0.15,
    maxHpMul: 0.15,
    cdMul: 0.05,
    moveMul: -0.05,
  },
});
