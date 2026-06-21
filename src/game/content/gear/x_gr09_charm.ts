import { registerGear } from '../../registry';

registerGear({
  id: 'gr09_charm',
  name: "Survivor's Charm",
  slot: 'necklace',
  rarity: 'legendary',
  icon: '🧿',
  desc: "Clawed from the neck of a corpse three weeks into the collapse. Stained, cracked, and still humming with something that refuses to die — just like you.",
  mods: {
    xpMul: 0.15,
    pickupMul: 0.2,
  },
});
