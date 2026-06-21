// Military Set — three legendary pieces scavenged from the ruins of a fallen army.
import { registerGear } from '../../registry';

registerGear({ id: 'ga_combat_rifle', name: 'Combat Rifle', slot: 'weapon', rarity: 'legendary', icon: '🔫', desc: 'A battle-worn assault rifle pulled off a dead soldier\'s back. The barrel is scorched, the stock is cracked, and it still hits harder than anything else on the field.', mods: { dmgMul: 0.3, critRate: 0.08, critDmg: 0.15 } });
registerGear({ id: 'ga_blast_plate', name: 'Blast Plate', slot: 'armor', rarity: 'legendary', icon: '🪖', desc: 'Ceramic composite panels stitched over ballistic fiber — military-grade and caked in dried blood that isn\'t yours. Not yet.', mods: { maxHpMul: 0.28, dmgTakenMul: -0.14 } });
registerGear({ id: 'ga_ranger_boots', name: 'Ranger Boots', slot: 'boots', rarity: 'legendary', icon: '🥾', desc: 'Reinforced with steel-toed caps and a midsole designed for rapid assault movements. The undead don\'t stop — so neither do you.', mods: { moveMul: 0.25, cdMul: -0.1 } });
