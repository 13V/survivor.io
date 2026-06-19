// Nomad: a roaming scavenger who covers ground fast and sweeps up every drop.
// Flings Shuriken on the move, trading bulk for speed and a wide pickup reach.
import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'nomad',
  name: 'Nomad',
  desc: 'Restless wanderer. Blazing footwork and a vast pickup radius vacuum the field.',
  icon: '🧭',
  tint: 0xe0c27a,
  startingWeapon: 'shuriken',
  mods: { moveMul: 0.25, pickupMul: 0.8 },
});
