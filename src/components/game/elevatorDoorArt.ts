import elevatorSheetUrl from '../../assets/elevator-door-sheet.jpg';
import { floorY, worldWidth } from '../../lib/platformLevel';

type SourceFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const sheet = new Image();
sheet.src = elevatorSheetUrl;

const doorFrame: SourceFrame = { x: 1110, y: 548, width: 184, height: 190 };
let cleanedDoor: HTMLCanvasElement | null = null;

export function drawElevatorDoor(ctx: CanvasRenderingContext2D) {
  const x = worldWidth - 142;
  const y = floorY - 156;
  const width = 112;
  const height = 156;
  if (!sheet.complete || sheet.naturalWidth === 0) {
    drawFallbackDoor(ctx, x, y, width, height);
    return;
  }
  ctx.drawImage(cleanDoorFrame(), x, y, width, height);
}

function cleanDoorFrame() {
  if (cleanedDoor) return cleanedDoor;
  const canvas = document.createElement('canvas');
  canvas.width = doorFrame.width;
  canvas.height = doorFrame.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.drawImage(sheet, doorFrame.x, doorFrame.y, doorFrame.width, doorFrame.height, 0, 0, doorFrame.width, doorFrame.height);
  eraseEdgeBackground(ctx, doorFrame.width, doorFrame.height);
  cleanedDoor = canvas;
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

function drawFallbackDoor(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.fillStyle = '#5e8f86';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = '#0d0f0d';
  ctx.fillRect(x + width / 2 - 5, y + 30, 10, height - 46);
}
