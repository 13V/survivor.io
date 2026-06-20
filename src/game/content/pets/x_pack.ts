// X-Pack pets: Phoenix, Stone Golem, Spark Sprite
import { registerPet } from '../../registry';
registerPet({ id: 'phoenix_pet', name: 'Phoenix', icon: '🔥', desc: 'A blazing firebird reborn from cinders, scorching foes with searing talons.', color: 0xff7733, cooldown: 0.7, dmg: 11, range: 500, count: 1, speed: 600 });
registerPet({ id: 'golem_pet', name: 'Stone Golem', icon: '🗿', desc: 'An ancient guardian hewn from living rock, hurling chunks of mountain at anything that draws too close.', color: 0x99aa88, cooldown: 1.4, dmg: 22, range: 440, count: 1, speed: 460 });
registerPet({ id: 'spark_sprite', name: 'Spark Sprite', icon: '⚡', desc: 'A mischievous bolt of raw lightning that splits apart mid-flight to zap two enemies at once.', color: 0xffee66, cooldown: 0.4, dmg: 5, range: 460, count: 2, speed: 580 });
