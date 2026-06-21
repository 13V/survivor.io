// Demolition Set — three legendary pieces built for one purpose: total annihilation.
import { registerGear } from '../../registry';

registerGear({ id: 'gg_breacher', name: 'Breacher', slot: 'weapon', rarity: 'legendary', icon: '💥', desc: 'A sawn-off sledgehammer with a det-cord wrap around the head. Every swing detonates on contact. The undead don\'t just die — they come apart.', mods: { dmgMul: 0.28, critRate: 0.1 } });
registerGear({ id: 'gg_blastcord_belt', name: 'Blastcord Belt', slot: 'belt', rarity: 'legendary', icon: '🧨', desc: 'Strips of detonation cord woven through ballistic webbing. The concussive feedback from each kill rattles your bones and sharpens your edge. Pain is leverage.', mods: { critDmg: 0.3, xpMul: 0.1 } });
registerGear({ id: 'gg_demo_gloves', name: 'Demo Gloves', slot: 'gloves', rarity: 'legendary', icon: '🧤', desc: 'Thick blast-rated gauntlets worn by EOD crews who stopped fearing death. The tactile dampening somehow makes your hands faster — less hesitation, more detonation.', mods: { cdMul: -0.1, dmgMul: 0.12, critRate: 0.06 } });
