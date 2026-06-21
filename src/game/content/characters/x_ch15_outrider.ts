import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch15_outrider',
  name: 'Outrider',
  desc: 'A hardened biker scout who never stops moving. Forged on dead highways and burning wastelands, she reads the battlefield from the saddle — always one step ahead, always cutting through — because the moment she slows down is the moment the horde catches up.',
  icon: '🏍',
  tint: 0x5a6a8a,
  startingWeapon: 'zap',
  mods: {
    moveMul: 0.18,
    critRate: 0.03,
  },
});
