import { registerGear } from '../../registry';

registerGear({
  id: 'titan_girdle',
  name: 'Titan Girdle',
  slot: 'belt',
  rarity: 'legendary',
  icon: '⛓',
  desc: 'Forged for giants — both ward and constitution surge.',
  mods: { dmgTakenMul: -0.22, maxHpMul: 0.4 },
});
