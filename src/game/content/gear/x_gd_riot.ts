import { registerGear } from '../../registry';

registerGear({
  id: 'gd_riot_shield_vest',
  name: 'Riot Shield Vest',
  slot: 'armor',
  rarity: 'legendary',
  icon: '🛡️',
  desc: 'Thick composite plating hammered from salvaged cruiser hull. Rounds flatten against it. You barely notice.',
  mods: { dmgTakenMul: -0.28, maxHpMul: 0.12 },
});

registerGear({
  id: 'gd_riot_enforcer_belt',
  name: 'Riot Enforcer Belt',
  slot: 'belt',
  rarity: 'legendary',
  icon: '🔩',
  desc: 'A trauma rig packed with stims and trauma plates. Hit harder. Last longer. Walk away.',
  mods: { maxHpMul: 0.3, dmgTakenMul: -0.08 },
});

registerGear({
  id: 'gd_riot_breacher',
  name: 'Riot Breacher',
  slot: 'weapon',
  rarity: 'legendary',
  icon: '🔫',
  desc: 'Crowd-control shotgun adapted for horde suppression. Every pull clears a lane. Every lane buys another second.',
  mods: { dmgMul: 0.25, critRate: 0.12, critDmg: 0.2 },
});
