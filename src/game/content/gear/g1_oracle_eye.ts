// Necklace (legendary) — sees the kill before it happens.
import { registerGear } from '../../registry';

registerGear({
  id: 'oracle_eye',
  name: 'Oracle Eye',
  slot: 'necklace',
  rarity: 'legendary',
  icon: '🔮',
  desc: 'An all-seeing eye that reveals every weakness and hastens every reward.',
  mods: { critRate: 0.13, xpMul: 0.25 },
});
