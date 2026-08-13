import { bossEscapeDoor, floorY, worldHeight, worldWidth } from '../../lib/platformLevel';
import type { PlatformGameState } from '../../lib/platformTypes';

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function drawRoof(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  const sky = ctx.createLinearGradient(0, 0, 0, floorY);
  sky.addColorStop(0, '#101826');
  sky.addColorStop(0.55, '#24334a');
  sky.addColorStop(1, '#4d5360');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, worldWidth, worldHeight);

  for (let x = 60; x < worldWidth; x += 190) {
    px(ctx, '#111923', x, floorY - 250 + (x % 380), 105, 250);
    px(ctx, '#f2dc5d', x + 20, floorY - 205 + (x % 120), 12, 8);
    px(ctx, '#f2dc5d', x + 62, floorY - 145 + (x % 100), 12, 8);
  }

  px(ctx, '#555b60', 0, floorY - 46, worldWidth, 46);
  px(ctx, '#2b302c', 0, floorY, worldWidth, 120);
  for (let x = 0; x < worldWidth; x += 90) px(ctx, x % 180 ? '#383d3f' : '#454b4d', x, floorY + 6, 84, 18);
  for (let x = 22; x < worldWidth; x += 92) px(ctx, '#89939a', x, floorY - 92, 10, 52);
  px(ctx, '#89939a', 0, floorY - 92, worldWidth, 8);
  px(ctx, '#89939a', 0, floorY - 60, worldWidth, 8);

  px(ctx, '#272b2e', 210, floorY - 118, 130, 72);
  px(ctx, '#151817', 244, floorY - 160, 62, 42);
  px(ctx, '#7c8781', 272, floorY - 250, 8, 90);
  drawBossEscapeDoor(ctx, state);
  px(ctx, 'rgba(242, 220, 93, 0.18)', 1890, 190, 300, 230);

  if (state.bossTimeLeft < 60) px(ctx, 'rgba(184, 63, 53, 0.18)', 0, 0, worldWidth, worldHeight);
}

function drawBossEscapeDoor(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  px(ctx, '#080908', bossEscapeDoor.x - 10, bossEscapeDoor.y - 12, bossEscapeDoor.width + 20, bossEscapeDoor.height + 12);
  px(ctx, state.bossDodged ? '#6f543b' : '#2b302c', bossEscapeDoor.x, bossEscapeDoor.y, bossEscapeDoor.width, bossEscapeDoor.height);
  px(ctx, state.bossDodged ? '#2a211a' : '#151817', bossEscapeDoor.x + 9, bossEscapeDoor.y + 16, bossEscapeDoor.width - 18, bossEscapeDoor.height - 22);
  px(ctx, state.bossDodged ? '#f2dc5d' : '#596057', bossEscapeDoor.x + bossEscapeDoor.width - 16, bossEscapeDoor.y + 72, 6, 6);
  ctx.fillStyle = state.bossDodged ? '#f2dc5d' : '#89939a';
  ctx.font = '16px monospace';
  ctx.fillText('EXIT', bossEscapeDoor.x - 1, bossEscapeDoor.y - 22);
}
