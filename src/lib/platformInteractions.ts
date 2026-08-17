import { overlaps } from './platformGeometry';
import { finalVentMonsterFor, floorY, ventMonsterFor } from './platformLevel';
import type { InputState, ItemKind, PlatformGameState } from './platformTypes';

function randomGunBullets() {
  return 3 + Math.floor(Math.random() * 6);
}

function grantLoot(state: PlatformGameState, loot: ItemKind) {
  if (loot === 'battery') {
    return {
      ...state,
      batteries: state.mode === 'flood' ? state.batteries : state.batteries + 1,
      player: { ...state.player, stamina: Math.min(100, state.player.stamina + 35) },
    };
  }
  if (loot === 'flashlight') return { ...state, flashlights: state.flashlights + 1 };
  if (loot === 'gun') {
    const shots = state.shots + randomGunBullets();
    return { ...state, hasGun: true, shots, revolverLoaded: state.hasGun ? state.revolverLoaded : Math.min(6, shots) };
  }
  if (loot === 'stone') return { ...state, infinityStones: Math.min(6, state.infinityStones + 1) };
  return { ...state, medkits: state.medkits + 1 };
}

export function collectItems(state: PlatformGameState) {
  let next = state;
  const items = state.items.filter((item) => {
    if (!overlaps(state.player, item)) return true;
    next = grantLoot(next, item.kind);
    return false;
  });

  return { ...next, items, message: next === state ? state.message : 'Supplies collected.' };
}

const ventPlatforms = [
  { x: 330, y: floorY - 78, width: 260, height: 34 },
  { x: 655, y: floorY - 136, width: 270, height: 34 },
  { x: 1010, y: floorY - 96, width: 280, height: 34 },
  { x: 1370, y: floorY - 154, width: 280, height: 34 },
  { x: 1715, y: floorY - 92, width: 290, height: 34 },
  { x: 2040, y: floorY - 34, width: 330, height: 34 },
];

const ventGaps = [
  { x: 292, y: floorY, width: 305, height: 72 },
  { x: 630, y: floorY, width: 315, height: 72 },
  { x: 990, y: floorY, width: 315, height: 72 },
  { x: 1348, y: floorY, width: 315, height: 72 },
  { x: 1688, y: floorY, width: 330, height: 72 },
];

export function enterVentRoute(state: PlatformGameState, message = 'Vent chase. Run right, jump the platforms, then kill the monster at the far vent.') {
  return {
    ...state,
    inVent: true,
    enemies: [ventMonsterFor(state.floor), finalVentMonsterFor(state.floor)],
    boxes: ventPlatforms,
    holes: ventGaps,
    nest: null,
    nestHp: 0,
    hasGun: true,
    shots: state.unlimitedGun ? state.shots : Math.max(state.shots, 8),
    revolverLoaded: 6,
    reloadTimer: 0,
    player: { ...state.player, x: 80, y: floorY - 72, height: 72, grounded: true, running: true, facing: 1 as const },
    message,
  };
}

function enterRoom(state: PlatformGameState) {
  const playerCenter = state.player.x + state.player.width / 2;
  if (state.ventHole && Math.abs(playerCenter - (state.ventHole.x + state.ventHole.width / 2)) < 95) {
    return enterVentRoute(state);
  }
  if (state.currentRoom) return state;
  const roomsByDistance = state.rooms
    .filter((item) => !item.opened)
    .map((item) => ({ item, distance: Math.abs(playerCenter - (item.x + item.width / 2)) }))
    .sort((a, b) => a.distance - b.distance);
  const room = roomsByDistance[0]?.distance < 180 ? roomsByDistance[0].item : null;
  if (!room) return { ...state, message: 'No closed room close enough. Move in front of a door.' };

  let next: PlatformGameState = {
    ...state,
    currentRoom: { ...room, opened: true },
    rooms: state.rooms.map((item) => (item.id === room.id ? { ...item, opened: true } : item)),
  };
  return { ...next, message: 'Entered room. Press E near the drawer to search it.' };
}

function searchDrawer(state: PlatformGameState) {
  const room = state.currentRoom;
  if (!room || room.searched) return state;

  let next: PlatformGameState = {
    ...state,
    currentRoom: { ...room, searched: true },
    rooms: state.rooms.map((item) => (item.id === room.id ? { ...item, searched: true } : item)),
  };
  if (room.loot === 'empty') return { ...next, message: 'The drawer is empty.' };
  next = grantLoot(next, room.loot);
  return { ...next, message: `Drawer opened: ${room.loot} found.` };
}

