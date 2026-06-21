import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch09_gunslinger',
  name: 'Gunslinger',
  desc: 'Forged on dust-choked roads where the dead outnumber the living, she draws before the world decides to blink. Worn boots, iron nerves, and a trigger finger that answers every problem faster than fear can form. The apocalypse is just another territory she is passing through.',
  icon: '🤠',
  tint: 0x8a6a3a,
  startingWeapon: 'zap',
  mods: {
    cdMul: -0.08,
    critRate: 0.04,
  },
});
