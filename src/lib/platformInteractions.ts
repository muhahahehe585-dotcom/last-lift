import { overlaps } from './platformGeometry';
import { damageNest } from './platformNest';
import type { InputState, ItemKind, PlatformGameState } from './platformTypes';

function grantLoot(state: PlatformGameState, loot: ItemKind) {
  if (loot === 'battery') {
    return {
      ...state,
      batteries: state.mode === 'flood' ? state.batteries : state.batteries + 1,
      player: { ...state.player, stamina: Math.min(100, state.player.stamina + 35) },
    };
  }
  if (loot === 'flashlight') return { ...state, flashlights: state.flashlights + 1 };
  if (loot === 'gun') return { ...state, hasGun: true, shots: state.shots + 3 };
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

function enterRoom(state: PlatformGameState) {
  const playerCenter = state.player.x + state.player.width / 2;
  if (state.ventHole && Math.abs(playerCenter - (state.ventHole.x + state.ventHole.width / 2)) < 95) {
    return {
      ...state,
      inVent: true,
      player: { ...state.player, x: 80, y: 416, height: 44, grounded: true },
      message: 'You crawled into the vents. No sprinting. The nest is forward.',
    };
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
  const maxHealth = state.player.hp > 100 ? 180 : 100;
  if (state.medkits < 1) return { ...state, message: 'No medkits left.' };
  if (state.player.hp >= maxHealth) return { ...state, message: 'Health is already full.' };
  return {
    ...state,
    medkits: state.medkits - 1,
    player: { ...state.player, hp: Math.min(maxHealth, state.player.hp + 25) },
    message: 'Medkit used.',
  };
}

function shootEnemy(state: PlatformGameState, input: InputState) {
  if (!state.hasGun || (!state.unlimitedGun && state.shots < 1)) return state;
  const bulletRange = 520;
  const bulletY = state.player.y + 28;
  const bulletStart = state.player.x + state.player.width / 2;
  const facing = input.aimX === null ? state.player.facing : input.aimX >= bulletStart ? 1 : -1;
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
  const nest = state.inVent && state.nest && facing === 1 && bulletEnd >= state.nest.x ? state.nest : null;
  if (!target && nest) return damageNest(state, { shots, bulletTrail: trail });
  if (!target) return { ...state, shots, bulletTrail: trail, message: 'Shot missed.' };
  const damage = target.kind === 'boss' ? 3 : target.kind === 'vent-monster' ? 4 : 999;
  const enemies = state.enemies
    .map((enemy) => (enemy.id === target.id ? { ...enemy, hp: enemy.hp - damage } : enemy))
    .filter((enemy) => enemy.hp > 0);

  return {
    ...state,
    shots,
    bulletTrail: trail,
    enemies,
    message: target.kind === 'boss' ? 'Boss hit by the shot.' : `${target.kind} destroyed by the shot.`,
  };
}

export function handleActionInputs(state: PlatformGameState, input: InputState, dt: number) {
  if (input.leavePressed) return leaveRoom(state);
  if (state.currentRoom && input.interactPressed) return searchDrawer(state);
  if (state.currentRoom) return { ...state, botBlindTime: Math.max(0, state.botBlindTime - dt) };
  if (input.interactPressed) return enterRoom(state);
  if (input.flashlightPressed) return useFlashlight(state);
  if (input.medkitPressed) return useMedkit(state);
  if (input.shootPressed) return shootEnemy(state, input);
  return state;
}
