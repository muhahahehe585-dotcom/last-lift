import { overlaps } from './platformGeometry';
import type { Enemy, Rect } from './platformTypes';

export function bossHeadSpot(enemy: Enemy): Rect {
  return {
    x: enemy.x - 1088,
    y: enemy.y - 44,
    width: 248,
    height: 188,
  };
}

export function bossTailSpot(enemy: Enemy): Rect {
  return {
    x: enemy.x - 18,
    y: enemy.y + 124,
    width: 330,
    height: 84,
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
