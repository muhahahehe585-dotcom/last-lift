import { bossEscapeDoor, createLevel, finalFloor, finalVentMonsterFor, floorY, rageFire, worldWidth } from './platformLevel';
import { overlaps } from './platformGeometry';
import { hitPlayer, normalHit, slamEnemies, updateEnemies } from './platformCombat';
import { updateBossHazards } from './bossHazards';
import { applyEventDamage } from './platformHazards';
import { collectItems, handleActionInputs, ventBossPlatforms } from './platformInteractions';
import { startTrainDuel, updateTrainDuel } from './trainDuel';
import type { InputState, PlatformGameState } from './platformTypes';
import { awardCoins, awardFloorCoin } from './progress';

const gravity = 1700;
const moveSpeed = 250;
const runSpeed = 390;
const staminaDrain = 24;
const staminaRecover = 9;
const jumpPower = 680;
const slamSpeed = 1050;
const liftX = worldWidth - 120;
const trainGuardX = worldWidth - 380;
export const dodgeRadius = 150;
const dodgeGap = 18;

function tryLift(state: PlatformGameState) {
  const atLift = state.player.x + state.player.width > liftX;
  if (!atLift || state.floor === finalFloor) return state;
  if (state.mode !== 'flood' && state.batteries < state.batteriesNeeded) return { ...state, message: 'The lift still needs more batteries.' };
  awardFloorCoin();
  return createLevel(state.floor + 1, state.player.hp, getCarry(state));
}

function tryBossRunAwayDoor(state: PlatformGameState) {
  if (state.floor !== finalFloor || !state.bossDodged) return state;
  const playerCenter = state.player.x + state.player.width / 2;
  const doorCenter = bossEscapeDoor.x + bossEscapeDoor.width / 2;
  if (Math.abs(playerCenter - doorCenter) > 95) return state;
  return {
    ...state,
    status: 'won' as const,
    ending: 'ran-away' as const,
    message: 'RAN AWAY.',
  };
}

function tryTrainGuard(state: PlatformGameState) {
  if (state.mode !== 'train') return state;
  const atGuard = state.player.x + state.player.width > trainGuardX;
  if (!atGuard) return state;
  return startTrainDuel({
    ...state,
    player: { ...state.player, x: trainGuardX - state.player.width - 12, vx: 0 },
  });
}

function tryVentBossFight(state: PlatformGameState) {
  if (!state.inVent) return state;
  const chaserAlive = state.enemies.some((enemy) => enemy.id.startsWith('vent-chaser'));
  if (chaserAlive) return state;
  const finalAlive = state.enemies.some((enemy) => enemy.id.startsWith('vent-final'));
  if (finalAlive) return state;
  awardFloorCoin();
  if (state.tutorialRun) {
    return {
      ...createLevel(state.floor + 1, state.player.hp, getCarry(state)),
      message: 'Tutorial floor 13 complete. Press 0 or Menu when you want to leave.',
    };
  }
  return {
    ...state,
    status: 'won' as const,
    ending: 'sunset' as const,
    message: 'Vent boss defeated. Sunset ending unlocked.',
  };
}

function tryVentHallwayBoss(state: PlatformGameState) {
  if (!state.inVent || state.player.x < 1960) return state;
  const hasChaser = state.enemies.some((enemy) => enemy.id.startsWith('vent-chaser'));
  const hasFinal = state.enemies.some((enemy) => enemy.id.startsWith('vent-final'));
  if (!hasChaser || hasFinal) return state;
  return {
    ...state,
    enemies: [
      ...state.enemies.filter((enemy) => !enemy.id.startsWith('vent-chaser')),
      finalVentMonsterFor(state.floor),
    ],
    boxes: ventBossPlatforms,
    holes: [],
    player: { ...state.player, x: 1975, y: floorY - 106, vy: 0, grounded: true },
    message: 'The chase monster crashes behind you. Boss fight.',
  };
}

function tryTurnedBackDoor(state: PlatformGameState, player: PlatformGameState['player']) {
  if (state.tutorialRun || state.floor !== 1 || state.inVent || player.x > 14 || player.vx >= 0) return null;
  const coins = awardCoins(100);
  return {
    ...state,
    player,
    status: 'won' as const,
    ending: 'last-stand' as const,
    coins,
    message: 'TURNED BACK. You avoided the challenge, but now you must survive.',
  };
}

