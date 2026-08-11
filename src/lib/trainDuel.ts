import { createLevel } from './platformLevel';
import type { InputState, PlatformGameState } from './platformTypes';
import { awardFloorCoin } from './progress';

export function startTrainDuel(state: PlatformGameState) {
  return {
    ...state,
    duel: { active: true, focus: 0, playerMarks: 0, guardMarks: 0, crosshairX: 560, crosshairY: 300 },
    message: 'Duel started. Mash Space, aim with movement, press F to mark shots.',
  };
}

export function updateTrainDuel(state: PlatformGameState, input: InputState, dt: number) {
  const duel = state.duel;
  if (!duel?.active) return state;
  const aimedX = input.aimX ?? duel.crosshairX + (input.left ? -260 : input.right ? 260 : 0) * dt;
  const aimedY = input.aimY ?? duel.crosshairY + (input.jump ? -260 : input.down ? 260 : 0) * dt;
  const crosshairX = Math.max(360, Math.min(820, aimedX));
  const crosshairY = Math.max(170, Math.min(430, aimedY));
  const focus = Math.min(100, duel.focus + (input.jumpPressed || input.slamPressed ? 16 : 0));
  const guardMarks = Math.min(6, duel.guardMarks + dt * 0.4);
  const onGuard = Math.abs(crosshairX - 660) < 90 && Math.abs(crosshairY - 290) < 120;
  const playerMarks = input.shootPressed && focus >= 20 && onGuard ? duel.playerMarks + 1 : duel.playerMarks;
  const nextDuel = { ...duel, crosshairX, crosshairY, focus: input.shootPressed ? Math.max(0, focus - 20) : focus, guardMarks, playerMarks };

  if (playerMarks >= 4) {
    awardFloorCoin();
    return {
      ...createLevel(state.floor + 1, state.player.hp, { flashlights: state.flashlights, hasGun: true, shots: 24, stamina: state.player.stamina, unlimitedGun: state.unlimitedGun }),
      message: 'Duel won. Revolver acquired with 24 bullets.',
    };
  }
  if (guardMarks >= 4) {
    return { ...state, duel: nextDuel, status: 'lost' as const, deathCause: 'duel' as const, player: { ...state.player, hp: 0 }, message: 'The guard outdrew you.' };
  }
  return { ...state, duel: nextDuel };
}
