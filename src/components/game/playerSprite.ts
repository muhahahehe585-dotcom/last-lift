import { floorY } from '../../lib/platformLevel';
import type { PlatformGameState } from '../../lib/platformTypes';
import { frames, jumpSheet, mainSheet, type FrameName, type SourceFrame } from './playerSpriteFrames';

const cleanedFrames = new Map<string, HTMLCanvasElement>();

export function canDrawPlayerSprite() {
  return mainSheet.complete && mainSheet.naturalWidth > 0 && jumpSheet.complete && jumpSheet.naturalWidth > 0;
}

export function drawSpritePlayer(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (!canDrawPlayerSprite()) return false;
  const p = state.player;
  const frameSet = frameSetFor(state);
  const source = frames[frameSet][frameIndexFor(state, frameSet)];
  const frame = cleanedFrame(frameSet, source);
  const height = frameHeight(frameSet);
  const width = (source.width / source.height) * height;
  const footY = state.inVent ? p.y + p.height : Math.min(floorY, p.y + p.height);
  const x = p.x + p.width / 2 - width / 2;
  const y = footY - height;
  if (shouldMirror(state, frameSet)) {
    ctx.save();
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    ctx.drawImage(frame, 0, 0, width, height);
    ctx.restore();
    return true;
  }
  ctx.drawImage(frame, x, y, width, height);
  return true;
}

function frameSetFor(state: PlatformGameState): FrameName {
  const direction = state.player.facing === 1 ? 'Right' : 'Left';
  if (state.player.shootPulse > 0) return `shoot${direction}` as FrameName;
  if (state.player.hitPulse > 0) return `hit${direction}` as FrameName;
  if (state.player.doubleJumpPulse > 0) return 'doubleJumpLeft';
  if (!state.player.grounded) return 'jumpLeft';
  return `walk${direction}` as FrameName;
}

function frameIndexFor(state: PlatformGameState, frameSet: FrameName) {
  const total = frames[frameSet].length;
  if (frameSet.startsWith('shoot')) return pulseFrame(total, state.player.shootPulse, 0.22);
  if (frameSet.startsWith('hit')) return pulseFrame(total, state.player.hitPulse, 0.24);
  if (frameSet === 'doubleJumpLeft') return pulseFrame(total, state.player.doubleJumpPulse, 0.34);
  if (frameSet === 'jumpLeft') return state.player.vy < -180 ? 1 : state.player.vy > 180 ? 3 : 2;
  if (Math.abs(state.player.vx) < 5) return 1;
  return Math.abs(Math.floor(state.player.x / (state.player.running ? 18 : 24))) % total;
}

function pulseFrame(total: number, pulse: number, duration: number) {
  return Math.min(total - 1, Math.floor((1 - pulse / duration) * total));
}

function frameHeight(frameSet: FrameName) {
  if (frameSet.startsWith('walk')) return 86;
  if (frameSet.startsWith('shoot')) return 92;
  if (frameSet.startsWith('hit')) return 98;
  return frameSet === 'doubleJumpLeft' ? 102 : 94;
}

function shouldMirror(state: PlatformGameState, frameSet: FrameName) {
  return (frameSet === 'jumpLeft' || frameSet === 'doubleJumpLeft') && state.player.facing === 1;
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
  ctx.drawImage(source.sheet, source.x, source.y, source.width, source.height, 0, 0, source.width, source.height);
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