function getCarry(state: PlatformGameState) {
  return {
    flashlights: state.flashlights,
    medkits: state.medkits,
    hasGun: state.hasGun,
    shots: state.shots,
    revolverLoaded: state.revolverLoaded,
    reloadTimer: state.reloadTimer,
    unlimitedGun: state.unlimitedGun,
    infinityStones: state.infinityStones,
    stamina: state.player.stamina,
    armorCount: state.armorCount,
    maxHp: state.player.maxHp,
    tutorialRun: state.tutorialRun,
  };
}

function overHole(state: PlatformGameState, playerX: number) {
  const feet = playerX + state.player.width / 2;
  return state.holes.some((hole) => feet > hole.x + 8 && feet < hole.x + hole.width - 8);
}

function boxUnderPlayer(state: PlatformGameState, playerX: number, playerBottom: number) {
  const feet = playerX + state.player.width / 2;
  return state.boxes.find((box) => feet > box.x && feet < box.x + box.width && playerBottom >= box.y && playerBottom <= box.y + 42);
}

export function updatePlatformGame(state: PlatformGameState, input: InputState, dt: number): PlatformGameState {
  if (state.status === 'lost') return { ...state, deathTimer: state.deathTimer + dt };
  if (state.status !== 'playing') return state;
  state = updateGunReload(state, dt);
  if (state.rageJumpTimer > 0) return updateRageJump(state, dt);
  if (state.meteorThrowTimer > 0) return updateMeteorThrow(state, dt);
  if (state.gauntletSnapTimer > 0) return updateGauntletSnap(state, dt);
  if (state.duel) return updateTrainDuel(state, input, dt);
  if (input.shortcutPressed && state.floor === finalFloor && Math.abs(state.player.vx) < 5) {
    return { ...state, bossTimeLeft: Math.min(state.bossTimeLeft, 10), message: 'Gauntlet test shortcut: 10 seconds left.' };
  }
  if (input.gauntletPressed) return useInfinityGauntlet(state);
  if (input.interactPressed) {
    const runaway = tryBossRunAwayDoor(state);
    if (runaway !== state) return runaway;
  }
  const actionState = handleActionInputs(state, input, dt);
  if (actionState !== state || state.currentRoom) return actionState;
  if (input.hitPressed) return normalHit(state);

  let running = state.inVent ? true : input.runPressed ? !state.player.running : state.player.running;
  let stamina = state.player.stamina;
  if (running && (input.left || input.right)) stamina = Math.max(0, stamina - staminaDrain * dt);
  if (!running) stamina = Math.min(100, stamina + staminaRecover * dt);
  if (stamina <= 0) running = false;
  const speed = running ? runSpeed : moveSpeed;
  const vx = input.left ? -speed : input.right ? speed : 0;
  const canDoubleJump = state.doubleJumpUnlocked && !state.player.grounded && !state.player.doubleJumpUsed;
  const wantsGroundJump = input.jumpPressed && state.player.grounded;
  const wantsDoubleJump = input.doubleJumpPressed && canDoubleJump;
  const wantsJump = wantsGroundJump || wantsDoubleJump;
  const jump = wantsJump ? -jumpPower : state.player.vy;
  const isSlamming = state.player.isSlamming || (!wantsJump && !state.player.grounded && input.slamPressed);
  const slam = isSlamming ? slamSpeed : jump;
  const player = {
    ...state.player,
    vx,
    vy: slam + gravity * dt,
    stamina,
    running,
    isSlamming,
    doubleJumpUsed: wantsDoubleJump ? true : state.player.doubleJumpUsed,
    doubleJumpPulse: wantsDoubleJump ? 0.34 : state.player.doubleJumpPulse,
    facing: vx < 0 ? -1 : vx > 0 ? 1 : state.player.facing,
  };
  player.x = Math.max(0, Math.min(worldWidth - player.width, player.x + player.vx * dt));
  player.y += player.vy * dt;
  if (state.inVent) {
    player.height = 72;
  }
  player.slamCooldown = Math.max(0, player.slamCooldown - dt);
  player.slamPulse = Math.max(0, player.slamPulse - dt);
  player.dodgeCooldown = Math.max(0, player.dodgeCooldown - dt);
  player.dodgePulse = Math.max(0, player.dodgePulse - dt);
  player.hitPulse = Math.max(0, player.hitPulse - dt);
  player.shootPulse = Math.max(0, player.shootPulse - dt);
  player.doubleJumpPulse = Math.max(0, player.doubleJumpPulse - dt);
  player.hurtCooldown = Math.max(0, player.hurtCooldown - dt);

  const wasAirSlamming = player.isSlamming;
  const turnedBackEnding = tryTurnedBackDoor(state, player);
  if (turnedBackEnding) return turnedBackEnding;

  if (player.y > floorY + 130) {
    return {
      ...state,
      player: { ...player, hp: 0 },
      status: 'lost',
      deathCause: 'fall',
      message: state.inVent ? 'The vent drops into darkness.' : 'You fell through the broken hotel floor.',
    };
  }

  const box = boxUnderPlayer(state, player.x, player.y + player.height);
  if (box && player.vy >= 0) {
    player.y = box.y - player.height;
    player.vy = 0;
    player.grounded = true;
    player.isSlamming = false;
    player.doubleJumpUsed = false;
  } else if (player.y + player.height >= floorY && !overHole(state, player.x)) {
    player.y = floorY - player.height;
    player.vy = 0;
    player.grounded = true;
    player.isSlamming = false;
    player.doubleJumpUsed = false;
  } else {
    player.grounded = false;
  }

  const blinded = state.botBlindTime > 0;
  const bulletTrail = updateBulletTrail(state, dt);
  let next = collectItems({
    ...state,
    player,
    bulletTrail,
    meteorites: updateMeteorites(state, dt),
    botBlindTime: Math.max(0, state.botBlindTime - dt),
    enemies: updateEnemies({ ...state, player }, dt, blinded),
  });
  next = tryDodge(next, input);
  next = updateVentSpawns(next, dt);
  next = updateVentClaws(next, dt);
  next = applyEventDamage(next, dt);
  next = updateBossHazards(next, dt);
  if (next.status !== 'playing') return next;
  const shootingDrone = next.enemies.find((enemy) => enemy.kind === 'drone' && Math.abs(enemy.x - next.player.x) < 220 && Math.abs(enemy.y - next.player.y) < 95);
  if (shootingDrone && !next.bulletTrail) {
    next = {
      ...next,
      bulletTrail: {
        x: shootingDrone.x + shootingDrone.width / 2,
        y: shootingDrone.y + 18,
        width: next.player.x + next.player.width / 2 - (shootingDrone.x + shootingDrone.width / 2),
        height: next.player.y + next.player.height / 2 - (shootingDrone.y + 18),
        targetX: next.player.x + next.player.width / 2,
        targetY: next.player.y + next.player.height / 2,
        progress: 0,
        damage: 4,
      },
    };
    next = { ...next, enemies: next.enemies.map((enemy) => (enemy.id === shootingDrone.id ? { ...enemy, attackPulse: 0.34 } : enemy)) };
    if (next.status !== 'playing') return next;
  }
  if (next.bulletTrail?.damage && (next.bulletTrail.progress ?? 0) >= 1) {
    next = hitPlayer(next, next.bulletTrail.damage, 'Drone shot you.', 'drone');
    next = { ...next, bulletTrail: null, player: { ...next.player, hurtCooldown: Math.max(next.player.hurtCooldown, 1.2) } };
    if (next.status !== 'playing') return next;
  }
  if (wasAirSlamming && player.grounded) next = slamEnemies(next);
  next = tryVentHallwayBoss(next);
  const touchingEnemy = next.enemies.find((enemy) => overlaps(next.player, enemy));
  if (next.inVent && touchingEnemy?.id.startsWith('vent-chaser') && touchingEnemy.wakeDelay <= 0) {
    return { ...next, status: 'lost', deathCause: 'bot', player: { ...next.player, hp: 0 }, message: 'The vent monster caught you.' };
  }
  if (touchingEnemy?.kind === 'sea-monster') {
    return { ...next, status: 'lost', deathCause: 'flood', player: { ...next.player, hp: 0 }, message: 'The sea monster caught you.' };
  }
  if (touchingEnemy) {
    if (touchingEnemy.kind === 'boss' && Math.abs(next.player.vx) < 5) return next;
    const cause = touchingEnemy.kind === 'drone' ? 'drone' : touchingEnemy.kind === 'bot-guard' ? 'guard' : touchingEnemy.kind === 'boss' ? 'boss' : 'bot';
    next = startEnemyAttack(next, touchingEnemy.id);
    next = touchingEnemy.kind === 'broken-bot' && Math.abs(next.player.vx) < 5
      ? damagePlayerPerSecond(next, 5, dt, 'broken-bot is hitting you.', 'bot')
      : hitPlayer(next, damageForEnemyTouch(next, touchingEnemy.kind), `${touchingEnemy.kind} hit you.`, cause);
  }
  next = tryVentBossFight(next);
  next = tryTrainGuard(next);
  if (input.interactPressed) next = tryBossRunAwayDoor(next);
  next = tryLift(next);

  return next;
}

