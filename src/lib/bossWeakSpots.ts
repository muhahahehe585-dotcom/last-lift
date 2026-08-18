import { overlaps } from './platformGeometry';
import type { Enemy, Rect } from './platformTypes';

export function bossHeadSpot(enemy: Enemy): Rect {
  return {
    x: enemy.x - 52,
    y: enemy.y - 116,
    width: 148,
    height: 154,
  };
}

export function bossTailSpot(enemy: Enemy): Rect {
  return {
    x: enemy.x + 70,
    y: enemy.y - 72,
    width: 132,
    height: 112,
  };
}

export function bossWeakSpots(enemy: Enemy) {
  return [{ x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height }];
}

export function hitsBossWeakSpot(enemy: Enemy, rect: Rect) {
  return bossWeakSpots(enemy).some((spot) => overlaps(rect, spot));
}

export function bulletHitsBossWeakSpot(enemy: Enemy, bulletY: number, startX: number, endX: number) {
  const left = Math.min(startX, endX);
  const right = Math.max(startX, endX);
  return bossWeakSpots(enemy).some((spot) => bulletY >= spot.y - 8 && bulletY <= spot.y + spot.height + 8 && right >= spot.x && left <= spot.x + spot.width);
}
