import ventBackgroundUrl from '../../assets/vent-chase-background.jpg';
import { floorY, worldHeight, worldWidth } from '../../lib/platformLevel';
import type { PlatformGameState } from '../../lib/platformTypes';

const ventBackground = new Image();
ventBackground.src = ventBackgroundUrl;

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function drawVentWorld(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (ventBackground.complete && ventBackground.naturalWidth > 0) {
    drawVentBackground(ctx);
    drawVentWalkway(ctx);
    drawNest(ctx, state);
    return;
  }
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
  drawNest(ctx, state);
}

function drawVentBackground(ctx: CanvasRenderingContext2D) {
  ctx.drawImage(ventBackground, 0, 0, worldWidth, worldHeight);
  ctx.fillStyle = 'rgba(3, 7, 6, 0.18)';
  ctx.fillRect(0, 0, worldWidth, worldHeight);
}

function drawVentWalkway(ctx: CanvasRenderingContext2D) {
  px(ctx, 'rgba(7, 8, 7, 0.72)', 0, floorY - 38, worldWidth, 86);
  for (let x = 0; x < worldWidth; x += 86) {
    px(ctx, x % 172 ? 'rgba(52, 58, 59, 0.78)' : 'rgba(89, 96, 87, 0.72)', x, floorY - 58, 54, 8);
  }
}

function drawNest(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (!state.nest) return;
  px(ctx, '#2b1d17', state.nest.x, floorY - 112, 150, 60);
  px(ctx, '#5c2b28', state.nest.x + 18, floorY - 96, 112, 34);
  px(ctx, '#f2dc5d', state.nest.x + 58, floorY - 79, 20, 12);
  px(ctx, '#cfc7b3', state.nest.x + 36, floorY - 132, state.nestHp * 18, 8);
}
