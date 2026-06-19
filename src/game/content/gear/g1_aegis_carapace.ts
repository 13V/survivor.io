// Armor (legendary) — an impervious shell forged for the apocalypse.
import { registerGear } from '../../registry';

registerGear({
  id: 'aegis_carapace',
  name: 'Aegis Carapace',
  slot: 'armor',
  rarity: 'legendary',
  icon: '🐢',
  desc: 'An unbreakable carapace that turns the wearer into a walking fortress.',
  mods: { maxHpMul: 0.5, dmgTakenMul: -0.22 },
});
