import type { PlatformGameState } from './platformTypes';

export function damageNest(state: PlatformGameState, options: {
  bulletTrail?: PlatformGameState['bulletTrail'];
  shots?: number;
} = {}) {
  const nestHp = Math.max(0, state.nestHp - 1);
  return {
    ...state,
    shots: options.shots ?? state.shots,
    bulletTrail: options.bulletTrail ?? state.bulletTrail,
    nestHp,
    status: nestHp <= 0 ? 'won' as const : state.status,
    ending: nestHp <= 0 ? 'sunset' as const : state.ending,
    message: nestHp <= 0 ? 'Vent ending found. You saved the whole world.' : `Nest hit. ${nestHp} hits left.`,
  };
}
