// bitECS components (Struct-of-Arrays). Access as Position.x[eid].
import { defineComponent, Types } from 'bitecs';

export const Position = defineComponent({ x: Types.f32, y: Types.f32 });
export const Velocity = defineComponent({ x: Types.f32, y: Types.f32 });

export const Enemy = defineComponent({
  speed: Types.f32,
  hp: Types.f32,
  maxHp: Types.f32,
  dmg: Types.f32,
  radius: Types.f32,
  kind: Types.ui8,
  xp: Types.f32,
  flash: Types.f32, // hit-flash timer
  boss: Types.ui8,
  elite: Types.ui8, // 1 = buffed pack-leader (bigger, tankier, bonus XP, aura)
  atkCd: Types.f32, // boss special-attack cooldown
  knock: Types.f32, // knockback velocity decay
  knx: Types.f32,
  kny: Types.f32,
});

export const Projectile = defineComponent({
  dmg: Types.f32,
  life: Types.f32,
  radius: Types.f32,
  pierce: Types.i16,
  crit: Types.ui8,
  enemy: Types.ui8, // 1 = enemy-owned hazard (damages the player), 0 = player projectile
});

export const Gem = defineComponent({
  value: Types.f32,
  kind: Types.ui8, // 0 green,1 blue,2 gold,3 heal
  magnet: Types.ui8,
  life: Types.f32,
});
