import { viewWidth, worldHeight } from '../../lib/platformLevel';
import type { PlatformGameState } from '../../lib/platformTypes';

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function drawTrainDuelOverlay(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  const duel = state.duel;
  if (!duel) return;

  drawTrainCar(ctx);
  drawGuard(ctx, 590, 208);
  duel.shotMarks.forEach((mark) => drawShotMark(ctx, mark.x, mark.y));
  drawDuelPlayer(ctx, 372, 296);

  if (duel.phase === 'choice') {
    drawChoicePanel(ctx, state);
    return;
  }

  drawDuelHud(ctx, state);
  drawCrosshair(ctx, duel.crosshairX, duel.crosshairY);
}

function drawTrainCar(ctx: CanvasRenderingContext2D) {
  px(ctx, 'rgba(0, 0, 0, 0.78)', 0, 0, viewWidth, worldHeight);
  px(ctx, '#202329', 150, 92, 900, 410);
  px(ctx, '#3c4542', 178, 120, 844, 340);
  px(ctx, '#151817', 204, 148, 792, 84);
  for (let x = 228; x < 960; x += 156) {
    px(ctx, '#090f13', x, 166, 108, 48);
    px(ctx, '#365f88', x + 6, 172, 96, 16);
  }
  px(ctx, '#6f543b', 190, 432, 820, 44);
  px(ctx, '#111311', 190, 476, 820, 22);
  for (let x = 230; x < 980; x += 76) px(ctx, '#2b1d17', x, 438, 42, 8);
  px(ctx, '#89939a', 170, 504, 860, 8);
  px(ctx, '#89939a', 170, 535, 860, 8);
}

function drawGuard(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#151817', x + 24, y, 64, 22);
  px(ctx, '#f1c08b', x + 32, y + 22, 48, 42);
  px(ctx, '#111311', x + 66, y + 38, 7, 7);
  px(ctx, '#7c8781', x + 18, y + 64, 74, 98);
  px(ctx, '#4aa3ff', x + 30, y + 78, 48, 10);
  px(ctx, '#3c4542', x - 12, y + 82, 32, 72);
  px(ctx, '#3c4542', x + 90, y + 82, 32, 72);
  px(ctx, '#222726', x + 26, y + 162, 24, 64);
  px(ctx, '#222726', x + 62, y + 162, 24, 64);
}

function drawShotMark(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#f2dc5d', x - 7, y, 24, 4);
  px(ctx, '#f2dc5d', x + 3, y - 10, 4, 24);
  px(ctx, '#b83f35', x, y - 3, 10, 10);
  px(ctx, '#111311', x + 3, y, 4, 4);
}

function drawDuelPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#2a1812', x + 10, y - 4, 38, 14);
  px(ctx, '#f1c08b', x + 16, y + 12, 30, 28);
  px(ctx, '#111311', x + 39, y + 24, 5, 5);
  px(ctx, '#1b2632', x + 8, y + 44, 48, 22);
  px(ctx, '#365f88', x + 8, y + 66, 48, 44);
  px(ctx, '#f1c08b', x + 54, y + 54, 56, 14);
  px(ctx, '#202329', x + 14, y + 110, 16, 58);
  px(ctx, '#202329', x + 42, y + 110, 16, 58);
}

function drawChoicePanel(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  px(ctx, 'rgba(17, 19, 17, 0.92)', 270, 78, 660, 112);
  ctx.fillStyle = '#f2dc5d';
  ctx.font = '26px monospace';
  ctx.fillText('TRAIN GUARD', 500, 116);
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '18px monospace';
  ctx.fillText('F: spend 1 bullet', 318, 154);
  ctx.fillText('J: sacrifice 10 health', 508, 154);
  ctx.fillText('E: duel him', 748, 154);
  ctx.fillText(`Bullets ${state.unlimitedGun ? 'unlimited' : state.shots} | Health ${Math.round(state.player.hp)}%`, 420, 178);
}

function drawDuelHud(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  const duel = state.duel;
  if (!duel) return;
  px(ctx, 'rgba(17, 19, 17, 0.92)', 315, 70, 570, 86);
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '18px monospace';
  ctx.fillText(`Focus ${Math.round(duel.focus)} | You ${duel.playerMarks} Guard ${Math.floor(duel.guardMarks)}`, 400, 102);
  ctx.fillText('Mash Space. Aim with movement. Press F to mark.', 340, 132);
}

function drawCrosshair(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = '#f2dc5d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 18, y);
  ctx.lineTo(x + 18, y);
  ctx.moveTo(x, y - 18);
  ctx.lineTo(x, y + 18);
  ctx.stroke();
}
