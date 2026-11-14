import {
  SHIP_SPRITE_DATA_URI,
  CAOLA_PILOT_DATA_URI,
  CAOLA_FULLBODY_DATA_URI,
  RTX_GPU_DATA_URI,
  RTX_TRANSPORT_DATA_URI,
} from './spritesData';

// =============================================================================
// MODULE: CONFIG, SAVE DATA & PALETTE
// =============================================================================
export const CANVAS_W = 360;
export const CANVAS_H = 640;
export const GAME_SHARE_URL = 'https://gameclub-ef3.pages.dev/';
export const GPU_TO_RTX_RATE = 1.0; // 1 RTX VIBE GPU = 1.00 $RTX STONK (NOT $CAOLA!)

const SAVE_KEY = 'gameclub_caola_save_v3';

export const PALETTE = {
  bgDeep: '#060811',
  bgSpace: '#0b1021',
  bgDeck: '#12182b',
  hullLight: '#b7bfc2',
  hullMed: '#8f979a',
  hullDark: '#5d656a',
  armorDeep: '#272d38',
  purpleLight: '#9d7bb8',
  purpleMed: '#5d486e',
  purpleDark: '#31213f',
  cyanBright: '#b8f8ff',
  cyanCore: '#38e8ff',
  cyanDeep: '#0891b2',
  outline: '#080a10',
  redWarn: '#ff4d6d',
  orangeCore: '#fb923c',
  chipGreen: '#22c55e',
  chipBright: '#86efac',
  goldPin: '#facc15',
  hudBg: 'rgba(6, 9, 18, 0.90)',
};

export type GamePhase = 'LOBBY' | 'PLAYING' | 'VICTORY' | 'GAMEOVER';
export type WeaponMode = 'PULSE' | 'SPREAD' | 'RAIL';

export interface ShipUpgrades {
  cannons: number;   // 1..4
  firerate: number;  // 1..4
  hull: number;      // 1..4
  thrusters: number; // 1..4
}

export interface PersistentSave {
  caola: number;
  gpus: number;
  rtxStonk: number;
  highScore: number;
  missionsCleared: number;
  maxSector: number;
  upgrades: ShipUpgrades;
}

export interface GameSnapshot {
  phase: GamePhase;
  sector: number;
  maxSector: number;
  caola: number;
  runCaola: number;
  gpus: number;
  runGpus: number;
  rtxStonk: number;
  enemiesDestroyed: number;
  hp: number;
  maxHp: number;
  progress: number;
  bossActive: boolean;
  autoFire: boolean;
  weaponMode: WeaponMode;
  empCooldown: number;
  empMaxCooldown: number;
  overdriveCooldown: number;
  overdriveMaxCooldown: number;
  overdriveTimer: number;
  upgrades: ShipUpgrades;
  highScore: number;
  missionsCleared: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fromPlayer: boolean;
  damage: number;
  color: string;
  size: number;
  pierce: number;
  hitIds?: Set<number>;
  kind?: 'normal' | 'rail' | 'missile' | 'bomb';
  fuseTimer?: number;
  trail: { x: number; y: number }[];
}

type EnemyKind =
  | 'drone'
  | 'interceptor'
  | 'turret'
  | 'bomber'
  | 'spiral'
  | 'laser'
  | 'shielder'
  | 'mine'
  | 'transport';

interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  radius: number;
  hp: number;
  maxHp: number;
  shieldHp?: number;
  maxShieldHp?: number;
  fireTimer: number;
  hitFlash: number;
  phase: number;
  aimAngle: number;
  laserState?: 'idle' | 'telegraph' | 'firing';
  laserTimer?: number;
  spiralAngle?: number;
  escortParentId?: number;
  orbitAngle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  patternStep?: number;
}

type PickupKind = 'caola' | 'gpu' | 'repair' | 'overdrive';

interface Pickup {
  kind: PickupKind;
  x: number;
  y: number;
  vy: number;
  value: number;
  pulse: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
  maxLife: number;
  width: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  color: string;
}

interface DataPulse {
  x: number;
  y: number;
  speed: number;
  len: number;
  color: string;
}

function defaultSave(): PersistentSave {
  return {
    caola: 120,
    gpus: 0,
    rtxStonk: 0,
    highScore: 0,
    missionsCleared: 0,
    maxSector: 1,
    upgrades: { cannons: 1, firerate: 1, hull: 1, thrusters: 1 },
  };
}

function loadSave(): PersistentSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem('gameclub_caola_save_v2');
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw);
    const stonk =
      typeof parsed.rtxStonk === 'number'
        ? parsed.rtxStonk
        : typeof parsed.nvdaShares === 'number'
        ? parsed.nvdaShares
        : 0;
    return {
      caola: typeof parsed.caola === 'number' ? parsed.caola : 120,
      gpus: typeof parsed.gpus === 'number' ? parsed.gpus : 0,
      rtxStonk: stonk,
      highScore: typeof parsed.highScore === 'number' ? parsed.highScore : 0,
      missionsCleared: typeof parsed.missionsCleared === 'number' ? parsed.missionsCleared : 0,
      maxSector: typeof parsed.maxSector === 'number' ? Math.max(1, parsed.maxSector) : 1,
      upgrades: {
        cannons: Math.min(4, Math.max(1, parsed.upgrades?.cannons ?? 1)),
        firerate: Math.min(4, Math.max(1, parsed.upgrades?.firerate ?? 1)),
        hull: Math.min(4, Math.max(1, parsed.upgrades?.hull ?? 1)),
        thrusters: Math.min(4, Math.max(1, parsed.upgrades?.thrusters ?? 1)),
      },
    };
  } catch {
    return defaultSave();
  }
}

// =============================================================================
// MODULE: PIXEL ART SPRITE BUILDERS (Strict Top-Down Overhead)
// =============================================================================
function makeOffscreen(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function createDroneSprite(): HTMLCanvasElement {
  const [c, ctx] = makeOffscreen(32, 32);
  px(ctx, 5, 4, 5, 5, PALETTE.outline);
  px(ctx, 6, 5, 3, 3, PALETTE.purpleMed);
  px(ctx, 22, 4, 5, 5, PALETTE.outline);
  px(ctx, 23, 5, 3, 3, PALETTE.purpleMed);
  px(ctx, 13, 2, 6, 4, PALETTE.outline);
  px(ctx, 14, 3, 4, 2, PALETTE.cyanCore);

  const cx = 16, cy = 16;
  for (let y = 4; y <= 28; y++) {
    for (let x = 4; x <= 28; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= 11.5 && d > 10.1) px(ctx, x, y, 1, 1, PALETTE.outline);
      else if (d <= 10.1) {
        let col = PALETTE.hullMed;
        if (x - cx + (y - cy) < -5) col = PALETTE.hullLight;
        else if (y > cy + 4) col = PALETTE.purpleMed;
        else if (d > 8.2) col = PALETTE.hullDark;
        px(ctx, x, y, 1, 1, col);
      }
    }
  }
  px(ctx, 10, 10, 12, 12, PALETTE.outline);
  px(ctx, 11, 11, 10, 10, PALETTE.purpleDark);
  px(ctx, 12, 12, 8, 8, PALETTE.cyanDeep);
  px(ctx, 13, 13, 6, 6, PALETTE.cyanCore);
  px(ctx, 14, 14, 3, 3, PALETTE.cyanBright);
  return c;
}

function createInterceptorSprite(): HTMLCanvasElement {
  const [c, ctx] = makeOffscreen(32, 34);
  px(ctx, 3, 8, 26, 10, PALETTE.outline);
  px(ctx, 4, 9, 24, 8, PALETTE.purpleMed);
  px(ctx, 5, 10, 22, 3, PALETTE.purpleLight);
  px(ctx, 10, 3, 12, 26, PALETTE.outline);
  px(ctx, 11, 4, 10, 24, PALETTE.hullMed);
  px(ctx, 12, 5, 4, 20, PALETTE.hullLight);
  px(ctx, 13, 24, 6, 6, PALETTE.outline);
  px(ctx, 14, 25, 4, 4, PALETTE.hullDark);
  px(ctx, 13, 15, 6, 7, PALETTE.outline);
  px(ctx, 14, 16, 4, 5, PALETTE.redWarn);
  px(ctx, 15, 17, 2, 2, '#fecdd3');
  px(ctx, 4, 17, 3, 6, PALETTE.armorDeep);
  px(ctx, 25, 17, 3, 6, PALETTE.armorDeep);
  px(ctx, 4, 22, 3, 2, PALETTE.redWarn);
  px(ctx, 25, 22, 3, 2, PALETTE.redWarn);
  return c;
}

function createTurretBaseSprite(): HTMLCanvasElement {
  const [c, ctx] = makeOffscreen(36, 36);
  const cx = 18, cy = 18;
  for (let y = 2; y < 34; y++) {
    for (let x = 2; x < 34; x++) {
      const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
      const hex = Math.max(dx * 0.866 + dy * 0.5, dy);
      if (hex <= 15.2 && hex > 13.8) px(ctx, x, y, 1, 1, PALETTE.outline);
      else if (hex <= 13.8) {
        let col = PALETTE.hullMed;
        if (hex > 11.2) col = x + y < 34 ? PALETTE.hullLight : PALETTE.hullDark;
        else if (hex > 8.5) col = PALETTE.hullLight;
        else col = PALETTE.purpleDark;
        px(ctx, x, y, 1, 1, col);
      }
    }
  }
  px(ctx, 12, 5, 12, 2, PALETTE.armorDeep);
  px(ctx, 12, 29, 12, 2, PALETTE.armorDeep);
  px(ctx, 12, 12, 12, 12, PALETTE.outline);
  px(ctx, 13, 13, 10, 10, PALETTE.purpleMed);
  px(ctx, 9, 10, 3, 3, PALETTE.redWarn);
  px(ctx, 24, 10, 3, 3, PALETTE.redWarn);
  return c;
}

function createBomberSprite(): HTMLCanvasElement {
  const [c, ctx] = makeOffscreen(44, 34);
  px(ctx, 2, 10, 40, 14, PALETTE.outline);
  px(ctx, 4, 12, 36, 10, PALETTE.hullDark);
  px(ctx, 6, 13, 32, 4, PALETTE.hullMed);
  // Bomb bays
  px(ctx, 8, 22, 6, 6, PALETTE.outline);
  px(ctx, 9, 23, 4, 4, PALETTE.orangeCore);
  px(ctx, 30, 22, 6, 6, PALETTE.outline);
  px(ctx, 31, 23, 4, 4, PALETTE.orangeCore);
  // Center hull
  px(ctx, 15, 4, 14, 26, PALETTE.outline);
  px(ctx, 17, 6, 10, 22, PALETTE.purpleMed);
  px(ctx, 19, 14, 6, 8, PALETTE.orangeCore);
  px(ctx, 20, 16, 4, 4, PALETTE.goldPin);
  return c;
}

function createSpiralPodSprite(): HTMLCanvasElement {
  const [c, ctx] = makeOffscreen(34, 34);
  px(ctx, 13, 2, 8, 30, PALETTE.outline);
  px(ctx, 2, 13, 30, 8, PALETTE.outline);
  px(ctx, 14, 3, 6, 28, PALETTE.purpleMed);
  px(ctx, 3, 14, 28, 6, PALETTE.purpleMed);
  px(ctx, 7, 7, 20, 20, PALETTE.outline);
  px(ctx, 9, 9, 16, 16, PALETTE.armorDeep);
  px(ctx, 11, 11, 12, 12, PALETTE.purpleLight);
  px(ctx, 14, 14, 6, 6, PALETTE.goldPin);
  return c;
}

function createShielderSprite(): HTMLCanvasElement {
  const [c, ctx] = makeOffscreen(44, 38);
  px(ctx, 4, 6, 36, 22, PALETTE.outline);
  px(ctx, 6, 8, 32, 18, PALETTE.hullDark);
  px(ctx, 8, 10, 28, 12, PALETTE.hullMed);
  px(ctx, 16, 4, 12, 28, PALETTE.outline);
  px(ctx, 18, 6, 8, 24, PALETTE.cyanDeep);
  px(ctx, 19, 14, 6, 10, PALETTE.cyanCore);
  px(ctx, 8, 24, 6, 6, PALETTE.redWarn);
  px(ctx, 30, 24, 6, 6, PALETTE.redWarn);
  return c;
}

function createLaserStrikerSprite(): HTMLCanvasElement {
  const [c, ctx] = makeOffscreen(38, 38);
  px(ctx, 4, 6, 8, 26, PALETTE.outline);
  px(ctx, 5, 7, 6, 24, PALETTE.purpleDark);
  px(ctx, 6, 8, 4, 22, PALETTE.purpleMed);
  px(ctx, 26, 6, 8, 26, PALETTE.outline);
  px(ctx, 27, 7, 6, 24, PALETTE.purpleDark);
  px(ctx, 28, 8, 4, 22, PALETTE.purpleMed);
  px(ctx, 12, 4, 14, 28, PALETTE.outline);
  px(ctx, 13, 5, 12, 26, PALETTE.hullDark);
  px(ctx, 15, 7, 8, 22, PALETTE.hullMed);
  px(ctx, 16, 12, 6, 10, PALETTE.outline);
  px(ctx, 17, 13, 4, 8, PALETTE.redWarn);
  px(ctx, 17, 29, 4, 6, PALETTE.redWarn);
  px(ctx, 18, 30, 2, 4, '#ffffff');
  return c;
}

