import { finalFloor } from './platformLevel';
import type { PlatformGameState } from './platformTypes';

export function tickGameTimers(state: PlatformGameState): PlatformGameState {
  if (state.status !== 'playing') return state;

  if (state.mode === 'supply') return state;

  if (state.mode === 'flood' || state.mode === 'collapse') {
    if (state.floorTimeLeft <= 1) {
      return {
        ...state,
        floorTimeLeft: 0,
        status: 'lost',
        player: { ...state.player, hp: 0 },
        deathCause: state.mode === 'flood' ? 'flood' : 'fall',
        message: state.mode === 'flood' ? 'The sea monster drags you under.' : 'The floor gives out under you.',
      };
    }
    return { ...state, floorTimeLeft: state.floorTimeLeft - 1 };
  }

  if (state.floor !== finalFloor && state.batteries < state.batteriesNeeded) {
    if (state.floorTimeLeft <= 1) {
      return {
        ...state,
        floorTimeLeft: 0,
        status: 'lost',
        player: { ...state.player, hp: 0 },
        deathCause: 'fall',
        message: 'The lift loses power and falls down the shaft.',
      };
    }
    return { ...state, floorTimeLeft: state.floorTimeLeft - 1 };
  }

  if (state.floor === finalFloor && state.enemies.some((enemy) => enemy.kind === 'boss')) {
    if (state.bossTimeLeft <= 1) {
      if (Math.random() < 0.5) {
        return {
          ...state,
          bossTimeLeft: 0,
          enemies: state.enemies.filter((enemy) => enemy.kind !== 'boss'),
          status: 'won',
          ending: 'ruler',
          message: 'RULER OF THE EARTH?',
        };
      }
      return {
        ...state,
        bossTimeLeft: 0,
        status: 'lost',
        player: { ...state.player, hp: 0 },
        deathCause: 'boss',
        message: 'The stones rise into the gauntlet. The boss snaps. You lose.',
      };
    }
    return { ...state, bossTimeLeft: state.bossTimeLeft - 1 };
  }

  if (state.floor === finalFloor && state.enemies.length === 0) {
    return { ...state, status: 'won', ending: 'escape', message: 'The boss is down. Last Lift is yours.' };
  }

  return state;
}
