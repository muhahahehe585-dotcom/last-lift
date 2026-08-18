import bossSheetUrl from '../../assets/gauntlet-boss-idle-sheet.jpg';
import bossHitSheetUrl from '../../assets/gauntlet-boss-hit-sheet.jpg';
import bossWalkSheetUrl from '../../assets/gauntlet-boss-walk-sheet.jpg';
import { finalFloor, floorY } from '../../lib/platformLevel';
import type { Enemy, PlatformGameState } from '../../lib/platformTypes';

type Frame = { x: number; y: number; width: number; height: number };

const idleSheet = new Image();
idleSheet.src = bossSheetUrl;
const hitSheet = new Image();
hitSheet.src = bossHitSheetUrl;
const walkSheet = new Image();
walkSheet.src = bossWalkSheetUrl;

const idleFrames: Frame[] = [
  { x: 34, y: 32, width: 294, height: 330 },
  { x: 388, y: 34, width: 286, height: 326 },
  { x: 740, y: 34, width: 286, height: 326 },
  { x: 1092, y: 34, width: 286, height: 326 },
];
const walkFrames: Frame[] = [
  ...idleFrames,
  { x: 34, y: 416, width: 294, height: 332 },
  { x: 388, y: 418, width: 286, height: 328 },
  { x: 740, y: 418, width: 286, height: 328 },
  { x: 1092, y: 418, width: 286, height: 328 },
];
const hitFrames: Frame[] = [
  { x: 12, y: 58, width: 290, height: 204 },
  { x: 324, y: 38, width: 280, height: 224 },
  { x: 625, y: 86, width: 300, height: 176 },
  { x: 902, y: 112, width: 264, height: 150 },
  { x: 1132, y: 92, width: 250, height: 170 },
];
const cleanedFrames = new Map<string, HTMLCanvasElement>();

export function drawBoss(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  const attacking = enemy.attackPulse > 0;
  const walking = !attacking && Math.abs(enemy.vx) > 5;
  const image = attacking ? hitSheet : walking ? walkSheet : idleSheet;
  const frames = attacking ? hitFrames : walking ? walkFrames : idleFrames;
  if (!image.complete || image.naturalWidth === 0) return drawFallbackBoss(ctx, enemy);
  const frameIndex = attacking ? hitIndex(enemy.attackPulse) : Math.floor(performance.now() / (walking ? 115 : 180)) % frames.length;
  const pulse = attacking || walking ? 1 : 0.9 + Math.sin(performance.now() / 130) * 0.04;
  const width = (attacking ? 290 : 250) * pulse;
  const height = (attacking ? 218 : 282) * pulse;
  const x = enemy.x + enemy.width / 2 - width / 2;
  const y = floorY - height + 10;
  const flip = enemy.vx < -5;
  drawFrame(ctx, image, frames[frameIndex], `${attacking ? 'hit' : walking ? 'walk' : 'idle'}-${frameIndex}`, x, y, width, height, flip);
  drawGauntlet(ctx, flip ? x + width * 0.12 : x + width * 0.76, y + height * 0.18, pulse);
}

function hitIndex(attackPulse: number) {
  const progress = Math.max(0, Math.min(1, 1 - attackPulse / 0.34));
  return Math.min(hitFrames.length - 1, Math.floor(progress * hitFrames.length));
}

export function drawBossHazards(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.floor !== finalFloor) return;
  drawFireballWarning(ctx, state);
}

function drawFireballWarning(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.bossLightningStrike > 0) {
    return drawFallingFireball(ctx, state);
  }
}

function drawFallingFireball(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  const progress = 1 - Math.max(0, Math.min(1, state.bossLightningStrike)), x = state.bossLightningX, y = 42 + progress * (floorY - 90);
  ctx.fillStyle = 'rgba(255, 75, 31, 0.36)';
  ctx.fillRect(x - 28, Math.max(0, y - 124), 56, 126);
  ctx.fillStyle = '#b83f35'; ctx.fillRect(x - 28, y - 22, 56, 44);
  ctx.fillStyle = '#ff8a3d'; ctx.fillRect(x - 20, y - 30, 40, 54);
  ctx.fillStyle = '#f2dc5d'; ctx.fillRect(x - 10, y - 38, 20, 60);
  if (progress < 0.82) return;
  const blast = (progress - 0.82) / 0.18;
  ctx.fillStyle = `rgba(255, 141, 61, ${1 - blast * 0.45})`;
  ctx.fillRect(x - 76 * blast, floorY - 40 - 52 * blast, 152 * blast, 72 * blast);
}

function drawFrame(ctx: CanvasRenderingContext2D, image: HTMLImageElement, source: Frame, key: string, x: number, y: number, width: number, height: number, flip: boolean) {
  const frame = cleanFrame(image, source, key);
  if (!flip) return void ctx.drawImage(frame, x, y, width, height);
  ctx.save();
  ctx.translate(x + width, y);
  ctx.scale(-1, 1);
  ctx.drawImage(frame, 0, 0, width, height);
  ctx.restore();
}

function drawGauntlet(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const size = 44 * scale;
  ctx.fillStyle = 'rgba(255, 128, 54, 0.35)';
  ctx.fillRect(x - size * 0.45, y - size * 0.55, size * 1.6, size * 1.6);
  ctx.fillStyle = '#c49b55';
  ctx.fillRect(x, y, size * 0.82, size * 0.66);
  ctx.fillStyle = '#f2dc5d';
  for (let i = 0; i < 4; i += 1) ctx.fillRect(x + i * size * 0.2, y - size * (0.5 + i * 0.05), size * 0.14, size * 0.58);
  ctx.fillStyle = '#4aa3ff';
  ctx.fillRect(x + size * 0.2, y + size * 0.17, size * 0.14, size * 0.14);
  ctx.fillStyle = '#b83f35';
  ctx.fillRect(x + size * 0.46, y + size * 0.12, size * 0.14, size * 0.14);
}

function cleanFrame(image: HTMLImageElement, source: Frame, key: string) {
  const cached = cleanedFrames.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.drawImage(image, source.x, source.y, source.width, source.height, 0, 0, source.width, source.height);
  eraseLightGrid(ctx, source.width, source.height);
  cleanedFrames.set(key, canvas);
  return canvas;
}

function eraseLightGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const neutral = Math.abs(r - g) < 28 && Math.abs(g - b) < 28;
    if ((r > 178 && g > 178 && b > 178) || (neutral && r > 132)) data[i + 3] = 0;
  }
  ctx.putImageData(image, 0, 0);
}

function drawFallbackBoss(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  ctx.fillStyle = '#1a1515';
  ctx.fillRect(enemy.x - 20, floorY - 260, 210, 260);
  drawGauntlet(ctx, enemy.x + 122, floorY - 230, 0.86);
}
