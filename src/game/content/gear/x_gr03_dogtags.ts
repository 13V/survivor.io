import { registerGear } from '../../registry';

registerGear({
  id: 'gr03_dogtags',
  name: 'Dog Tags',
  slot: 'necklace',
  rarity: 'rare',
  icon: '🪖',
  desc: 'Scratched metal stamped with a dead soldier\'s name. Wearing someone else\'s tags means you made it and they didn\'t — that edge keeps you sharp.',
  mods: {
    critRate: 0.06,
  },
});
