import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch04_brawler',
  name: 'Brawler',
  desc: 'No rifle, no plan — just fists and fury. He wades straight into the swarm, takes the hits, and keeps throwing. The dead learned quick that knocking him down only makes him angrier.',
  icon: '🥊',
  tint: 0x9a5a44,
  startingWeapon: 'blades',
  mods: {
    dmgMul: 0.12,
    maxHpMul: 0.1,
    moveMul: -0.05,
  },
});
