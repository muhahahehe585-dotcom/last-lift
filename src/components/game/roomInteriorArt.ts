import roomInteriorUrl from '../../assets/room-interior.jpg';
import { viewWidth, worldHeight } from '../../lib/platformLevel';
import type { ItemKind, PlatformGameState } from '../../lib/platformTypes';
import { drawItem } from './spriteArt';

const roomInterior = new Image();
roomInterior.src = roomInteriorUrl;
const roomFrame = { x: 210, y: 95, width: 780, height: 430 };

export function drawRoomInterior(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  const room = state.currentRoom;
  if (!room) return;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
  ctx.fillRect(0, 0, viewWidth, worldHeight);
  if (roomInterior.complete && roomInterior.naturalWidth > 0) {
    drawCoverImage(ctx, roomInterior, roomFrame);
  } else {
    drawFallbackRoom(ctx);
  }

  if (room.searched) drawSearchedRoomText(ctx);
  drawRoomLoot(ctx, room.loot, room.searched);
}

function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, frame: typeof roomFrame) {
  const scale = Math.max(frame.width / image.naturalWidth, frame.height / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(frame.x, frame.y, frame.width, frame.height);
  ctx.clip();
  ctx.drawImage(image, frame.x + (frame.width - width) / 2, frame.y + (frame.height - height) / 2, width, height);
  ctx.restore();
}

function drawFallbackRoom(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#15130f';
  ctx.fillRect(roomFrame.x, roomFrame.y, roomFrame.width, roomFrame.height);
  ctx.fillStyle = '#4a3727';
  ctx.fillRect(275, 225, 260, 220);
  ctx.fillRect(555, 330, 300, 115);
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '38px monospace';
  ctx.fillText('INSIDE ROOM', 435, 142);
}

function drawSearchedRoomText(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'rgba(8, 8, 7, 0.72)';
  ctx.fillRect(360, 78, 420, 132);
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '34px monospace';
  ctx.fillText('DRAWER OPEN', 424, 132);
  ctx.font = '22px monospace';
  ctx.fillText('Press O to leave', 438, 176);
}

function drawRoomLoot(ctx: CanvasRenderingContext2D, loot: ItemKind | 'empty', searched: boolean) {
  if (!searched) return;
  if (loot === 'empty') {
    ctx.fillStyle = '#cfc7b3';
    ctx.font = '22px monospace';
    ctx.fillText('nothing', 610, 374);
    return;
  }
  drawItem(ctx, { id: 'room-loot', kind: loot, x: 660, y: 328, width: 36, height: 38 });
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '20px monospace';
  ctx.fillText(loot.toUpperCase(), 618, 410);
}
