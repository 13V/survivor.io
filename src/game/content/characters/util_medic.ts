// Medic: a sustain-focused survivor who simply refuses to go down.
// Pulses a Nova to keep space clear while staying durable enough to outlast fights.
import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'medic',
  name: 'Medic',
  desc: 'Safe and steady. Healthy bulk and damage reduction let you outlast any wave.',
  icon: '🩺',
  tint: 0x8fe6b0,
  startingWeapon: 'nova',
  mods: { maxHpMul: 0.3, dmgTakenMul: -0.15, dmgMul: 0.05 },
});
