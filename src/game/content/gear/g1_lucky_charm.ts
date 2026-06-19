// Necklace (rare) — a little luck goes a long way.
import { registerGear } from '../../registry';

registerGear({
  id: 'lucky_charm',
  name: 'Lucky Charm',
  slot: 'necklace',
  rarity: 'rare',
  icon: '🍀',
  desc: 'A four-leaf trinket that nudges fortune in your favor.',
  mods: { critRate: 0.05, xpMul: 0.1 },
});
