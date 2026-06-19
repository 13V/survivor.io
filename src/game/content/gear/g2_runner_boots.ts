import { registerGear } from '../../registry';

registerGear({
  id: 'runner_boots',
  name: 'Runner Boots',
  slot: 'boots',
  rarity: 'rare',
  icon: '👟',
  desc: 'Cushioned soles for quicker footwork and pickups.',
  mods: { moveMul: 0.1, pickupMul: 0.25 },
});
