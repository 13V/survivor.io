import { registerGear } from '../../registry';

registerGear({
  id: 'bulwark_belt',
  name: 'Bulwark Belt',
  slot: 'belt',
  rarity: 'epic',
  icon: '🛡',
  desc: 'A fortified girdle that turns aside heavy strikes.',
  mods: { dmgTakenMul: -0.14, maxHpMul: 0.2 },
});
