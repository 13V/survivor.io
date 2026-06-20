// Harbinger: glass-cannon character — overwhelming firepower at the cost of survivability
import { registerCharacter } from '../../registry';
registerCharacter({ id: 'harbinger', name: 'Harbinger', desc: 'Channels devastating cosmic energy to obliterate enemies, but the same power that fuels their assault leaves them dangerously exposed.', icon: '☄️', tint: 0xcc6644, startingWeapon: 'nova', mods: { dmgMul: 0.15, maxHpMul: -0.1 } });
