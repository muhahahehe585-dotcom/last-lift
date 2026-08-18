import monsterSheetUrl from '../../assets/vent-monster-sheet.jpg';
import type { Enemy } from '../../lib/platformTypes';

type Frame = { x: number; y: number; width: number; height: number };

const sheet = new Image();
sheet.src = monsterSheetUrl;

const idleFrames: Frame[] = [
  { x: 16, y: 30, width: 130, height: 105 },
  { x: 172, y: 28, width: 145, height: 108 },
  { x: 332, y: 28, width: 145, height: 108 },
  { x: 488, y: 28, width: 145, height: 108 },
];
const walkFrames: Frame[] = [
  { x: 14, y: 188, width: 200, height: 110 },
  { x: 236, y: 188, width: 205, height: 110 },
  { x: 474, y: 188, width: 205, height: 110 },
  { x: 712, y: 188, width: 205, height: 110 },
  { x: 952, y: 188, width: 205, height: 110 },
  { x: 1188, y: 188, width: 200, height: 110 },
];
const attackFrames: Frame[] = [
  { x: 8, y: 488, width: 190, height: 118 },
  { x: 224, y: 488, width: 198, height: 118 },
  { x: 452, y: 488, width: 238, height: 118 },
  { x: 720, y: 488, width: 196, height: 118 },
];
const cleanedFrames = new Map<string, HTMLCanvasElement>();

export function drawVentMonsterSprite(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  if (!sheet.complete || sheet.naturalWidth === 0) return false;
  const attacking = enemy.attackPulse > 0;
  const moving = !attacking && Math.abs(enemy.vx) > 5;
  const frames = attacking ? attackFrames : moving ? walkFrames : idleFrames;
  const source = frames[Math.abs(Math.floor((enemy.x + performance.now() / 18) / 30)) % frames.length];
  const height = enemy.id.startsWith('vent-final') ? 176 : 154;
  const width = (source.width / source.height) * height;
  const x = enemy.x + enemy.width / 2 - width / 2;
  const y = enemy.y + enemy.height - height + 8;
  ctx.drawImage(cleanFrame(source), x, y, width, height);
  return true;
}

function cleanFrame(source: Frame) {
  const key = `${source.x}-${source.y}-${source.width}-${source.height}`;
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
  for (let x = 0; x < width; x += 1) { queueIfBackground(x, 0); queueIfBackground(x, height - 1); }
  for (let y = 0; y < height; y += 1) { queueIfBackground(0, y); queueIfBackground(width - 1, y); }
  for (let index = 0; index < queue.length; index += 1) {
    const point = queue[index], x = point % width, y = Math.floor(point / width);
    data[point * 4 + 3] = 0;
    queueIfBackground(x + 1, y); queueIfBackground(x - 1, y); queueIfBackground(x, y + 1); queueIfBackground(x, y - 1);
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
