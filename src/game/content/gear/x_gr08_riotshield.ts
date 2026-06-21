import { registerGear } from '../../registry';

registerGear({
  id: 'gr08_riotshield',
  name: 'Riot Shield Harness',
  slot: 'armor',
  rarity: 'legendary',
  icon: '🛡',
  desc: 'Ripped from a dead cop outside the evacuation checkpoint. The blood never fully washed out, but the ballistic plating held — and so will you.',
  mods: {
    maxHpMul: 0.28,
    dmgTakenMul: -0.14,
  },
});
