import type { PlatformGameState } from './platformTypes';

export function applyEventDamage(state: PlatformGameState, dt: number) {
  const cooldown = Math.max(0, state.eventDamageCooldown - dt);
  if (state.mode !== 'lava') return { ...state, eventDamageCooldown: cooldown };
  const onBox = state.boxes.some((box) => overlapsBoxTop(state, box));
  if (onBox) return { ...state, eventDamageCooldown: cooldown };
  if (!state.player.grounded || cooldown > 0) return { ...state, eventDamageCooldown: cooldown };

  const hp = Math.max(0, state.player.hp - 8);
  return {
    ...state,
    eventDamageCooldown: 0.7,
    player: { ...state.player, hp },
    status: hp <= 0 ? 'lost' : state.status,
    deathCause: hp <= 0 ? 'lava' : state.deathCause,
    message: hp <= 0 ? 'The lava floor cooked you.' : 'The lava floor burns. Jump or run.',
  };
}

function overlapsBoxTop(state: PlatformGameState, box: { x: number; y: number; width: number }) {
  const player = state.player;
  const feet = player.x + player.width / 2;
  return feet > box.x && feet < box.x + box.width && Math.abs(player.y + player.height - box.y) < 8;
}