function damagePlayerPerSecond(state: PlatformGameState, damagePerSecond: number, dt: number, message: string, cause: NonNullable<PlatformGameState['deathCause']>) {
  const hp = Math.max(0, state.player.hp - damagePerSecond * dt);
  return {
    ...state,
    player: { ...state.player, hp },
    status: hp <= 0 ? 'lost' as const : state.status,
    deathCause: hp <= 0 ? cause : state.deathCause,
    message,
  };
}

function updateBulletTrail(state: PlatformGameState, dt: number) {
  const trail = state.bulletTrail;
  if (!trail) return null;
  if (trail.damage) {
    const progress = Math.min(1, (trail.progress ?? 0) + dt * 5.2);
    return { ...trail, progress };
  }
  const height = trail.height - dt;
  return height > 0 ? { ...trail, height } : null;
}

function updateVentClaws(state: PlatformGameState, dt: number) {
  if (!state.inVent) return state;
  let ventSpawnTimer = state.ventSpawnTimer - dt;
  if (ventSpawnTimer <= 0) ventSpawnTimer = 2.8;
  let next = { ...state, ventSpawnTimer };
  const active = ventSpawnTimer <= 0.7;
  const dodging = next.player.dodgePulse > 0 || next.player.hurtCooldown > 0;
  const clawHit = [510, 925, 1340, 1745].some((x) => overlaps(next.player, { x: x - 78, y: 54, width: 156, height: floorY - 104 }));
  if (active && clawHit && !dodging) {
    next = hitPlayer(next, 16, 'Ceiling claws dropped from the vent.', 'bot');
  }
  return next;
}

