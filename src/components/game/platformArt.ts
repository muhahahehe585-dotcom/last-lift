import { bossEscapeDoor, finalFloor, floorY, rageFire, viewWidth, worldHeight, worldWidth } from '../../lib/platformLevel';
import type { HotelRoom, PlatformGameState } from '../../lib/platformTypes';
import { drawRoof } from './roofArt';
import { drawTrainFloor } from './trainFloorArt';
import { drawVentWorld } from './ventArt';

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function cameraXFor(state: PlatformGameState) {
  const center = state.player.x + state.player.width / 2 - viewWidth / 2;
  return Math.max(0, Math.min(worldWidth - viewWidth, center));
}

export function drawHotel(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.floor === finalFloor) {
    drawRoof(ctx, state);
    return;
  }
  if (state.inVent) {
    drawVentWorld(ctx, state);
    return;
  }
  px(ctx, '#111311', 0, 0, worldWidth, worldHeight);
  drawCeiling(ctx);
  px(ctx, '#262520', 0, 54, worldWidth, floorY - 54);
  for (let x = 0; x < worldWidth; x += 96) px(ctx, x % 192 ? '#1b1c18' : '#303029', x, 86, 48, 88);
  for (let x = 40; x < worldWidth; x += 260) px(ctx, '#141511', x, 150, 90, 8);
  drawRooms(ctx, state.rooms);
  if (state.floor === 1) drawTurnBackDoor(ctx);
  drawWoodFloor(ctx, state);
  if (state.mode === 'train') drawTrainFloor(ctx);
  if (state.mode === 'vent') drawVentRoute(ctx, state);
  if (state.mode === 'flood') drawFlood(ctx);
  if (state.mode === 'lava') drawLava(ctx, state);
  if (state.mode === 'lava') drawBoxes(ctx, state);
  if (state.mode === 'supply') drawSupplyLights(ctx);
  px(ctx, '#5e8f86', worldWidth - 108, floorY - 132, 70, 132);
  px(ctx, '#0d0f0d', worldWidth - 78, floorY - 102, 10, 84);
}

function drawTurnBackDoor(ctx: CanvasRenderingContext2D) {
  px(ctx, '#090a09', 4, floorY - 132, 72, 132);
  px(ctx, '#6f543b', 16, floorY - 118, 48, 118);
  px(ctx, '#2a211a', 24, floorY - 102, 32, 96);
  px(ctx, '#f2dc5d', 50, floorY - 56, 6, 6);
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '16px monospace';
  ctx.fillText('BACK', 15, floorY - 142);
}

function drawCeiling(ctx: CanvasRenderingContext2D) {
  px(ctx, '#0a0b0a', 0, 46, worldWidth, 18);
  for (let x = 0; x < worldWidth; x += 86) {
    px(ctx, x % 172 ? '#242820' : '#30352b', x, 64, 58, 8);
  }
}

function drawVentRoute(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.ventHole) {
    px(ctx, '#050605', state.ventHole.x, state.ventHole.y, state.ventHole.width, state.ventHole.height);
    px(ctx, '#596057', state.ventHole.x + 8, state.ventHole.y + 8, state.ventHole.width - 16, 6);
    px(ctx, '#596057', state.ventHole.x + 8, state.ventHole.y + 22, state.ventHole.width - 16, 6);
    drawVentLadder(ctx, state.ventHole.x + state.ventHole.width / 2 - 18);
  }
}

function drawVentLadder(ctx: CanvasRenderingContext2D, x: number) {
  px(ctx, '#6f543b', x, 108, 8, floorY - 108);
  px(ctx, '#6f543b', x + 30, 108, 8, floorY - 108);
  for (let y = 126; y < floorY - 16; y += 34) {
    px(ctx, '#9a744c', x, y, 38, 8);
  }
}

function drawFlood(ctx: CanvasRenderingContext2D) {
  px(ctx, 'rgba(31, 96, 117, 0.86)', 0, floorY - 36, worldWidth, 90);
  for (let x = 0; x < worldWidth; x += 80) px(ctx, '#58a6b8', x, floorY - 22 + (x % 160 ? 6 : 0), 42, 5);
}

function drawLava(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  px(ctx, 'rgba(184, 63, 53, 0.9)', 0, floorY + 10, worldWidth, 58);
  for (let x = 0; x < worldWidth; x += 110) px(ctx, '#f2dc5d', x + 20, floorY + 24, 48, 6);
  if (state.floor !== 5) return;
  px(ctx, '#f2dc5d', rageFire.x + 20, rageFire.y + 18, 44, 38);
  px(ctx, '#ff8a3d', rageFire.x + 10, rageFire.y + 24, 70, 32);
  px(ctx, '#b83f35', rageFire.x + 28, rageFire.y + 30, 30, 24);
  px(ctx, 'rgba(242, 220, 93, 0.3)', rageFire.x - 18, rageFire.y - 18, rageFire.width + 36, rageFire.height + 24);
  ctx.fillStyle = '#fff8dc';
  ctx.font = '16px monospace';
  ctx.fillText('RAGE', rageFire.x + 20, rageFire.y - 8);
}

