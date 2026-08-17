import doorSheetUrl from '../../assets/room-door-sheet.jpg';
import type { HotelRoom } from '../../lib/platformTypes';

type SourceFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const sheet = new Image();
sheet.src = doorSheetUrl;

const doorFrame: SourceFrame = { x: 492, y: 112, width: 422, height: 595 };
let cleanedDoor: HTMLCanvasElement | null = null;

export function drawRoomDoor(ctx: CanvasRenderingContext2D, room: HotelRoom, labelShade: string) {
  if (room.opened) {
    drawOpenDoor(ctx, room);
    return;
  }
  if (!sheet.complete || sheet.naturalWidth === 0) {
    drawFallbackDoor(ctx, room);
    return;
  }
  ctx.drawImage(cleanDoorFrame(), room.x - 8, room.y - 10, room.width + 16, room.height + 10);
  ctx.fillStyle = labelShade;
  ctx.fillRect(room.x + 14, room.y - 38, 30, 18);
}

function cleanDoorFrame() {
  if (cleanedDoor) return cleanedDoor;
  const canvas = document.createElement('canvas');
  canvas.width = doorFrame.width;
  canvas.height = doorFrame.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.drawImage(sheet, doorFrame.x, doorFrame.y, doorFrame.width, doorFrame.height, 0, 0, doorFrame.width, doorFrame.height);
  cleanedDoor = canvas;
  return canvas;
}

function drawOpenDoor(ctx: CanvasRenderingContext2D, room: HotelRoom) {
  ctx.fillStyle = '#111311';
  ctx.fillRect(room.x - 8, room.y - 10, room.width + 16, room.height + 10);
  ctx.fillStyle = '#15120f';
  ctx.fillRect(room.x, room.y + 10, room.width, room.height - 10);
  ctx.fillStyle = '#070807';
  ctx.fillRect(room.x + 8, room.y + 20, room.width - 16, room.height - 26);
  ctx.fillStyle = room.searched ? '#596057' : '#f2dc5d';
  ctx.fillRect(room.x + 20, room.y + 34, 18, 8);
}

function drawFallbackDoor(ctx: CanvasRenderingContext2D, room: HotelRoom) {
  ctx.fillStyle = '#111311';
  ctx.fillRect(room.x - 8, room.y - 10, room.width + 16, room.height + 10);
  ctx.fillStyle = '#6f543b';
  ctx.fillRect(room.x, room.y + 10, room.width, room.height - 10);
  ctx.fillStyle = '#2a211a';
  ctx.fillRect(room.x + 8, room.y + 20, room.width - 16, room.height - 26);
  ctx.fillStyle = '#c49b55';
  ctx.fillRect(room.x + room.width - 16, room.y + 66, 5, 5);
}
