import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch01_soldier',
  name: 'Soldier',
  desc: 'Twenty years in the field left her with shrapnel in her shoulder and no patience for the dead. She outlasted her squad, her orders, and every sorry thing that came crawling after the collapse. Old habits keep her alive.',
  icon: '🪖',
  tint: 0x6a7050,
  startingWeapon: 'blades',
  mods: {
    maxHpMul: 0.15,
    dmgTakenMul: -0.08,
  },
});
