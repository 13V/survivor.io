import { registerPassive } from '../../registry';

registerPassive({
  id: 'ferocity',
  name: 'Ferocity',
  icon: '💢',
  maxLevel: 5,
  desc: '+15% crit damage / level',
  apply: (l, m) => {
    m.critDmg += 0.15 * l;
  },
});
