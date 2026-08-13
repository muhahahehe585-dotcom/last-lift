import { floorY } from '../../lib/platformLevel';
import { dodgeRadius } from '../../lib/platformPhysics';
import type { PlatformGameState } from '../../lib/platformTypes';

export type InventoryItem = 'gun' | 'medkit' | 'flashlight' | null;

export function drawActionHitboxes(ctx: CanvasRenderingContext2D, state: PlatformGameState, selected: InventoryItem) {
  drawDodgeRadii(ctx, state);
  drawMeleeHitbox(ctx, state);
  if (selected === 'flashlight') drawFlashlightHitbox(ctx, state);
}

function drawDodgeRadii(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  ctx.save();
  ctx.strokeStyle = 'rgba(94, 143, 134, 0.5)';
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 9]);
  state.enemies.forEach((enemy) => {
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, dodgeRadius, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}

function drawMeleeHitbox(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  const p = state.player;
  const x = p.facing === 1 ? p.x + p.width / 2 : p.x + p.width / 2 - 175;
  ctx.strokeStyle = 'rgba(242, 220, 93, 0.72)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.strokeRect(x, p.y - 22, 175, 150);
  ctx.setLineDash([]);
}

function drawFlashlightHitbox(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  const p = state.player;
  const x = p.facing === 1 ? p.x + p.width / 2 : p.x + p.width / 2 - 360;
  ctx.fillStyle = 'rgba(74, 163, 255, 0.14)';
  ctx.fillRect(x, floorY - 190, 360, 190);
  ctx.strokeStyle = 'rgba(74, 163, 255, 0.88)';
  ctx.lineWidth = 4;
  ctx.strokeRect(x, floorY - 190, 360, 190);
}
