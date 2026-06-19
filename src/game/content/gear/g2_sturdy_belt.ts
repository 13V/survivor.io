import { registerGear } from '../../registry';

registerGear({
  id: 'sturdy_belt',
  name: 'Sturdy Belt',
  slot: 'belt',
  rarity: 'rare',
  icon: '🪢',
  desc: 'Reinforced leather softens incoming blows.',
  mods: { dmgTakenMul: -0.08, maxHpMul: 0.08 },
});
