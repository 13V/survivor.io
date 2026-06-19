// Tinkerer: a cooldown engine who fires everything noticeably faster.
// Deploys an autonomous Drone and leans on relentless uptime over raw power.
import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'tinkerer',
  name: 'Tinkerer',
  desc: 'Cooldown engine. Tightened timers mean weapons fire again before they cool.',
  icon: '🔧',
  tint: 0xc9a14a,
  startingWeapon: 'drone',
  mods: { cdMul: -0.12, dmgMul: 0.05 },
});
