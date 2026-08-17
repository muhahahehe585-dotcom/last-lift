import { floorY } from './platformLevel';
import type { Rect } from './platformTypes';

export const groundClawRects: Rect[] = [1180, 1545, 1910].map((x) => ({
  x,
  y: floorY - 112,
  width: 190,
  height: 112,
}));
