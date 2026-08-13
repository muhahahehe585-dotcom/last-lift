import { viewWidth, worldHeight } from '../../lib/platformLevel';

function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

export function drawRulerEnding(ctx: CanvasRenderingContext2D) {
  px(ctx, '#090807', 0, 0, viewWidth, worldHeight);
  px(ctx, '#1b1715', 0, 400, viewWidth, 240);
  for (let x = 0; x < viewWidth; x += 90) {
    px(ctx, '#cfc7b3', x + 10, 470, 62, 10);
    px(ctx, '#cfc7b3', x + 28, 452, 10, 44);
    px(ctx, '#8c867a', x + 6, 464, 16, 16);
    px(ctx, '#8c867a', x + 60, 464, 16, 16);
  }

  drawBoneThrone(ctx, 480, 190);
  drawSeatedRuler(ctx, 545, 208);
  drawEndingText(ctx);
}

export function drawSunsetEnding(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, 0, worldHeight);
  sky.addColorStop(0, '#7d3b34');
  sky.addColorStop(0.45, '#f2dc5d');
  sky.addColorStop(1, '#24334a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, viewWidth, worldHeight);
  px(ctx, '#f5c95a', 890, 132, 120, 120);
  px(ctx, '#1b2632', 0, 410, viewWidth, 230);
  px(ctx, '#365f88', 0, 454, viewWidth, 28);
  px(ctx, '#cfc7b3', 495, 365, 230, 22);
  px(ctx, '#2a1812', 565, 314, 58, 18);
  px(ctx, '#f1c08b', 585, 326, 42, 34);
  px(ctx, '#111311', 608, 340, 7, 7);
  px(ctx, '#5e8f86', 585, 348, 28, 5);
  px(ctx, '#365f88', 512, 352, 92, 28);
  px(ctx, '#202329', 472, 372, 78, 20);
  px(ctx, '#202329', 655, 372, 78, 20);
  px(ctx, '#f2dc5d', 520, 292, 38, 8);
  ctx.fillStyle = '#f2dc5d';
  ctx.font = '38px monospace';
  ctx.fillText('WORLD SAVED', 455, 98);
  ctx.fillStyle = '#fff8dc';
  ctx.font = '20px monospace';
  ctx.fillText('He chose good. The tower sleeps under the sunset.', 345, 132);
}

export function drawHalfUniverseEnding(ctx: CanvasRenderingContext2D) {
  px(ctx, '#02030a', 0, 0, viewWidth, worldHeight);
  for (let x = 30; x < viewWidth; x += 74) {
    px(ctx, x % 148 ? '#cfc7b3' : '#f2dc5d', x, 48 + (x * 7) % 520, 4, 4);
  }
  drawHalfPlanet(ctx, 150, 190, 80, '#4aa3ff', '#5e8f86');
  drawHalfPlanet(ctx, 360, 390, 58, '#b83f35', '#f2dc5d');
  drawHalfPlanet(ctx, 610, 230, 110, '#8b5bd6', '#24334a');
  drawHalfPlanet(ctx, 850, 420, 72, '#c49b55', '#7d3b34');
  drawHalfPlanet(ctx, 1030, 170, 48, '#89939a', '#596057');
  px(ctx, 'rgba(242, 220, 93, 0.16)', 0, 0, viewWidth, worldHeight);
  ctx.fillStyle = '#f2dc5d';
  ctx.font = '42px monospace';
  ctx.fillText('HALF THE UNIVERSE', 370, 92);
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '20px monospace';
  ctx.fillText('The snap worked. Only half of every world remains.', 330, 128);
}

function drawHalfPlanet(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, shade: string) {
  px(ctx, color, x, y, size / 2, size);
  px(ctx, shade, x + size / 2 - 8, y + 8, 8, size - 16);
  px(ctx, 'rgba(255,255,255,0.22)', x + 12, y + 16, size / 5, size / 8);
  px(ctx, '#02030a', x + size / 2, y - 6, size / 2 + 14, size + 12);
  px(ctx, 'rgba(242, 220, 93, 0.2)', x - 10, y - 10, size / 2 + 20, size + 20);
}

export function drawLastStandEnding(ctx: CanvasRenderingContext2D) {
  px(ctx, '#101210', 0, 0, viewWidth, worldHeight);
  px(ctx, '#2b302c', 0, 390, viewWidth, 250);
  for (let x = 0; x < viewWidth; x += 120) px(ctx, '#1b1d1c', x, 80, 70, 310);
  drawGunHero(ctx, 210, 292);
  drawRobotLine(ctx, 610, 310);
  drawRobotLine(ctx, 820, 282);
  drawRobotLine(ctx, 1010, 326);
  px(ctx, '#f2dc5d', 355, 330, 240, 6);
  px(ctx, '#f2dc5d', 365, 348, 335, 5);
  px(ctx, '#f2dc5d', 360, 366, 430, 4);
  ctx.fillStyle = '#f2dc5d';
  ctx.font = '42px monospace';
  ctx.fillText('TURNED BACK', 440, 90);
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '20px monospace';
  ctx.fillText('You avoided the challenge, but now you must survive.', 315, 125);
}

