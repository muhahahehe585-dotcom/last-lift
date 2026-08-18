import { overlaps } from './platformGeometry';
import { finalFloor, floorY, worldWidth } from './platformLevel';
import { hitPlayer } from './platformCombat';
import type { PlatformGameState } from './platformTypes';

export function updateBossHazards(state: PlatformGameState, dt: number): PlatformGameState {
  const bossAlive = state.floor === finalFloor && state.enemies.some((enemy) => enemy.kind === 'boss');
  if (!bossAlive) return state;

  return updateBossFireball(state, dt);
}

function updateBossFireball(state: PlatformGameState, dt: number): PlatformGameState {
  if (state.bossLightningStrike > 0) {
    const willImpact = state.bossLightningStrike > 0.14 && state.bossLightningStrike - dt <= 0.14;
    const bossLightningStrike = Math.max(0, state.bossLightningStrike - dt);
    const next = { ...state, bossLightningStrike };
    if (willImpact) {
      const impactRect = { x: state.bossLightningX - 58, y: floorY - 118, width: 116, height: 118 };
      return overlaps(state.player, impactRect) ? hitPlayer(next, 26, 'A fireball crashed down.', 'boss') : next;
    }
    if (bossLightningStrike > 0) return next;
    return { ...next, bossLightningWarning: 10 };
  }

  const bossLightningWarning = state.bossLightningWarning - dt;
  if (bossLightningWarning > 0) return { ...state, bossLightningWarning };

  return {
    ...state,
    bossLightningWarning: 0,
    bossLightningStrike: 1,
    bossLightningX: 220 + Math.random() * (worldWidth - 440),
  };
}