function leaveRoom(state: PlatformGameState) {
  if (!state.currentRoom) return state;
  return { ...state, currentRoom: null, message: 'Back in the hallway.' };
}

function useFlashlight(state: PlatformGameState) {
  if (state.flashlights < 1 || state.botBlindTime > 0) return state;
  return { ...state, flashlights: state.flashlights - 1, botBlindTime: 4, message: 'Flashlight blast blinds the bots.' };
}

function useMedkit(state: PlatformGameState) {
  if (state.medkits < 1) return { ...state, message: 'No medkits left.' };
  if (state.player.hp >= state.player.maxHp) return { ...state, message: 'Health is already full.' };
  return {
    ...state,
    medkits: state.medkits - 1,
    player: { ...state.player, hp: Math.min(state.player.maxHp, state.player.hp + 25) },
    message: 'Medkit used.',
  };
}

function shootEnemy(state: PlatformGameState, input: InputState) {
  if (!state.hasGun || (!state.unlimitedGun && state.shots < 1)) return state;
  if (state.reloadTimer > 0) return { ...state, message: 'Revolver reloading.' };
  const loaded = state.revolverLoaded > 0 ? state.revolverLoaded : Math.min(6, state.unlimitedGun ? 6 : state.shots);
  if (loaded < 1) return { ...state, reloadTimer: 0.85, message: 'Revolver reloading.' };
  const bulletRange = 520;
  const bulletY = state.player.y + 28;
  const bulletStart = state.player.x + state.player.width / 2;
  const facing = input.aimX === null ? (state.inVent ? 1 : state.player.facing) : input.aimX >= bulletStart ? 1 : -1;
  const bulletEnd = bulletStart + facing * bulletRange;
  const trail = {
    x: bulletStart,
    y: bulletY,
    width: facing * bulletRange,
    height: 0.16,
  };
  const target = state.enemies
    .filter((enemy) => enemy.kind !== 'sea-monster')
    .filter((enemy) => bulletY >= enemy.y - 8 && bulletY <= enemy.y + enemy.height + 8)
    .filter((enemy) => (facing === 1 ? enemy.x >= bulletStart && enemy.x <= bulletEnd : enemy.x + enemy.width <= bulletStart && enemy.x + enemy.width >= bulletEnd))
    .sort((a, b) => Math.abs(a.x - bulletStart) - Math.abs(b.x - bulletStart))[0];

  const shots = state.unlimitedGun ? state.shots : state.shots - 1;
  const revolverLoaded = loaded - 1;
  const reloadTimer = revolverLoaded <= 0 && (state.unlimitedGun || shots > 0) ? 0.85 : 0;
  const shootingPlayer = { ...state.player, shootPulse: 0.22 };
  if (!target) return { ...state, player: shootingPlayer, shots, revolverLoaded, reloadTimer, bulletTrail: trail, message: 'Shot missed.' };
  const damage = target.kind === 'boss' ? 3 : target.kind === 'vent-monster' ? 4 : 999;
  const enemies = state.enemies
    .map((enemy) => (enemy.id === target.id ? { ...enemy, hp: enemy.hp - damage } : enemy))
    .filter((enemy) => enemy.hp > 0);

  return {
    ...state,
    player: shootingPlayer,
    shots,
    revolverLoaded,
    reloadTimer,
    bulletTrail: trail,
    enemies,
    message: target.kind === 'boss' ? 'Boss hit by the shot.' : `${target.kind} destroyed by the shot.`,
  };
}

export function handleActionInputs(state: PlatformGameState, input: InputState, dt: number) {
  if (input.leavePressed) return leaveRoom(state);
  if (input.medkitPressed) return useMedkit(state);
  if (state.currentRoom && input.interactPressed) return searchDrawer(state);
  if (state.currentRoom) return { ...state, botBlindTime: Math.max(0, state.botBlindTime - dt) };
  if (input.interactPressed) return enterRoom(state);
  if (input.flashlightPressed) return useFlashlight(state);
  if (input.shootPressed) return shootEnemy(state, input);
  return state;
}