export function drawSuperheroEnding(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, 0, worldHeight);
  sky.addColorStop(0, '#18213a');
  sky.addColorStop(1, '#5e8f86');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, viewWidth, worldHeight);
  for (let x = 0; x < viewWidth; x += 110) {
    px(ctx, x % 220 ? '#202329' : '#111923', x, 255 + (x % 3) * 35, 82, 330);
    px(ctx, '#f2dc5d', x + 18, 310 + (x % 5) * 18, 12, 10);
    px(ctx, '#f2dc5d', x + 52, 370 + (x % 4) * 14, 12, 10);
  }
  ctx.strokeStyle = '#f4f8ff';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(620, 245);
  ctx.quadraticCurveTo(700, 120, 860, 72);
  ctx.stroke();
  drawSwingHero(ctx, 585, 238);
  ctx.fillStyle = '#f2dc5d';
  ctx.font = '44px monospace';
  ctx.fillText('SUPERHERO', 470, 92);
  ctx.fillStyle = '#fff8dc';
  ctx.font = '20px monospace';
  ctx.fillText('He swings across the city as its new protector.', 360, 126);
}

export function drawEscapeEnding(ctx: CanvasRenderingContext2D) {
  px(ctx, '#101210', 0, 0, viewWidth, worldHeight);
  const sky = ctx.createLinearGradient(0, 0, 0, worldHeight);
  sky.addColorStop(0, '#171817');
  sky.addColorStop(0.55, '#24334a');
  sky.addColorStop(1, '#111311');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, viewWidth, worldHeight);
  for (let x = 35; x < viewWidth; x += 120) {
    px(ctx, x % 240 ? '#202329' : '#111923', x, 320 + (x % 3) * 24, 74, 260);
    px(ctx, '#f2dc5d', x + 18, 360 + (x % 4) * 22, 10, 8);
    px(ctx, '#f2dc5d', x + 48, 430 + (x % 5) * 12, 10, 8);
  }
  px(ctx, '#2b302c', 0, 472, viewWidth, 168);
  for (let x = 0; x < viewWidth; x += 86) px(ctx, '#3c4542', x + 10, 506, 58, 7);
  drawDefeatedBoss(ctx, 438, 340);
  drawSwordHero(ctx, 570, 254);
  ctx.fillStyle = '#f2dc5d';
  ctx.font = '42px monospace';
  ctx.fillText('LAST LIFT ESCAPED', 360, 92);
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '20px monospace';
  ctx.fillText('The boss is down. The survivor stands above him.', 330, 128);
}

export function drawRanAwayEnding(ctx: CanvasRenderingContext2D) {
  px(ctx, '#080908', 0, 0, viewWidth, worldHeight);
  px(ctx, '#242820', 120, 145, 960, 405);
  px(ctx, '#151611', 150, 178, 900, 330);
  px(ctx, '#30352b', 150, 476, 900, 32);
  for (let x = 185; x < 1000; x += 160) drawSupplyShelf(ctx, x, 230);
  px(ctx, '#5e8f86', 920, 340, 80, 92);
  px(ctx, '#c49b55', 918, 324, 84, 18);
  px(ctx, '#b83f35', 950, 365, 18, 18);
  px(ctx, '#f2dc5d', 160, 185, 820, 8);
  px(ctx, 'rgba(242, 220, 93, 0.18)', 260, 190, 540, 250);
  px(ctx, 'rgba(184, 63, 53, 0.2)', 0, 0, viewWidth, worldHeight);
  drawCorneredHero(ctx, 240, 350);
  drawThreatBot(ctx, 470, 355, 1.25);
  drawThreatBot(ctx, 640, 365, 1.1);
  drawThreatBot(ctx, 790, 348, 1.25);
  drawThreatDrone(ctx, 520, 245);
  drawThreatDrone(ctx, 690, 230);
  drawThreatDrone(ctx, 850, 260);
  ctx.fillStyle = '#f2dc5d';
  ctx.font = '46px monospace';
  ctx.fillText('RAN AWAY', 475, 90);
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '20px monospace';
  ctx.fillText('He went away like a coward.', 445, 128);
  ctx.fillText('The world collapsed because he was scared.', 375, 158);
}

