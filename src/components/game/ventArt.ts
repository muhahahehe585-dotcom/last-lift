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
  drawVentBackground(ctx);
  drawVentWalkway(ctx);
  drawVentGaps(ctx, state);
  drawVentPlatforms(ctx, state);
  drawExitVent(ctx);
}

function drawVentBackground(ctx: CanvasRenderingContext2D) {
  if (!ventBackground.complete || ventBackground.naturalWidth === 0) {
    px(ctx, '#070807', 0, 0, worldWidth, worldHeight);
    return;
  }
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

function drawVentGaps(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  state.holes.forEach((hole) => {
    px(ctx, '#020302', hole.x, floorY - 56, hole.width, 130);
    px(ctx, 'rgba(94, 143, 134, 0.25)', hole.x + 14, floorY - 50, hole.width - 28, 6);
    px(ctx, 'rgba(0, 0, 0, 0.7)', hole.x + 8, floorY + 18, hole.width - 16, 38);
  });
}

function drawVentPlatforms(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  state.boxes.forEach((box) => {
    px(ctx, '#1d2926', box.x, box.y, box.width, box.height);
    px(ctx, '#596057', box.x + 8, box.y + 4, box.width - 16, 5);
    px(ctx, '#0a0f0d', box.x, box.y + box.height - 5, box.width, 5);
  });
}

function drawExitVent(ctx: CanvasRenderingContext2D) {
  px(ctx, '#030504', worldWidth - 180, floorY - 178, 150, 178);
  px(ctx, '#1c2823', worldWidth - 164, floorY - 160, 118, 128);
  px(ctx, '#050807', worldWidth - 146, floorY - 142, 82, 92);
  px(ctx, 'rgba(94, 143, 134, 0.45)', worldWidth - 136, floorY - 128, 62, 5);
  px(ctx, 'rgba(94, 143, 134, 0.35)', worldWidth - 136, floorY - 98, 62, 5);
}
