import spriteSheetUrl from '../../assets/player-sprite-sheet.jpg';
import { floorY } from '../../lib/platformLevel';
import type { PlatformGameState } from '../../lib/platformTypes';

type FrameName = 'walkRight' | 'walkLeft' | 'shootRight' | 'shootLeft' | 'hitRight' | 'hitLeft';

type SourceFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const sheet = new Image();
sheet.src = spriteSheetUrl;

const frames: Record<FrameName, SourceFrame[]> = {
  walkRight: [
    { x: 82, y: 70, width: 105, height: 174 },
    { x: 224, y: 70, width: 102, height: 174 },
    { x: 368, y: 70, width: 102, height: 174 },
    { x: 506, y: 70, width: 105, height: 174 },
  ],
  walkLeft: [
    { x: 794, y: 70, width: 105, height: 174 },
    { x: 933, y: 70, width: 102, height: 174 },
    { x: 1077, y: 70, width: 102, height: 174 },
    { x: 1217, y: 70, width: 105, height: 174 },
  ],
  shootRight: [
    { x: 84, y: 312, width: 157, height: 150 },
    { x: 273, y: 312, width: 169, height: 150 },
    { x: 500, y: 312, width: 187, height: 150 },
  ],
  shootLeft: [
    { x: 786, y: 312, width: 187, height: 150 },
    { x: 1015, y: 312, width: 169, height: 150 },
    { x: 1208, y: 312, width: 157, height: 150 },
  ],
  hitRight: [
    { x: 44, y: 558, width: 171, height: 188 },
    { x: 246, y: 576, width: 212, height: 164 },
    { x: 490, y: 582, width: 178, height: 156 },
  ],
  hitLeft: [
    { x: 738, y: 582, width: 178, height: 156 },
    { x: 949, y: 576, width: 212, height: 164 },
    { x: 1202, y: 558, width: 171, height: 188 },
  ],
};

const cleanedFrames = new Map<string, HTMLCanvasElement>();

export function canDrawPlayerSprite() {
  return sheet.complete && sheet.naturalWidth > 0;
}

export function drawSpritePlayer(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (!canDrawPlayerSprite()) return false;
  const p = state.player;
  const frameSet = frameSetFor(state);
  const source = frames[frameSet][frameIndexFor(state, frameSet)];
  const frame = cleanedFrame(frameSet, source);
  const height = frameSet.startsWith('walk') ? 86 : frameSet.startsWith('shoot') ? 92 : 98;
  const width = (source.width / source.height) * height;
  const footY = state.inVent ? p.y + p.height : Math.min(floorY, p.y + p.height);
  const x = p.x + p.width / 2 - width / 2;
  const y = footY - height;
  ctx.drawImage(frame, x, y, width, height);
  return true;
}

function frameSetFor(state: PlatformGameState): FrameName {
  const direction = state.player.facing === 1 ? 'Right' : 'Left';
  if (state.player.shootPulse > 0) return `shoot${direction}` as FrameName;
  if (state.player.hitPulse > 0) return `hit${direction}` as FrameName;
  return `walk${direction}` as FrameName;
}

function frameIndexFor(state: PlatformGameState, frameSet: FrameName) {
  const total = frames[frameSet].length;
  if (frameSet.startsWith('shoot')) return Math.min(total - 1, Math.floor((1 - state.player.shootPulse / 0.22) * total));
  if (frameSet.startsWith('hit')) return Math.min(total - 1, Math.floor((1 - state.player.hitPulse / 0.24) * total));
  if (Math.abs(state.player.vx) < 5) return 1;
  return Math.abs(Math.floor(state.player.x / (state.player.running ? 18 : 24))) % total;
}

function cleanedFrame(frameSet: FrameName, source: SourceFrame) {
  const key = `${frameSet}-${source.x}-${source.y}`;
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
    const x = point % width;
    const y = Math.floor(point / width);
    data[point * 4 + 3] = 0;
    queueIfBackground(x + 1, y);
    queueIfBackground(x - 1, y);
    queueIfBackground(x, y + 1);
    queueIfBackground(x, y - 1);
  }
  ctx.putImageData(image, 0, 0);

  function queueIfBackground(x: number, y: number) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const point = y * width + x;
    if (seen[point]) return;
    seen[point] = 1;
    const offset = point * 4;
    if (!isSheetBackground(data[offset], data[offset + 1], data[offset + 2])) return;
    queue.push(point);
  }
}

function isSheetBackground(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return min > 54 && max < 198 && max - min < 48;
}
