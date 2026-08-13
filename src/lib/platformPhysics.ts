import { bossEscapeDoor, createLevel, finalFloor, floorY, worldWidth } from './platformLevel';
import { overlaps } from './platformGeometry';
import { hitPlayer, normalHit, slamEnemies, updateEnemies } from './platformCombat';
import { applyEventDamage } from './platformHazards';
import { collectItems, handleActionInputs } from './platformInteractions';
import { startTrainDuel, updateTrainDuel } from './trainDuel';
import type { InputState, PlatformGameState } from './platformTypes';
import { awardCoins, awardFloorCoin } from './progress';

const gravity = 1700;
const moveSpeed = 250;
const runSpeed = 390;
const crawlSpeed = 145;
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

function tryVentNest(state: PlatformGameState) {
  if (!state.nest) return state;
  if (state.inVent) return state.nestHp <= 0 ? { ...state, status: 'won' as const, ending: 'sunset' as const, message: 'Vent ending found. You saved the whole world.' } : state;
  const reachedNest = overlaps(state.player, state.nest);
  const monsterAlive = state.enemies.some((enemy) => enemy.kind === 'vent-monster');
  if (!reachedNest) return state;
  if (monsterAlive) return { ...state, message: 'The nest is blocked by the vent monster.' };
  return { ...state, status: 'won' as const, ending: 'sunset' as const, message: 'Vent ending found. You saved the whole world.' };
}

