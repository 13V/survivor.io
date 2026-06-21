import { registerGear } from '../../registry';

registerGear({
  id: 'gr01_chainsaw',
  name: 'Chainsaw Bayonet',
  slot: 'weapon',
  rarity: 'legendary',
  icon: '🪚',
  desc: 'A combat bayonet with a screaming chainsaw blade welded to the barrel. Leaves nothing clean.',
  mods: {
    dmgMul: 0.25,
    cdMul: -0.05,
  },
});