function drawSupplyShelf(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#6f543b', x, y, 90, 18);
  px(ctx, '#6f543b', x, y + 62, 90, 18);
  px(ctx, '#596057', x + 8, y - 28, 24, 28);
  px(ctx, '#f2dc5d', x + 44, y - 20, 20, 20);
  px(ctx, '#cfc7b3', x + 12, y + 34, 28, 20);
  px(ctx, '#b83f35', x + 56, y + 28, 22, 28);
}

function drawCorneredHero(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#30352b', x - 54, y - 72, 22, 210);
  px(ctx, '#30352b', x - 54, y + 118, 210, 22);
  px(ctx, '#2a1812', x + 10, y - 10, 38, 14);
  px(ctx, '#f1c08b', x + 13, y + 4, 34, 34);
  px(ctx, '#f4f8ff', x + 19, y + 14, 7, 7);
  px(ctx, '#f4f8ff', x + 36, y + 14, 7, 7);
  px(ctx, '#111311', x + 25, y + 26, 5, 5);
  px(ctx, '#111311', x + 25, y + 30, 18, 4);
  px(ctx, '#111311', x + 25, y + 34, 5, 5);
  px(ctx, '#f1c08b', x + 48, y + 35, 18, 36);
  px(ctx, '#f1c08b', x - 9, y + 38, 18, 34);
  px(ctx, '#365f88', x + 6, y + 42, 48, 62);
  px(ctx, '#202329', x + 7, y + 104, 15, 48);
  px(ctx, '#202329', x + 38, y + 104, 15, 48);
  px(ctx, '#f2dc5d', x + 4, y - 30, 8, 8);
  px(ctx, '#f2dc5d', x + 52, y - 28, 8, 8);
}

function drawThreatBot(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const w = (value: number) => value * scale;
  px(ctx, '#4d5650', x + w(8), y, w(42), w(20));
  px(ctx, '#6f7b72', x, y + w(20), w(58), w(50));
  px(ctx, '#b83f35', x + w(15), y + w(9), w(30), w(7));
  px(ctx, '#3c4542', x - w(10), y + w(32), w(12), w(48));
  px(ctx, '#3c4542', x + w(56), y + w(32), w(12), w(48));
  px(ctx, '#222726', x + w(12), y + w(70), w(14), w(38));
  px(ctx, '#222726', x + w(36), y + w(70), w(14), w(38));
}

function drawThreatDrone(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#2d3335', x, y + 18, 70, 12);
  px(ctx, '#8b969d', x + 18, y, 34, 34);
  px(ctx, '#b83f35', x + 30, y + 14, 10, 7);
  px(ctx, '#596057', x - 24, y + 17, 24, 6);
  px(ctx, '#596057', x + 70, y + 17, 24, 6);
}

function drawSwingHero(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#b83f35', x + 26, y, 28, 28);
  px(ctx, '#f4f8ff', x + 34, y + 10, 6, 5);
  px(ctx, '#f4f8ff', x + 45, y + 10, 6, 5);
  px(ctx, '#365f88', x + 18, y + 28, 48, 52);
  px(ctx, '#b83f35', x + 62, y + 34, 54, 12);
  px(ctx, '#b83f35', x - 24, y + 44, 46, 12);
  px(ctx, '#202329', x + 22, y + 78, 18, 58);
  px(ctx, '#202329', x + 52, y + 74, 18, 58);
}

function drawDefeatedBoss(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#202329', x + 45, y + 86, 250, 78);
  px(ctx, '#5b6368', x + 96, y + 38, 132, 58);
  px(ctx, '#1a1515', x + 112, y + 12, 106, 34);
  px(ctx, '#111311', x + 122, y + 58, 18, 10);
  px(ctx, '#111311', x + 184, y + 58, 18, 10);
  px(ctx, '#b83f35', x + 145, y + 78, 58, 8);
  px(ctx, '#7c8781', x, y + 112, 92, 28);
  px(ctx, '#7c8781', x + 270, y + 104, 92, 28);
  px(ctx, '#3c4542', x + 86, y + 156, 54, 34);
  px(ctx, '#3c4542', x + 202, y + 156, 54, 34);
  px(ctx, '#c49b55', x + 326, y + 96, 42, 30);
  px(ctx, '#4aa3ff', x + 334, y + 104, 8, 8);
  px(ctx, '#b83f35', x + 350, y + 103, 8, 8);
  px(ctx, '#5e8f86', x + 342, y + 116, 8, 8);
}

