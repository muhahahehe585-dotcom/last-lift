import { useEffect, useRef } from 'react';
import { viewWidth, worldHeight } from '../../lib/platformLevel';
import type { ItemKind, PlatformGameState } from '../../lib/platformTypes';
import { cameraXFor, drawDarkness, drawDoorPrompt, drawHotel } from './platformArt';
import { drawDeathAnimation } from './deathArt';
import { drawEscapeEnding, drawHalfUniverseEnding, drawLastStandEnding, drawRulerEnding, drawSunsetEnding, drawSuperheroEnding } from './endingArt';
import { drawMeteorShower, drawMeteorThrow } from './meteorArt';
import { drawEnemy, drawItem, drawPlayer } from './spriteArt';

type PlatformCanvasProps = {
  state: PlatformGameState;
  onAim: (x: number, y: number) => void;
  onMeteorClick: (x: number, y: number) => void;
};

function drawRoomInterior(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  const room = state.currentRoom;
  if (!room) return;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
  ctx.fillRect(0, 0, viewWidth, worldHeight);
  ctx.fillStyle = '#15130f';
  ctx.fillRect(210, 95, 780, 430);
  ctx.fillStyle = '#27221b';
  ctx.fillRect(238, 125, 724, 320);
  ctx.fillStyle = '#4a3727';
  ctx.fillRect(275, 355, 660, 42);
  ctx.fillStyle = '#3a2b20';
  ctx.fillRect(305, 250, 180, 96);
  ctx.fillRect(710, 276, 145, 62);
  ctx.fillStyle = '#6f543b';
  ctx.fillRect(512, 292, 96, 54);
  ctx.fillStyle = '#c49b55';
  ctx.fillRect(552, 312, 10, 8);
  ctx.fillStyle = '#1b1a16';
  ctx.fillRect(760, 155, 92, 80);
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '24px monospace';
  ctx.fillText(room.searched ? 'DRAWER OPEN' : 'INSIDE ROOM', 455, 185);
  ctx.font = '18px monospace';
  ctx.fillText(room.searched ? 'Press O to leave' : 'Press E to open drawer', 475, 220);
  drawRoomLoot(ctx, room.loot, room.searched);
}

function drawRoomLoot(ctx: CanvasRenderingContext2D, loot: ItemKind | 'empty', searched: boolean) {
  if (!searched) return;
  if (loot === 'empty') {
    ctx.fillStyle = '#6f756d';
    ctx.font = '20px monospace';
    ctx.fillText('nothing', 548, 395);
    return;
  }
  drawItem(ctx, { id: 'room-loot', kind: loot, x: 548, y: 365, width: 32, height: 34 });
  ctx.fillStyle = '#111311';
  ctx.font = '18px monospace';
  ctx.fillText(loot.toUpperCase(), 510, 435);
}

export function PlatformCanvas({ state, onAim, onMeteorClick }: PlatformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const cameraX = cameraXFor(state);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, viewWidth, worldHeight);
    if (state.status === 'won' && state.ending === 'ruler') {
      drawRulerEnding(ctx);
      return;
    }
    if (state.status === 'won' && state.ending === 'half-universe') {
      drawHalfUniverseEnding(ctx);
      return;
    }
    if (state.status === 'won' && state.ending === 'sunset') {
      drawSunsetEnding(ctx);
      return;
    }
    if (state.status === 'won' && state.ending === 'superhero') {
      drawSuperheroEnding(ctx);
      return;
    }
    if (state.status === 'won' && state.ending === 'last-stand') {
      drawLastStandEnding(ctx);
      return;
    }
    if (state.status === 'won' && state.ending === 'escape') {
      drawEscapeEnding(ctx);
      return;
    }
    ctx.save();
    ctx.translate(-cameraX, 0);
    drawHotel(ctx, state);
    drawMeteorShower(ctx, state);
    state.items.forEach((item) => drawItem(ctx, item));
    state.enemies.forEach((enemy) => drawEnemy(ctx, enemy));
    if (state.status === 'lost') drawDeathAnimation(ctx, state);
    else drawPlayer(ctx, state);
    drawPlayerSnap(ctx, state);
    drawMeteorThrow(ctx, state);
    drawBulletTrail(ctx, state);
    ctx.restore();
    drawDarkness(ctx, state, cameraX);
    drawDoorPrompt(ctx, state, cameraX);
    drawRoomInterior(ctx, state);
    drawBossCountdown(ctx, state);
    drawDuel(ctx, state);
  }, [state]);

  const aimWithPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!state.duel?.active) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * viewWidth;
    const y = ((event.clientY - rect.top) / rect.height) * worldHeight;
    onAim(x, y);
  };

  const clickMeteor = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = canvasPoint(event);
    onMeteorClick(point.x + cameraXFor(state), point.y);
  };

  const canvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * viewWidth,
      y: ((event.clientY - rect.top) / rect.height) * worldHeight,
    };
  };

  return (
    <canvas
      className="platform-canvas"
      ref={canvasRef}
      width={viewWidth}
      height={worldHeight}
      onPointerMove={aimWithPointer}
      onPointerDown={clickMeteor}
    />
  );
}

