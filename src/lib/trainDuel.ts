import { createLevel } from './platformLevel';
import type { InputState, PlatformGameState } from './platformTypes';
import { awardFloorCoin } from './progress';

export function startTrainDuel(state: PlatformGameState) {
  return {
    ...state,
    duel: { phase: 'choice' as const, active: false, focus: 0, playerMarks: 0, shotMarks: [], guardMarks: 0, crosshairX: 560, crosshairY: 300 },
    message: 'Train guard blocks the last cart. Choose: F bullet, J health, or E duel.',
  };
}

export function updateTrainDuel(state: PlatformGameState, input: InputState, dt: number) {
  const duel = state.duel;
  if (!duel) return state;
  if (duel.phase === 'choice') return updateTrainChoice(state, input);
  const aimedX = input.aimX ?? duel.crosshairX + (input.left ? -260 : input.right ? 260 : 0) * dt;
  const aimedY = input.aimY ?? duel.crosshairY + (input.jump ? -260 : input.down ? 260 : 0) * dt;
  const crosshairX = Math.max(360, Math.min(820, aimedX));
  const crosshairY = Math.max(170, Math.min(430, aimedY));
  const focus = Math.min(100, duel.focus + (input.jumpPressed || input.slamPressed ? 16 : 0));
  const guardMarks = Math.min(6, duel.guardMarks + dt * 0.4);
  const onGuard = Math.abs(crosshairX - 660) < 90 && Math.abs(crosshairY - 290) < 120;
  const markedGuard = input.shootPressed && focus >= 20 && onGuard;
  const playerMarks = markedGuard ? duel.playerMarks + 1 : duel.playerMarks;
  const shotMarks = markedGuard ? [...duel.shotMarks, { x: crosshairX - 5, y: crosshairY - 5, width: 10, height: 10 }] : duel.shotMarks;
  const nextDuel = { ...duel, crosshairX, crosshairY, focus: input.shootPressed ? Math.max(0, focus - 20) : focus, guardMarks, playerMarks, shotMarks };

  if (playerMarks >= 4) {
    awardFloorCoin();
    return {
      ...createLevel(state.floor + 1, state.player.hp, { flashlights: state.flashlights, medkits: state.medkits, hasGun: true, shots: 24, stamina: state.player.stamina, unlimitedGun: state.unlimitedGun }),
      message: 'Duel won. Revolver acquired with 24 bullets.',
    };
  }
  if (guardMarks >= 4) {
    return { ...state, duel: nextDuel, status: 'lost' as const, deathCause: 'duel' as const, player: { ...state.player, hp: 0 }, message: 'The guard outdrew you.' };
  }
  return { ...state, duel: nextDuel };
}

export function chooseTrainBullet(state: PlatformGameState) {
  if (!state.duel || state.duel.phase !== 'choice') return state;
  if (!state.hasGun || (!state.unlimitedGun && state.shots < 1)) {
    return { ...state, message: 'No bullet to sacrifice. Choose health or duel.' };
  }
  return advanceTrainFloor({ ...state, shots: state.unlimitedGun ? state.shots : state.shots - 1 }, 'You spent one bullet. The guard lets you pass.');
}

export function chooseTrainHealth(state: PlatformGameState) {
  if (!state.duel || state.duel.phase !== 'choice') return state;
  const hp = Math.max(1, state.player.hp - 10);
  return advanceTrainFloor({ ...state, player: { ...state.player, hp } }, 'You sacrifice 10 health and force your way through.');
}

export function chooseTrainDuel(state: PlatformGameState) {
  const duel = state.duel;
  if (!duel || duel.phase !== 'choice') return state;
  return {
    ...state,
    duel: { ...duel, phase: 'duel' as const, active: true },
    message: 'Duel started. Mash Space, aim with movement, press F to mark shots.',
  };
}

function updateTrainChoice(state: PlatformGameState, input: InputState) {
  if (input.shootPressed) return chooseTrainBullet(state);
  if (input.hitPressed) return chooseTrainHealth(state);
  if (input.interactPressed) return chooseTrainDuel(state);
  return state;
}

function advanceTrainFloor(state: PlatformGameState, message: string) {
  awardFloorCoin();
  return {
    ...createLevel(state.floor + 1, state.player.hp, {
      flashlights: state.flashlights,
      medkits: state.medkits,
      hasGun: state.hasGun,
      shots: state.shots,
      stamina: state.player.stamina,
      unlimitedGun: state.unlimitedGun,
      infinityStones: state.infinityStones,
    }),
    message,
  };
}