function createMineSprite(): HTMLCanvasElement {
  const [c, ctx] = makeOffscreen(28, 28);
  px(ctx, 3, 3, 4, 4, PALETTE.outline);
  px(ctx, 21, 3, 4, 4, PALETTE.outline);
  px(ctx, 3, 21, 4, 4, PALETTE.outline);
  px(ctx, 21, 21, 4, 4, PALETTE.outline);
  px(ctx, 12, 1, 4, 4, PALETTE.redWarn);
  px(ctx, 12, 23, 4, 4, PALETTE.redWarn);
  px(ctx, 1, 12, 4, 4, PALETTE.redWarn);
  px(ctx, 23, 12, 4, 4, PALETTE.redWarn);
  px(ctx, 6, 6, 16, 16, PALETTE.outline);
  px(ctx, 7, 7, 14, 14, PALETTE.armorDeep);
  px(ctx, 9, 9, 10, 10, PALETTE.purpleMed);
  px(ctx, 11, 11, 6, 6, PALETTE.redWarn);
  px(ctx, 12, 12, 3, 3, PALETTE.goldPin);
  return c;
}

function createCaolaShardSprite(): HTMLCanvasElement {
  const [c, ctx] = makeOffscreen(18, 18);
  px(ctx, 3, 3, 12, 12, PALETTE.outline);
  px(ctx, 4, 4, 10, 10, PALETTE.purpleDark);
  px(ctx, 5, 5, 8, 8, PALETTE.chipGreen);
  px(ctx, 6, 6, 6, 6, PALETTE.chipBright);
  px(ctx, 8, 7, 2, 4, PALETTE.outline);
  px(ctx, 7, 8, 4, 2, PALETTE.outline);
  return c;
}

function createBossCoreSprite(): HTMLCanvasElement {
  const [c, ctx] = makeOffscreen(172, 82);
  px(ctx, 4, 6, 164, 70, PALETTE.outline);
  px(ctx, 6, 8, 160, 66, PALETTE.armorDeep);
  px(ctx, 8, 10, 48, 62, PALETTE.hullDark);
  px(ctx, 10, 12, 44, 58, PALETTE.hullMed);
  px(ctx, 116, 10, 48, 62, PALETTE.hullDark);
  px(ctx, 118, 12, 44, 58, PALETTE.hullMed);
  for (let row = 16; row <= 62; row += 6) {
    px(ctx, 14, row, 36, 3, PALETTE.purpleDark);
    px(ctx, 14, row, 36, 1, PALETTE.purpleLight);
    px(ctx, 122, row, 36, 3, PALETTE.purpleDark);
    px(ctx, 122, row, 36, 1, PALETTE.purpleLight);
  }
  px(ctx, 58, 4, 56, 74, PALETTE.outline);
  px(ctx, 60, 6, 52, 70, PALETTE.purpleMed);
  px(ctx, 64, 10, 44, 62, PALETTE.hullMed);
  px(ctx, 66, 12, 40, 58, PALETTE.hullLight);
  px(ctx, 70, 16, 32, 50, PALETTE.armorDeep);
  for (let y = 20; y <= 58; y += 6) {
    px(ctx, 72, y, 28, 2, PALETTE.cyanDeep);
    px(ctx, 74, y, 6, 2, PALETTE.cyanBright);
    px(ctx, 92, y, 6, 2, PALETTE.cyanBright);
  }
  px(ctx, 76, 30, 20, 20, PALETTE.outline);
  px(ctx, 78, 32, 16, 16, PALETTE.cyanDeep);
  px(ctx, 80, 34, 12, 12, PALETTE.cyanCore);
  px(ctx, 83, 37, 6, 6, PALETTE.cyanBright);
  px(ctx, 22, 60, 14, 14, PALETTE.outline);
  px(ctx, 24, 62, 10, 10, PALETTE.purpleLight);
  px(ctx, 27, 65, 4, 4, PALETTE.redWarn);
  px(ctx, 136, 60, 14, 14, PALETTE.outline);
  px(ctx, 138, 62, 10, 10, PALETTE.purpleLight);
  px(ctx, 141, 65, 4, 4, PALETTE.redWarn);
  return c;
}

