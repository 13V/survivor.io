import { registerGear } from '../../registry';

registerGear({
  id: 'gb_scavenger_necklace',
  name: 'Scavenger\'s Tooth',
  slot: 'necklace',
  rarity: 'epic',
  icon: '🦷',
  desc: 'A cracked molar strung on wire, pried from something that no longer needs it. Draws resources like blood draws flies.',
  mods: { pickupMul: 0.18, xpMul: 0.15 },
});

registerGear({
  id: 'gb_scavenger_belt',
  name: 'Scavenger\'s Gut Strap',
  slot: 'belt',
  rarity: 'epic',
  icon: '🪢',
  desc: 'Salvaged from a dead soldier\'s kit, wound tight around the waist. Keeps your guts where they belong.',
  mods: { maxHpMul: 0.20 },
});

registerGear({
  id: 'gb_scavenger_gloves',
  name: 'Scavenger\'s Grip',
  slot: 'gloves',
  rarity: 'epic',
  icon: '🧤',
  desc: 'Fingers cut short, knuckles re-taped a dozen times. You\'ve learned to reload faster than the dead can shamble.',
  mods: { cdMul: -0.18 },
});
