import { overlaps } from './platformGeometry';
import { finalFloor, floorY, worldWidth } from './platformLevel';
import { hitPlayer } from './platformCombat';
import type { PlatformGameState } from './platformTypes';

export function updateBossHazards(state: PlatformGameState, dt: number): PlatformGameState {
  const bossAlive = state.floor === finalFloor && state.enemies.some((enemy) => enemy.kind === 'boss');
  if (!bossAlive) return state;

  let next = updateBossClaw(state, dt);
  if (next.status !== 'playing') return next;
  next = updateBossLightning(next, dt);
  return next;
}

function updateBossClaw(state: PlatformGameState, dt: number): PlatformGameState {
  const wasActive = state.bossClawTimer > 1.7;
  let bossClawTimer = state.bossClawTimer - dt;
  let bossClawX = state.bossClawX;
  if (bossClawTimer <= 0) {
    bossClawTimer = 2.35;
    bossClawX = Math.max(180, Math.min(worldWidth - 220, state.player.x + state.player.width / 2 - 62));
  }
  let next = { ...state, bossClawTimer, bossClawX };
  const active = bossClawTimer > 1.7 && bossClawTimer <= 2.25;
  const clawRect = { x: bossClawX + 14, y: floorY - 90, width: 98, height: 90 };
  if (active && wasActive && next.player.grounded && overlaps(next.player, clawRect)) {
    next = hitPlayer(next, 18, 'Claws burst from the ground.', 'boss');
  }
  return next;
}

function updateBossLightning(state: PlatformGameState, dt: number): PlatformGameState {
  if (state.bossLightningStrike > 0) {
    const bossLightningStrike = Math.max(0, state.bossLightningStrike - dt);
    if (bossLightningStrike > 0) return { ...state, bossLightningStrike };
    return {
      ...state,
      bossLightningStrike: 0,
      bossLightningWarning: 3,
      bossLightningX: Math.max(180, Math.min(worldWidth - 180, state.player.x + state.player.width / 2)),
    };
  }

  const bossLightningWarning = state.bossLightningWarning - dt;
  if (bossLightningWarning > 0) return { ...state, bossLightningWarning };

  const lightningRect = { x: state.bossLightningX - 34, y: 0, width: 68, height: floorY + 24 };
  const struck = overlaps(state.player, lightningRect);
  const next = { ...state, bossLightningWarning: 0, bossLightningStrike: 0.34 };
  return struck ? hitPlayer(next, 26, 'Lightning struck after the warning.', 'boss') : next;
}
