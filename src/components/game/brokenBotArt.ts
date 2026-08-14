import botSheetUrl from '../../assets/broken-bot-sheet.jpg';
import type { Enemy } from '../../lib/platformTypes';

type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const sheet = new Image();
sheet.src = botSheetUrl;

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
  if (!sheet.complete || sheet.naturalWidth === 0) return false;
  const facing = enemy.vx >= 0 ? 'Right' : 'Left';
  const moving = Math.abs(enemy.vx) > 5;
  const group = moving ? frames[`walk${facing}`] : frames[`idle${facing}`];
  const source = group[frameIndex(enemy, group.length, moving)];
  const frame = cleanFrame(source);
  const height = 84;
  const width = (source.width / source.height) * height;
  const x = enemy.x + enemy.width / 2 - width / 2;
  const y = enemy.y + enemy.height - height;
  ctx.drawImage(frame, x, y, width, height);
  return true;
}

function frameIndex(enemy: Enemy, total: number, moving: boolean) {
  if (!moving) return Math.floor(performance.now() / 180) % total;
  return Math.abs(Math.floor(enemy.x / 22)) % total;
}

function cleanFrame(source: Frame) {
  const key = `${source.x}-${source.y}`;
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
