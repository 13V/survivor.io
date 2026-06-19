import { registerGear } from '../../registry';

registerGear({
  id: 'windwalkers',
  name: 'Windwalkers',
  slot: 'boots',
  rarity: 'epic',
  icon: '🌬',
  desc: 'Gusts gather at your heels, sweeping loot inward.',
  mods: { moveMul: 0.17, pickupMul: 0.55 },
});
