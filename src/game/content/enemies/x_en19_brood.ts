// Brood Crawler — a chitinous nightmare that scuttles through the dark, swarming in writhing clusters to drag survivors down.
import { registerEnemy } from '../../registry';

registerEnemy({ id: 'en19_brood', name: 'Brood Crawler', speed: 62, hp: 36, dmg: 9, radius: 13, xp: 5, texKind: 0, tint: 0x7a6a8a, ai: 'seek', spawn: { minTime: 45, weight: 0.6 } });
