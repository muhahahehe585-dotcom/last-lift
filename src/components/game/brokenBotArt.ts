import botSheetUrl from '../../assets/broken-bot-sheet.jpg';
import botGuardSheetUrl from '../../assets/bot-guard-sheet.jpg';
import type { Enemy } from '../../lib/platformTypes';

type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const brokenSheet = new Image();
brokenSheet.src = botSheetUrl;

const guardSheet = new Image();
guardSheet.src = botGuardSheetUrl;

const frames = {
  walkRight: [
    { x: 88, y: 88, width: 102, height: 152 },
    { x: 222, y: 88, width: 112, height: 152 },
    { x: 366, y: 88, width: 112, height: 152 },
    { x: 505, y: 88, width: 116, height: 152 },
  ],
  walkLeft: [
    { x: 790, y: 88, width: 116, height: 152 },
    { x: 932, y: 88, width: 112, height: 152 },
    { x: 1076, y: 88, width: 112, height: 152 },
    { x: 1215, y: 88, width: 102, height: 152 },
  ],
  hitRight: [
    { x: 88, y: 326, width: 122, height: 154 },
    { x: 235, y: 326, width: 150, height: 154 },
    { x: 380, y: 326, width: 150, height: 154 },
    { x: 515, y: 326, width: 128, height: 154 },
  ],
  hitLeft: [
    { x: 760, y: 326, width: 128, height: 154 },
    { x: 903, y: 326, width: 150, height: 154 },
    { x: 1046, y: 326, width: 150, height: 154 },
    { x: 1198, y: 326, width: 122, height: 154 },
  ],
  idleRight: [
    { x: 88, y: 588, width: 100, height: 150 },
    { x: 224, y: 588, width: 106, height: 150 },
    { x: 365, y: 588, width: 112, height: 150 },
    { x: 506, y: 588, width: 116, height: 150 },
  ],
  idleLeft: [
    { x: 790, y: 588, width: 116, height: 150 },
    { x: 934, y: 588, width: 112, height: 150 },
    { x: 1078, y: 588, width: 106, height: 150 },
    { x: 1216, y: 588, width: 100, height: 150 },
  ],
};

const cleanedFrames = new Map<string, HTMLCanvasElement>();

export function drawBrokenBotSprite(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  return drawBotSprite(ctx, enemy, brokenSheet, 'broken');
}

export function drawBotGuardSprite(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  return drawBotSprite(ctx, enemy, guardSheet, 'guard');
}

function drawBotSprite(ctx: CanvasRenderingContext2D, enemy: Enemy, sheet: HTMLImageElement, variant: string) {
  if (!sheet.complete || sheet.naturalWidth === 0) return false;
  const facing = enemy.vx >= 0 ? 'Right' : 'Left';
  const moving = Math.abs(enemy.vx) > 5;
  const attacking = enemy.attackPulse > 0;
  const group = attacking ? frames[`hit${facing}`] : moving ? frames[`walk${facing}`] : frames[`idle${facing}`];
  const source = group[frameIndex(enemy, group.length, moving, attacking)];
  const frame = cleanFrame(source, sheet, variant);
  const height = 84;
  const width = (source.width / source.height) * height;
  const x = enemy.x + enemy.width / 2 - width / 2;
  const y = enemy.y + enemy.height - height;
  ctx.drawImage(frame, x, y, width, height);
  return true;
}

function frameIndex(enemy: Enemy, total: number, moving: boolean, attacking: boolean) {
  if (attacking) return Math.min(total - 1, Math.floor((1 - enemy.attackPulse / 0.34) * total));
  if (!moving) return Math.floor(performance.now() / 180) % total;
  return Math.abs(Math.floor(enemy.x / 22)) % total;
}

function cleanFrame(source: Frame, sheet: HTMLImageElement, variant: string) {
  const key = `${variant}-${source.x}-${source.y}`;
  const cached = cleanedFrames.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.drawImage(sheet, source.x, source.y, source.width, source.height, 0, 0, source.width, source.height);
  eraseEdgeBackground(ctx, source.width, source.height);
  cleanedFrames.set(key, canvas);
  return canvas;
}

function eraseEdgeBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const seen = new Uint8Array(width * height);
  const queue: number[] = [];
  for (let x = 0; x < width; x += 1) {
    queueIfBackground(x, 0);
    queueIfBackground(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    queueIfBackground(0, y);
    queueIfBackground(width - 1, y);
  }
  for (let index = 0; index < queue.length; index += 1) {
    const point = queue[index];
    data[point * 4 + 3] = 0;
    queueIfBackground(point % width + 1, Math.floor(point / width));
    queueIfBackground(point % width - 1, Math.floor(point / width));
    queueIfBackground(point % width, Math.floor(point / width) + 1);
    queueIfBackground(point % width, Math.floor(point / width) - 1);
  }
  ctx.putImageData(image, 0, 0);

  function queueIfBackground(x: number, y: number) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const point = y * width + x;
    if (seen[point]) return;
    seen[point] = 1;
    const offset = point * 4;
    if (isSheetBackground(data[offset], data[offset + 1], data[offset + 2])) queue.push(point);
  }
}

function isSheetBackground(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return min > 54 && max < 198 && max - min < 48;
}
