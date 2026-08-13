import { floorY, worldHeight, worldWidth } from '../../lib/platformLevel';
import type { PlatformGameState } from '../../lib/platformTypes';

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function drawVentWorld(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  px(ctx, '#070807', 0, 0, worldWidth, worldHeight);
  px(ctx, '#101211', 0, floorY - 120, worldWidth, 36);
  px(ctx, '#1b1d1c', 0, floorY - 104, worldWidth, 48);
  px(ctx, '#343a3b', 0, floorY - 120, worldWidth, 16);
  px(ctx, '#343a3b', 0, floorY - 56, worldWidth, 16);
  px(ctx, '#070807', 0, floorY - 40, worldWidth, 82);
  for (let x = 0; x < worldWidth; x += 72) {
    px(ctx, x % 144 ? '#596057' : '#3c4542', x, floorY - 104, 8, 48);
    px(ctx, '#252a2b', x + 18, floorY - 92, 32, 5);
  }
  if (!state.nest) return;
  px(ctx, '#2b1d17', state.nest.x, floorY - 112, 150, 60);
  px(ctx, '#5c2b28', state.nest.x + 18, floorY - 96, 112, 34);
  px(ctx, '#f2dc5d', state.nest.x + 58, floorY - 79, 20, 12);
  px(ctx, '#cfc7b3', state.nest.x + 36, floorY - 132, state.nestHp * 18, 8);
}
