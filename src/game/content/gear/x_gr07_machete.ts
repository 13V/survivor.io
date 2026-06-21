import { registerGear } from '../../registry';

registerGear({
  id: 'gr07_machete',
  name: 'Serrated Machete',
  slot: 'weapon',
  rarity: 'epic',
  icon: '🔪',
  desc: 'A hand-worn blade with a rust-stained serrated spine. Every swing tears deeper than the last — bone, sinew, nothing holds.',
  mods: {
    dmgMul: 0.18,
    critDmg: 0.15,
  },
});
