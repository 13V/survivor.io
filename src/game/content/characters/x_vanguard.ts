// Vanguard: a tanky frontline defender who soaks hits and holds the line so others don't have to.
import { registerCharacter } from '../../registry';
registerCharacter({ id: 'vanguard', name: 'Vanguard', desc: 'Built like a fortress and twice as stubborn — the Vanguard absorbs punishment at the front so the squad never breaks.', icon: '🛡', tint: 0x4488bb, startingWeapon: 'blades', mods: { maxHpMul: 0.25, dmgTakenMul: -0.12, moveMul: -0.05 } });
