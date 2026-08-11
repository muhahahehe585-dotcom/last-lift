import { floorY, worldHeight, worldWidth } from '../../lib/platformLevel';
import type { PlatformGameState } from '../../lib/platformTypes';

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function drawDeathAnimation(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.status !== 'lost' || !state.deathCause) return;
  const t = Math.min(1, state.deathTimer * 1.8);
  const p = state.player;

  if (state.deathCause === 'lava') return drawLavaDeath(ctx, p.x, p.y, t);
  if (state.deathCause === 'flood') return drawMonsterDeath(ctx, p.x, p.y, t);
  if (state.deathCause === 'drone') return drawDroneDeath(ctx, p.x, p.y, t);
  if (state.deathCause === 'bot' || state.deathCause === 'guard') return drawBotDeath(ctx, p.x, p.y, t);
  if (state.deathCause === 'boss') return drawBossSnap(ctx, state);
  drawFallDeath(ctx, p.x, p.y, t);
}

function drawLavaDeath(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const sink = y + t * 70;
  px(ctx, '#f1c08b', x + 10, sink + 4, 16, 16);
  px(ctx, '#365f88', x + 5, sink + 25, 24, 24);
  px(ctx, '#b83f35', x + 2, sink + 10, 30, 36);
  px(ctx, '#f2dc5d', x + 8, sink + 2, 8, 24);
  px(ctx, '#f2dc5d', x + 23, sink + 12, 7, 18);
}

function drawMonsterDeath(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  px(ctx, '#173f48', x - 50 + t * 30, floorY - 118, 150, 100);
  px(ctx, '#216978', x - 10, floorY - 150, 88, 70);
  px(ctx, '#071012', x + 36, floorY - 112, 60, 18);
  px(ctx, '#f1c08b', x + 22 + t * 40, y + 16, 12, 12);
  px(ctx, '#365f88', x + 8 + t * 38, y + 36, 24, 20);
}

function drawDroneDeath(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  px(ctx, '#f1c08b', x + 9, y + 5, 17, 17);
  px(ctx, '#365f88', x + 5, y + 32, 24, 17);
  px(ctx, '#b83f35', x + 19, y + 9, 8 + t * 18, 5);
  px(ctx, '#f2dc5d', x + 65 - t * 30, y + 12, 36, 4);
}

function drawBotDeath(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  px(ctx, '#365f88', x + 4, y + 36, 28, 24);
  px(ctx, '#f1c08b', x + 10 + t * 52, y - 10 - t * 22, 16, 16);
  px(ctx, '#6f7b72', x - 38, y + 6, 44, 58);
  px(ctx, '#b83f35', x - 28, y + 12, 22, 8);
}

function drawFallDeath(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  px(ctx, '#f1c08b', x + 9, y + 5 + t * 80, 17, 17);
  px(ctx, '#365f88', x + 5, y + 28 + t * 90, 24, 24);
  px(ctx, 'rgba(0,0,0,0.55)', x - 12, floorY - 4, 58, 16);
}

function drawBossSnap(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  const boss = state.enemies.find((enemy) => enemy.kind === 'boss');
  if (!boss) return;
  const t = Math.min(1, state.deathTimer / 3.2);
  const handX = boss.x + 137;
  const handY = boss.y + 142;

  ctx.fillStyle = `rgba(242, 220, 93, ${0.15 + t * 0.35})`;
  ctx.fillRect(boss.x - 130, boss.y - 80, 410, 320);
  drawStone(ctx, '#4aa3ff', handX - 210 + t * 200, floorY - 14 - t * 170, t);
  drawStone(ctx, '#b83f35', handX - 125 + t * 116, floorY - 8 - t * 150, t);
  drawStone(ctx, '#5e8f86', handX + 150 - t * 138, floorY - 22 - t * 165, t);
  drawStone(ctx, '#f2dc5d', handX + 230 - t * 210, floorY - 18 - t * 180, t);
  drawStone(ctx, '#8b5bd6', handX + 48 - t * 38, floorY - 40 - t * 138, t);
  drawStone(ctx, '#ff8a3d', handX - 36 + t * 42, floorY - 28 - t * 155, t);

  if (t > 0.72) {
    const flash = (t - 0.72) / 0.28;
    px(ctx, `rgba(255, 244, 180, ${flash})`, boss.x - 240, boss.y - 150, 560, 430);
    px(ctx, '#f2dc5d', handX - 22, handY - 58, 72, 10);
    px(ctx, '#f2dc5d', handX + 10, handY - 90, 10, 72);
  }

  if (t > 0.92) {
    px(ctx, '#ffffff', 0, 0, worldWidth, worldHeight);
    ctx.fillStyle = '#111111';
    ctx.font = '72px monospace';
    ctx.fillText('YOU DIED', boss.x - 80, 290);
  }

  ctx.fillStyle = '#f2dc5d';
  ctx.font = '24px monospace';
  ctx.fillText('SNAP', boss.x + 32, boss.y - 34);
}

function drawStone(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, t: number) {
  px(ctx, color, x, y, 14, 14);
  px(ctx, 'rgba(255,255,255,0.55)', x + 4, y + 3, 4, 4);
  px(ctx, `rgba(242, 220, 93, ${0.18 + t * 0.3})`, x - 8, y - 8, 30, 30);
}