function drawBoxes(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  state.boxes.forEach((box) => {
    px(ctx, '#6b472c', box.x, box.y, box.width, box.height);
    px(ctx, '#3a2419', box.x + 6, box.y + 8, box.width - 12, 8);
    px(ctx, '#8a5d37', box.x + 10, box.y + 24, box.width - 20, 10);
  });
}

function drawSupplyLights(ctx: CanvasRenderingContext2D) {
  for (let x = 90; x < worldWidth; x += 240) {
    px(ctx, '#f2dc5d', x, 70, 50, 8);
    px(ctx, 'rgba(242, 220, 93, 0.22)', x - 40, 78, 130, 120);
  }
}

function drawRooms(ctx: CanvasRenderingContext2D, rooms: HotelRoom[]) {
  rooms.forEach((room, index) => {
    px(ctx, '#111311', room.x - 8, room.y - 10, room.width + 16, room.height + 10);
    px(ctx, room.opened ? '#15120f' : '#6f543b', room.x, room.y + 10, room.width, room.height - 10);
    px(ctx, room.opened ? '#070807' : '#2a211a', room.x + 8, room.y + 20, room.width - 16, room.height - 26);
    if (!room.opened) px(ctx, '#c49b55', room.x + room.width - 16, room.y + 66, 5, 5);
    if (room.opened) px(ctx, room.searched ? '#596057' : '#f2dc5d', room.x + 20, room.y + 34, 18, 8);
    px(ctx, index % 2 ? '#151611' : '#333029', room.x + 14, room.y - 38, 30, 18);
  });
}

function drawWoodFloor(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  px(ctx, '#231914', 0, floorY, worldWidth, 120);
  for (let x = 0; x < worldWidth; x += 74) {
    px(ctx, x % 148 ? '#5b3b27' : '#6b472c', x, floorY + 4, 70, 18);
    px(ctx, '#2b1d17', x + 5, floorY + 17, 56, 3);
  }
  state.holes.forEach((hole) => {
    px(ctx, '#020302', hole.x, hole.y - 2, hole.width, 72);
    px(ctx, '#3a2419', hole.x - 10, hole.y, 14, 24);
    px(ctx, '#3a2419', hole.x + hole.width - 4, hole.y, 14, 30);
  });
}

export function drawDarkness(ctx: CanvasRenderingContext2D, state: PlatformGameState, cameraX: number) {
  if (state.floor === finalFloor) return;
  const x = state.player.x - cameraX + state.player.width / 2;
  const y = state.player.y + state.player.height / 2;
  const outer = state.mode === 'blackout' ? 170 : state.mode === 'supply' ? 520 : 330;
  const inner = state.mode === 'blackout' ? 45 : 80;
  const dark = state.mode === 'supply' ? 0.45 : 0.92;
  const glow = ctx.createRadialGradient(x, y, inner, x, y, outer);
  glow.addColorStop(0, 'rgba(0,0,0,0)');
  glow.addColorStop(1, `rgba(0,0,0,${dark})`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, viewWidth, worldHeight);
}

export function drawDoorPrompt(ctx: CanvasRenderingContext2D, state: PlatformGameState, cameraX: number) {
  const playerCenter = state.player.x + state.player.width / 2;
  const escapeDoorCenter = bossEscapeDoor.x + bossEscapeDoor.width / 2;
  if (state.floor === finalFloor && state.bossDodged && Math.abs(playerCenter - escapeDoorCenter) < 95) {
    px(ctx, '#f2dc5d', bossEscapeDoor.x + 17 - cameraX, bossEscapeDoor.y - 42, 24, 24);
    ctx.fillStyle = '#111311';
    ctx.font = '18px monospace';
    ctx.fillText('E', bossEscapeDoor.x + 23 - cameraX, bossEscapeDoor.y - 24);
    return;
  }
  const room = state.rooms.find((item) => !item.opened && Math.abs(playerCenter - (item.x + item.width / 2)) < 180);
  if (state.ventHole && Math.abs(playerCenter - (state.ventHole.x + state.ventHole.width / 2)) < 95 && !state.currentRoom) {
    px(ctx, '#f2dc5d', state.ventHole.x + 34 - cameraX, state.ventHole.y - 34, 24, 24);
    ctx.fillStyle = '#111311';
    ctx.font = '18px monospace';
    ctx.fillText('E', state.ventHole.x + 40 - cameraX, state.ventHole.y - 16);
  }
  if (!room || state.currentRoom) return;
  px(ctx, '#f2dc5d', room.x + room.width / 2 - cameraX - 12, room.y - 54, 24, 24);
  ctx.fillStyle = '#111311';
  ctx.font = '18px monospace';
  ctx.fillText('E', room.x + room.width / 2 - cameraX - 6, room.y - 36);
}
