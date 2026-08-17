import { floorY } from '../../lib/platformLevel';
import type { Enemy, Item, PlatformGameState } from '../../lib/platformTypes';
import { drawBoss } from './bossArt';
import { drawBrokenBotSprite } from './brokenBotArt';
import { drawSpritePlayer } from './playerSprite';
import { drawVentMonsterSprite } from './ventMonsterArt';

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function drawPlayer(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  const p = state.player;
  if (drawSpritePlayer(ctx, state)) return;
  const walk = Math.abs(p.vx) > 5 ? Math.sin(p.x / (p.running ? 6 : 9)) : 0;
  px(ctx, '#2a1812', p.x + 6, p.y - 4, 22, 9);
  px(ctx, '#3b2118', p.x + 3, p.y + 1, 9, 10);
  px(ctx, '#f1c08b', p.x + 9, p.y + 5, 17, 17);
  px(ctx, '#111311', p.x + (p.facing === 1 ? 22 : 11), p.y + 11, 3, 3);
  px(ctx, '#7d3b34', p.x + 16, p.y + 17, 6, 2);
  px(ctx, '#1b2632', p.x + 5, p.y + 22, 24, 10);
  px(ctx, '#365f88', p.x + 5, p.y + 32, 24, 17);
  px(ctx, '#cfc7b3', p.x + 10, p.y + 33, 5, 12);
  px(ctx, '#f1c08b', p.x + (p.facing === 1 ? 29 : -3), p.y + 25, 8, 24);
  px(ctx, '#f1c08b', p.x + (p.facing === 1 ? -3 : 29), p.y + 27, 8, 20);
  px(ctx, '#202329', p.x + 6 + walk * 7, p.y + 49, 8, 23);
  px(ctx, '#202329', p.x + 21 - walk * 7, p.y + 49, 8, 23);
  if (p.slamPulse > 0) {
    const radius = 120 * (p.slamPulse / 0.28);
    ctx.strokeStyle = 'rgba(242, 220, 93, 0.85)';
    ctx.lineWidth = 6;
    ctx.strokeRect(p.x + p.width / 2 - radius, floorY - 18, radius * 2, 34);
  }
}

export function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  if (enemy.kind === 'drone') return drawDrone(ctx, enemy);
  if (enemy.kind === 'bot-guard') return drawBotGuard(ctx, enemy);
  if (enemy.kind === 'sea-monster') return drawSeaMonster(ctx, enemy);
  if (enemy.kind === 'vent-monster') return drawVentMonster(ctx, enemy);
  if (enemy.kind === 'boss') return drawBoss(ctx, enemy);
  drawBrokenBot(ctx, enemy);
}

function drawDrone(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  px(ctx, '#2d3335', enemy.x, enemy.y + 14, enemy.width, 10);
  px(ctx, '#8b969d', enemy.x + 12, enemy.y + 4, 26, 26);
  px(ctx, '#f2dc5d', enemy.x + 21, enemy.y + 13, 8, 5);
}

function drawBrokenBot(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  if (drawBrokenBotSprite(ctx, enemy)) return;
  px(ctx, '#4d5650', enemy.x + 7, enemy.y, 31, 17);
  px(ctx, '#6f7b72', enemy.x + 2, enemy.y + 17, 42, 28);
  px(ctx, '#3c4542', enemy.x - 5, enemy.y + 24, 8, 25);
  px(ctx, '#3c4542', enemy.x + 43, enemy.y + 24, 8, 25);
  px(ctx, '#2b302c', enemy.x + 7, enemy.y + 45, 10, 15);
  px(ctx, '#2b302c', enemy.x + 29, enemy.y + 45, 10, 15);
  px(ctx, '#b83f35', enemy.x + 13, enemy.y + 7, 21, 7);
  px(ctx, '#111311', enemy.x + 16, enemy.y + 9, 4, 3);
  px(ctx, '#111311', enemy.x + 27, enemy.y + 9, 4, 3);
}

function drawBotGuard(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  if (drawBrokenBotSprite(ctx, enemy)) return;
  px(ctx, '#151817', enemy.x + 9, enemy.y, 28, 14);
  px(ctx, '#7c8781', enemy.x + 7, enemy.y + 14, 32, 33);
  px(ctx, '#3c4542', enemy.x - 1, enemy.y + 23, 9, 28);
  px(ctx, '#3c4542', enemy.x + 38, enemy.y + 23, 9, 28);
  px(ctx, '#222726', enemy.x + 8, enemy.y + 47, 10, 17);
  px(ctx, '#222726', enemy.x + 29, enemy.y + 47, 10, 17);
  px(ctx, '#4aa3ff', enemy.x + 14, enemy.y + 7, 19, 6);
  px(ctx, '#111311', enemy.x + 18, enemy.y + 9, 3, 2);
  px(ctx, '#111311', enemy.x + 28, enemy.y + 9, 3, 2);
  px(ctx, '#111311', enemy.x + 21, enemy.y + 12, 8, 2);
}

