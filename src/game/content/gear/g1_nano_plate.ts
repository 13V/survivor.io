// Armor (epic) — self-repairing nanomesh that hardens under fire.
import { registerGear } from '../../registry';

registerGear({
  id: 'nano_plate',
  name: 'Nano Plate',
  slot: 'armor',
  rarity: 'epic',
  icon: '🛡',
  desc: 'A lattice of self-knitting nanomachines that reinforce on impact.',
  mods: { maxHpMul: 0.32, dmgTakenMul: -0.12 },
});
