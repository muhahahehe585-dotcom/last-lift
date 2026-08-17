import droneSheetUrl from '../../assets/drone-bullet-sheet.jpg';
import type { Enemy, Rect } from '../../lib/platformTypes';

type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const sheet = new Image();
sheet.src = droneSheetUrl;

const droneFrame = { x: 58, y: 184, width: 630, height: 362 };
const bulletFrame = { x: 812, y: 306, width: 520, height: 156 };
const cleanedFrames = new Map<string, HTMLCanvasElement>();

export function drawDroneSprite(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  if (!sheet.complete || sheet.naturalWidth === 0) return false;
  const frame = cleanFrame(droneFrame, 'drone');
  const width = 78;
  const height = (droneFrame.height / droneFrame.width) * width;
  const bob = Math.sin(performance.now() / 140 + enemy.x * 0.02) * 3;
  ctx.drawImage(frame, enemy.x + enemy.width / 2 - width / 2, enemy.y + enemy.height / 2 - height / 2 + bob, width, height);
  return true;
}

export function drawBulletSprite(ctx: CanvasRenderingContext2D, trail: Rect) {
  if (!sheet.complete || sheet.naturalWidth === 0) return false;
  const frame = cleanFrame(bulletFrame, 'bullet');
  const facing = trail.width >= 0 ? 1 : -1;
  const width = Math.min(108, Math.max(54, Math.abs(trail.width) * 0.24));
  const height = (bulletFrame.height / bulletFrame.width) * width;
  const endX = trail.x + trail.width;
  ctx.save();
  if (facing < 0) {
    ctx.translate(endX + width / 2, trail.y);
    ctx.scale(-1, 1);
    ctx.drawImage(frame, -width / 2, -height / 2, width, height);
  } else {
    ctx.drawImage(frame, endX - width, trail.y - height / 2, width, height);
  }
  ctx.restore();
  return true;
}

function cleanFrame(source: Frame, key: string) {
  const cached = cleanedFrames.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.drawImage(sheet, source.x, source.y, source.width, source.height, 0, 0, source.width, source.height);
  eraseEdgeBlack(ctx, source.width, source.height);
  cleanedFrames.set(key, canvas);
  return canvas;
}

function eraseEdgeBlack(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const seen = new Uint8Array(width * height);
  const queue: number[] = [];
  for (let x = 0; x < width; x += 1) {
    queueIfBlack(x, 0);
    queueIfBlack(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    queueIfBlack(0, y);
    queueIfBlack(width - 1, y);
  }
  for (let index = 0; index < queue.length; index += 1) {
    const point = queue[index];
    data[point * 4 + 3] = 0;
    queueIfBlack(point % width + 1, Math.floor(point / width));
    queueIfBlack(point % width - 1, Math.floor(point / width));
    queueIfBlack(point % width, Math.floor(point / width) + 1);
    queueIfBlack(point % width, Math.floor(point / width) - 1);
  }
  ctx.putImageData(image, 0, 0);

  function queueIfBlack(x: number, y: number) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const point = y * width + x;
    if (seen[point]) return;
    seen[point] = 1;
    const offset = point * 4;
    if (data[offset] < 42 && data[offset + 1] < 42 && data[offset + 2] < 42) queue.push(point);
  }
}
