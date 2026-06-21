import { registerGear } from '../../registry';

registerGear({
  id: 'gj_juggernaut_plate',
  name: 'Juggernaut Plate',
  slot: 'armor',
  rarity: 'legendary',
  icon: '🛡️',
  desc: 'Forged from the bones of things that stopped moving. You won\'t.',
  mods: {
    maxHpMul: 0.3,
  },
});

registerGear({
  id: 'gj_juggernaut_girdle',
  name: 'Juggernaut Girdle',
  slot: 'belt',
  rarity: 'legendary',
  icon: '⛓️',
  desc: 'Every hit lands softer. Every scar hardens you more. Keep walking.',
  mods: {
    dmgTakenMul: -0.2,
  },
});

registerGear({
  id: 'gj_juggernaut_stompers',
  name: 'Juggernaut Stompers',
  slot: 'boots',
  rarity: 'legendary',
  icon: '🦶',
  desc: 'Slower. Heavier. Unstoppable. The dead scatter at the sound of your step.',
  mods: {
    maxHpMul: 0.2,
    moveMul: -0.05,
  },
});
