import type { Enemy, EnemyKind, HotelRoom, Item, ItemKind, PlatformGameState } from './platformTypes';
import { batteryNeed, modeFor, modeMessage } from './floorEvents';
import { boxesFor, holesFor } from './platformObstacles';
import { getArmor, getCoins, hasDoubleJump, hasInfinityGauntlet } from './progress';

export const worldWidth = 2400;
export const viewWidth = 1200;
export const worldHeight = 640;
export const floorY = 520;
export const finalFloor = 100;
export const bossEscapeDoor = { x: worldWidth - 82, y: floorY - 138, width: 58, height: 138 };

type LevelCarry = {
  flashlights?: number;
  medkits?: number;
  hasGun?: boolean;
  shots?: number;
  unlimitedGun?: boolean;
  infinityStones?: number;
  stamina?: number;
  armorCount?: number;
};

const enemyKinds: EnemyKind[] = ['drone', 'broken-bot', 'bot-guard'];

function enemyFor(floor: number, index: number): Enemy {
  const kind = floor === finalFloor ? 'boss' : enemyKinds[(floor + index) % enemyKinds.length];
  const boss = kind === 'boss';
  const x = boss ? 2110 : 360 + index * 360 + ((floor * 29) % 120);

  return {
    id: `floor-${floor}-enemy-${index}`,
    kind,
    x,
    y: boss ? floorY - 182 : kind === 'drone' ? floorY - 118 : floorY - 58,
    width: boss ? 138 : kind === 'drone' ? 50 : 46,
    height: boss ? 182 : kind === 'drone' ? 38 : 58,
    hp: boss ? 30 : kind === 'bot-guard' ? 4 : 2,
    vx: boss ? -72 : 45 + index * 8,
    patrolLeft: Math.max(180, x - 180),
    patrolRight: Math.min(worldWidth - 160, x + 210),
    wakeDelay: 0,
  };
}

function seaMonsterFor(floor: number): Enemy {
  return {
    id: `sea-monster-${floor}`,
    kind: 'sea-monster',
    x: -620,
    y: floorY - 112,
    width: 132,
    height: 112,
    hp: 999,
    vx: 92,
    patrolLeft: -700,
    patrolRight: worldWidth,
    wakeDelay: 5,
  };
}

function ventMonsterFor(floor: number): Enemy {
  return {
    id: `vent-monster-${floor}`,
    kind: 'vent-monster',
    x: 1420,
    y: floorY - 102,
    width: 78,
    height: 52,
    hp: 8,
    vx: 70,
    patrolLeft: 1180,
    patrolRight: 1780,
    wakeDelay: 0,
  };
}

function itemsFor(floor: number): Item[] {
  const shift = (floor * 47) % 180;
  const stone = stoneFor(floor);

  return [
    { id: `battery-a-${floor}`, kind: 'battery', x: 260 + shift, y: floorY - 40, width: 26, height: 34 },
    { id: `battery-b-${floor}`, kind: 'battery', x: 820 - shift / 2, y: floorY - 40, width: 26, height: 34 },
    { id: `battery-c-${floor}`, kind: 'battery', x: 1450 + shift / 3, y: floorY - 40, width: 26, height: 34 },
    { id: `battery-d-${floor}`, kind: 'battery', x: 2020 - shift / 5, y: floorY - 40, width: 26, height: 34 },
    { id: `medkit-${floor}`, kind: 'medkit', x: 1830 + shift / 4, y: floorY - 40, width: 30, height: 28 },
    ...(stone ? [stone] : []),
  ];
}

function stoneFor(floor: number): Item | null {
  const stoneFloors = [14, 30, 45, 62, 75, 90];
  if (!stoneFloors.includes(floor)) return null;
  return { id: `infinity-stone-${floor}`, kind: 'stone', x: 1180, y: floorY - 38, width: 24, height: 24 };
}

function floodItemsFor(floor: number): Item[] {
  return [330, 760, 1190, 1620, 2050].map((x, index) => ({
    id: `flood-battery-${floor}-${index}`,
    kind: 'battery',
    x,
    y: floorY - 42,
    width: 26,
    height: 34,
  }));
}

function lavaItemsFor(floor: number, boxes: ReturnType<typeof boxesFor>): Item[] {
  return boxes.slice(0, 4).map((box, index) => ({
    id: `lava-battery-${floor}-${index}`,
    kind: 'battery',
    x: box.x + box.width / 2 - 13,
    y: box.y - 34,
    width: 26,
    height: 34,
  }));
}

