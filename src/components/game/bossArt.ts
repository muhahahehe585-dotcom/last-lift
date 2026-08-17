import serpentSheetUrl from '../../assets/serpent-boss-sheet.jpg';
import { bossHeadSpot, bossTailSpot } from '../../lib/bossWeakSpots';
import { finalFloor, floorY } from '../../lib/platformLevel';
import type { Enemy, PlatformGameState } from '../../lib/platformTypes';

type Frame = { x: number; y: number; width: number; height: number };

const sheet = new Image();
sheet.src = serpentSheetUrl;

const headFrame = { x: 718, y: 34, width: 238, height: 188 };
const bodyFrame = { x: 28, y: 284, width: 1326, height: 218 };
const tailFrame = { x: 300, y: 585, width: 990, height: 122 };
const clawFrame = { x: 72, y: 552, width: 218, height: 174 };
const cleanedFrames = new Map<string, HTMLCanvasElement>();

export function drawBoss(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  if (!sheet.complete || sheet.naturalWidth === 0) return drawFallbackBoss(ctx, enemy);
  const bodyX = enemy.x - 650;
  const bodyY = enemy.y + 104;
  drawFrame(ctx, headFrame, 'head', enemy.x - 912, enemy.y - 18, 188, 148);
  drawFrame(ctx, bodyFrame, 'body', bodyX, bodyY, 820, 126);
  drawFrame(ctx, tailFrame, 'tail', enemy.x + 58, enemy.y + 128, 265, 66, true);
  drawWeakSpotGlow(ctx, bossHeadSpot(enemy));
  drawWeakSpotGlow(ctx, bossTailSpot(enemy));
}

export function drawBossHazards(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.floor !== finalFloor) return;
  drawLightningWarning(ctx, state);
  drawGroundClaw(ctx, state);
}

function drawGroundClaw(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.bossClawTimer <= 1.7 || state.bossClawTimer > 2.35) return;
  const rise = Math.min(1, (2.35 - state.bossClawTimer) / 0.3);
  if (sheet.complete && sheet.naturalWidth > 0) {
    drawFrame(ctx, clawFrame, 'claw', state.bossClawX, floorY - 28 - rise * 92, 126, 104);
    return;
  }
  ctx.fillStyle = '#5b6368';
  ctx.fillRect(state.bossClawX + 18, floorY - rise * 92, 88, rise * 92);
}

function drawLightningWarning(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.bossLightningStrike > 0) {
    const alpha = Math.min(1, state.bossLightningStrike / 0.32);
    ctx.fillStyle = `rgba(122, 244, 255, ${0.45 + alpha * 0.35})`;
    ctx.fillRect(state.bossLightningX - 28, 38, 56, floorY - 38);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + alpha * 0.35})`;
    ctx.fillRect(state.bossLightningX - 8, 24, 16, floorY);
    return;
  }
  if (state.bossLightningWarning <= 0) return;
  const pulse = 0.55 + Math.sin(performance.now() / 90) * 0.25;
  ctx.strokeStyle = `rgba(255, 66, 66, ${pulse})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(state.bossLightningX, floorY - 38, 34, 0, Math.PI * 2);
  ctx.moveTo(state.bossLightningX - 52, floorY - 38);
  ctx.lineTo(state.bossLightningX + 52, floorY - 38);
  ctx.moveTo(state.bossLightningX, floorY - 90);
  ctx.lineTo(state.bossLightningX, floorY + 14);
  ctx.stroke();
}

function drawFrame(ctx: CanvasRenderingContext2D, source: Frame, key: string, x: number, y: number, width: number, height: number, flip = false) {
  const frame = cleanFrame(source, key);
  ctx.save();
  if (flip) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    ctx.drawImage(frame, 0, 0, width, height);
  } else {
    ctx.drawImage(frame, x, y, width, height);
  }
  ctx.restore();
}

function drawWeakSpotGlow(ctx: CanvasRenderingContext2D, spot: { x: number; y: number; width: number; height: number }) {
  ctx.strokeStyle = 'rgba(122, 244, 255, 0.38)';
  ctx.lineWidth = 3;
  ctx.strokeRect(spot.x, spot.y, spot.width, spot.height);
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
  eraseLightGrid(ctx, source.width, source.height);
  cleanedFrames.set(key, canvas);
  return canvas;
}

function eraseLightGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const seen = new Uint8Array(width * height);
  const queue: number[] = [];
  for (let x = 0; x < width; x += 1) {
    queueIfGrid(x, 0);
    queueIfGrid(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    queueIfGrid(0, y);
    queueIfGrid(width - 1, y);
  }
  for (let index = 0; index < queue.length; index += 1) {
    const point = queue[index];
    const x = point % width;
    const y = Math.floor(point / width);
    data[point * 4 + 3] = 0;
    queueIfGrid(x + 1, y);
    queueIfGrid(x - 1, y);
    queueIfGrid(x, y + 1);
    queueIfGrid(x, y - 1);
  }
  ctx.putImageData(image, 0, 0);

  function queueIfGrid(x: number, y: number) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const point = y * width + x;
    if (seen[point]) return;
    seen[point] = 1;
    const offset = point * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const neutral = Math.abs(r - g) < 24 && Math.abs(g - b) < 24;
    if ((r > 178 && g > 178 && b > 178) || (neutral && r > 126)) queue.push(point);
  }
}

function drawFallbackBoss(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  ctx.fillStyle = '#101826';
  ctx.fillRect(enemy.x - 650, enemy.y + 112, 820, 104);
  ctx.fillStyle = '#2ee6ff';
  ctx.fillRect(enemy.x - 620, enemy.y + 140, 760, 14);
  ctx.fillStyle = '#b83f35';
  ctx.fillRect(enemy.x - 880, enemy.y + 18, 110, 56);
  ctx.fillRect(enemy.x + 92, enemy.y + 145, 160, 34);
}
