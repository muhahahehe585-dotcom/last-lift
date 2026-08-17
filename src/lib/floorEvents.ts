import type { FloorMode } from './platformTypes';

const finalFloorNumber = 100;

export function batteryNeed(floor: number) {
  return floor === finalFloorNumber ? 0 : 3 + Math.floor(floor / 34);
}

export function modeFor(floor: number): FloorMode {
  if (floor === finalFloorNumber) return 'normal';
  if (floor % 13 === 0) return 'vent';
  if (floor % 11 === 0) return 'train';
  if (floor % 10 === 0) return 'supply';
  if (floor % 9 === 0) return 'collapse';
  if (floor % 8 === 0) return 'drone-swarm';
  if (floor % 7 === 0) return 'blackout';
  if (floor % 6 === 0) return 'flood';
  if (floor % 5 === 0) return 'lava';
  return 'normal';
}

export function modeMessage(floor: number, mode: FloorMode, bossFloor: boolean) {
  if (bossFloor) return 'Roof level. Beat the boss before the gauntlet cooldown ends.';
  if (mode === 'flood') return `Floor ${floor}: flood chase. Run to the elevator.`;
  if (mode === 'lava') return `Floor ${floor}: floor is lava. Keep moving and get power fast.`;
  if (mode === 'blackout') return `Floor ${floor}: blackout. Vision range is tiny.`;
  if (mode === 'drone-swarm') return `Floor ${floor}: drone swarm. Watch the air.`;
  if (mode === 'collapse') return `Floor ${floor}: collapsing floor. More gaps, less mercy.`;
  if (mode === 'supply') return `Floor ${floor}: supply floor. Grab what you can.`;
  if (mode === 'train') return `Floor ${floor}: train event. Get to the last cart.`;
  if (mode === 'vent') return `Floor ${floor}: vent chase. Run the platforms to reach the monster fight.`;
  return `Floor ${floor}. Find batteries before the lift drops.`;
}
