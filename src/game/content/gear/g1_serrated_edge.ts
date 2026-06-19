// Weapon (rare) — a jagged blade that bites a little deeper.
import { registerGear } from '../../registry';

registerGear({
  id: 'serrated_edge',
  name: 'Serrated Edge',
  slot: 'weapon',
  rarity: 'rare',
  icon: '🔪',
  desc: 'A wickedly jagged blade that tears wounds wider.',
  mods: { dmgMul: 0.12, critRate: 0.03 },
});
