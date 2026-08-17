export type GameStatus = 'playing' | 'won' | 'lost';
export type EndingKind = 'ruler' | 'half-universe' | 'sunset' | 'superhero' | 'last-stand' | 'escape' | 'ran-away' | 'rage' | null;
export type DeathCause = 'lava' | 'flood' | 'bot' | 'guard' | 'drone' | 'fall' | 'boss' | 'duel';
export type EnemyKind = 'drone' | 'broken-bot' | 'bot-guard' | 'boss' | 'sea-monster' | 'vent-monster';
export type ItemKind = 'battery' | 'medkit' | 'flashlight' | 'gun' | 'stone';
export type FloorMode = 'normal' | 'flood' | 'lava' | 'blackout' | 'drone-swarm' | 'collapse' | 'supply' | 'train' | 'vent';

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Player = Rect & {
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  stamina: number;
  grounded: boolean;
  facing: 1 | -1;
  running: boolean;
  isSlamming: boolean;
  slamCooldown: number;
  slamPulse: number;
  dodgeCooldown: number;
  dodgePulse: number;
  hitPulse: number;
  shootPulse: number;
  doubleJumpPulse: number;
  hurtCooldown: number;
  doubleJumpUsed: boolean;
};

export type Enemy = Rect & {
  id: string;
  kind: EnemyKind;
  hp: number;
  vx: number;
  patrolLeft: number;
  patrolRight: number;
  wakeDelay: number;
  attackPulse: number;
};

export type Item = Rect & {
  id: string;
  kind: ItemKind;
};

export type HotelRoom = Rect & {
  id: string;
  loot: ItemKind | 'empty';
  opened: boolean;
  searched: boolean;
};

export type PlatformGameState = {
  floor: number;
  mode: FloorMode;
  status: GameStatus;
  ending: EndingKind;
  player: Player;
  enemies: Enemy[];
  items: Item[];
  rooms: HotelRoom[];
  holes: Rect[];
  boxes: Rect[];
  ventHole: Rect | null;
  nest: Rect | null;
  nestHp: number;
  inVent: boolean;
  ventSpawnTimer: number;
  currentRoom: HotelRoom | null;
  batteries: number;
  batteriesNeeded: number;
  flashlights: number;
  medkits: number;
  infinityStones: number;
  gauntletOwned: boolean;
  botBlindTime: number;
  eventDamageCooldown: number;
  hasGun: boolean;
  shots: number;
  revolverLoaded: number;
  reloadTimer: number;
  unlimitedGun: boolean;
  bulletTrail: Rect | null;
  meteorites: Rect[];
  grabbedMeteor: Rect | null;
  duel: DuelState | null;
  floorTimeLeft: number;
  bossTimeLeft: number;
  gauntletSnapTimer: number;
  meteorThrowTimer: number;
  rageJumpTimer: number;
  bossDodged: boolean;
  message: string;
  deathCause: DeathCause | null;
  deathTimer: number;
  coins: number;
  armorCount: number;
  doubleJumpUnlocked: boolean;
  tutorialRun: boolean;
};

export type DuelState = {
  phase: 'choice' | 'duel';
  active: boolean;
  focus: number;
  playerMarks: number;
  shotMarks: Rect[];
  guardMarks: number;
  crosshairX: number;
  crosshairY: number;
};

export type InputState = {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean;
  doubleJumpPressed: boolean;
  down: boolean;
  slamPressed: boolean;
  dodgePressed: boolean;
  hitPressed: boolean;
  interactPressed: boolean;
  leavePressed: boolean;
  flashlightPressed: boolean;
  medkitPressed: boolean;
  shootPressed: boolean;
  runPressed: boolean;
  shortcutPressed: boolean;
  gauntletPressed: boolean;
  aimX: number | null;
  aimY: number | null;
};
