import { floorY, worldWidth } from '../../lib/platformLevel';

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function drawTrainFloor(ctx: CanvasRenderingContext2D) {
  px(ctx, '#202329', 0, floorY - 150, worldWidth, 150);
  for (let x = 0; x < worldWidth; x += 260) {
    px(ctx, '#3c4542', x + 10, floorY - 132, 220, 110);
    px(ctx, '#101210', x + 42, floorY - 104, 54, 42);
    px(ctx, '#101210', x + 122, floorY - 104, 54, 42);
    px(ctx, '#89939a', x + 225, floorY - 82, 14, 58);
  }
  px(ctx, '#7c8781', worldWidth - 260, floorY - 152, 230, 130);
  drawTrainGuard(ctx, worldWidth - 380, floorY - 92);
}

function drawTrainGuard(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#151817', x + 9, y, 28, 14);
  px(ctx, '#7c8781', x + 7, y + 14, 32, 33);
  px(ctx, '#3c4542', x - 1, y + 23, 9, 28);
  px(ctx, '#3c4542', x + 38, y + 23, 9, 28);
  px(ctx, '#222726', x + 8, y + 47, 10, 17);
  px(ctx, '#222726', x + 29, y + 47, 10, 17);
  px(ctx, '#4aa3ff', x + 14, y + 7, 19, 6);
  px(ctx, '#f2dc5d', x - 8, y - 30, 62, 18);
  ctx.fillStyle = '#111311';
  ctx.font = '14px monospace';
  ctx.fillText('GUARD', x - 5, y - 17);
}
