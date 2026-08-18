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
  drawCeilingClaws(ctx, state);
  drawVentWalkway(ctx);
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
  drawSprite(ctx, 0, 405, 410, 145, 0, floorY - 136, 520, 168);
  drawSprite(ctx, 1030, 385, 300, 130, 1870, floorY - 138, 500, 180);
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

function drawCeilingClaws(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  const active = state.ventSpawnTimer <= 0.7;
  [510, 925, 1340, 1745].forEach((x, index) => {
    const length = active ? 390 : 82;
    px(ctx, '#090b0a', x - 52, 46, 104, length + 14);
    px(ctx, '#dfe6df', x - 44, 58, 18, length);
    px(ctx, '#cdd6d0', x - 8, 58, 18, length + (index % 2 ? 26 : 0));
    px(ctx, '#dfe6df', x + 30, 58, 18, length);
    px(ctx, '#b83f35', x - 48, 58 + length, 24, 10);
    px(ctx, '#b83f35', x - 12, 58 + length + 10, 24, 10);
    px(ctx, '#b83f35', x + 26, 58 + length, 24, 10);
  });
}

function drawExitVent(ctx: CanvasRenderingContext2D) {
  px(ctx, '#030504', worldWidth - 180, floorY - 178, 150, 178);
  px(ctx, '#1c2823', worldWidth - 164, floorY - 160, 118, 128);
  px(ctx, '#050807', worldWidth - 146, floorY - 142, 82, 92);
  px(ctx, 'rgba(94, 143, 134, 0.45)', worldWidth - 136, floorY - 128, 62, 5);
  px(ctx, 'rgba(94, 143, 134, 0.35)', worldWidth - 136, floorY - 98, 62, 5);
}
