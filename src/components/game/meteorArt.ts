import { finalFloor } from '../../lib/platformLevel';
import type { PlatformGameState } from '../../lib/platformTypes';

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function drawMeteorShower(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.floor !== finalFloor) return;
  state.meteorites.forEach((meteor) => {
    px(ctx, 'rgba(242, 220, 93, 0.22)', meteor.x - 90, meteor.y - 55, meteor.width + 130, meteor.height + 90);
    px(ctx, '#5d4032', meteor.x, meteor.y, meteor.width, meteor.height);
    px(ctx, '#8a5d37', meteor.x + 18, meteor.y + 14, meteor.width - 32, meteor.height - 26);
    px(ctx, '#2b1d17', meteor.x + meteor.width * 0.58, meteor.y + 18, 24, 18);
    px(ctx, '#f2dc5d', meteor.x - 96, meteor.y - 22, 112, 22);
    px(ctx, 'rgba(184, 63, 53, 0.56)', meteor.x - 140, meteor.y - 42, 162, 54);
  });
}

export function drawMeteorThrow(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.meteorThrowTimer <= 0 || !state.grabbedMeteor) return;
  const t = Math.min(1, state.meteorThrowTimer / 1.8);
  const player = state.player;
  const boss = state.enemies.find((enemy) => enemy.kind === 'boss');
  const startX = state.grabbedMeteor.x;
  const startY = state.grabbedMeteor.y;
  const targetX = boss ? boss.x + boss.width / 2 : 2140;
  const targetY = boss ? boss.y + boss.height / 2 : 350;
  const meteorX = startX + (targetX - startX) * Math.max(0, (t - 0.35) / 0.65);
  const meteorY = startY + (targetY - startY) * Math.max(0, (t - 0.35) / 0.65);

  drawSpiderMask(ctx, player.x + 6, player.y - 3);
  ctx.strokeStyle = '#f4f8ff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y + 18);
  ctx.lineTo(t < 0.45 ? startX : meteorX, t < 0.45 ? startY : meteorY);
  ctx.stroke();
  px(ctx, '#5d4032', meteorX, meteorY, state.grabbedMeteor.width, state.grabbedMeteor.height);
  px(ctx, '#f2dc5d', meteorX - 105, meteorY - 16, 122, 18);
  if (t > 0.82) px(ctx, 'rgba(242, 220, 93, 0.58)', targetX - 170, targetY - 150, 340, 300);
}

function drawSpiderMask(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#b83f35', x + 2, y + 6, 26, 24);
  px(ctx, '#111311', x + 7, y + 13, 7, 6);
  px(ctx, '#111311', x + 18, y + 13, 7, 6);
  px(ctx, '#f4f8ff', x + 8, y + 14, 5, 4);
  px(ctx, '#f4f8ff', x + 19, y + 14, 5, 4);
}
