import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch07_arsonist',
  name: 'Arsonist',
  desc: 'He was burning buildings before the dead started walking — now he burns everything else too. No plan, no caution, just fuel and flame and the ugly grin of a man who never needed a reason. The horde comes, and he lights the match.',
  icon: '🔥',
  tint: 0xaa5a30,
  startingWeapon: 'nova',
  mods: {
    dmgMul: 0.15,
    dmgTakenMul: 0.05,
  },
});
