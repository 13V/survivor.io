import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch14_vandal',
  name: 'Vandal',
  desc: 'She never met a structure she didn\'t want to demolish. Before the outbreak she was wiring charges under condemned buildings — now every street block is condemned. Equal parts reckless and precise, she tears through the horde with ordnance and attitude, leaving nothing standing that didn\'t deserve to fall.',
  icon: '🧨',
  tint: 0x8a5a6a,
  startingWeapon: 'nova',
  mods: {
    dmgMul: 0.1,
    cdMul: -0.06,
  },
});
