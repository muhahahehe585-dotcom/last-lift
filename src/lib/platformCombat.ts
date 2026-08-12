import { floorY } from './platformLevel';
import { overlaps } from './platformGeometry';
import { damageNest } from './platformNest';
import type { DeathCause, Enemy, PlatformGameState } from './platformTypes';

const slamRadius = 110;
const hitRange = 150;

export function hitPlayer(state: PlatformGameState, damage: number, message: string, cause: DeathCause) {
  if (state.player.hurtCooldown > 0) return state;
  const hp = Math.max(0, state.player.hp - damage);
  return {
    ...state,
    player: { ...state.player, hp, hurtCooldown: 0.8 },
    status: hp <= 0 ? 'lost' : state.status,
    deathCause: hp <= 0 ? cause : state.deathCause,
    message,
  };
}

export function normalHit(state: PlatformGameState) {
  const nestHit = hitNest(state);
  if (nestHit) return nestHit;

  const playerCenter = state.player.x + state.player.width / 2;
  let landed = false;
  const enemies = state.enemies
    .map((enemy) => {
      const enemyCenter = enemy.x + enemy.width / 2;
      const inFront = state.player.facing === 1 ? enemyCenter > playerCenter : enemyCenter < playerCenter;
      const close = Math.abs(enemyCenter - playerCenter) < hitRange && Math.abs(enemy.y - state.player.y) < 150;
      const touching = overlaps({ ...state.player, width: state.player.width + 24 }, enemy);
      if ((inFront && close) || touching) {
        landed = true;
        return { ...enemy, hp: enemy.hp - 2 };
      }
      return enemy;
    })
    .filter((enemy) => enemy.hp > 0);
  return landed ? { ...state, enemies, message: 'Hit landed.' } : { ...state, message: 'Hit missed. Get closer or face the enemy.' };
}

function hitNest(state: PlatformGameState) {
  if (!state.nest) return null;
  const playerCenter = state.player.x + state.player.width / 2;
  const nestCenter = state.nest.x + state.nest.width / 2;
  const inFront = state.player.facing === 1 ? nestCenter > playerCenter : nestCenter < playerCenter;
  const close = Math.abs(nestCenter - playerCenter) < hitRange + 25 && Math.abs(state.nest.y - state.player.y) < 150;
  const touching = overlaps({ ...state.player, width: state.player.width + 28 }, state.nest);
  if (!((inFront && close) || touching)) return null;
  return damageNest(state);
}

export function slamEnemies(state: PlatformGameState) {
  if (!state.player.grounded || state.player.slamCooldown > 0) return state;
  const center = state.player.x + state.player.width / 2;
  const enemies = state.enemies
    .map((enemy) => {
      const enemyCenter = enemy.x + enemy.width / 2;
      const inRange = Math.abs(enemyCenter - center) < slamRadius && enemy.y + enemy.height > floorY - 135;
      return inRange ? { ...enemy, hp: enemy.hp - 3 } : enemy;
    })
    .filter((enemy) => enemy.hp > 0);

  return { ...state, enemies, player: { ...state.player, slamCooldown: 0.35, slamPulse: 0.28 }, message: 'Slam shockwave hit nearby machines.' };
}

export function updateEnemies(state: PlatformGameState, dt: number, blinded: boolean) {
  return state.enemies.map((enemy) => {
    if (enemy.wakeDelay > 0) return { ...enemy, wakeDelay: Math.max(0, enemy.wakeDelay - dt) };
    if (enemy.kind === 'boss') return updateBoss(state, enemy, dt);
    if (state.inVent && enemy.kind === 'vent-monster') return updateVentMonster(state, enemy, dt);
    if (enemy.kind === 'sea-monster') {
      const target = Math.max(enemy.x + enemy.vx * dt, state.player.x - 210);
      return { ...enemy, x: target };
    }
    if (blinded && ['broken-bot', 'bot-guard'].includes(enemy.kind)) return enemy;
    const x = enemy.x + enemy.vx * dt;
    const hitPatrol = x <= enemy.patrolLeft || x + enemy.width >= enemy.patrolRight;
    const hitHole = enemyWouldCrossHole(state, enemy, x);
    return { ...enemy, x: hitPatrol || hitHole ? enemy.x : x, vx: hitPatrol || hitHole ? -enemy.vx : enemy.vx };
  });
}

function updateVentMonster(state: PlatformGameState, enemy: Enemy, dt: number) {
  const nextX = enemy.x - Math.abs(enemy.vx) * dt;
  const minX = state.player.x + state.player.width + 26;
  return { ...enemy, x: Math.max(minX, nextX), y: floorY - 82, vx: -Math.abs(enemy.vx) };
}

function updateBoss(state: PlatformGameState, enemy: Enemy, dt: number) {
  if (Math.abs(state.player.vx) < 5) return { ...enemy, y: floorY - enemy.height, vx: 0 };
  const bossCenter = enemy.x + enemy.width / 2;
  const playerCenter = state.player.x + state.player.width / 2;
  const direction = playerCenter < bossCenter ? -1 : 1;
  const chaseSpeed = 120;
  const leftEdge = 360;
  const rightEdge = 2260;
  const targetX = enemy.x + direction * chaseSpeed * dt;
  const x = Math.max(leftEdge, Math.min(rightEdge - enemy.width, targetX));
  return { ...enemy, x, y: floorY - enemy.height, vx: direction * chaseSpeed };
}

function enemyWouldCrossHole(state: PlatformGameState, enemy: Enemy, x: number) {
  if (enemy.kind === 'drone') return false;
  const front = enemy.vx > 0 ? x + enemy.width + 8 : x - 8;
  return state.holes.some((hole) => front > hole.x && front < hole.x + hole.width);
}