function startEnemyAttack(state: PlatformGameState, enemyId: string) {
  return {
    ...state,
    enemies: state.enemies.map((enemy) => (enemy.id === enemyId ? { ...enemy, attackPulse: 0.34 } : enemy)),
  };
}

function tryDodge(state: PlatformGameState, input: InputState) {
  if (!input.dodgePressed || state.player.dodgeCooldown > 0) return state;
  const radius = state.inVent ? 360 : dodgeRadius;
  const enemy = state.enemies.find((item) => distanceBetweenCenters(state.player, item) <= radius);
  if (!enemy && state.inVent) return ventDodge(state);
  if (!enemy) return state;
  const playerCenter = state.player.x + state.player.width / 2;
  const enemyCenter = enemy.x + enemy.width / 2;
  const slideDirection: -1 | 1 = playerCenter < enemyCenter ? 1 : -1;
  const targetX = slideDirection === 1 ? enemy.x + enemy.width + dodgeGap : enemy.x - state.player.width - dodgeGap;
  const x = Math.max(0, Math.min(worldWidth - state.player.width, targetX));
  return {
    ...state,
    player: {
      ...state.player,
      x,
      vx: slideDirection * moveSpeed,
      facing: slideDirection,
      hurtCooldown: 0.45,
      dodgeCooldown: 0.65,
      dodgePulse: 0.28,
    },
    bossDodged: state.bossDodged || enemy.kind === 'boss',
    message: enemy.kind === 'boss' ? 'You slid under the boss. The far roof door is open.' : 'Slid behind the enemy.',
  };
}

function ventDodge(state: PlatformGameState) {
  return {
    ...state,
    player: {
      ...state.player,
      vx: runSpeed,
      facing: 1 as const,
      hurtCooldown: 0.55,
      dodgeCooldown: 0.65,
      dodgePulse: 0.42,
    },
    message: 'Dodged through the ceiling claws.',
  };
}

function distanceBetweenCenters(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  const ax = a.x + a.width / 2;
  const ay = a.y + a.height / 2;
  const bx = b.x + b.width / 2;
  const by = b.y + b.height / 2;
  return Math.hypot(ax - bx, ay - by);
}

function damageForEnemyTouch(state: PlatformGameState, kind: string) {
  if (kind === 'boss') return 35;
  if (state.floor < 5) return kind === 'bot-guard' ? 7 : 5;
  if (state.floor < 15) return kind === 'bot-guard' ? 10 : 8;
  return kind === 'bot-guard' ? 14 : 12;
}

function updateMeteorites(state: PlatformGameState, dt: number) {
  if (state.floor !== finalFloor || state.meteorThrowTimer > 0) return state.meteorites;
  return state.meteorites.map((meteor, index) => {
    const x = meteor.x - (18 + index * 4) * dt;
    const y = meteor.y + (10 + index * 3) * dt;
    if (y > 310 || x < 120) return { ...meteor, x: 420 + index * 520, y: 60 + index * 44 };
    return { ...meteor, x, y };
  });
}

