/**
 * Handcrafted Physics Puzzle Levels for GameClub
 * Web3 Meme & Cyberpunk Degen theme with stable platform coordinates.
 */

export interface PlatformDef {
  x: number; // center x
  y: number; // center y
  w: number;
  h: number;
  color?: string;
  borderColor?: string;
  angle?: number; // radians
  label?: string;
}

export interface HazardDef {
  x: number; // center x
  y: number; // center y
  w: number;
  h: number;
  type: 'spikes' | 'acid' | 'void';
}

export interface HiveDef {
  x: number;
  y: number;
  beeCount: number;
}

export interface AnchorPinDef {
  x: number;
  y: number;
  label?: string;
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  characterPos: { x: number; y: number };
  hives: HiveDef[];
  platforms: PlatformDef[];
  hazards?: HazardDef[];
  anchorPins?: AnchorPinDef[];
  maxInk: number;
  countdownTime: number; // in seconds
  rewardCaola: number;
  rewardNvdaShards: number;
}

export const LEVELS: LevelConfig[] = [
  // Level 1: The Genesis Node (Hook on golden staking node)
  {
    id: 1,
    title: 'LEVEL 1: GENESIS BLOCK',
    subtitle: 'Hook smart contract firewall onto the staking node!',
    characterPos: { x: 200, y: 412 },
    hives: [{ x: 200, y: 70, beeCount: 14 }],
    platforms: [
      { x: 200, y: 520, w: 90, h: 140, color: '#111827', borderColor: '#10b981', label: 'GENESIS' },
      { x: 60, y: 640, w: 120, h: 40, color: '#1e293b' },
      { x: 340, y: 640, w: 120, h: 40, color: '#1e293b' },
    ],
    anchorPins: [
      { x: 130, y: 310, label: 'NODE 1' },
      { x: 270, y: 310, label: 'NODE 2' },
    ],
    hazards: [
      { x: 200, y: 650, w: 160, h: 30, type: 'spikes' },
    ],
    maxInk: 650,
    countdownTime: 8,
    rewardCaola: 50,
    rewardNvdaShards: 1.0,
  },

  // Level 2: Bear Market Slope (Angled slope sliding down to rekt zone)
  {
    id: 2,
    title: 'LEVEL 2: BEAR MARKET SLIDE',
    subtitle: 'Steep red candle! Anchor your shield before it slides off!',
    characterPos: { x: 160, y: 395 },
    hives: [{ x: 280, y: 75, beeCount: 16 }],
    platforms: [
      { x: 170, y: 520, w: 220, h: 40, angle: 0.35, color: '#111827', borderColor: '#ef4444' },
    ],
    anchorPins: [
      { x: 80, y: 330, label: 'PEG' },
    ],
    hazards: [
      { x: 320, y: 640, w: 160, h: 40, type: 'spikes' },
    ],
    maxInk: 680,
    countdownTime: 8,
    rewardCaola: 75,
    rewardNvdaShards: 1.5,
  },

  // Level 3: Liquidity Gorge (Flanking swarm of liquidation bots)
  {
    id: 3,
    title: 'LEVEL 3: LIQUIDITY GORGE',
    subtitle: 'Flanking bots! Connect the two validator pins above!',
    characterPos: { x: 200, y: 492 },
    hives: [
      { x: 70, y: 80, beeCount: 10 },
      { x: 330, y: 80, beeCount: 10 },
    ],
    platforms: [
      { x: 40, y: 380, w: 90, h: 180, color: '#111827', borderColor: '#3b82f6' },
      { x: 360, y: 380, w: 90, h: 180, color: '#111827', borderColor: '#3b82f6' },
      { x: 200, y: 550, w: 120, h: 40, color: '#1e293b' },
    ],
    anchorPins: [
      { x: 95, y: 270, label: 'ETH' },
      { x: 305, y: 270, label: 'SOL' },
    ],
    hazards: [
      { x: 120, y: 650, w: 80, h: 30, type: 'spikes' },
      { x: 280, y: 650, w: 80, h: 30, type: 'spikes' },
    ],
    maxInk: 720,
    countdownTime: 9,
    rewardCaola: 100,
    rewardNvdaShards: 2.0,
  },

  // Level 4: Diamond Hands Spire (Floating pedestal over spikes)
  {
    id: 4,
    title: 'LEVEL 4: DIAMOND HANDS',
    subtitle: 'High stakes! Hold the line above the liquidation pit!',
    characterPos: { x: 200, y: 384 },
    hives: [{ x: 200, y: 70, beeCount: 18 }],
    platforms: [
      { x: 200, y: 440, w: 80, h: 35, color: '#111827', borderColor: '#10b981', label: 'HODL' },
      { x: 200, y: 200, w: 60, h: 22, color: '#334155' },
    ],
    anchorPins: [
      { x: 135, y: 235, label: 'HODL 1' },
      { x: 265, y: 235, label: 'HODL 2' },
    ],
    hazards: [
      { x: 200, y: 645, w: 380, h: 40, type: 'spikes' },
    ],
    maxInk: 700,
    countdownTime: 8,
    rewardCaola: 120,
    rewardNvdaShards: 2.5,
  },

  // Level 5: Gas Limit Funnel
  {
    id: 5,
    title: 'LEVEL 5: GAS SPIKE FUNNEL',
    subtitle: 'Bees shoot down the ramp! Build an anchored deflect shield!',
    characterPos: { x: 110, y: 490 },
    hives: [{ x: 320, y: 70, beeCount: 20 }],
    platforms: [
      { x: 110, y: 550, w: 160, h: 44, color: '#111827', borderColor: '#10b981' },
      { x: 280, y: 300, w: 180, h: 24, angle: 0.45, color: '#1e293b', borderColor: '#f59e0b' },
    ],
    anchorPins: [
      { x: 60, y: 350, label: 'HOOK' },
      { x: 180, y: 350, label: 'PEG' },
    ],
    hazards: [
      { x: 290, y: 640, w: 180, h: 40, type: 'spikes' },
    ],
    maxInk: 750,
    countdownTime: 9,
    rewardCaola: 150,
    rewardNvdaShards: 3.0,
  },

  // Level 6: The Cliff Precipice
  {
    id: 6,
    title: 'LEVEL 6: EDGE OF RUGPULL',
    subtitle: 'Perched on the cliff! Hook your shield back into the rock!',
    characterPos: { x: 130, y: 387 },
    hives: [
      { x: 90, y: 75, beeCount: 11 },
      { x: 310, y: 120, beeCount: 12 },
    ],
    platforms: [
      { x: 100, y: 510, w: 200, h: 170, color: '#111827', borderColor: '#6366f1' },
      { x: 340, y: 400, w: 80, h: 25, color: '#1e293b' },
    ],
    anchorPins: [
      { x: 45, y: 290, label: 'WALL' },
      { x: 210, y: 320, label: 'PIN' },
    ],
    hazards: [
      { x: 290, y: 640, w: 190, h: 40, type: 'spikes' },
    ],
    maxInk: 780,
    countdownTime: 9,
    rewardCaola: 175,
    rewardNvdaShards: 3.5,
  },

  // Level 7: Triple Swarm Crossfire
  {
    id: 7,
    title: 'LEVEL 7: TRIPLE HASHRATE',
    subtitle: 'Three hives attacking! Construct a multi-span canopy!',
    characterPos: { x: 200, y: 488 },
    hives: [
      { x: 60, y: 80, beeCount: 8 },
      { x: 200, y: 65, beeCount: 10 },
      { x: 340, y: 80, beeCount: 8 },
    ],
    platforms: [
      { x: 200, y: 550, w: 260, h: 48, color: '#111827', borderColor: '#10b981' },
      { x: 100, y: 280, w: 70, h: 20, color: '#1e293b' },
      { x: 300, y: 280, w: 70, h: 20, color: '#1e293b' },
    ],
    anchorPins: [
      { x: 100, y: 230, label: 'L' },
      { x: 200, y: 220, label: 'M' },
      { x: 300, y: 230, label: 'R' },
    ],
    hazards: [
      { x: 60, y: 650, w: 100, h: 30, type: 'spikes' },
      { x: 340, y: 650, w: 100, h: 30, type: 'spikes' },
    ],
    maxInk: 820,
    countdownTime: 10,
    rewardCaola: 200,
    rewardNvdaShards: 4.0,
  },

  // Level 8: NVDA Quantum Mining Cluster (Final Boss)
  {
    id: 8,
    title: 'LEVEL 8: NVDA GENESIS RIG',
    subtitle: 'Final Boss! Defend Caola against 30 liquidation bots!',
    characterPos: { x: 200, y: 412 },
    hives: [
      { x: 90, y: 60, beeCount: 15 },
      { x: 310, y: 60, beeCount: 15 },
    ],
    platforms: [
      { x: 200, y: 470, w: 90, h: 40, color: '#111827', borderColor: '#ccff00', label: 'NVDA' },
      { x: 70, y: 350, w: 60, h: 20, color: '#1e293b' },
      { x: 330, y: 350, w: 60, h: 20, color: '#1e293b' },
    ],
    anchorPins: [
      { x: 70, y: 300, label: 'GPU 1' },
      { x: 200, y: 240, label: 'CORE' },
      { x: 330, y: 300, label: 'GPU 2' },
    ],
    hazards: [
      { x: 200, y: 645, w: 380, h: 40, type: 'spikes' },
    ],
    maxInk: 850,
    countdownTime: 10,
    rewardCaola: 300,
    rewardNvdaShards: 5.0,
  },
];