function tryTurnedBackDoor(state: PlatformGameState, player: PlatformGameState['player']) {
  if (state.floor !== 1 || state.inVent || player.x > 14 || player.vx >= 0) return null;
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
    unlimitedGun: state.unlimitedGun,
    infinityStones: state.infinityStones,
    stamina: state.player.stamina,
    armorCount: state.armorCount,
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

function trySecretFloorOneHoles(state: PlatformGameState, player: PlatformGameState['player']) {
  if (state.floor !== 1) return null;
  const feet = player.x + player.width / 2;
  const hole = state.holes.find((item) => feet > item.x + 8 && feet < item.x + item.width - 8);
  if (!hole || player.y < floorY + 46) return null;
  if (hole === state.holes[0]) {
    return {
      ...createLevel(finalFloor, player.hp, { ...getCarry(state), infinityStones: 6 }),
      message: 'Secret vent found. It throws you straight onto the roof.',
    };
  }
  const ventLevel = createLevel(13, player.hp, { ...getCarry(state), hasGun: true, shots: 0, unlimitedGun: true });
  return {
    ...ventLevel,
    inVent: true,
    player: {
      ...ventLevel.player,
      x: 80,
      y: floorY - 104,
      height: 44,
      grounded: true,
    },
    message: 'Second secret vent found. You are inside the vents with an unlimited revolver.',
  };
}

export function updatePlatformGame(state: PlatformGameState, input: InputState, dt: number): PlatformGameState {
  if (state.status === 'lost') return { ...state, deathTimer: state.deathTimer + dt };
  if (state.status !== 'playing') return state;
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

  let running = state.inVent ? false : input.runPressed ? !state.player.running : state.player.running;
  let stamina = state.player.stamina;
  if (running && (input.left || input.right)) stamina = Math.max(0, stamina - staminaDrain * dt);
  if (!running) stamina = Math.min(100, stamina + staminaRecover * dt);
  if (stamina <= 0) running = false;
  const speed = state.inVent ? crawlSpeed : running ? runSpeed : moveSpeed;
  const vx = input.left ? -speed : input.right ? speed : 0;
  const canDoubleJump = !state.inVent && state.doubleJumpUnlocked && !state.player.grounded && !state.player.doubleJumpUsed;
  const wantsGroundJump = !state.inVent && input.jumpPressed && state.player.grounded;
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
    facing: vx < 0 ? -1 : vx > 0 ? 1 : state.player.facing,
  };
  player.x = Math.max(0, Math.min(worldWidth - player.width, player.x + player.vx * dt));
  player.y += player.vy * dt;
  if (state.inVent) {
    player.y = floorY - 104;
    player.vy = 0;
    player.grounded = true;
    player.isSlamming = false;
  }
  player.slamCooldown = Math.max(0, player.slamCooldown - dt);
  player.slamPulse = Math.max(0, player.slamPulse - dt);
  player.dodgeCooldown = Math.max(0, player.dodgeCooldown - dt);
  player.dodgePulse = Math.max(0, player.dodgePulse - dt);
  player.hurtCooldown = Math.max(0, player.hurtCooldown - dt);

  const wasAirSlamming = player.isSlamming;
  const turnedBackEnding = tryTurnedBackDoor(state, player);
  if (turnedBackEnding) return turnedBackEnding;
  const secretHole = trySecretFloorOneHoles(state, player);
  if (secretHole) return secretHole;

  if (!state.inVent && player.y > floorY + 130) {
    return {
      ...state,
      player: { ...player, hp: 0 },
      status: 'lost',
      deathCause: 'fall',
      message: 'You fell through the broken hotel floor.',
    };
  }

  const box = boxUnderPlayer(state, player.x, player.y + player.height);
  if (box && player.vy >= 0) {
    player.y = box.y - player.height;
    player.vy = 0;
    player.grounded = true;
    player.isSlamming = false;
    player.doubleJumpUsed = false;
  } else if (state.inVent) {
    player.grounded = true;
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
  const bulletTrail = state.bulletTrail ? { ...state.bulletTrail, height: state.bulletTrail.height - dt } : null;
  let next = collectItems({
    ...state,
    player,
    bulletTrail: bulletTrail && bulletTrail.height > 0 ? bulletTrail : null,
    meteorites: updateMeteorites(state, dt),
    botBlindTime: Math.max(0, state.botBlindTime - dt),
    enemies: updateEnemies({ ...state, player }, dt, blinded),
  });
  next = tryDodge(next, input);
  next = updateVentSpawns(next, dt);
  next = applyEventDamage(next, dt);
  if (next.status !== 'playing') return next;
  const shootingDrone = next.enemies.find((enemy) => enemy.kind === 'drone' && Math.abs(enemy.x - next.player.x) < 220 && Math.abs(enemy.y - next.player.y) < 95);
  if (shootingDrone) {
    next = {
      ...next,
      bulletTrail: { x: shootingDrone.x + shootingDrone.width / 2, y: shootingDrone.y + 18, width: next.player.x - shootingDrone.x, height: 0.12 },
    };
    next = hitPlayer(next, 4, 'Drone shot you.', 'drone');
    next = { ...next, player: { ...next.player, hurtCooldown: Math.max(next.player.hurtCooldown, 2) } };
    if (next.status !== 'playing') return next;
  }
  if (wasAirSlamming && player.grounded) next = slamEnemies(next);
  const touchingEnemy = next.enemies.find((enemy) => overlaps(next.player, enemy));
  if (touchingEnemy?.kind === 'sea-monster') {
    return { ...next, status: 'lost', deathCause: 'flood', player: { ...next.player, hp: 0 }, message: 'The sea monster caught you.' };
  }
  if (touchingEnemy) {
    if (touchingEnemy.kind === 'boss' && Math.abs(next.player.vx) < 5) return next;
    const cause = touchingEnemy.kind === 'drone' ? 'drone' : touchingEnemy.kind === 'bot-guard' ? 'guard' : touchingEnemy.kind === 'boss' ? 'boss' : 'bot';
    next = hitPlayer(next, damageForEnemyTouch(next, touchingEnemy.kind), `${touchingEnemy.kind} hit you.`, cause);
  }
  next = tryVentNest(next);
  next = tryTrainGuard(next);
  if (input.interactPressed) next = tryBossRunAwayDoor(next);
  next = tryLift(next);

  return next;
}

function tryDodge(state: PlatformGameState, input: InputState) {
  if (!input.dodgePressed || state.player.dodgeCooldown > 0) return state;
  const enemy = state.enemies.find((item) => distanceBetweenCenters(state.player, item) <= dodgeRadius);
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

export function triggerMeteorThrow(state: PlatformGameState, x: number, y: number): PlatformGameState {
  if (state.floor !== finalFloor || state.status !== 'playing' || state.meteorThrowTimer > 0) return state;
  const meteor = state.meteorites.find((item) => x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height);
  if (!meteor) return state;
  return { ...state, grabbedMeteor: meteor, meteorThrowTimer: 0.01, message: 'Mask on. Webs grabbed the meteorite.' };
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

function updateVentSpawns(state: PlatformGameState, dt: number) {
  if (!state.inVent || state.status !== 'playing') return state;
  const timer = state.ventSpawnTimer - dt;
  if (timer > 0) return { ...state, ventSpawnTimer: timer };
  const x = Math.min(worldWidth - 170, state.player.x + 620);
  const enemy = {
    id: `vent-spawn-${Date.now()}`,
    kind: 'vent-monster' as const,
    x,
    y: floorY - 102,
    width: 78,
    height: 52,
    hp: 8,
    vx: -70,
    patrolLeft: Math.max(state.player.x + 120, x - 260),
    patrolRight: Math.min(worldWidth - 120, x + 120),
    wakeDelay: 0,
  };
  return { ...state, ventSpawnTimer: 60, enemies: [...state.enemies, enemy], message: 'A vent monster crawls in ahead.' };
}