function updateGunReload(state: PlatformGameState, dt: number) {
  if (state.reloadTimer <= 0) return state;
  const reloadTimer = Math.max(0, state.reloadTimer - dt);
  if (reloadTimer > 0) return { ...state, reloadTimer };
  const revolverLoaded = state.unlimitedGun ? 6 : Math.min(6, state.shots);
  return {
    ...state,
    reloadTimer: 0,
    revolverLoaded,
    message: revolverLoaded > 0 ? 'Revolver reloaded.' : state.message,
  };
}

export function triggerMeteorThrow(state: PlatformGameState, x: number, y: number): PlatformGameState {
  const clickedRageFire = state.floor === 5 && state.mode === 'lava' && x >= rageFire.x && x <= rageFire.x + rageFire.width && y >= rageFire.y && y <= rageFire.y + rageFire.height;
  if (clickedRageFire) {
    return {
      ...state,
      rageJumpTimer: 0.01,
      player: { ...state.player, vx: 0, vy: -900, hurtCooldown: 3 },
      message: 'Rage ignites. The roof is not far enough.',
    };
  }
  if (state.floor !== finalFloor || state.status !== 'playing' || state.meteorThrowTimer > 0) return state;
  const meteor = state.meteorites.find((item) => x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height);
  if (!meteor) return state;
  return { ...state, grabbedMeteor: meteor, meteorThrowTimer: 0.01, message: 'Mask on. Webs grabbed the meteorite.' };
}

function updateRageJump(state: PlatformGameState, dt: number): PlatformGameState {
  const timer = state.rageJumpTimer + dt;
  if (timer < 2.8) return { ...state, rageJumpTimer: timer };
  return {
    ...state,
    rageJumpTimer: timer,
    enemies: state.enemies.filter((enemy) => enemy.kind !== 'boss'),
    status: 'won' as const,
    ending: 'rage' as const,
    message: 'RAGE.',
  };
}

function updateMeteorThrow(state: PlatformGameState, dt: number): PlatformGameState {
  const timer = state.meteorThrowTimer + dt;
  if (timer < 1.8) return { ...state, meteorThrowTimer: timer };
  return {
    ...state,
    meteorThrowTimer: timer,
    enemies: state.enemies.filter((enemy) => enemy.kind !== 'boss'),
    status: 'won' as const,
    ending: 'superhero' as const,
    message: 'SUPERHERO. The city has a new masked protector.',
  };
}

function useInfinityGauntlet(state: PlatformGameState) {
  if (state.floor !== finalFloor) return { ...state, message: 'The gauntlet only works in the boss fight.' };
  if (!state.gauntletOwned) return { ...state, message: 'You do not own the Infinity Gauntlet.' };
  if (state.infinityStones < 6) return { ...state, message: `The gauntlet needs all stones: ${state.infinityStones}/6.` };
  if (!state.player.grounded || Math.abs(state.player.vx) > 5) return { ...state, message: 'Stand still to snap the gauntlet.' };
  const bossAlive = state.enemies.some((enemy) => enemy.kind === 'boss');
  if (!bossAlive) return state;
  return { ...state, gauntletSnapTimer: 0.01, message: 'The stones ignite. Snap now.' };
}

function updateGauntletSnap(state: PlatformGameState, dt: number): PlatformGameState {
  const timer = state.gauntletSnapTimer + dt;
  if (timer < 2.2) return { ...state, gauntletSnapTimer: timer };
  const snapKillsBoss = Math.random() < 0.5;
  if (!snapKillsBoss) {
    return {
      ...state,
      gauntletSnapTimer: timer,
      player: { ...state.player, hp: 0 },
      status: 'lost' as const,
      deathCause: 'boss' as const,
      message: 'The gauntlet backfires. The snap erased you.',
    };
  }

  return {
    ...state,
    gauntletSnapTimer: timer,
    enemies: state.enemies.filter((enemy) => enemy.kind !== 'boss'),
    status: 'won' as const,
    ending: 'half-universe' as const,
    message: 'HALF THE UNIVERSE.',
  };
}

function updateVentSpawns(state: PlatformGameState, _dt: number) {
  if (!state.inVent) {
    return {
      ...state,
      enemies: state.enemies.filter((enemy) => enemy.kind !== 'vent-monster'),
      nest: null,
    };
  }
  return state;
}
