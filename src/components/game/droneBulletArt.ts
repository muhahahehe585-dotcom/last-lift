import droneSheetUrl from '../../assets/drone-bullet-sheet.jpg';
import type { Enemy, Rect } from '../../lib/platformTypes';

const sheet = new Image();
sheet.src = droneSheetUrl;

const droneFrame = { x: 58, y: 184, width: 630, height: 362 };
const bulletFrame = { x: 812, y: 306, width: 520, height: 156 };

export function drawDroneSprite(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  if (!sheet.complete || sheet.naturalWidth === 0) return false;
  const width = 112;
  const height = (droneFrame.height / droneFrame.width) * width;
  const bob = Math.sin(performance.now() / 140 + enemy.x * 0.02) * 3;
  ctx.drawImage(sheet, droneFrame.x, droneFrame.y, droneFrame.width, droneFrame.height, enemy.x + enemy.width / 2 - width / 2, enemy.y + enemy.height / 2 - height / 2 + bob, width, height);
  return true;
}

export function drawBulletSprite(ctx: CanvasRenderingContext2D, trail: Rect) {
  if (!sheet.complete || sheet.naturalWidth === 0) return false;
  const facing = trail.width >= 0 ? 1 : -1;
  const width = Math.min(170, Math.max(88, Math.abs(trail.width) * 0.36));
  const height = (bulletFrame.height / bulletFrame.width) * width;
  const endX = trail.x + trail.width;
  ctx.save();
  if (facing < 0) {
    ctx.translate(endX + width / 2, trail.y);
    ctx.scale(-1, 1);
    ctx.drawImage(sheet, bulletFrame.x, bulletFrame.y, bulletFrame.width, bulletFrame.height, -width / 2, -height / 2, width, height);
  } else {
    ctx.drawImage(sheet, bulletFrame.x, bulletFrame.y, bulletFrame.width, bulletFrame.height, endX - width, trail.y - height / 2, width, height);
  }
  ctx.restore();
  return true;
}