function drawSwordHero(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#2a1812', x + 8, y - 4, 38, 14);
  px(ctx, '#3b2118', x + 2, y + 6, 12, 16);
  px(ctx, '#f1c08b', x + 13, y + 14, 28, 28);
  px(ctx, '#111311', x + 34, y + 26, 5, 5);
  px(ctx, '#7d3b34', x + 24, y + 36, 10, 3);
  px(ctx, '#1b2632', x + 6, y + 46, 46, 20);
  px(ctx, '#365f88', x + 6, y + 66, 46, 36);
  px(ctx, '#cfc7b3', x + 18, y + 69, 9, 24);
  px(ctx, '#f1c08b', x - 12, y + 52, 18, 42);
  px(ctx, '#f1c08b', x + 50, y + 48, 18, 42);
  px(ctx, '#202329', x + 10, y + 102, 14, 48);
  px(ctx, '#202329', x + 38, y + 102, 14, 48);
  px(ctx, '#111311', x + 2, y + 146, 26, 10);
  px(ctx, '#111311', x + 34, y + 146, 26, 10);
  px(ctx, '#89939a', x + 58, y - 62, 8, 132);
  px(ctx, '#cfc7b3', x + 54, y + 28, 18, 8);
  px(ctx, '#6f543b', x + 58, y + 36, 10, 28);
}

function drawGunHero(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#2a1812', x + 24, y - 34, 50, 16);
  px(ctx, '#f1c08b', x + 34, y - 18, 36, 34);
  px(ctx, '#111311', x + 60, y - 4, 6, 6);
  px(ctx, '#5e8f86', x + 44, y + 10, 22, 4);
  px(ctx, '#365f88', x + 18, y + 20, 60, 78);
  px(ctx, '#f1c08b', x + 75, y + 38, 55, 16);
  px(ctx, '#89939a', x + 116, y + 35, 70, 12);
  px(ctx, '#202329', x + 36, y + 98, 18, 58);
  px(ctx, '#202329', x + 68, y + 98, 18, 58);
}

function drawRobotLine(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#6f7b72', x + 8, y, 46, 58);
  px(ctx, '#4d5650', x + 14, y - 18, 34, 18);
  px(ctx, '#b83f35', x + 20, y - 10, 22, 6);
  px(ctx, '#3c4542', x - 2, y + 18, 12, 42);
  px(ctx, '#3c4542', x + 54, y + 18, 12, 42);
  px(ctx, '#222726', x + 15, y + 58, 12, 34);
  px(ctx, '#222726', x + 38, y + 58, 12, 34);
}

function drawBoneThrone(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#cfc7b3', x + 18, y + 30, 180, 160);
  px(ctx, '#8c867a', x + 42, y + 52, 132, 124);
  for (let i = 0; i < 6; i += 1) {
    px(ctx, '#e8e0cf', x + i * 34, y + 6, 18, 190);
    px(ctx, '#f4eddf', x + i * 34 - 5, y, 28, 18);
  }
  px(ctx, '#cfc7b3', x - 30, y + 112, 86, 22);
  px(ctx, '#cfc7b3', x + 160, y + 112, 86, 22);
  px(ctx, '#8c867a', x + 20, y + 184, 190, 40);
}

function drawSeatedRuler(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#f2dc5d', x + 13, y - 28, 58, 22);
  px(ctx, '#f2dc5d', x + 18, y - 48, 10, 24);
  px(ctx, '#f2dc5d', x + 39, y - 56, 10, 30);
  px(ctx, '#f2dc5d', x + 61, y - 46, 10, 22);
  px(ctx, '#2a1812', x + 16, y - 5, 56, 18);
  px(ctx, '#f1c08b', x + 24, y + 8, 42, 38);
  px(ctx, '#111311', x + 34, y + 21, 8, 8);
  px(ctx, '#111311', x + 55, y + 21, 8, 8);
  px(ctx, '#b83f35', x + 34, y + 35, 30, 7);
  px(ctx, '#111311', x + 38, y + 34, 22, 3);
  px(ctx, '#1b2632', x + 18, y + 50, 62, 70);
  px(ctx, '#365f88', x + 6, y + 74, 86, 48);
  px(ctx, '#f1c08b', x - 20, y + 72, 30, 22);
  px(ctx, '#f1c08b', x + 84, y + 72, 30, 22);
  px(ctx, '#f1c08b', x - 24, y + 94, 20, 18);
  px(ctx, '#f1c08b', x + 108, y + 94, 20, 18);
  px(ctx, '#202329', x + 4, y + 120, 38, 22);
  px(ctx, '#202329', x + 58, y + 120, 38, 22);
  px(ctx, '#202329', x - 18, y + 142, 30, 18);
  px(ctx, '#202329', x + 90, y + 142, 30, 18);
  px(ctx, '#111311', x - 24, y + 158, 42, 12);
  px(ctx, '#111311', x + 84, y + 158, 42, 12);
}

function drawEndingText(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#f2dc5d';
  ctx.font = '42px monospace';
  ctx.fillText('RULER OF THE EARTH?', 345, 95);
  ctx.fillStyle = '#cfc7b3';
  ctx.font = '20px monospace';
  ctx.fillText('The gauntlet chose him. That was not mercy.', 350, 130);
}
