import { registerPassive } from '../../registry';

registerPassive({
  id: 'power',
  name: 'Power',
  icon: '🗡',
  maxLevel: 5,
  desc: '+12% damage / level',
  apply: (l, m) => (m.dmgMul += 0.12 * l),
});

registerPassive({
  id: 'haste',
  name: 'Haste',
  icon: '⏱',
  maxLevel: 5,
  desc: '−8% cooldown / level',
  apply: (l, m) => (m.cdMul *= Math.pow(0.92, l)),
});

registerPassive({
  id: 'swift',
  name: 'Swift',
  icon: '👟',
  maxLevel: 5,
  desc: '+10% move speed / level',
  apply: (l, m) => (m.moveMul += 0.1 * l),
});

registerPassive({
  id: 'vitality',
  name: 'Vitality',
  icon: '❤',
  maxLevel: 5,
  desc: '+18% max HP / level',
  apply: (l, m) => (m.maxHpMul += 0.18 * l),
});

registerPassive({
  id: 'magnet',
  name: 'Magnet',
  icon: '🧲',
  maxLevel: 5,
  desc: '+35% pickup range / level',
  apply: (l, m) => (m.pickupMul += 0.35 * l),
});

registerPassive({
  id: 'growth',
  name: 'Growth',
  icon: '✷',
  maxLevel: 5,
  desc: '+15% XP / level',
  apply: (l, m) => (m.xpMul += 0.15 * l),
});

registerPassive({
  id: 'crit',
  name: 'Precision',
  icon: '🎯',
  maxLevel: 5,
  desc: '+4% crit chance / level',
  apply: (l, m) => (m.critRate += 0.04 * l),
});

registerPassive({
  id: 'guard',
  name: 'Guard',
  icon: '🦺',
  maxLevel: 5,
  desc: '−9% damage taken / level',
  apply: (l, m) => (m.dmgTakenMul *= Math.pow(0.91, l)),
});
