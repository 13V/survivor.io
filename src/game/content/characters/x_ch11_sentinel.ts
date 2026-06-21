import { registerCharacter } from '../../registry';

registerCharacter({
  id: 'ch11_sentinel',
  name: 'Sentinel',
  desc: 'He does not advance. He does not retreat. He plants his boots in the dirt and becomes the wall — the last thing between the horde and everything worth protecting. Rounds flatten against his armor. The dead pile up at his feet. He does not notice. He is still holding the line.',
  icon: '🛡',
  tint: 0x4a5a6a,
  startingWeapon: 'blades',
  mods: {
    dmgTakenMul: -0.18,
    moveMul: -0.06,
    maxHpMul: 0.1,
  },
});
