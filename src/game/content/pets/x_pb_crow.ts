// Carrion Crow pet
import { registerPet } from '../../registry';

registerPet({
  id: 'pb_crow',
  name: 'Carrion Crow',
  icon: '🐦‍⬛',
  desc: 'A pair of battle-worn scavengers that circle overhead, pecking rapid weak shots into whatever twitches closest.',
  color: 0x444450,
  cooldown: 0.45,
  dmg: 5,
  range: 460,
  count: 2,
  speed: 580,
});
