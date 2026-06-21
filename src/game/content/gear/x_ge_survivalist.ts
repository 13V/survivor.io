// Survivalist Set — three rare pieces cobbled together from whatever the wasteland didn't take.
import { registerGear } from '../../registry';

registerGear({ id: 'ge_survivalist_pendant', name: "Survivor's Pendant", slot: 'necklace', rarity: 'rare', icon: '📿', desc: "A bent bottlecap strung on wire, punched through with the initials of whoever wore it before. You don't know their name. You know they lasted longer than most.", mods: { maxHpMul: 0.10, xpMul: 0.08, pickupMul: 0.09 } });
registerGear({ id: 'ge_survivalist_vest', name: "Survivalist's Vest", slot: 'armor', rarity: 'rare', icon: '🧥', desc: 'Patched with duct tape, zip-ties, and a strip of tire rubber over the left shoulder. It looks like garbage. It has kept you breathing through things that killed everyone else.', mods: { maxHpMul: 0.12, dmgTakenMul: -0.08, pickupMul: 0.06 } });
registerGear({ id: 'ge_survivalist_belt', name: "Scavenger's Belt", slot: 'belt', rarity: 'rare', icon: '🎗', desc: 'Every loop and pouch stuffed with something you might need and probably will. Hoarder instinct turned survival skill — out here the pack rat outlives the warrior.', mods: { pickupMul: 0.12, xpMul: 0.10, maxHpMul: 0.08 } });
