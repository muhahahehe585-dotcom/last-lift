import type { Enemy } from '../../lib/platformTypes';

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function drawBoss(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  const x = enemy.x;
  const y = enemy.y;
  px(ctx, '#1a1515', x + 25, y, 72, 30);
  px(ctx, '#5b6368', x + 19, y + 28, 84, 48);
  px(ctx, '#202329', x + 5, y + 76, 112, 70);
  px(ctx, '#111311', x + 38, y + 44, 14, 10);
  px(ctx, '#111311', x + 72, y + 44, 14, 10);
  px(ctx, '#b83f35', x + 42, y + 62, 42, 8);
  px(ctx, '#7c8781', x - 16, y + 88, 22, 72);
  px(ctx, '#7c8781', x + 116, y + 88, 22, 72);
  px(ctx, '#3c4542', x + 20, y + 146, 28, 36);
  px(ctx, '#3c4542', x + 75, y + 146, 28, 36);
  drawGauntlet(ctx, x + 123, y + 142);
}

function drawGauntlet(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#c49b55', x, y, 30, 26);
  px(ctx, '#f2dc5d', x + 5, y - 24, 7, 25);
  px(ctx, '#f2dc5d', x + 13, y - 28, 7, 29);
  px(ctx, '#f2dc5d', x + 21, y - 20, 7, 21);
  px(ctx, '#4aa3ff', x + 6, y + 6, 6, 6);
  px(ctx, '#b83f35', x + 17, y + 5, 6, 6);
  px(ctx, '#5e8f86', x + 11, y + 15, 6, 6);
  px(ctx, 'rgba(242, 220, 93, 0.35)', x - 8, y - 10, 48, 48);
}
