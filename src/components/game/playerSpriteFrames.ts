import idleSheetUrl from '../../assets/player-idle-sheet.jpg';
import jumpSheetUrl from '../../assets/player-jump-sheet.jpg';
import spriteSheetUrl from '../../assets/player-sprite-sheet.jpg';

export type FrameName =
  | 'walkRight'
  | 'walkLeft'
  | 'idleRight'
  | 'idleLeft'
  | 'shootRight'
  | 'shootLeft'
  | 'hitRight'
  | 'hitLeft'
  | 'jumpLeft'
  | 'doubleJumpLeft';

export type SourceFrame = {
  sheet: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const mainSheet = new Image();
mainSheet.src = spriteSheetUrl;

export const jumpSheet = new Image();
jumpSheet.src = jumpSheetUrl;

export const idleSheet = new Image();
idleSheet.src = idleSheetUrl;

const main = mainSheet;
const jump = jumpSheet;
const idle = idleSheet;

export const frames: Record<FrameName, SourceFrame[]> = {
  walkRight: [
    { sheet: main, x: 82, y: 70, width: 105, height: 174 },
    { sheet: main, x: 224, y: 70, width: 102, height: 174 },
    { sheet: main, x: 368, y: 70, width: 102, height: 174 },
    { sheet: main, x: 506, y: 70, width: 105, height: 174 },
  ],
  walkLeft: [
    { sheet: main, x: 794, y: 70, width: 105, height: 174 },
    { sheet: main, x: 933, y: 70, width: 102, height: 174 },
    { sheet: main, x: 1077, y: 70, width: 102, height: 174 },
    { sheet: main, x: 1217, y: 70, width: 105, height: 174 },
  ],
  idleRight: [
    { sheet: idle, x: 84, y: 584, width: 102, height: 154 },
    { sheet: idle, x: 225, y: 584, width: 102, height: 154 },
    { sheet: idle, x: 368, y: 584, width: 102, height: 154 },
    { sheet: idle, x: 512, y: 584, width: 102, height: 154 },
  ],
  idleLeft: [
    { sheet: idle, x: 794, y: 584, width: 102, height: 154 },
    { sheet: idle, x: 936, y: 584, width: 102, height: 154 },
    { sheet: idle, x: 1078, y: 584, width: 102, height: 154 },
    { sheet: idle, x: 1218, y: 584, width: 102, height: 154 },
  ],
  shootRight: [
    { sheet: main, x: 84, y: 312, width: 157, height: 150 },
    { sheet: main, x: 273, y: 312, width: 169, height: 150 },
    { sheet: main, x: 500, y: 312, width: 187, height: 150 },
  ],
  shootLeft: [
    { sheet: main, x: 786, y: 312, width: 187, height: 150 },
    { sheet: main, x: 1015, y: 312, width: 169, height: 150 },
    { sheet: main, x: 1208, y: 312, width: 157, height: 150 },
  ],
  hitRight: [
    { sheet: main, x: 44, y: 558, width: 171, height: 188 },
    { sheet: main, x: 246, y: 576, width: 212, height: 164 },
    { sheet: main, x: 490, y: 582, width: 178, height: 156 },
  ],
  hitLeft: [
    { sheet: main, x: 738, y: 582, width: 178, height: 156 },
    { sheet: main, x: 949, y: 576, width: 212, height: 164 },
    { sheet: main, x: 1202, y: 558, width: 171, height: 188 },
  ],
  jumpLeft: [
    { sheet: jump, x: 68, y: 584, width: 118, height: 154 },
    { sheet: jump, x: 216, y: 566, width: 116, height: 170 },
    { sheet: jump, x: 362, y: 542, width: 114, height: 188 },
    { sheet: jump, x: 505, y: 582, width: 112, height: 154 },
  ],
  doubleJumpLeft: [
    { sheet: jump, x: 730, y: 582, width: 122, height: 156 },
    { sheet: jump, x: 884, y: 548, width: 146, height: 188 },
    { sheet: jump, x: 1060, y: 548, width: 136, height: 188 },
    { sheet: jump, x: 1220, y: 582, width: 112, height: 154 },
  ],
};
