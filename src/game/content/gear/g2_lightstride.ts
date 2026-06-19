import { registerGear } from '../../registry';

registerGear({
  id: 'lightstride',
  name: 'Lightstride',
  slot: 'boots',
  rarity: 'legendary',
  icon: '⚡',
  desc: 'Step like lightning — blurring speed and a vast pickup field.',
  mods: { moveMul: 0.25, pickupMul: 1.0 },
});
