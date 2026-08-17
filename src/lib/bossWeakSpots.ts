import { overlaps } from './platformGeometry';
import type { Enemy, Rect } from './platformTypes';

export function bossHeadSpot(enemy: Enemy): Rect {
  return {
    x: enemy.x - 900,
    y: enemy.y - 14,
    width: 168,
    height: 136,
  };
}

export function bossTailSpot(enemy: Enemy): Rect {
  return {
    x: enemy.x + 74,
    y: enemy.y + 132,
    width: 205,
    height: 62,
  };
}

export function bossWeakSpots(enemy: Enemy) {
  return [bossHeadSpot(enemy), bossTailSpot(enemy)];
}

export function hitsBossWeakSpot(enemy: Enemy, rect: Rect) {
  return bossWeakSpots(enemy).some((spot) => overlaps(rect, spot));
}

export function bulletHitsBossWeakSpot(enemy: Enemy, bulletY: number, startX: number, endX: number) {
  const left = Math.min(startX, endX);
  const right = Math.max(startX, endX);
  return bossWeakSpots(enemy).some((spot) => bulletY >= spot.y - 8 && bulletY <= spot.y + spot.height + 8 && right >= spot.x && left <= spot.x + spot.width);
}
