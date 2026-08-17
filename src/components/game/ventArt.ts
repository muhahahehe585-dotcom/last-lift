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
  drawVentShell(ctx);
  drawVentSprites(ctx);
  drawVentWalkway(ctx);
  drawVentGaps(ctx, state);
  drawVentPlatforms(ctx, state);
  drawExitVent(ctx);
}

function drawVentShell(ctx: CanvasRenderingContext2D) {
  px(ctx, '#101412', 0, 0, worldWidth, worldHeight);
  for (let x = 0; x < worldWidth; x += 96) {
    px(ctx, x % 192 ? '#18201c' : '#202923', x, 52, 72, 360);
    px(ctx, '#07100d', x + 70, 52, 8, 360);
  }
}

function drawVentSprites(ctx: CanvasRenderingContext2D) {
  if (!ventBackground.complete || ventBackground.naturalWidth === 0) return;
  drawSprite(ctx, 245, 80, 328, 310, 60, 72, 470, 318);
  drawSprite(ctx, 660, 108, 360, 310, 690, 78, 520, 340);
  drawSprite(ctx, 1080, 280, 250, 250, 1680, 130, 360, 300);
  drawSprite(ctx, 0, 405, 410, 145, 0, floorY - 122, 420, 150);
  drawSprite(ctx, 1030, 385, 300, 130, 1950, floorY - 116, 390, 160);
}

function drawSprite(ctx: CanvasRenderingContext2D, sx: number, sy: number, sw: number, sh: number, x: number, y: number, w: number, h: number) {
  ctx.drawImage(ventBackground, sx, sy, sw, sh, x, y, w, h);
}

function drawVentWalkway(ctx: CanvasRenderingContext2D) {
  px(ctx, '#111916', 0, floorY - 38, worldWidth, 86);
  for (let x = 0; x < worldWidth; x += 86) {
    px(ctx, x % 172 ? '#343c39' : '#596057', x, floorY - 58, 54, 8);
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
    if (ventBackground.complete && ventBackground.naturalWidth > 0) {
      drawSprite(ctx, 1035, 394, 280, 86, box.x, box.y - 10, box.width, box.height + 26);
    } else {
      px(ctx, '#1d2926', box.x, box.y, box.width, box.height);
    }
    px(ctx, '#91d5c8', box.x, box.y, box.width, 4);
    px(ctx, 'rgba(145, 213, 200, 0.24)', box.x, box.y, box.width, box.height);
  });
}

function drawExitVent(ctx: CanvasRenderingContext2D) {
  px(ctx, '#030504', worldWidth - 180, floorY - 178, 150, 178);
  px(ctx, '#1c2823', worldWidth - 164, floorY - 160, 118, 128);
  px(ctx, '#050807', worldWidth - 146, floorY - 142, 82, 92);
  px(ctx, 'rgba(94, 143, 134, 0.45)', worldWidth - 136, floorY - 128, 62, 5);
  px(ctx, 'rgba(94, 143, 134, 0.35)', worldWidth - 136, floorY - 98, 62, 5);
}