function roomLoot(floor: number, index: number): ItemKind | 'empty' {
  const value = (floor * 11 + index * 7) % 20;
  if (value === 0) return 'gun';
  if (value < 5) return 'battery';
  if (value < 8) return 'flashlight';
  if (value < 10) return 'medkit';
  return 'empty';
}

function roomsFor(floor: number): HotelRoom[] {
  return [190, 480, 770, 1060, 1350, 1640, 1930].map((x, index) => ({
    id: `room-${floor}-${index}`,
    x,
    y: floorY - 122,
    width: 58,
    height: 122,
    loot: roomLoot(floor, index),
    opened: false,
    searched: false,
  }));
}

function meteoritesFor(floor: number): Item[] {
  if (floor !== finalFloor) return [];
  return [
    { id: 'meteor-a', kind: 'battery', x: 380, y: 110, width: 128, height: 92 },
    { id: 'meteor-b', kind: 'battery', x: 900, y: 62, width: 112, height: 82 },
    { id: 'meteor-c', kind: 'battery', x: 1440, y: 136, width: 140, height: 96 },
  ];
}

export function createLevel(floor: number, hp = 100, carry: LevelCarry = {}): PlatformGameState {
  const bossFloor = floor === finalFloor;
  const mode = modeFor(floor);
  const boxes = mode === 'lava' ? boxesFor(floor) : [];
  const baseEnemyCount = Math.min(5, 2 + Math.floor(floor / 25));
  const enemyCount = bossFloor ? 1 : mode === 'supply' ? 0 : mode === 'drone-swarm' ? 6 : baseEnemyCount;

  return {
    floor,
    mode,
    status: 'playing',
    ending: null,
    player: {
      x: 42,
      y: floorY - 72,
      width: 34,
      height: 72,
      vx: 0,
      vy: 0,
      hp,
      stamina: carry.stamina ?? 100,
      grounded: true,
      facing: 1,
      running: false,
      isSlamming: false,
      slamCooldown: 0,
      slamPulse: 0,
      dodgeCooldown: 0,
      dodgePulse: 0,
      hurtCooldown: 0,
      doubleJumpUsed: false,
    },
    enemies: mode === 'vent' ? [ventMonsterFor(floor)] : mode === 'flood' ? [seaMonsterFor(floor)] : Array.from({ length: enemyCount }, (_, index) => enemyFor(floor, index)),
    items: bossFloor ? [] : mode === 'flood' ? floodItemsFor(floor) : mode === 'lava' ? lavaItemsFor(floor, boxes) : mode === 'supply' ? [...itemsFor(floor), ...itemsFor(floor + 1)] : itemsFor(floor),
    rooms: bossFloor || mode === 'flood' ? [] : roomsFor(floor),
    holes: bossFloor || mode === 'supply' || mode === 'lava' ? [] : mode === 'collapse' ? [...holesFor(floor), ...holesFor(floor + 1)] : holesFor(floor),
    boxes,
    ventHole: mode === 'vent' ? { x: 520, y: 70, width: 92, height: 38 } : null,
    nest: mode === 'vent' ? { x: 2130, y: floorY - 92, width: 120, height: 92 } : null,
    nestHp: 5,
    inVent: false,
    ventSpawnTimer: 60,
    currentRoom: null,
    batteries: 0,
    batteriesNeeded: mode === 'flood' ? 0 : batteryNeed(floor),
    flashlights: carry.flashlights ?? 0,
    medkits: carry.medkits ?? 0,
    infinityStones: carry.infinityStones ?? 0,
    gauntletOwned: hasInfinityGauntlet(),
    botBlindTime: 0,
    eventDamageCooldown: 0,
    hasGun: mode === 'train' ? true : carry.hasGun ?? false,
    shots: mode === 'train' ? Math.max(carry.shots ?? 0, 6) : carry.shots ?? 0,
    unlimitedGun: carry.unlimitedGun ?? false,
    bulletTrail: null,
    meteorites: meteoritesFor(floor),
    grabbedMeteor: null,
    duel: null,
    floorTimeLeft: bossFloor ? 0 : mode === 'flood' ? 45 : 70,
    bossTimeLeft: bossFloor ? 600 : 0,
    gauntletSnapTimer: 0,
    meteorThrowTimer: 0,
    bossDodged: false,
    message: modeMessage(floor, mode, bossFloor),
    deathCause: null,
    deathTimer: 0,
    coins: getCoins(),
    armorCount: carry.armorCount ?? getArmor(),
    doubleJumpUnlocked: hasDoubleJump(),
  };
}

export const initialPlatformState = createLevel(1);
