// Stormcaller: a rapid-firing electric caster who chains lightning across enemies in a relentless storm.
import { registerCharacter } from '../../registry';
registerCharacter({ id: 'stormcaller', name: 'Stormcaller', desc: 'Where others pause to breathe, the Stormcaller unleashes bolt after bolt — chaining lightning through clustered foes in a ceaseless, crackling tempest.', icon: '⚡', tint: 0x66ccff, startingWeapon: 'zap', mods: { cdMul: -0.1, critRate: 0.03 } });
