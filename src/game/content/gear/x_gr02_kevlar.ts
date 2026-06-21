import { registerGear } from '../../registry';

registerGear({
  id: 'gr02_kevlar',
  name: 'Kevlar Plates',
  slot: 'armor',
  rarity: 'epic',
  icon: '🦺',
  desc: 'Cracked, bloodstained plates stripped from a soldier who no longer needed them. Still stops bullets. Mostly.',
  mods: {
    maxHpMul: 0.2,
    dmgTakenMul: -0.08,
  },
});