function drawSeaMonster(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  px(ctx, '#173f48', enemy.x, enemy.y + 26, enemy.width, 54);
  px(ctx, '#216978', enemy.x + 38, enemy.y, 60, 58);
  px(ctx, '#f2dc5d', enemy.x + 78, enemy.y + 18, 8, 8);
  px(ctx, '#071012', enemy.x + 96, enemy.y + 37, 24, 8);
  px(ctx, '#173f48', enemy.x + 22, enemy.y + 74, 25, 28);
  px(ctx, '#173f48', enemy.x + 78, enemy.y + 74, 25, 28);
}

function drawVentMonster(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  if (drawVentMonsterSprite(ctx, enemy)) return;
  px(ctx, '#dfe6df', enemy.x + 8, enemy.y + 18, enemy.width - 12, 26);
  px(ctx, '#f4f8ff', enemy.x + 18, enemy.y, 42, 30);
  px(ctx, '#0a0b0a', enemy.x + 26, enemy.y + 9, 8, 10);
  px(ctx, '#0a0b0a', enemy.x + 46, enemy.y + 9, 8, 10);
  px(ctx, '#f4f8ff', enemy.x + 29, enemy.y + 12, 3, 3);
  px(ctx, '#f4f8ff', enemy.x + 49, enemy.y + 12, 3, 3);
  px(ctx, '#111311', enemy.x + 34, enemy.y + 23, 30, 8);
  px(ctx, '#f4f8ff', enemy.x + 38, enemy.y + 23, 5, 10);
  px(ctx, '#f4f8ff', enemy.x + 50, enemy.y + 23, 5, 10);
  px(ctx, '#f4f8ff', enemy.x + 61, enemy.y + 23, 5, 10);
  px(ctx, '#cdd6d0', enemy.x - 2, enemy.y + 28, 20, 8);
  px(ctx, '#cdd6d0', enemy.x + 62, enemy.y + 26, 22, 8);
  px(ctx, '#f4f8ff', enemy.x - 8, enemy.y + 34, 18, 7);
  px(ctx, '#f4f8ff', enemy.x + 72, enemy.y + 32, 18, 7);
  px(ctx, '#b83f35', enemy.x - 11, enemy.y + 38, 14, 4);
  px(ctx, '#b83f35', enemy.x + 83, enemy.y + 36, 14, 4);
  px(ctx, '#dfe6df', enemy.x + 16, enemy.y + 44, 12, 11);
  px(ctx, '#dfe6df', enemy.x + 50, enemy.y + 44, 12, 11);
}

export function drawItem(ctx: CanvasRenderingContext2D, item: Item) {
  if (item.kind === 'battery') drawBattery(ctx, item);
  if (item.kind === 'medkit') drawMedkit(ctx, item);
  if (item.kind === 'flashlight') drawFlashlight(ctx, item);
  if (item.kind === 'gun') drawGun(ctx, item);
  if (item.kind === 'stone') drawStone(ctx, item);
}

function drawBattery(ctx: CanvasRenderingContext2D, item: Item) {
  px(ctx, '#2b2b1f', item.x + 5, item.y, 16, 5);
  px(ctx, '#f2dc5d', item.x + 3, item.y + 5, 20, 28);
  px(ctx, '#111311', item.x + 9, item.y + 11, 8, 16);
}

function drawMedkit(ctx: CanvasRenderingContext2D, item: Item) {
  px(ctx, '#e8f4ed', item.x, item.y + 3, 30, 24);
  px(ctx, '#b83f35', item.x + 12, item.y + 7, 6, 16);
  px(ctx, '#b83f35', item.x + 7, item.y + 12, 16, 6);
}

function drawFlashlight(ctx: CanvasRenderingContext2D, item: Item) {
  px(ctx, '#cfc7b3', item.x, item.y + 12, 28, 10);
  px(ctx, '#f2dc5d', item.x + 21, item.y + 9, 8, 16);
  px(ctx, '#596057', item.x + 6, item.y + 14, 8, 6);
}

function drawGun(ctx: CanvasRenderingContext2D, item: Item) {
  px(ctx, '#89939a', item.x, item.y + 8, 32, 9);
  px(ctx, '#202329', item.x + 18, item.y + 17, 8, 12);
  px(ctx, '#111311', item.x + 5, item.y + 17, 10, 4);
}

function drawStone(ctx: CanvasRenderingContext2D, item: Item) {
  px(ctx, '#8b5bd6', item.x + 5, item.y, 14, 14);
  px(ctx, '#4aa3ff', item.x + 1, item.y + 9, 10, 10);
  px(ctx, '#f2dc5d', item.x + 12, item.y + 12, 10, 10);
  px(ctx, 'rgba(242, 220, 93, 0.35)', item.x - 5, item.y - 5, 34, 34);
}