function drawBulletTrail(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (!state.bulletTrail) return;
  ctx.strokeStyle = '#f2dc5d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(state.bulletTrail.x, state.bulletTrail.y);
  ctx.lineTo(state.bulletTrail.x + state.bulletTrail.width, state.bulletTrail.y);
  ctx.stroke();
}

function drawPlayerSnap(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.gauntletSnapTimer <= 0) return;
  const p = state.player;
  const t = Math.min(1, state.gauntletSnapTimer / 2.2);
  const handX = p.x + (p.facing === 1 ? 32 : -18);
  const handY = p.y + 6 - t * 18;
  ctx.fillStyle = `rgba(242, 220, 93, ${0.18 + t * 0.42})`;
  ctx.fillRect(p.x - 48, p.y - 62, 132, 142);
  ctx.fillStyle = '#c49b55';
  ctx.fillRect(handX, handY, 22, 20);
  ctx.fillStyle = '#f2dc5d';
  ctx.fillRect(handX + 3, handY - 20, 5, 22);
  ctx.fillRect(handX + 9, handY - 24, 5, 26);
  ctx.fillRect(handX + 15, handY - 17, 5, 19);
  ['#4aa3ff', '#b83f35', '#5e8f86', '#8b5bd6', '#ff8a3d', '#f2dc5d'].forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.fillRect(handX - 34 + index * 14, handY - 38 - Math.sin(t * 8 + index) * 8, 7, 7);
  });
  if (t > 0.78) {
    ctx.fillStyle = `rgba(255, 244, 180, ${(t - 0.78) / 0.22})`;
    ctx.fillRect(p.x - 220, p.y - 170, 520, 360);
  }
}

function drawDuel(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  const duel = state.duel;
  if (!duel?.active) return;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
  ctx.fillRect(0, 0, viewWidth, worldHeight);
  ctx.fillStyle = '#2b302c';
  ctx.fillRect(575, 190, 160, 250);
  ctx.fillStyle = '#4aa3ff';
  ctx.fillRect(620, 225, 70, 18);
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '18px monospace';
  ctx.fillText(`Focus ${Math.round(duel.focus)} | You ${duel.playerMarks} Guard ${Math.floor(duel.guardMarks)}`, 360, 95);
  ctx.fillText('Mash Space. Aim with movement. Press F to mark.', 330, 125);
  ctx.strokeStyle = '#f2dc5d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(duel.crosshairX - 18, duel.crosshairY);
  ctx.lineTo(duel.crosshairX + 18, duel.crosshairY);
  ctx.moveTo(duel.crosshairX, duel.crosshairY - 18);
  ctx.lineTo(duel.crosshairX, duel.crosshairY + 18);
  ctx.stroke();
}

function drawBossCountdown(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.floor !== 100 || state.status !== 'playing') return;
  const minutes = Math.floor(state.bossTimeLeft / 60);
  const seconds = state.bossTimeLeft % 60;
  const time = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  ctx.fillStyle = 'rgba(17, 19, 17, 0.78)';
  ctx.fillRect(390, 22, 420, 76);
  ctx.fillStyle = state.bossTimeLeft < 60 ? '#b83f35' : '#f2dc5d';
  ctx.font = '34px monospace';
  ctx.fillText(`GAUNTLET ${time}`, 436, 70);
}
