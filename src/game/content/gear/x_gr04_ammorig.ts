import { registerGear } from '../../registry';

registerGear({
  id: 'gr04_ammorig',
  name: 'Ammo Rig',
  slot: 'belt',
  rarity: 'epic',
  icon: '🎽',
  desc: 'A duct-taped chest rig stripped from a supply runner who never made it back. Pouches pre-loaded, hands never idle.',
  mods: {
    cdMul: -0.1,
  },
});
