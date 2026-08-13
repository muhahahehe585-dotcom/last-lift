import { useEffect, useRef } from 'react';
import { viewWidth, worldHeight } from '../../lib/platformLevel';
import type { ItemKind, PlatformGameState } from '../../lib/platformTypes';
import { drawActionHitboxes, type InventoryItem } from './actionHitboxArt';
import { cameraXFor, drawDarkness, drawDoorPrompt, drawHotel } from './platformArt';
import { drawDeathAnimation } from './deathArt';
import { drawEscapeEnding, drawHalfUniverseEnding, drawLastStandEnding, drawRageEnding, drawRanAwayEnding, drawRulerEnding, drawSunsetEnding, drawSuperheroEnding } from './endingArt';
import { drawMeteorShower, drawMeteorThrow } from './meteorArt';
import { drawEnemy, drawItem, drawPlayer } from './spriteArt';
import { drawTrainDuelOverlay } from './trainDuelArt';

type PlatformCanvasProps = {
  state: PlatformGameState;
  onAim: (x: number, y: number) => void;
  onMeteorClick: (x: number, y: number) => void;
  onTrainBullet: () => void;
  onTrainHealth: () => void;
  onTrainDuel: () => void;
  selectedInventory: InventoryItem;
  onUseInventory: (x: number, y: number) => void;
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

export function PlatformCanvas({ state, onAim, onMeteorClick, onTrainBullet, onTrainHealth, onTrainDuel, selectedInventory, onUseInventory }: PlatformCanvasProps) {
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
    if (state.status === 'won' && state.ending === 'ran-away') {
      drawRanAwayEnding(ctx);
      return;
    }
    if (state.status === 'won' && state.ending === 'rage') {
      drawRageEnding(ctx);
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
    drawActionHitboxes(ctx, state, selectedInventory);
    drawPlayerSnap(ctx, state);
    drawRageJump(ctx, state);
    drawMeteorThrow(ctx, state);
    drawBulletTrail(ctx, state);
    ctx.restore();
    drawDarkness(ctx, state, cameraX);
    drawDoorPrompt(ctx, state, cameraX);
    drawRoomInterior(ctx, state);
    drawBossCountdown(ctx, state);
    drawTrainDuelOverlay(ctx, state);
  }, [state, selectedInventory]);

  const aimWithPointer = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!state.duel?.active) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * viewWidth;
    const y = ((event.clientY - rect.top) / rect.height) * worldHeight;
    onAim(x, y);
  };

  const clickMeteor = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = canvasPoint(event);
    if (selectedInventory) {
      onUseInventory(point.x + cameraXFor(state), point.y);
      return;
    }
    onMeteorClick(point.x + cameraXFor(state), point.y);
  };

  const canvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * viewWidth,
      y: ((event.clientY - rect.top) / rect.height) * worldHeight,
    };
  };

  const showTrainChoice = state.duel?.phase === 'choice';

  return (
    <div className="platform-stage">
      <canvas
        className="platform-canvas"
        ref={canvasRef}
        width={viewWidth}
        height={worldHeight}
        onPointerMove={aimWithPointer}
        onPointerDown={clickMeteor}
      />
      {showTrainChoice && (
        <div className="train-choice-buttons">
          <button type="button" onClick={onTrainBullet}>Spend Bullet</button>
          <button type="button" onClick={onTrainHealth}>Sacrifice Health</button>
          <button type="button" onClick={onTrainDuel}>Duel</button>
        </div>
      )}
    </div>
  );
}

function drawRageJump(ctx: CanvasRenderingContext2D, state: PlatformGameState) {
  if (state.rageJumpTimer <= 0) return;
  const t = Math.min(1, state.rageJumpTimer / 2.8);
  const lift = Math.sin(Math.min(1, t / 0.45) * Math.PI * 0.5) * 500;
  const x = state.player.x + 12 + t * 760;
  const y = state.player.y - lift + Math.max(0, t - 0.56) * 940;

  ctx.fillStyle = `rgba(184, 63, 53, ${0.22 + t * 0.38})`;
  ctx.fillRect(state.player.x - 220, state.player.y - 210, 620 + t * 780, 460);

  if (t > 0.42) {
    const roofX = state.player.x + 560;
    const roofY = 168;
    ctx.fillStyle = '#2b302c';
    ctx.fillRect(roofX - 120, roofY + 250, 650, 82);
    ctx.fillStyle = '#596057';
    ctx.fillRect(roofX - 120, roofY + 238, 650, 14);
    drawBurningBossHit(ctx, roofX + 190, roofY + 150, t);
  }

  drawFlamingLaunchHero(ctx, x, y, t);
}

function drawFlamingLaunchHero(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ctx.fillStyle = '#ff8a3d';
  ctx.fillRect(x - 28, y + 22, 96, 140);
  ctx.fillStyle = '#f2dc5d';
  ctx.fillRect(x - 8, y - 8, 52, 126);
  ctx.fillStyle = '#b83f35';
  ctx.fillRect(x + 18, y + 36, 70, 118);
  ctx.fillStyle = '#2a1812';
  ctx.fillRect(x + 8, y - 4, 38, 14);
  ctx.fillStyle = '#f1c08b';
  ctx.fillRect(x + 13, y + 14, 28, 28);
  ctx.fillStyle = '#f4f8ff';
  ctx.fillRect(x + 22, y + 24, 6, 6);
  ctx.fillRect(x + 37, y + 24, 6, 6);
  ctx.fillStyle = '#365f88';
  ctx.fillRect(x + 6, y + 46, 46, 56);
  ctx.fillStyle = `rgba(242, 220, 93, ${0.2 + t * 0.45})`;
  ctx.fillRect(x - 54, y - 42, 160, 240);
}

function drawBurningBossHit(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ctx.fillStyle = '#3c4542';
  ctx.fillRect(x + 52, y + 36, 180, 70);
  ctx.fillStyle = '#0a0b0a';
  ctx.fillRect(x + 86, y, 120, 42);
  ctx.fillStyle = '#111311';
  ctx.fillRect(x + 102, y + 56, 22, 12);
  ctx.fillRect(x + 170, y + 56, 22, 12);
  ctx.fillStyle = '#ff8a3d';
  ctx.fillRect(x + 18, y + 52, 60, 130);
  ctx.fillRect(x + 206, y + 38, 70, 144);
  ctx.fillStyle = '#f2dc5d';
  ctx.fillRect(x + 38, y + 20, 22, 112);
  ctx.fillRect(x + 232, y + 12, 20, 118);
  if (t > 0.72) {
    ctx.fillStyle = `rgba(255, 244, 180, ${(t - 0.72) / 0.28})`;
    ctx.fillRect(x - 140, y - 92, 540, 310);
  }
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