// =============================================================================
// MODULE: GAME ENGINE
// =============================================================================
export class GameClubEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onStateChange: (snapshot: GameSnapshot) => void;

  // Embedded original sprites (untouched)
  private shipImg = new Image();
  private pilotImg = new Image();
  private caolaFullImg = new Image();
  private rtxGpuImg = new Image();
  private rtxTransportImg = new Image();

  // Enemy & pickup pixel sprites
  private droneSprite = createDroneSprite();
  private interceptorSprite = createInterceptorSprite();
  private turretBaseSprite = createTurretBaseSprite();
  private bomberSprite = createBomberSprite();
  private spiralSprite = createSpiralPodSprite();
  private shielderSprite = createShielderSprite();
  private laserStrikerSprite = createLaserStrikerSprite();
  private mineSprite = createMineSprite();
  private caolaShardSprite = createCaolaShardSprite();
  private bossSprite = createBossCoreSprite();

  private save: PersistentSave = loadSave();
  private phase: GamePhase = 'LOBBY';
  private currentSector = 1;
  private runCaola = 0;
  private runGpus = 0;
  private enemiesDestroyed = 0;
  private levelProgress = 0;
  private scrollDistance = 0;
  private planetY = 110;
  private waveTimer = 0;
  private transportSpawnedStage = 0;
  private nextEnemyId = 1;
  private screenShake = 0;
  private bossWarningTimer = 0;
  private autoFire = false;
  private weaponMode: WeaponMode = 'PULSE';
  private missileTimer = 0;
  private empCooldown = 0;
  private readonly empMaxCooldown = 14;
  private overdriveCooldown = 0;
  private readonly overdriveMaxCooldown = 18;
  private overdriveTimer = 0;
  private lobbyAnimTime = 0;
  private muzzleFlashTimer = 0;

  private player = {
    x: CANVAS_W / 2,
    y: 500,
    w: 54,
    h: 102,
    speed: 210,
    hp: 100,
    maxHp: 100,
    fireCooldown: 0,
    invulnTimer: 0,
  };

  private boss = {
    active: false,
    x: CANVAS_W / 2,
    y: -95,
    targetY: 126,
    w: 172,
    h: 82,
    vx: 64,
    hp: 1100,
    maxHp: 1100,
    fireTimer: 1.0,
    patternStep: 0,
    spiralAngle: 0,
    hitFlash: 0,
    corePulse: 0,
  };

  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private pickups: Pickup[] = [];
  private particles: Particle[] = [];
  private shockwaves: Shockwave[] = [];
  private popups: FloatingText[] = [];
  private stars: Star[] = [];
  private dataPulses: DataPulse[] = [];

  // Input state
  private keys: Record<string, boolean> = {};
  private mouseDown = false;
  private joyCenter = { x: 64, y: 568, r: 38 };
  private joyTouchId: number | null = null;
  private joyVec = { x: 0, y: 0 };
  private fireBtn = { x: 304, y: 572, r: 32 };
  private empBtn = { x: 244, y: 586, r: 21 };
  private ovrBtn = { x: 256, y: 534, r: 21 };
  private fireTouchId: number | null = null;
  private firePressed = false;
  private dragTouchId: number | null = null;
  private lastDragPos: { x: number; y: number } | null = null;
  private autoBtnHitbox = { x: CANVAS_W - 60, y: 34, w: 52, h: 18 };
  private wpnBtnHitbox = { x: CANVAS_W - 122, y: 34, w: 58, h: 18 };

  private rafId = 0;
  private lastTime = 0;
  private lastEmitTime = 0;

  constructor(canvas: HTMLCanvasElement, onStateChange: (snap: GameSnapshot) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.onStateChange = onStateChange;

    this.shipImg.src = SHIP_SPRITE_DATA_URI;
    this.pilotImg.src = CAOLA_PILOT_DATA_URI;
    this.caolaFullImg.src = CAOLA_FULLBODY_DATA_URI;
    this.rtxGpuImg.src = RTX_GPU_DATA_URI;
    this.rtxTransportImg.src = RTX_TRANSPORT_DATA_URI;

    this.currentSector = this.save.maxSector;
    this.initBackdrop();
    this.bindInputs();
    this.emitSnapshot(true);

    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  public destroy() {
    cancelAnimationFrame(this.rafId);
    this.unbindInputs();
  }

  private persistSave() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.save));
    } catch {
      // Ignore storage quota errors
    }
  }

  public setSector(sec: number) {
    this.currentSector = Math.max(1, Math.min(this.save.maxSector, sec));
    this.emitSnapshot(true);
  }

  public getMaxHp(): number {
    return 100 + (this.save.upgrades.hull - 1) * 45;
  }

  public getUpgradeCost(key: keyof ShipUpgrades): number {
    return this.save.upgrades[key] * 120;
  }

  public upgradeShip(key: keyof ShipUpgrades): boolean {
    const lvl = this.save.upgrades[key];
    if (lvl >= 4) return false;
    const cost = this.getUpgradeCost(key);
    if (this.save.caola < cost) return false;
    this.save.caola -= cost;
    this.save.upgrades[key] = lvl + 1;
    this.persistSave();
    this.emitSnapshot(true);
    // [SFX HOOK]: Play upgrade sound
    return true;
  }

  // Strictly exchange RTX VIBE GPUs -> $RTX STONK ONLY (NOT $CAOLA)
  public exchangeGpusForRtxStonk(count: number): { swapped: number; stonkGained: number } {
    const toSwap = Math.min(this.save.gpus, Math.max(0, Math.floor(count)));
    if (toSwap <= 0) return { swapped: 0, stonkGained: 0 };
    const stonkGained = Number((toSwap * GPU_TO_RTX_RATE).toFixed(2));
    this.save.gpus -= toSwap;
    this.save.rtxStonk = Number((this.save.rtxStonk + stonkGained).toFixed(2));
    this.persistSave();
    this.emitSnapshot(true);
    // [SFX HOOK]: Play $RTX STONK exchange confirmation
    return { swapped: toSwap, stonkGained };
  }

  public returnToLobby() {
    this.phase = 'LOBBY';
    this.bullets = [];
    this.enemies = [];
    this.pickups = [];
    this.particles = [];
    this.shockwaves = [];
    this.popups = [];
    this.boss.active = false;
    this.emitSnapshot(true);
  }

  public toggleAutoFire() {
    this.autoFire = !this.autoFire;
    this.emitSnapshot(true);
  }

  public cycleWeaponMode(mode?: WeaponMode) {
    if (mode) {
      this.weaponMode = mode;
    } else {
      const order: WeaponMode[] = ['PULSE', 'SPREAD', 'RAIL'];
      this.weaponMode = order[(order.indexOf(this.weaponMode) + 1) % order.length];
    }
    this.popups.push({
      x: this.player.x,
      y: this.player.y - 54,
      text: `WPN: ${this.weaponMode}`,
      color: this.weaponMode === 'RAIL' ? PALETTE.cyanBright : this.weaponMode === 'SPREAD' ? PALETTE.goldPin : PALETTE.cyanCore,
      life: 0.85,
    });
    this.emitSnapshot(true);
  }

  // Active Skill 1: EMP NOVA (Clears enemy bullets + shocks all enemies)
  public triggerEmpNova() {
    if (this.phase !== 'PLAYING' || this.empCooldown > 0) return;
    this.empCooldown = this.empMaxCooldown;
    this.screenShake = 0.35;
    this.shockwaves.push({
      x: this.player.x,
      y: this.player.y,
      radius: 14,
      maxRadius: 360,
      color: PALETTE.cyanCore,
      life: 0.45,
      maxLife: 0.45,
      width: 4,
    });
    this.shockwaves.push({
      x: this.player.x,
      y: this.player.y,
      radius: 6,
      maxRadius: 280,
      color: '#ffffff',
      life: 0.35,
      maxLife: 0.35,
      width: 2,
    });

    // Vaporize all enemy bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b.fromPlayer) {
        this.spawnParticles(b.x, b.y, PALETTE.cyanBright, 3);
        this.bullets.splice(i, 1);
      }
    }

    // Shock all enemies
    for (let j = this.enemies.length - 1; j >= 0; j--) {
      const e = this.enemies[j];
      if (!e) continue;
      if (e.shieldHp) e.shieldHp = 0;
      if (e.kind === 'laser') e.laserState = 'idle';
      this.damageEnemy(e, j, 55, true);
    }
    if (this.boss.active) {
      this.boss.hp -= 75;
      this.boss.hitFlash = 0.2;
      if (this.boss.hp <= 0) this.handleBossDefeated();
    }

    this.popups.push({ x: this.player.x, y: this.player.y - 62, text: 'EMP NOVA!', color: PALETTE.cyanBright, life: 1.0 });
    this.emitSnapshot(true);
    // [SFX HOOK]: Play EMP shockwave blast
  }

  // Active Skill 2: OVERDRIVE SHIELD (5.5s Shield Barrier + Rapid Fire + Missile Salvo)
  public triggerOverdrive() {
    if (this.phase !== 'PLAYING' || this.overdriveCooldown > 0) return;
    this.overdriveCooldown = this.overdriveMaxCooldown;
    this.overdriveTimer = 5.5;
    this.shockwaves.push({
      x: this.player.x,
      y: this.player.y,
      radius: 10,
      maxRadius: 72,
      color: PALETTE.goldPin,
      life: 0.35,
      maxLife: 0.35,
      width: 3,
    });
    this.popups.push({ x: this.player.x, y: this.player.y - 62, text: 'OVERDRIVE SHIELD!', color: PALETTE.goldPin, life: 1.0 });
    this.emitSnapshot(true);
    // [SFX HOOK]: Play Overdrive ignition sound
  }

  public startMission(sectorOverride?: number) {
    if (sectorOverride) this.currentSector = Math.max(1, Math.min(this.save.maxSector, sectorOverride));
    const maxHp = this.getMaxHp();
    const speedBonus = (this.save.upgrades.thrusters - 1) * 24;
    const sec = this.currentSector;

    this.phase = 'PLAYING';
    this.runCaola = 0;
    this.runGpus = 0;
    this.enemiesDestroyed = 0;
    this.levelProgress = 0;
    this.waveTimer = 0.8;
    this.transportSpawnedStage = 0;
    this.bossWarningTimer = 0;
    this.overdriveTimer = 0;
    this.empCooldown = 0;
    this.overdriveCooldown = 0;
    this.missileTimer = 0.9;
    this.screenShake = 0;
    this.bullets = [];
    this.enemies = [];
    this.pickups = [];
    this.particles = [];
    this.shockwaves = [];
    this.popups = [];

    this.player = {
      x: CANVAS_W / 2,
      y: 500,
      w: 54,
      h: 102,
      speed: 205 + speedBonus,
      hp: maxHp,
      maxHp,
      fireCooldown: 0,
      invulnTimer: 0,
    };

    const bossHp = 1050 + (sec - 1) * 450;
    this.boss = {
      active: false,
      x: CANVAS_W / 2,
      y: -95,
      targetY: 126,
      w: 172,
      h: 82,
      vx: 62 + (sec - 1) * 10,
      hp: bossHp,
      maxHp: bossHp,
      fireTimer: 1.0,
      patternStep: 0,
      spiralAngle: 0,
      hitFlash: 0,
      corePulse: 0,
    };

    this.popups.push({
      x: CANVAS_W / 2,
      y: 260,
      text: `SECTOR 0${sec} // LAUNCH!`,
      color: PALETTE.cyanBright,
      life: 1.4,
    });

    this.emitSnapshot(true);
  }

  public async captureScreenshotBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }

  private initBackdrop() {
    this.stars = [];
    const cols = ['#ffffff', '#b8f8ff', '#9d7bb8', '#38e8ff', '#64748b'];
    for (let i = 0; i < 95; i++) {
      const layer = i % 3;
      this.stars.push({
        x: Math.floor(Math.random() * CANVAS_W),
        y: Math.floor(Math.random() * CANVAS_H),
        speed: layer === 0 ? 18 : layer === 1 ? 42 : 95,
        size: layer === 2 ? 2 : 1,
        color: cols[i % cols.length],
      });
    }

    this.dataPulses = [];
    const lanes = [34, 88, 180, 272, 326];
    for (let i = 0; i < 14; i++) {
      this.dataPulses.push({
        x: lanes[i % lanes.length],
        y: Math.random() * CANVAS_H,
        speed: 140 + (i % 4) * 35,
        len: 14 + (i % 3) * 8,
        color: i % 3 === 0 ? PALETTE.purpleLight : PALETTE.cyanCore,
      });
    }
  }

  // ===========================================================================
  // MODULE: INPUT
  // ===========================================================================
  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    this.keys[k] = true;
    if (this.phase !== 'PLAYING') return;
    if (k === ' ') e.preventDefault();
    if (k === 'f') this.toggleAutoFire();
    if (k === '1') this.cycleWeaponMode('PULSE');
    if (k === '2') this.cycleWeaponMode('SPREAD');
    if (k === '3') this.cycleWeaponMode('RAIL');
    if (k === 'tab') {
      e.preventDefault();
      this.cycleWeaponMode();
    }
    if (k === 'q') this.triggerEmpNova();
    if (k === 'e') this.triggerOverdrive();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  private toCanvasPoint(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }

  private hitBox(pt: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }, pad = 6) {
    return pt.x >= box.x - pad && pt.x <= box.x + box.w + pad && pt.y >= box.y - pad && pt.y <= box.y + box.h + pad;
  }

  private onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 || this.phase !== 'PLAYING') return;
    const pt = this.toCanvasPoint(e.clientX, e.clientY);
    if (this.hitBox(pt, this.autoBtnHitbox)) {
      this.toggleAutoFire();
      return;
    }
    if (this.hitBox(pt, this.wpnBtnHitbox)) {
      this.cycleWeaponMode();
      return;
    }
    if (Math.hypot(pt.x - this.empBtn.x, pt.y - this.empBtn.y) <= this.empBtn.r + 6) {
      this.triggerEmpNova();
      return;
    }
    if (Math.hypot(pt.x - this.ovrBtn.x, pt.y - this.ovrBtn.y) <= this.ovrBtn.r + 6) {
      this.triggerOverdrive();
      return;
    }
    this.mouseDown = true;
  };

  private onMouseUp = () => {
    this.mouseDown = false;
  };

  private updateJoystick(pxX: number, pxY: number) {
    const dx = pxX - this.joyCenter.x;
    const dy = pxY - this.joyCenter.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 4) {
      this.joyVec = { x: 0, y: 0 };
      return;
    }
    const clamped = Math.min(dist, this.joyCenter.r) / this.joyCenter.r;
    this.joyVec = { x: (dx / dist) * clamped, y: (dy / dist) * clamped };
  }

  private onTouchStart = (e: TouchEvent) => {
    if (this.phase !== 'PLAYING') return;
    if (e.cancelable) e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const pt = this.toCanvasPoint(t.clientX, t.clientY);

      if (this.hitBox(pt, this.autoBtnHitbox, 8)) {
        this.toggleAutoFire();
        continue;
      }
      if (this.hitBox(pt, this.wpnBtnHitbox, 8)) {
        this.cycleWeaponMode();
        continue;
      }
      if (Math.hypot(pt.x - this.empBtn.x, pt.y - this.empBtn.y) <= this.empBtn.r + 10) {
        this.triggerEmpNova();
        continue;
      }
      if (Math.hypot(pt.x - this.ovrBtn.x, pt.y - this.ovrBtn.y) <= this.ovrBtn.r + 10) {
        this.triggerOverdrive();
        continue;
      }
      if (Math.hypot(pt.x - this.fireBtn.x, pt.y - this.fireBtn.y) <= this.fireBtn.r + 16 && this.fireTouchId === null) {
        this.fireTouchId = t.identifier;
        this.firePressed = true;
        continue;
      }
      if (Math.hypot(pt.x - this.joyCenter.x, pt.y - this.joyCenter.y) <= this.joyCenter.r + 24 && this.joyTouchId === null) {
        this.joyTouchId = t.identifier;
        this.updateJoystick(pt.x, pt.y);
        continue;
      }
      if (this.dragTouchId === null) {
        this.dragTouchId = t.identifier;
        this.lastDragPos = pt;
      }
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (this.phase !== 'PLAYING') return;
    if (e.cancelable) e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const pt = this.toCanvasPoint(t.clientX, t.clientY);
      if (t.identifier === this.joyTouchId) {
        this.updateJoystick(pt.x, pt.y);
      } else if (t.identifier === this.dragTouchId && this.lastDragPos) {
        const dx = pt.x - this.lastDragPos.x;
        const dy = pt.y - this.lastDragPos.y;
        this.player.x = Math.max(this.player.w / 2 + 12, Math.min(CANVAS_W - this.player.w / 2 - 12, this.player.x + dx));
        this.player.y = Math.max(170, Math.min(CANVAS_H - this.player.h / 2 - 14, this.player.y + dy));
        this.lastDragPos = pt;
      }
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === this.joyTouchId) {
        this.joyTouchId = null;
        this.joyVec = { x: 0, y: 0 };
      } else if (t.identifier === this.fireTouchId) {
        this.fireTouchId = null;
        this.firePressed = false;
      } else if (t.identifier === this.dragTouchId) {
        this.dragTouchId = null;
        this.lastDragPos = null;
      }
    }
  };

  private bindInputs() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd);
    this.canvas.addEventListener('touchcancel', this.onTouchEnd);
  }

  private unbindInputs() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    this.canvas.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.removeEventListener('touchend', this.onTouchEnd);
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd);
  }

  // ===========================================================================
  // MODULE: SCROLLING SCI-FI BACKDROP LOGIC
  // ===========================================================================
  private updateScroll(dt: number) {
    const deckSpeed = this.phase === 'PLAYING' ? 68 + (this.currentSector - 1) * 10 : 22;
    this.scrollDistance += deckSpeed * dt;
    this.planetY += (this.phase === 'PLAYING' ? 6 : 2) * dt;
    if (this.planetY > CANVAS_H + 120) this.planetY = -120;

    for (const s of this.stars) {
      s.y += s.speed * (this.phase === 'PLAYING' ? 1.25 : 0.45) * dt;
      if (s.y > CANVAS_H) {
        s.y = -2;
        s.x = Math.floor(Math.random() * CANVAS_W);
      }
    }

    for (const dp of this.dataPulses) {
      dp.y += dp.speed * dt;
      if (dp.y > CANVAS_H + 30) dp.y = -30;
    }

    if (this.phase === 'PLAYING' && !this.boss.active) {
      this.levelProgress = Math.min(100, this.levelProgress + dt * 1.65);
      if (this.levelProgress >= 100 && !this.boss.active) {
        this.boss.active = true;
        this.bossWarningTimer = 2.6;
        // [SFX HOOK]: Play Boss Computing Core alarm siren
      }
    }
  }

  // ===========================================================================
  // MODULE: PLAYER LOGIC (3 Forward Weapons + Homing Missiles + Skills)
  // ===========================================================================
  private updatePlayer(dt: number) {
    let mx = 0;
    let my = 0;
    if (this.keys['w'] || this.keys['arrowup']) my -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) my += 1;
    if (this.keys['a'] || this.keys['arrowleft']) mx -= 1;
    if (this.keys['d'] || this.keys['arrowright']) mx += 1;

    if (mx !== 0 || my !== 0) {
      const len = Math.hypot(mx, my);
      mx /= len;
      my /= len;
    } else if (Math.abs(this.joyVec.x) > 0.1 || Math.abs(this.joyVec.y) > 0.1) {
      mx = this.joyVec.x;
      my = this.joyVec.y;
    }

    this.player.x = Math.max(
      this.player.w / 2 + 16,
      Math.min(CANVAS_W - this.player.w / 2 - 16, this.player.x + mx * this.player.speed * dt)
    );
    this.player.y = Math.max(
      170,
      Math.min(CANVAS_H - this.player.h / 2 - 14, this.player.y + my * this.player.speed * dt)
    );

    if (Math.random() < 0.85) {
      const thrusters = [-15, -6, 6, 15];
      const tx = this.player.x + thrusters[Math.floor(Math.random() * thrusters.length)];
      this.particles.push({
        x: tx,
        y: this.player.y + this.player.h * 0.48,
        vx: (Math.random() - 0.5) * 12,
        vy: 85 + Math.random() * 60,
        life: 0.2,
        maxLife: 0.2,
        color: this.overdriveTimer > 0 ? PALETTE.goldPin : Math.random() < 0.65 ? PALETTE.cyanCore : PALETTE.purpleLight,
        size: 3,
      });
    }

    if (this.player.invulnTimer > 0) this.player.invulnTimer -= dt;
    if (this.overdriveTimer > 0) this.overdriveTimer = Math.max(0, this.overdriveTimer - dt);
    if (this.empCooldown > 0) this.empCooldown = Math.max(0, this.empCooldown - dt);
    if (this.overdriveCooldown > 0) this.overdriveCooldown = Math.max(0, this.overdriveCooldown - dt);
    if (this.muzzleFlashTimer > 0) this.muzzleFlashTimer = Math.max(0, this.muzzleFlashTimer - dt);
    if (this.player.fireCooldown > 0) this.player.fireCooldown -= dt;

    const firing = this.mouseDown || this.firePressed || this.keys[' '] || this.autoFire;
    const baseCd =
      this.weaponMode === 'RAIL'
        ? 0.29 - (this.save.upgrades.firerate - 1) * 0.032
        : this.weaponMode === 'SPREAD'
        ? 0.20 - (this.save.upgrades.firerate - 1) * 0.025
        : 0.15 - (this.save.upgrades.firerate - 1) * 0.02;
    const activeCd = this.overdriveTimer > 0 ? baseCd * 0.6 : baseCd;

    if (firing && this.player.fireCooldown <= 0) {
      this.spawnForwardPlayerBullets();
      this.player.fireCooldown = activeCd;
      this.muzzleFlashTimer = 0.05;
    }

    // Wing Homing Micro-Missiles (unlocked at Cannons Lv2+ or active during Overdrive)
    if (firing && (this.save.upgrades.cannons >= 2 || this.overdriveTimer > 0)) {
      this.missileTimer -= dt * (this.overdriveTimer > 0 ? 2.1 : 1.0);
      if (this.missileTimer <= 0) {
        this.spawnWingMissiles();
        this.missileTimer = 1.25 - (this.save.upgrades.firerate - 1) * 0.12;
      }
    }
  }

  private spawnWingMissiles() {
    const dmg = 18 + this.save.upgrades.cannons * 4;
    [-20, 20].forEach((ox) => {
      this.bullets.push({
        x: this.player.x + ox,
        y: this.player.y - 16,
        vx: ox * 1.4,
        vy: -240,
        fromPlayer: true,
        damage: dmg,
        color: PALETTE.goldPin,
        size: 5,
        pierce: 1,
        kind: 'missile',
        trail: [],
      });
    });
  }

  // Fixed Straight-Forward Multi-Weapon Barrage
  private spawnForwardPlayerBullets() {
    const noseX = this.player.x;
    const noseY = this.player.y - this.player.h * 0.47;
    const cannonLvl = this.save.upgrades.cannons + (this.overdriveTimer > 0 ? 1 : 0);
    const dmg = 12 + (this.save.upgrades.cannons - 1) * 3;
    const mainCol = this.overdriveTimer > 0 ? PALETTE.goldPin : PALETTE.cyanBright;

    if (this.weaponMode === 'PULSE') {
      const spd = -530;
      if (cannonLvl === 1) {
        this.bullets.push({ x: noseX - 7, y: noseY + 8, vx: 0, vy: spd, fromPlayer: true, damage: dmg, color: mainCol, size: 4, pierce: 1, trail: [] });
        this.bullets.push({ x: noseX + 7, y: noseY + 8, vx: 0, vy: spd, fromPlayer: true, damage: dmg, color: mainCol, size: 4, pierce: 1, trail: [] });
      } else if (cannonLvl === 2) {
        this.bullets.push({ x: noseX, y: noseY, vx: 0, vy: spd - 40, fromPlayer: true, damage: dmg + 2, color: mainCol, size: 5, pierce: 1, trail: [] });
        this.bullets.push({ x: noseX - 11, y: noseY + 12, vx: 0, vy: spd, fromPlayer: true, damage: dmg, color: PALETTE.cyanCore, size: 4, pierce: 1, trail: [] });
        this.bullets.push({ x: noseX + 11, y: noseY + 12, vx: 0, vy: spd, fromPlayer: true, damage: dmg, color: PALETTE.cyanCore, size: 4, pierce: 1, trail: [] });
      } else if (cannonLvl === 3) {
        this.bullets.push({ x: noseX - 5, y: noseY + 2, vx: 0, vy: spd - 30, fromPlayer: true, damage: dmg, color: mainCol, size: 4, pierce: 1, trail: [] });
        this.bullets.push({ x: noseX + 5, y: noseY + 2, vx: 0, vy: spd - 30, fromPlayer: true, damage: dmg, color: mainCol, size: 4, pierce: 1, trail: [] });
        this.bullets.push({ x: noseX - 16, y: noseY + 16, vx: 0, vy: spd, fromPlayer: true, damage: dmg - 1, color: PALETTE.cyanCore, size: 3, pierce: 1, trail: [] });
        this.bullets.push({ x: noseX + 16, y: noseY + 16, vx: 0, vy: spd, fromPlayer: true, damage: dmg - 1, color: PALETTE.cyanCore, size: 3, pierce: 1, trail: [] });
      } else {
        this.bullets.push({ x: noseX, y: noseY - 2, vx: 0, vy: spd - 50, fromPlayer: true, damage: dmg + 3, color: '#ffffff', size: 5, pierce: 1, trail: [] });
        this.bullets.push({ x: noseX - 10, y: noseY + 8, vx: 0, vy: spd - 20, fromPlayer: true, damage: dmg, color: mainCol, size: 4, pierce: 1, trail: [] });
        this.bullets.push({ x: noseX + 10, y: noseY + 8, vx: 0, vy: spd - 20, fromPlayer: true, damage: dmg, color: mainCol, size: 4, pierce: 1, trail: [] });
        this.bullets.push({ x: noseX - 21, y: noseY + 20, vx: 0, vy: spd, fromPlayer: true, damage: dmg - 2, color: PALETTE.purpleLight, size: 3, pierce: 1, trail: [] });
        this.bullets.push({ x: noseX + 21, y: noseY + 20, vx: 0, vy: spd, fromPlayer: true, damage: dmg - 2, color: PALETTE.purpleLight, size: 3, pierce: 1, trail: [] });
      }
    } else if (this.weaponMode === 'SPREAD') {
      const spd = 490;
      const halfCount = Math.min(3, Math.ceil(cannonLvl / 1.4)); // 1->3, 2->5, 3->5, 4+->7 bolts
      for (let k = -halfCount; k <= halfCount; k++) {
        const ang = -Math.PI / 2 + k * 0.13;
        this.bullets.push({
          x: noseX + k * 4,
          y: noseY + Math.abs(k) * 4,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          fromPlayer: true,
          damage: Math.round(dmg * 0.72),
          color: k === 0 ? '#ffffff' : PALETTE.goldPin,
          size: k === 0 ? 4 : 3,
          pierce: 1,
          trail: [],
        });
      }
    } else {
      // RAIL: High-speed piercing cyan rail beams!
      const spd = -690;
      const railDmg = Math.round(dmg * 1.9);
      const count = cannonLvl >= 3 ? 2 : 1;
      for (let c = 0; c < count; c++) {
        const ox = count === 1 ? 0 : c === 0 ? -9 : 9;
        this.bullets.push({
          x: noseX + ox,
          y: noseY,
          vx: 0,
          vy: spd,
          fromPlayer: true,
          damage: railDmg,
          color: '#ffffff',
          size: 5,
          pierce: 3 + Math.floor(cannonLvl / 2),
          hitIds: new Set<number>(),
          kind: 'rail',
          trail: [],
        });
      }
    }
    // [SFX HOOK]: Play weapon fire sound
  }

  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > (b.kind === 'rail' ? 7 : 5)) b.trail.shift();

      if (b.kind === 'missile') {
        // Gentle forward homing steer toward nearest enemy
        let best: Enemy | { x: number; y: number } | null = null;
        let bestD = 9999;
        for (const e of this.enemies) {
          const d = Math.hypot(e.x - b.x, e.y - b.y);
          if (d < bestD && e.y < b.y + 40) {
            bestD = d;
            best = e;
          }
        }
        if (this.boss.active && !best) best = this.boss;
        if (best) {
          const ang = Math.atan2(best.y - b.y, best.x - b.x);
          b.vx += Math.cos(ang) * 520 * dt;
          b.vy += Math.sin(ang) * 520 * dt;
          const sp = Math.hypot(b.vx, b.vy);
          if (sp > 360) {
            b.vx = (b.vx / sp) * 360;
            b.vy = (b.vy / sp) * 360;
          }
        }
        if (Math.random() < 0.5) {
          this.particles.push({ x: b.x, y: b.y + 4, vx: 0, vy: 25, life: 0.16, maxLife: 0.16, color: PALETTE.hullLight, size: 2 });
        }
      } else if (b.kind === 'bomb' && b.fuseTimer !== undefined) {
        b.fuseTimer -= dt;
        if (b.fuseTimer <= 0) {
          // Cluster Bomb explodes into 4 diagonal plasma embers!
          for (let k = 0; k < 4; k++) {
            const ang = Math.PI / 4 + (k * Math.PI) / 2;
            this.bullets.push({
              x: b.x, y: b.y,
              vx: Math.cos(ang) * 145, vy: Math.sin(ang) * 145,
              fromPlayer: false, damage: 12, color: PALETTE.orangeCore, size: 4, pierce: 1, trail: [],
            });
          }
          this.shockwaves.push({ x: b.x, y: b.y, radius: 4, maxRadius: 34, color: PALETTE.orangeCore, life: 0.25, maxLife: 0.25, width: 2 });
          this.bullets.splice(i, 1);
          continue;
        }
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < -28 || b.x > CANVAS_W + 28 || b.y < -28 || b.y > CANVAS_H + 28) {
        this.bullets.splice(i, 1);
      }
    }
  }

  // ===========================================================================
  // MODULE: PROGRESSIVE WAVES & 9 ENEMY CLASSES + RTX TRANSPORT + BOSS
  // ===========================================================================
  private spawnTransportFreighter() {
    const hpScale = 1 + (this.currentSector - 1) * 0.25;
    const startX = 76 + Math.random() * (CANVAS_W - 152);
    const transportId = this.nextEnemyId++;
    const hullHp = Math.round(320 * hpScale);
    const shieldHp = Math.round(180 * hpScale);

    this.enemies.push({
      id: transportId,
      kind: 'transport',
      x: startX,
      y: -52,
      vx: (Math.random() < 0.5 ? -1 : 1) * 28,
      vy: 20,
      w: 96,
      h: 97,
      radius: 40,
      hp: hullHp,
      maxHp: hullHp,
      shieldHp,
      maxShieldHp: shieldHp,
      fireTimer: 1.15,
      hitFlash: 0,
      phase: 0,
      aimAngle: Math.PI / 2,
      patternStep: 0,
      spiralAngle: 0,
    });

    // Spawn 4 orbiting escort minions shielding and defending the RTX Transport Ship
    const escortCount = 4;
    for (let k = 0; k < escortCount; k++) {
      const ang = (k * Math.PI * 2) / escortCount;
      const orbR = 72;
      const isInterceptor = k % 2 === 1;
      const escHp = Math.round((isInterceptor ? 44 : 48) * hpScale);
      const escShield = Math.round(24 * hpScale);
      this.enemies.push({
        id: this.nextEnemyId++,
        kind: isInterceptor ? 'interceptor' : 'drone',
        x: Math.max(24, Math.min(CANVAS_W - 24, startX + Math.cos(ang) * orbR)),
        y: -52 + Math.sin(ang) * orbR * 0.85,
        vx: 0,
        vy: 82,
        w: 32,
        h: 32,
        radius: 15,
        hp: escHp,
        maxHp: escHp,
        shieldHp: escShield,
        maxShieldHp: escShield,
        fireTimer: 0.7 + k * 0.28,
        hitFlash: 0,
        phase: k * 0.9,
        aimAngle: Math.PI / 2,
        escortParentId: transportId,
        orbitAngle: ang,
        orbitRadius: orbR,
        orbitSpeed: 1.85,
      });
    }

    this.popups.push({
      x: CANVAS_W / 2,
      y: 98,
      text: '! RTX ARMORED CONVOY INBOUND !',
      color: PALETTE.chipBright,
      life: 1.8,
    });
    // [SFX HOOK]: Play RTX Transport radar ping
  }

  private spawnWave() {
    const p = this.levelProgress; // 0..100 progressive difficulty
    const hpScale = 1 + (this.currentSector - 1) * 0.22;
    const spdScale = 1 + (this.currentSector - 1) * 0.08;

    // Guaranteed RTX Transport Freighters at ~32% and ~72% progress
    if (p >= 32 && this.transportSpawnedStage === 0) {
      this.transportSpawnedStage = 1;
      this.spawnTransportFreighter();
      return;
    }
    if (p >= 72 && this.transportSpawnedStage === 1) {
      this.transportSpawnedStage = 2;
      this.spawnTransportFreighter();
      return;
    }

    // Progressive Tier Selection: Easy (0-25%) -> Medium (25-60%) -> Hard (60-100%)
    const roll = Math.random();
    if (p < 25 && this.currentSector === 1) {
      // Early warm-up: single or pair of slow scout drones or small interceptor wing
      if (roll < 0.65) {
        const baseX = 56 + Math.random() * (CANVAS_W - 112);
        for (let i = 0; i < 2; i++) {
          this.enemies.push({
            id: this.nextEnemyId++,
            kind: 'drone',
            x: Math.max(32, Math.min(CANVAS_W - 32, baseX + (i === 0 ? -24 : 24))),
            y: -24 - i * 24,
            vx: 0,
            vy: 66 * spdScale,
            w: 32,
            h: 32,
            radius: 15,
            hp: Math.round(24 * hpScale),
            maxHp: Math.round(24 * hpScale),
            fireTimer: 1.4,
            hitFlash: 0,
            phase: Math.random() * Math.PI * 2,
            aimAngle: Math.PI / 2,
          });
        }
      } else {
        this.spawnInterceptorWing(hpScale, spdScale);
      }
      return;
    }

    if (p < 60) {
      // Mid sector: introduces Hex Turret, Cluster Bomber, Spiral Pod
      if (roll < 0.26) this.spawnDroneSquad(3, hpScale, spdScale);
      else if (roll < 0.48) this.spawnInterceptorWing(hpScale, spdScale);
      else if (roll < 0.68) this.spawnTurret(hpScale, spdScale);
      else if (roll < 0.85) this.spawnBomber(hpScale, spdScale);
      else this.spawnSpiralPod(hpScale, spdScale);
    } else {
      // Late sector climax: adds Laser Striker, Aegis Shield Cruiser, Hunter EMP Mines
      if (roll < 0.16) this.spawnDroneSquad(3, hpScale, spdScale);
      else if (roll < 0.30) this.spawnInterceptorWing(hpScale, spdScale);
      else if (roll < 0.44) this.spawnTurret(hpScale, spdScale);
      else if (roll < 0.58) this.spawnBomber(hpScale, spdScale);
      else if (roll < 0.72) this.spawnSpiralPod(hpScale, spdScale);
      else if (roll < 0.84) this.spawnLaserStriker(hpScale, spdScale);
      else if (roll < 0.94) this.spawnShielder(hpScale, spdScale);
      else this.spawnMines(hpScale, spdScale);
    }
  }

  private spawnDroneSquad(count: number, hpScale: number, spdScale: number) {
    const baseX = 64 + Math.random() * (CANVAS_W - 128);
    for (let i = 0; i < count; i++) {
      this.enemies.push({
        id: this.nextEnemyId++, kind: 'drone',
        x: Math.max(30, Math.min(CANVAS_W - 30, baseX + (i - 1) * 46)),
        y: -24 - i * 24, vx: 0, vy: 74 * spdScale, w: 32, h: 32, radius: 15,
        hp: Math.round(28 * hpScale), maxHp: Math.round(28 * hpScale),
        fireTimer: 1.0 + Math.random() * 0.6, hitFlash: 0, phase: Math.random() * Math.PI * 2, aimAngle: Math.PI / 2,
      });
    }
  }

  private spawnInterceptorWing(hpScale: number, spdScale: number) {
    const cx = 75 + Math.random() * (CANVAS_W - 150);
    [{ dx: 0, dy: 0 }, { dx: -36, dy: -26 }, { dx: 36, dy: -26 }].forEach((off) => {
      this.enemies.push({
        id: this.nextEnemyId++, kind: 'interceptor',
        x: Math.max(28, Math.min(CANVAS_W - 28, cx + off.dx)),
        y: -26 + off.dy, vx: 0, vy: 108 * spdScale, w: 32, h: 34, radius: 14,
        hp: Math.round(24 * hpScale), maxHp: Math.round(24 * hpScale),
        fireTimer: 0.7, hitFlash: 0, phase: 0, aimAngle: Math.PI / 2,
      });
    });
  }

  private spawnTurret(hpScale: number, spdScale: number) {
    this.enemies.push({
      id: this.nextEnemyId++, kind: 'turret',
      x: 52 + Math.random() * (CANVAS_W - 104), y: -30, vx: 0, vy: 42 * spdScale, w: 36, h: 36, radius: 18,
      hp: Math.round(62 * hpScale), maxHp: Math.round(62 * hpScale),
      fireTimer: 0.9, hitFlash: 0, phase: 0, aimAngle: Math.PI / 2,
    });
  }

  private spawnBomber(hpScale: number, spdScale: number) {
    this.enemies.push({
      id: this.nextEnemyId++, kind: 'bomber',
      x: 56 + Math.random() * (CANVAS_W - 112), y: -32, vx: (Math.random() < 0.5 ? -1 : 1) * 28, vy: 46 * spdScale,
      w: 44, h: 34, radius: 19, hp: Math.round(70 * hpScale), maxHp: Math.round(70 * hpScale),
      fireTimer: 1.0, hitFlash: 0, phase: 0, aimAngle: Math.PI / 2,
    });
  }

  private spawnSpiralPod(hpScale: number, spdScale: number) {
    this.enemies.push({
      id: this.nextEnemyId++, kind: 'spiral',
      x: 68 + Math.random() * (CANVAS_W - 136), y: -30, vx: 0, vy: 48 * spdScale,
      w: 34, h: 34, radius: 16, hp: Math.round(66 * hpScale), maxHp: Math.round(66 * hpScale),
      fireTimer: 0.8, hitFlash: 0, phase: 0, aimAngle: Math.PI / 2, spiralAngle: 0,
    });
  }

  private spawnLaserStriker(hpScale: number, spdScale: number) {
    this.enemies.push({
      id: this.nextEnemyId++, kind: 'laser',
      x: 48 + Math.random() * (CANVAS_W - 96), y: -30, vx: 0, vy: 64 * spdScale,
      w: 38, h: 38, radius: 17, hp: Math.round(58 * hpScale), maxHp: Math.round(58 * hpScale),
      fireTimer: 1.2, hitFlash: 0, phase: 0, aimAngle: Math.PI / 2, laserState: 'idle', laserTimer: 0,
    });
  }

  private spawnShielder(hpScale: number, spdScale: number) {
    const sh = Math.round(55 * hpScale);
    this.enemies.push({
      id: this.nextEnemyId++, kind: 'shielder',
      x: 58 + Math.random() * (CANVAS_W - 116), y: -32, vx: 0, vy: 38 * spdScale,
      w: 44, h: 38, radius: 20, hp: Math.round(64 * hpScale), maxHp: Math.round(64 * hpScale),
      shieldHp: sh, maxShieldHp: sh, fireTimer: 1.1, hitFlash: 0, phase: 0, aimAngle: Math.PI / 2,
    });
  }

  private spawnMines(hpScale: number, spdScale: number) {
    for (let i = 0; i < 2; i++) {
      this.enemies.push({
        id: this.nextEnemyId++, kind: 'mine',
        x: 48 + Math.random() * (CANVAS_W - 96), y: -20 - i * 32, vx: 0, vy: 66 * spdScale,
        w: 28, h: 28, radius: 13, hp: Math.round(32 * hpScale), maxHp: Math.round(32 * hpScale),
        fireTimer: 2.3, hitFlash: 0, phase: 0, aimAngle: Math.PI / 2,
      });
    }
  }

  private updateBoss(dt: number) {
    this.boss.corePulse += dt * 4;
    if (this.boss.hitFlash > 0) this.boss.hitFlash -= dt;
    if (this.bossWarningTimer > 0) this.bossWarningTimer -= dt;

    if (this.boss.y < this.boss.targetY) {
      this.boss.y += 45 * dt;
      return;
    }

    const enraged = this.boss.hp < this.boss.maxHp * 0.45;
    this.boss.x += this.boss.vx * (enraged ? 1.4 : 1.0) * dt;
    if (this.boss.x < this.boss.w / 2 + 12) {
      this.boss.x = this.boss.w / 2 + 12;
      this.boss.vx = Math.abs(this.boss.vx);
    } else if (this.boss.x > CANVAS_W - this.boss.w / 2 - 12) {
      this.boss.x = CANVAS_W - this.boss.w / 2 - 12;
      this.boss.vx = -Math.abs(this.boss.vx);
    }

    this.boss.fireTimer -= dt;
    if (this.boss.fireTimer <= 0) {
      this.boss.patternStep = (this.boss.patternStep + 1) % 5;

      if (this.boss.patternStep === 0) {
        const count = enraged ? 3 : 2;
        for (let k = -count; k <= count; k++) {
          const ang = Math.PI / 2 + k * 0.22;
          this.bullets.push({
            x: this.boss.x, y: this.boss.y + 26,
            vx: Math.cos(ang) * 165, vy: Math.sin(ang) * 165,
            fromPlayer: false, damage: 14, color: PALETTE.cyanCore, size: 5, pierce: 1, trail: [],
          });
        }
        this.boss.fireTimer = enraged ? 0.9 : 1.15;
      } else if (this.boss.patternStep === 1) {
        [this.boss.x - 58, this.boss.x + 58].forEach((pxPos) => {
          const ang = Math.atan2(this.player.y - (this.boss.y + 26), this.player.x - pxPos);
          this.bullets.push({
            x: pxPos, y: this.boss.y + 28,
            vx: Math.cos(ang) * 205, vy: Math.sin(ang) * 205,
            fromPlayer: false, damage: 14, color: PALETTE.redWarn, size: 4, pierce: 1, trail: [],
          });
        });
        this.boss.fireTimer = 0.85;
      } else if (this.boss.patternStep === 2) {
        // Spiral Pinwheel Salvo
        this.boss.spiralAngle += 0.4;
        for (let k = 0; k < 8; k++) {
          const ang = this.boss.spiralAngle + (k * Math.PI * 2) / 8;
          this.bullets.push({
            x: this.boss.x, y: this.boss.y + 18,
            vx: Math.cos(ang) * 145, vy: Math.sin(ang) * 145,
            fromPlayer: false, damage: 12, color: PALETTE.purpleLight, size: 4, pierce: 1, trail: [],
          });
        }
        this.boss.fireTimer = 0.75;
      } else if (this.boss.patternStep === 3) {
        for (let offset = -50; offset <= 50; offset += 50) {
          this.bullets.push({
            x: this.boss.x + offset, y: this.boss.y + 34,
            vx: 0, vy: 225, fromPlayer: false, damage: 15, color: PALETTE.goldPin, size: 5, pierce: 1, trail: [],
          });
        }
        this.boss.fireTimer = 0.95;
      } else {
        if (this.enemies.length < 3) {
          this.enemies.push({
            id: this.nextEnemyId++,
            kind: Math.random() < 0.35 ? 'mine' : 'drone',
            x: Math.random() < 0.5 ? 46 : CANVAS_W - 46,
            y: this.boss.y + 20,
            vx: 0, vy: 76, w: 32, h: 32, radius: 15, hp: 26, maxHp: 26,
            fireTimer: 1.1, hitFlash: 0, phase: 0, aimAngle: Math.PI / 2,
          });
        }
        this.boss.fireTimer = 1.05;
      }
    }
  }

  private updateEnemies(dt: number) {
    if (!this.boss.active) {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.spawnWave();
        const progressEase = Math.max(0.95, 2.35 - this.levelProgress * 0.011 - (this.currentSector - 1) * 0.14);
        this.waveTimer = progressEase;
      }
    } else {
      this.updateBoss(dt);
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e) continue;
      e.phase += dt;
      if (e.hitFlash > 0) e.hitFlash -= dt;

      if (e.escortParentId !== undefined) {
        const parent = this.enemies.find((p) => p.id === e.escortParentId);
        if (parent) {
          e.orbitAngle = (e.orbitAngle ?? 0) + (e.orbitSpeed ?? 1.85) * dt;
          const r = e.orbitRadius ?? 72;
          e.x = Math.max(20, Math.min(CANVAS_W - 20, parent.x + Math.cos(e.orbitAngle) * r));
          e.y = parent.y + Math.sin(e.orbitAngle) * r * 0.85;
        } else {
          // Transport destroyed: escorts break formation and dive
          e.escortParentId = undefined;
          e.vy = 88;
        }
      } else if (e.kind === 'drone') {
        e.x = Math.max(24, Math.min(CANVAS_W - 24, e.x + Math.sin(e.phase * 3.2) * 44 * dt));
        e.y += e.vy * dt;
      } else if (e.kind === 'interceptor' || e.kind === 'turret' || e.kind === 'shielder') {
        e.y += e.vy * dt;
        if (e.kind === 'turret') e.aimAngle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      } else if (e.kind === 'bomber') {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (e.x < 34) { e.x = 34; e.vx = Math.abs(e.vx); }
        else if (e.x > CANVAS_W - 34) { e.x = CANVAS_W - 34; e.vx = -Math.abs(e.vx); }
      } else if (e.kind === 'spiral') {
        e.y += e.y < 145 ? e.vy * dt : e.vy * 0.35 * dt;
      } else if (e.kind === 'mine') {
        const dx = this.player.x - e.x;
        e.x += Math.sign(dx) * Math.min(Math.abs(dx), 48 * dt);
        e.y += e.vy * dt;
      } else if (e.kind === 'transport') {
        e.x += e.vx * dt;
        const speedY = e.y < 148 ? 28 : e.y < 235 ? 8 : 22;
        e.y += speedY * dt;
        if (e.x < 66) { e.x = 66; e.vx = Math.abs(e.vx); }
        else if (e.x > CANVAS_W - 66) { e.x = CANVAS_W - 66; e.vx = -Math.abs(e.vx); }

        // Escort drones reinforce & slowly recharge the transport ship's Aegis shield
        const escortsAlive = this.enemies.some((m) => m.escortParentId === e.id);
        if (escortsAlive && e.maxShieldHp && (e.shieldHp ?? 0) < e.maxShieldHp) {
          e.shieldHp = Math.min(e.maxShieldHp, (e.shieldHp ?? 0) + 10 * dt);
        }
      } else if (e.kind === 'laser') {
        if (e.laserState === 'idle') {
          e.y += e.vy * dt;
          if (e.y >= 115 && e.phase > 1.3) {
            e.laserState = 'telegraph';
            e.laserTimer = 0.85;
          }
        } else if (e.laserState === 'telegraph') {
          e.laserTimer = (e.laserTimer ?? 0) - dt;
          if (e.laserTimer <= 0) {
            e.laserState = 'firing';
            e.laserTimer = 0.55;
          }
        } else if (e.laserState === 'firing') {
          e.laserTimer = (e.laserTimer ?? 0) - dt;
          if (this.player.invulnTimer <= 0 && this.player.y > e.y && Math.abs(this.player.x - e.x) < 16) {
            this.damagePlayer(18);
          }
          if (e.laserTimer <= 0) {
            e.laserState = 'idle';
            e.vy = 92;
          }
        }
      }

      e.fireTimer -= dt;
      if (e.fireTimer <= 0 && e.y > 68 && e.y < CANVAS_H - 145) {
        if (e.kind === 'drone') {
          const ang = Math.atan2(this.player.y - e.y, this.player.x - e.x);
          this.bullets.push({
            x: e.x, y: e.y + 8, vx: Math.cos(ang) * 158, vy: Math.sin(ang) * 158,
            fromPlayer: false, damage: 11, color: PALETTE.cyanCore, size: 4, pierce: 1, trail: [],
          });
          e.fireTimer = e.escortParentId !== undefined ? 1.55 : 1.95;
        } else if (e.kind === 'interceptor') {
          [-8, 8].forEach((ox) => {
            this.bullets.push({
              x: e.x + ox, y: e.y + 12, vx: 0, vy: 205,
              fromPlayer: false, damage: 11, color: PALETTE.redWarn, size: 3, pierce: 1, trail: [],
            });
          });
          e.fireTimer = e.escortParentId !== undefined ? 1.35 : 1.5;
        } else if (e.kind === 'turret') {
          const base = Math.atan2(this.player.y - e.y, this.player.x - e.x);
          for (let s = -1; s <= 1; s++) {
            const ang = base + s * 0.22;
            this.bullets.push({
              x: e.x, y: e.y + 8, vx: Math.cos(ang) * 170, vy: Math.sin(ang) * 170,
              fromPlayer: false, damage: 13, color: PALETTE.redWarn, size: 4, pierce: 1, trail: [],
            });
          }
          e.fireTimer = 1.8;
        } else if (e.kind === 'bomber') {
          this.bullets.push({
            x: e.x, y: e.y + 14, vx: 0, vy: 115,
            fromPlayer: false, damage: 15, color: PALETTE.orangeCore, size: 6, pierce: 1,
            kind: 'bomb', fuseTimer: 0.85, trail: [],
          });
          e.fireTimer = 1.7;
        } else if (e.kind === 'spiral') {
          e.spiralAngle = (e.spiralAngle ?? 0) + 0.55;
          for (let k = 0; k < 6; k++) {
            const ang = e.spiralAngle + (k * Math.PI * 2) / 6;
            this.bullets.push({
              x: e.x, y: e.y, vx: Math.cos(ang) * 125, vy: Math.sin(ang) * 125,
              fromPlayer: false, damage: 11, color: PALETTE.purpleLight, size: 4, pierce: 1, trail: [],
            });
          }
          e.fireTimer = 1.15;
        } else if (e.kind === 'shielder') {
          [-12, 12].forEach((ox) => {
            this.bullets.push({
              x: e.x + ox, y: e.y + 16, vx: ox * 1.8, vy: 185,
              fromPlayer: false, damage: 13, color: PALETTE.cyanBright, size: 4, pierce: 1, trail: [],
            });
          });
          e.fireTimer = 1.4;
        } else if (e.kind === 'transport') {
          e.patternStep = ((e.patternStep ?? 0) + 1) % 3;
          if (e.patternStep === 0) {
            // Dual Wing 3-Way Aimed Spreads
            [-34, 34].forEach((ox) => {
              const baseAng = Math.atan2(this.player.y - (e.y + 24), this.player.x - (e.x + ox));
              for (let s = -1; s <= 1; s++) {
                const ang = baseAng + s * 0.2;
                this.bullets.push({
                  x: e.x + ox, y: e.y + 24,
                  vx: Math.cos(ang) * 175, vy: Math.sin(ang) * 175,
                  fromPlayer: false, damage: 13, color: PALETTE.redWarn, size: 4, pierce: 1, trail: [],
                });
              }
            });
            e.fireTimer = 1.25;
          } else if (e.patternStep === 1) {
            // Reactor Core 10-Way Plasma Burst
            e.spiralAngle = (e.spiralAngle ?? 0) + 0.35;
            for (let k = 0; k < 10; k++) {
              const ang = e.spiralAngle + (k * Math.PI * 2) / 10;
              this.bullets.push({
                x: e.x, y: e.y + 14,
                vx: Math.cos(ang) * 138, vy: Math.sin(ang) * 138,
                fromPlayer: false, damage: 12, color: PALETTE.orangeCore, size: 4, pierce: 1, trail: [],
              });
            }
            e.fireTimer = 1.15;
          } else {
            // Wing Cluster Bombs + Heavy Center Volley
            [-30, 30].forEach((ox) => {
              this.bullets.push({
                x: e.x + ox, y: e.y + 20, vx: ox * 0.35, vy: 118,
                fromPlayer: false, damage: 14, color: PALETTE.orangeCore, size: 6, pierce: 1,
                kind: 'bomb', fuseTimer: 0.8, trail: [],
              });
            });
            for (let k = -1; k <= 1; k++) {
              this.bullets.push({
                x: e.x + k * 14, y: e.y + 30, vx: k * 24, vy: 215,
                fromPlayer: false, damage: 14, color: PALETTE.goldPin, size: 5, pierce: 1, trail: [],
              });
            }
            e.fireTimer = 1.3;
          }
        } else if (e.kind === 'mine') {
          for (let k = 0; k < 8; k++) {
            const ang = (Math.PI * 2 * k) / 8;
            this.bullets.push({
              x: e.x, y: e.y, vx: Math.cos(ang) * 130, vy: Math.sin(ang) * 130,
              fromPlayer: false, damage: 12, color: PALETTE.redWarn, size: 4, pierce: 1, trail: [],
            });
          }
          this.shockwaves.push({ x: e.x, y: e.y, radius: 4, maxRadius: 42, color: PALETTE.redWarn, life: 0.25, maxLife: 0.25, width: 2 });
          this.enemies.splice(i, 1);
          continue;
        }
      }

      if (e.y > CANVAS_H + 64) this.enemies.splice(i, 1);
    }
  }

  // ===========================================================================
  // MODULE: PICKUPS, COLLISIONS & VFX
  // ===========================================================================
  private spawnPickup(kind: PickupKind, x: number, y: number, value: number) {
    this.pickups.push({ kind, x, y, vy: kind === 'gpu' ? 40 : 58, value, pulse: Math.random() * Math.PI * 2 });
  }

  private updatePickups(dt: number) {
    const magnetRange = 90 + (this.save.upgrades.thrusters - 1) * 28;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      pk.pulse += dt * 6;
      pk.y += pk.vy * dt;
      const dx = this.player.x - pk.x;
      const dy = this.player.y - pk.y;
      const d = Math.hypot(dx, dy);
      if (d < magnetRange && d > 1) {
        pk.x += (dx / d) * 210 * dt;
        pk.y += (dy / d) * 210 * dt;
      }
      if (pk.y > CANVAS_H + 28) this.pickups.splice(i, 1);
    }
  }

  private spawnParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 145;
      const life = 0.22 + Math.random() * 0.28;
      this.particles.push({
        x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        life, maxLife: life, color, size: Math.random() > 0.4 ? 3 : 2,
      });
    }
  }

  private damagePlayer(amt: number) {
    if (this.overdriveTimer > 0) {
      // Overdrive barrier absorbs hit!
      this.player.invulnTimer = 0.5;
      this.shockwaves.push({ x: this.player.x, y: this.player.y, radius: 18, maxRadius: 56, color: PALETTE.cyanCore, life: 0.22, maxLife: 0.22, width: 3 });
      this.popups.push({ x: this.player.x, y: this.player.y - 36, text: 'SHIELD BLOCK!', color: PALETTE.cyanBright, life: 0.65 });
      return;
    }
    this.player.hp = Math.max(0, this.player.hp - amt);
    this.player.invulnTimer = 0.85;
    this.screenShake = 0.25;
    this.spawnParticles(this.player.x, this.player.y, PALETTE.redWarn, 14);
    if (this.player.hp <= 0) {
      this.save.caola += this.runCaola;
      this.save.gpus += this.runGpus;
      if (this.runCaola > this.save.highScore) this.save.highScore = this.runCaola;
      this.persistSave();
      this.phase = 'GAMEOVER';
      this.emitSnapshot(true);
    }
  }

  private damageEnemy(e: Enemy, _index: number, dmg: number, isRail = false) {
    if (e.shieldHp && e.shieldHp > 0) {
      // Escort drones give transport 35% damage mitigation against non-rail shots while shield is active
      const escortsUp = e.kind === 'transport' && this.enemies.some((m) => m.escortParentId === e.id);
      const rawShieldDmg = isRail ? Math.round(dmg * 2.4) : dmg;
      const shieldDmg = escortsUp && !isRail ? Math.max(1, Math.round(rawShieldDmg * 0.65)) : rawShieldDmg;
      e.shieldHp = Math.max(0, e.shieldHp - shieldDmg);
      this.spawnParticles(e.x, e.y + 16, PALETTE.cyanBright, 5);
      if (e.shieldHp > 0) return;
      this.shockwaves.push({ x: e.x, y: e.y, radius: 10, maxRadius: e.kind === 'transport' ? 58 : 42, color: PALETTE.cyanCore, life: 0.25, maxLife: 0.25, width: 2 });
    }

    e.hp -= dmg;
    e.hitFlash = 0.08;
    if (e.hp <= 0) {
      this.enemiesDestroyed += 1;
      const isTrans = e.kind === 'transport';
      this.spawnParticles(e.x, e.y, PALETTE.cyanCore, isTrans ? 30 : 12);
      this.spawnParticles(e.x, e.y, isTrans ? PALETTE.orangeCore : PALETTE.purpleLight, isTrans ? 16 : 7);
      this.shockwaves.push({
        x: e.x, y: e.y, radius: 6, maxRadius: isTrans ? 64 : 30,
        color: isTrans ? PALETTE.chipBright : PALETTE.cyanCore, life: 0.28, maxLife: 0.28, width: isTrans ? 3 : 2,
      });

      if (isTrans) {
        // GPU Transport drops physical RTX VIBE GPU pickup + Caola bounty!
        this.spawnPickup('gpu', e.x, e.y, 1);
        this.spawnPickup('caola', e.x - 18, e.y + 8, 60);
        this.spawnPickup('repair', e.x + 18, e.y + 8, 25);
        this.popups.push({ x: e.x, y: e.y - 16, text: 'RTX GPU DROPPED!', color: PALETTE.chipBright, life: 1.1 });
        this.screenShake = 0.24;
      } else {
        const val = e.kind === 'turret' || e.kind === 'laser' || e.kind === 'bomber' || e.kind === 'shielder' ? 25 : 12;
        this.spawnPickup('caola', e.x, e.y, val);
        const r = Math.random();
        if (r < 0.08) this.spawnPickup('repair', e.x + 12, e.y, 25);
        else if (r < 0.13) this.spawnPickup('overdrive', e.x - 12, e.y, 5.5);
      }
      const realIdx = this.enemies.indexOf(e);
      if (realIdx !== -1) this.enemies.splice(realIdx, 1);
    }
  }

  private handleBossDefeated() {
    this.boss.active = false;
    this.enemies = [];
    this.bullets = [];
    this.screenShake = 0.55;
    this.runCaola += 300 + (this.currentSector - 1) * 100;
    this.runGpus += 2;
    this.save.caola += this.runCaola;
    this.save.gpus += this.runGpus;
    this.save.missionsCleared += 1;
    if (this.currentSector >= this.save.maxSector) {
      this.save.maxSector = Math.min(9, this.currentSector + 1);
    }
    if (this.runCaola > this.save.highScore) this.save.highScore = this.runCaola;
    this.persistSave();

    this.shockwaves.push({ x: this.boss.x, y: this.boss.y, radius: 12, maxRadius: 150, color: PALETTE.cyanBright, life: 0.55, maxLife: 0.55, width: 4 });
    for (let k = 0; k < 50; k++) {
      this.spawnParticles(
        this.boss.x + (Math.random() - 0.5) * this.boss.w,
        this.boss.y + (Math.random() - 0.5) * this.boss.h,
        k % 2 === 0 ? PALETTE.cyanBright : PALETTE.goldPin,
        1
      );
    }
    this.phase = 'VICTORY';
    this.emitSnapshot(true);
  }

  private updateCollisions() {
    const playerHitR = 15;

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      if (this.phase !== 'PLAYING') return;
      const b = this.bullets[i];
      if (!b) continue;
      if (b.fromPlayer) {
        let removeBullet = false;
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          if (!e) continue;
          if (b.hitIds && b.hitIds.has(e.id)) continue;
          const hitDist = e.kind === 'transport' ? 42 : e.radius + b.size;
          if (Math.hypot(b.x - e.x, b.y - e.y) <= hitDist) {
            if (b.hitIds) b.hitIds.add(e.id);
            this.spawnParticles(b.x, b.y, b.kind === 'missile' ? PALETTE.goldPin : PALETTE.cyanBright, b.kind === 'missile' ? 8 : 3);
            this.damageEnemy(e, j, b.damage, b.kind === 'rail');
            b.pierce -= 1;
            if (b.pierce <= 0) {
              removeBullet = true;
              break;
            }
          }
        }
        if (!removeBullet && this.boss.active) {
          if (
            b.x >= this.boss.x - this.boss.w / 2 &&
            b.x <= this.boss.x + this.boss.w / 2 &&
            b.y >= this.boss.y - this.boss.h / 2 &&
            b.y <= this.boss.y + this.boss.h / 2
          ) {
            this.boss.hp -= b.damage;
            this.boss.hitFlash = 0.06;
            removeBullet = true;
            this.spawnParticles(b.x, b.y, PALETTE.cyanBright, 4);
            if (this.boss.hp <= 0) {
              this.handleBossDefeated();
              return;
            }
          }
        }
        if (removeBullet && i < this.bullets.length) this.bullets.splice(i, 1);
      } else {
        if (this.player.invulnTimer <= 0 && Math.hypot(b.x - this.player.x, b.y - this.player.y) <= playerHitR + b.size) {
          this.bullets.splice(i, 1);
          this.damagePlayer(b.damage);
          if (this.phase !== 'PLAYING') return;
        }
      }
    }

    if (this.phase !== 'PLAYING') return;

    if (this.player.invulnTimer <= 0) {
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (!e) continue;
        if (Math.hypot(e.x - this.player.x, e.y - this.player.y) <= e.radius + playerHitR) {
          this.spawnParticles(e.x, e.y, PALETTE.redWarn, 14);
          if (e.kind !== 'transport') this.enemies.splice(j, 1);
          this.damagePlayer(22);
          if (this.phase !== 'PLAYING') return;
          break;
        }
      }
    }

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      if (Math.hypot(pk.x - this.player.x, pk.y - this.player.y) <= 32) {
        if (pk.kind === 'gpu') {
          this.runGpus += pk.value;
          this.spawnParticles(pk.x, pk.y, PALETTE.chipBright, 16);
          this.shockwaves.push({ x: pk.x, y: pk.y, radius: 6, maxRadius: 40, color: PALETTE.chipBright, life: 0.25, maxLife: 0.25, width: 2 });
          this.popups.push({ x: pk.x, y: pk.y - 12, text: '+1 RTX VIBE GPU!', color: PALETTE.chipBright, life: 1.1 });
        } else if (pk.kind === 'caola') {
          this.runCaola += pk.value;
          this.spawnParticles(pk.x, pk.y, PALETTE.goldPin, 7);
          this.popups.push({ x: pk.x, y: pk.y - 10, text: `+${pk.value} $CAOLA`, color: PALETTE.chipBright, life: 0.75 });
        } else if (pk.kind === 'repair') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + pk.value);
          this.spawnParticles(pk.x, pk.y, PALETTE.cyanBright, 10);
          this.popups.push({ x: pk.x, y: pk.y - 10, text: `+${pk.value} HULL HP`, color: PALETTE.cyanBright, life: 0.8 });
        } else {
          this.overdriveTimer = pk.value;
          this.spawnParticles(pk.x, pk.y, PALETTE.goldPin, 12);
          this.popups.push({ x: pk.x, y: pk.y - 10, text: 'HYPER VOLLEY!', color: PALETTE.goldPin, life: 0.9 });
        }
        this.pickups.splice(i, 1);
      }
    }
  }

  private updateParticles(dt: number) {
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life -= dt;
      sw.radius = sw.maxRadius * (1 - sw.life / sw.maxLife);
      if (sw.life <= 0) this.shockwaves.splice(i, 1);
    }
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y -= 28 * dt;
      pop.life -= dt;
      if (pop.life <= 0) this.popups.splice(i, 1);
    }
  }

  // ===========================================================================
  // MODULE: RENDERING
  // ===========================================================================
  private renderSciFiSpaceBackdrop(ctx: CanvasRenderingContext2D) {
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    grad.addColorStop(0, '#04060e');
    grad.addColorStop(0.5, '#0b1024');
    grad.addColorStop(1, '#140e28');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const py = Math.round(this.planetY);
    const pxCenter = 248;
    ctx.fillStyle = 'rgba(93, 72, 110, 0.30)';
    ctx.fillRect(pxCenter - 52, py - 52, 104, 104);
    ctx.fillStyle = 'rgba(56, 232, 255, 0.14)';
    ctx.fillRect(pxCenter - 44, py - 44, 88, 88);
    ctx.fillStyle = 'rgba(8, 145, 178, 0.35)';
    ctx.fillRect(pxCenter - 78, py - 4, 156, 8);
    ctx.fillStyle = 'rgba(184, 248, 255, 0.25)';
    ctx.fillRect(pxCenter - 68, py - 1, 136, 2);

    for (const s of this.stars) {
      ctx.fillStyle = s.color;
      ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
    }

    const tileH = 80;
    const off = Math.floor(this.scrollDistance) % tileH;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
    ctx.fillRect(28, 0, 12, CANVAS_H);
    ctx.fillRect(CANVAS_W - 40, 0, 12, CANVAS_H);
    ctx.fillStyle = 'rgba(24, 34, 60, 0.40)';
    ctx.fillRect(86, 0, 4, CANVAS_H);
    ctx.fillRect(270, 0, 4, CANVAS_H);
    ctx.fillRect(179, 0, 2, CANVAS_H);

    for (let y = off - tileH; y < CANVAS_H + tileH; y += tileH) {
      ctx.fillStyle = 'rgba(20, 28, 48, 0.65)';
      ctx.fillRect(0, y, CANVAS_W, 8);
      ctx.fillStyle = 'rgba(56, 232, 255, 0.22)';
      ctx.fillRect(28, y + 3, CANVAS_W - 56, 2);

      ctx.fillStyle = '#0d1322';
      ctx.fillRect(0, y, 22, tileH - 6);
      ctx.fillRect(CANVAS_W - 22, y, 22, tileH - 6);
      ctx.fillStyle = '#1d2740';
      ctx.fillRect(4, y + 6, 14, 26);
      ctx.fillRect(CANVAS_W - 18, y + 6, 14, 26);
      ctx.fillStyle = PALETTE.cyanDeep;
      ctx.fillRect(18, y + 12, 3, 18);
      ctx.fillRect(CANVAS_W - 21, y + 12, 3, 18);
      ctx.fillStyle = PALETTE.purpleMed;
      ctx.fillRect(6, y + 40, 10, 12);
      ctx.fillRect(CANVAS_W - 16, y + 40, 10, 12);
    }

    for (const dp of this.dataPulses) {
      ctx.fillStyle = dp.color;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(Math.round(dp.x), Math.round(dp.y), 2, dp.len);
    }
    ctx.globalAlpha = 1;
  }

  private renderLobbyHangar(ctx: CanvasRenderingContext2D) {
    this.renderSciFiSpaceBackdrop(ctx);

    ctx.fillStyle = 'rgba(8, 12, 24, 0.85)';
    ctx.fillRect(0, 0, CANVAS_W, 56);
    ctx.fillStyle = PALETTE.cyanCore;
    ctx.fillRect(0, 55, CANVAS_W, 2);

    ctx.fillStyle = 'rgba(13, 19, 36, 0.72)';
    ctx.fillRect(12, 64, CANVAS_W - 24, 232);
    ctx.strokeStyle = 'rgba(56, 232, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 64, CANVAS_W - 24, 232);

    ctx.fillStyle = '#0e1528';
    ctx.fillRect(14, 232, CANVAS_W - 28, 62);
    ctx.fillStyle = 'rgba(56, 232, 255, 0.35)';
    ctx.fillRect(14, 232, CANVAS_W - 28, 2);
    for (let x = 24; x < CANVAS_W - 20; x += 28) {
      ctx.fillStyle = 'rgba(56, 232, 255, 0.16)';
      ctx.fillRect(x, 234, 1, 60);
    }
    for (let y = 246; y < 292; y += 14) {
      ctx.fillStyle = 'rgba(56, 232, 255, 0.16)';
      ctx.fillRect(14, y, CANVAS_W - 28, 1);
    }

    const bob = Math.round(Math.sin(this.lobbyAnimTime * 2.6) * 2);
    ctx.fillStyle = 'rgba(56, 232, 255, 0.25)';
    ctx.fillRect(42, 266, 92, 12);
    ctx.fillStyle = PALETTE.cyanCore;
    ctx.fillRect(52, 270, 72, 3);
    if (this.caolaFullImg.complete && this.caolaFullImg.naturalWidth > 0) {
      ctx.drawImage(this.caolaFullImg, 44, 82 + bob, 86, 184);
    }

    const shipBob = Math.round(Math.sin(this.lobbyAnimTime * 3.1 + 1) * 3);
    ctx.fillStyle = 'rgba(157, 123, 184, 0.28)';
    ctx.fillRect(210, 266, 102, 12);
    ctx.fillStyle = PALETTE.purpleLight;
    ctx.fillRect(222, 270, 78, 3);
    if (this.shipImg.complete && this.shipImg.naturalWidth > 0) {
      ctx.drawImage(this.shipImg, 219, 90 + shipBob, 84, 158);
    }

    ctx.font = "bold 9px 'Courier New', monospace";
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.cyanBright;
    ctx.fillText('PILOT: CAOLA', 88, 287);
    ctx.fillStyle = PALETTE.purpleLight;
    ctx.fillText(`MK-${this.save.upgrades.cannons} INTERCEPTOR`, 261, 287);
  }

  private render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    if (this.phase === 'LOBBY') {
      this.renderLobbyHangar(ctx);
      ctx.restore();
      return;
    }

    if (this.screenShake > 0) {
      const mag = Math.round(this.screenShake * 16);
      ctx.translate(
        Math.round((Math.random() - 0.5) * mag),
        Math.round((Math.random() - 0.5) * mag)
      );
    }

    this.renderSciFiSpaceBackdrop(ctx);

    // Pickups
    for (const pk of this.pickups) {
      const bob = Math.round(Math.sin(pk.pulse) * 2);
      if (pk.kind === 'gpu') {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.28)';
        ctx.fillRect(Math.round(pk.x - 22), Math.round(pk.y - 14 + bob), 44, 28);
        ctx.strokeStyle = PALETTE.chipBright;
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(pk.x - 22), Math.round(pk.y - 14 + bob), 44, 28);
        if (this.rtxGpuImg.complete && this.rtxGpuImg.naturalWidth > 0) {
          ctx.drawImage(this.rtxGpuImg, Math.round(pk.x - 19), Math.round(pk.y - 12 + bob), 38, 24);
        }
      } else if (pk.kind === 'caola') {
        ctx.fillStyle = 'rgba(56, 232, 255, 0.20)';
        ctx.fillRect(Math.round(pk.x - 10), Math.round(pk.y - 10 + bob), 20, 20);
        ctx.drawImage(this.caolaShardSprite, Math.round(pk.x - 9), Math.round(pk.y - 9 + bob));
      } else if (pk.kind === 'repair') {
        px(ctx, pk.x - 8, pk.y - 8 + bob, 16, 16, PALETTE.outline);
        px(ctx, pk.x - 7, pk.y - 7 + bob, 14, 14, PALETTE.cyanDeep);
        px(ctx, pk.x - 2, pk.y - 5 + bob, 4, 10, '#ffffff');
        px(ctx, pk.x - 5, pk.y - 2 + bob, 10, 4, '#ffffff');
      } else {
        px(ctx, pk.x - 8, pk.y - 8 + bob, 16, 16, PALETTE.outline);
        px(ctx, pk.x - 7, pk.y - 7 + bob, 14, 14, PALETTE.goldPin);
        px(ctx, pk.x - 3, pk.y - 3 + bob, 6, 6, '#ffffff');
      }
    }

    // Escort tether beams (underneath enemy sprites)
    for (const e of this.enemies) {
      if (e.escortParentId !== undefined) {
        const parent = this.enemies.find((p) => p.id === e.escortParentId);
        if (parent) {
          ctx.save();
          ctx.strokeStyle = parent.shieldHp && parent.shieldHp > 0 ? 'rgba(56, 232, 255, 0.42)' : 'rgba(157, 123, 184, 0.32)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(Math.round(parent.x), Math.round(parent.y));
          ctx.lineTo(Math.round(e.x), Math.round(e.y));
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // Enemies
    for (const e of this.enemies) {
      if (e.kind === 'laser') {
        if (e.laserState === 'telegraph') {
          ctx.fillStyle = 'rgba(255, 77, 109, 0.55)';
          ctx.fillRect(Math.round(e.x - 1), Math.round(e.y + 18), 2, CANVAS_H - e.y);
        } else if (e.laserState === 'firing') {
          ctx.fillStyle = 'rgba(255, 77, 109, 0.45)';
          ctx.fillRect(Math.round(e.x - 8), Math.round(e.y + 18), 16, CANVAS_H - e.y);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(Math.round(e.x - 3), Math.round(e.y + 18), 6, CANVAS_H - e.y);
        }
      }

      ctx.save();
      ctx.translate(Math.round(e.x), Math.round(e.y));
      if (e.kind === 'drone') ctx.drawImage(this.droneSprite, -16, -16);
      else if (e.kind === 'interceptor') ctx.drawImage(this.interceptorSprite, -16, -17);
      else if (e.kind === 'bomber') ctx.drawImage(this.bomberSprite, -22, -17);
      else if (e.kind === 'spiral') ctx.drawImage(this.spiralSprite, -17, -17);
      else if (e.kind === 'laser') ctx.drawImage(this.laserStrikerSprite, -19, -19);
      else if (e.kind === 'mine') ctx.drawImage(this.mineSprite, -14, -14);
      else if (e.kind === 'shielder') {
        ctx.drawImage(this.shielderSprite, -22, -19);
      } else if (e.kind === 'turret') {
        ctx.drawImage(this.turretBaseSprite, -18, -18);
        ctx.save();
        ctx.rotate(e.aimAngle);
        px(ctx, 0, -4, 18, 8, PALETTE.outline);
        px(ctx, 2, -3, 15, 6, PALETTE.hullMed);
        px(ctx, 14, -3, 4, 6, PALETTE.armorDeep);
        ctx.restore();
      } else if (e.kind === 'transport') {
        // EXACT untouched uploaded RTX Transport Ship sprite!
        if (this.rtxTransportImg.complete && this.rtxTransportImg.naturalWidth > 0) {
          ctx.drawImage(this.rtxTransportImg, -48, -48, 96, 97);
        }
        // Heavy Aegis Defense Barrier Ring
        if (e.shieldHp && e.shieldHp > 0 && e.maxShieldHp) {
          const pulse = 0.45 + 0.25 * Math.sin(e.phase * 6);
          ctx.strokeStyle = `rgba(56, 232, 255, ${pulse.toFixed(2)})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, 52, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(157, 123, 184, 0.55)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 57, e.phase, e.phase + Math.PI * 1.3);
          ctx.stroke();
        }
        // Hull HP Bar + Shield Bar + Label
        px(ctx, -34, -60, 68, 5, PALETTE.outline);
        px(ctx, -33, -59, Math.round(66 * Math.max(0, e.hp / e.maxHp)), 3, PALETTE.chipBright);
        if (e.maxShieldHp && (e.shieldHp ?? 0) > 0) {
          px(ctx, -34, -54, 68, 4, PALETTE.outline);
          px(ctx, -33, -53, Math.round(66 * Math.max(0, (e.shieldHp ?? 0) / e.maxShieldHp)), 2, PALETTE.cyanCore);
        }
        ctx.font = "bold 8px 'Courier New', monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = PALETTE.chipBright;
        ctx.fillText('RTX TRANSPORT', 0, -64);
      }

      // Escort / Shielder shield arc
      if (e.kind !== 'transport' && e.shieldHp && e.shieldHp > 0) {
        ctx.strokeStyle = PALETTE.cyanCore;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, e.kind === 'shielder' ? 26 : 19, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      }

      if (e.hitFlash > 0) {
        ctx.fillStyle = 'rgba(184, 248, 255, 0.55)';
        ctx.fillRect(-e.w / 2 + 4, -e.h / 2 + 4, e.w - 8, e.h - 8);
      }
      ctx.restore();
    }

    // Boss Computing Core
    if (this.boss.active) {
      const bx = Math.round(this.boss.x - this.boss.w / 2);
      const by = Math.round(this.boss.y - this.boss.h / 2);
      ctx.drawImage(this.bossSprite, bx, by);
      const alpha = 0.25 + 0.25 * Math.sin(this.boss.corePulse);
      ctx.fillStyle = `rgba(56, 232, 255, ${alpha.toFixed(2)})`;
      ctx.fillRect(Math.round(this.boss.x - 12), Math.round(this.boss.y - 12), 24, 24);
      if (this.boss.hitFlash > 0) {
        ctx.fillStyle = 'rgba(184, 248, 255, 0.45)';
        ctx.fillRect(bx + 6, by + 6, this.boss.w - 12, this.boss.h - 12);
      }
    }

    // Bullets & Rail Trails
    for (const b of this.bullets) {
      for (let t = 0; t < b.trail.length; t++) {
        const pt = b.trail[t];
        ctx.fillStyle =
          b.kind === 'rail'
            ? 'rgba(184, 248, 255, 0.65)'
            : b.kind === 'missile'
            ? 'rgba(250, 204, 21, 0.45)'
            : b.fromPlayer
            ? 'rgba(56, 232, 255, 0.35)'
            : 'rgba(255, 77, 109, 0.35)';
        const sz = b.kind === 'rail' ? b.size : Math.max(1, b.size - 1);
        ctx.fillRect(Math.round(pt.x - sz / 2), Math.round(pt.y - sz / 2), sz, b.kind === 'rail' ? 10 : sz);
      }
      ctx.fillStyle = PALETTE.outline;
      ctx.fillRect(Math.round(b.x - b.size / 2 - 1), Math.round(b.y - b.size / 2 - 1), b.size + 2, b.size + 2);
      ctx.fillStyle = b.color;
      ctx.fillRect(Math.round(b.x - b.size / 2), Math.round(b.y - b.size / 2), b.size, b.kind === 'rail' ? 12 : b.size);
    }

    // Player Spaceship (100% Untouched Original Asset)
    if (this.phase === 'PLAYING') {
      const blink = this.player.invulnTimer > 0 && Math.floor(this.player.invulnTimer * 18) % 2 === 0;
      if (!blink) {
        const sx = Math.round(this.player.x - this.player.w / 2);
        const sy = Math.round(this.player.y - this.player.h / 2);
        if (this.shipImg.complete && this.shipImg.naturalWidth > 0) {
          ctx.drawImage(this.shipImg, sx, sy, this.player.w, this.player.h);
        } else {
          px(ctx, sx + 12, sy, this.player.w - 24, this.player.h, PALETTE.hullMed);
        }

        if (this.muzzleFlashTimer > 0) {
          ctx.fillStyle = 'rgba(184, 248, 255, 0.75)';
          ctx.fillRect(Math.round(this.player.x - 8), sy - 6, 16, 8);
        }

        if (this.overdriveTimer > 0) {
          ctx.strokeStyle = PALETTE.goldPin;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(Math.round(this.player.x), Math.round(this.player.y), 46, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Shockwaves & Particles
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sw.life / sw.maxLife);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.width;
      ctx.beginPath();
      ctx.arc(Math.round(sw.x), Math.round(sw.y), Math.round(sw.radius), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const pt of this.particles) {
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
    }
    ctx.globalAlpha = 1;

    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.textAlign = 'center';
    for (const pop of this.popups) {
      ctx.fillStyle = PALETTE.outline;
      ctx.fillText(pop.text, Math.round(pop.x) + 1, Math.round(pop.y) + 1);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, Math.round(pop.x), Math.round(pop.y));
    }

    if (this.bossWarningTimer > 0 && Math.floor(this.bossWarningTimer * 6) % 2 === 0) {
      ctx.fillStyle = 'rgba(157, 23, 77, 0.85)';
      ctx.fillRect(20, 260, CANVAS_W - 40, 42);
      ctx.strokeStyle = PALETTE.redWarn;
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 260, CANVAS_W - 40, 42);
      ctx.font = "bold 13px 'Courier New', monospace";
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('!! WARNING: COMPUTING CORE !!', CANVAS_W / 2, 285);
    }

    // Combat HUD
    ctx.fillStyle = PALETTE.hudBg;
    ctx.fillRect(0, 0, CANVAS_W, 58);
    ctx.fillStyle = PALETTE.cyanDeep;
    ctx.fillRect(0, 57, CANVAS_W, 1);

    if (this.pilotImg.complete && this.pilotImg.naturalWidth > 0) {
      ctx.fillStyle = PALETTE.outline;
      ctx.fillRect(6, 6, 30, 30);
      ctx.drawImage(this.pilotImg, 7, 7, 28, 28);
      ctx.strokeStyle = PALETTE.cyanCore;
      ctx.lineWidth = 1;
      ctx.strokeRect(6.5, 6.5, 29, 29);
    }

    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.hullLight;
    ctx.fillText(`HP ${this.player.hp}/${this.player.maxHp}`, 42, 15);
    px(ctx, 42, 19, 92, 8, PALETTE.outline);
    const hpRatio = this.player.hp / this.player.maxHp;
    px(ctx, 43, 20, Math.round(90 * hpRatio), 6, hpRatio > 0.5 ? PALETTE.cyanCore : hpRatio > 0.25 ? PALETTE.goldPin : PALETTE.redWarn);

    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.chipBright;
    ctx.fillText(`$CAOLA:${this.runCaola}`, 190, 15);
    ctx.fillStyle = PALETTE.goldPin;
    ctx.fillText(`RTX GPU:${this.runGpus}`, 190, 28);

    ctx.textAlign = 'right';
    if (this.boss.active) {
      ctx.fillStyle = PALETTE.redWarn;
      ctx.fillText(`S${this.currentSector} CORE:${Math.max(0, Math.ceil((this.boss.hp / this.boss.maxHp) * 100))}%`, CANVAS_W - 8, 15);
    } else {
      ctx.fillStyle = PALETTE.cyanBright;
      ctx.fillText(`SEC-${this.currentSector}:${Math.floor(this.levelProgress)}%`, CANVAS_W - 8, 15);
    }

    // Weapon Toggle Button
    ctx.fillStyle = 'rgba(20, 28, 48, 0.92)';
    ctx.fillRect(this.wpnBtnHitbox.x, this.wpnBtnHitbox.y, this.wpnBtnHitbox.w, this.wpnBtnHitbox.h);
    ctx.strokeStyle = this.weaponMode === 'RAIL' ? PALETTE.cyanBright : this.weaponMode === 'SPREAD' ? PALETTE.goldPin : PALETTE.cyanCore;
    ctx.lineWidth = 1;
    ctx.strokeRect(this.wpnBtnHitbox.x + 0.5, this.wpnBtnHitbox.y + 0.5, this.wpnBtnHitbox.w - 1, this.wpnBtnHitbox.h - 1);
    ctx.font = "bold 9px 'Courier New', monospace";
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.weaponMode, this.wpnBtnHitbox.x + this.wpnBtnHitbox.w / 2, this.wpnBtnHitbox.y + 12);

    // AUTO Toggle Button
    ctx.fillStyle = this.autoFire ? 'rgba(34, 197, 94, 0.28)' : 'rgba(24, 30, 48, 0.9)';
    ctx.fillRect(this.autoBtnHitbox.x, this.autoBtnHitbox.y, this.autoBtnHitbox.w, this.autoBtnHitbox.h);
    ctx.strokeStyle = this.autoFire ? PALETTE.chipBright : PALETTE.hullDark;
    ctx.strokeRect(this.autoBtnHitbox.x + 0.5, this.autoBtnHitbox.y + 0.5, this.autoBtnHitbox.w - 1, this.autoBtnHitbox.h - 1);
    ctx.fillStyle = this.autoFire ? PALETTE.chipBright : PALETTE.hullLight;
    ctx.fillText(this.autoFire ? 'AUTO:ON' : 'AUTO:OF', this.autoBtnHitbox.x + this.autoBtnHitbox.w / 2, this.autoBtnHitbox.y + 12);

    // Sector Progress Bar
    px(ctx, 8, 43, CANVAS_W - 138, 6, PALETTE.outline);
    if (this.boss.active) {
      px(ctx, 9, 44, Math.round((CANVAS_W - 140) * Math.max(0, this.boss.hp / this.boss.maxHp)), 4, PALETTE.redWarn);
    } else {
      px(ctx, 9, 44, Math.round((CANVAS_W - 140) * (this.levelProgress / 100)), 4, PALETTE.cyanCore);
    }

    // Mobile Touch Controls + Active Skill Buttons
    if (this.phase === 'PLAYING') {
      // Joystick
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.joyCenter.x, this.joyCenter.y, this.joyCenter.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(18, 22, 34, 0.35)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(56, 232, 255, 0.45)';
      ctx.stroke();

      const kx = Math.round(this.joyCenter.x + this.joyVec.x * (this.joyCenter.r - 12));
      const ky = Math.round(this.joyCenter.y + this.joyVec.y * (this.joyCenter.r - 12));
      ctx.beginPath();
      ctx.arc(kx, ky, 15, 0, Math.PI * 2);
      ctx.fillStyle = this.joyTouchId !== null ? 'rgba(56, 232, 255, 0.72)' : 'rgba(56, 232, 255, 0.40)';
      ctx.fill();
      ctx.restore();

      // Skill Buttons (EMP & OVERDRIVE)
      [
        { btn: this.empBtn, cd: this.empCooldown, label: 'EMP', key: 'Q', color: PALETTE.cyanCore },
        { btn: this.ovrBtn, cd: this.overdriveCooldown, label: 'OVR', key: 'E', color: PALETTE.goldPin },
      ].forEach((s) => {
        const ready = s.cd <= 0;
        ctx.save();
        ctx.beginPath();
        ctx.arc(s.btn.x, s.btn.y, s.btn.r, 0, Math.PI * 2);
        ctx.fillStyle = ready ? 'rgba(18, 28, 48, 0.62)' : 'rgba(10, 12, 20, 0.55)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = ready ? s.color : 'rgba(100, 116, 139, 0.45)';
        ctx.stroke();
        ctx.font = "bold 9px 'Courier New', monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = ready ? '#ffffff' : '#94a3b8';
        ctx.fillText(ready ? s.label : `${Math.ceil(s.cd)}s`, s.btn.x, s.btn.y + 3);
        ctx.restore();
      });

      // Fire Button
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.fireBtn.x, this.fireBtn.y, this.fireBtn.r, 0, Math.PI * 2);
      ctx.fillStyle = this.firePressed || this.autoFire ? 'rgba(56, 232, 255, 0.52)' : 'rgba(18, 22, 34, 0.35)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.firePressed || this.autoFire ? PALETTE.cyanBright : 'rgba(56, 232, 255, 0.50)';
      ctx.stroke();
      ctx.font = "bold 11px 'Courier New', monospace";
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(184, 248, 255, 0.88)';
      ctx.fillText('FIRE', this.fireBtn.x, this.fireBtn.y + 4);
      ctx.restore();
    }

    // End Screen
    if (this.phase === 'VICTORY' || this.phase === 'GAMEOVER') {
      const win = this.phase === 'VICTORY';
      ctx.fillStyle = 'rgba(6, 9, 18, 0.88)';
      ctx.fillRect(18, 86, CANVAS_W - 36, 404);
      ctx.strokeStyle = win ? PALETTE.cyanCore : PALETTE.redWarn;
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 86, CANVAS_W - 36, 404);

      if (this.caolaFullImg.complete && this.caolaFullImg.naturalWidth > 0) {
        ctx.drawImage(this.caolaFullImg, 34, 102, 54, 114);
      }
      if (this.rtxGpuImg.complete && this.rtxGpuImg.naturalWidth > 0) {
        ctx.drawImage(this.rtxGpuImg, CANVAS_W - 134, 128, 96, 60);
      }

      ctx.textAlign = 'center';
      ctx.font = "bold 20px 'Courier New', monospace";
      ctx.fillStyle = win ? PALETTE.cyanBright : PALETTE.redWarn;
      ctx.fillText(win ? `SECTOR ${this.currentSector} CLEARED!` : 'SIGNAL LOST // KIA', CANVAS_W / 2, 244);

      ctx.font = "bold 11px 'Courier New', monospace";
      ctx.fillStyle = PALETTE.hullLight;
      ctx.fillText(win ? 'NEXT SECTOR UNLOCKED IN HANGAR!' : 'RECOVERED LOOT SAVED TO HANGAR.', CANVAS_W / 2, 264);

      ctx.fillStyle = '#0d1324';
      ctx.fillRect(36, 282, CANVAS_W - 72, 134);
      ctx.strokeStyle = PALETTE.purpleLight;
      ctx.lineWidth = 1;
      ctx.strokeRect(36, 282, CANVAS_W - 72, 134);

      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.fillStyle = PALETTE.chipBright;
      ctx.fillText(`SORTIE $CAOLA : +${this.runCaola}`, CANVAS_W / 2, 308);
      ctx.fillStyle = PALETTE.goldPin;
      ctx.fillText(`RTX GPUs LOOTED: +${this.runGpus}`, CANVAS_W / 2, 332);
      ctx.fillStyle = PALETTE.cyanBright;
      ctx.fillText(`TOTAL RTX GPUs : ${this.save.gpus}`, CANVAS_W / 2, 356);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`$RTX STONK     : ${this.save.rtxStonk.toFixed(2)} $RTX`, CANVAS_W / 2, 380);
      ctx.fillStyle = PALETTE.hullLight;
      ctx.fillText(`UNITS DOWNED   : ${this.enemiesDestroyed}`, CANVAS_W / 2, 404);
    }

    ctx.restore();
  }

  private emitSnapshot(force = false) {
    const now = performance.now();
    if (!force && now - this.lastEmitTime < 90) return;
    this.lastEmitTime = now;

    this.onStateChange({
      phase: this.phase,
      sector: this.currentSector,
      maxSector: this.save.maxSector,
      caola: this.save.caola,
      runCaola: this.runCaola,
      gpus: this.save.gpus,
      runGpus: this.runGpus,
      rtxStonk: this.save.rtxStonk,
      enemiesDestroyed: this.enemiesDestroyed,
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      progress: this.levelProgress,
      bossActive: this.boss.active,
      autoFire: this.autoFire,
      weaponMode: this.weaponMode,
      empCooldown: this.empCooldown,
      empMaxCooldown: this.empMaxCooldown,
      overdriveCooldown: this.overdriveCooldown,
      overdriveMaxCooldown: this.overdriveMaxCooldown,
      overdriveTimer: this.overdriveTimer,
      upgrades: { ...this.save.upgrades },
      highScore: this.save.highScore,
      missionsCleared: this.save.missionsCleared,
    });
  }

  private loop = (now: number) => {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.lobbyAnimTime += dt;

    this.updateScroll(dt);

    if (this.phase === 'PLAYING') {
      this.updatePlayer(dt);
      this.updateBullets(dt);
      this.updateEnemies(dt);
      this.updatePickups(dt);
      this.updateCollisions();
      this.emitSnapshot(false);
    }

    this.updateParticles(dt);
    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  };
}
