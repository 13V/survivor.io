// Void Set — three legendary pieces forged from the fabric of collapsed dimensions.
import { registerGear } from '../../registry';

registerGear({ id: 'void_reaver', name: 'Void Reaver', slot: 'weapon', rarity: 'legendary', icon: '🗡️', desc: 'A blade that tears through reality itself, each strike pulling enemies into a momentary rift that amplifies the damage dealt.', mods: { dmgMul: 0.28, critDmg: 0.2 } });
registerGear({ id: 'void_shroud', name: 'Void Shroud', slot: 'armor', rarity: 'legendary', icon: '🥋', desc: 'Woven from solidified dark energy, this shroud wraps the wearer in a shell of null-space that absorbs and nullifies incoming force.', mods: { maxHpMul: 0.3, dmgTakenMul: -0.12 } });
registerGear({ id: 'void_striders', name: 'Void Striders', slot: 'boots', rarity: 'legendary', icon: '👢', desc: 'These boots phase the wearer fractionally out of existence, letting them step between moments and arrive at their destination before the cooldown even begins.', mods: { moveMul: 0.2, cdMul: -0.08 } });
