import { LevelConfig } from './levels';

export interface CommunityLevel extends LevelConfig {
  author: string;
  authorAddress: string;
  authorAvatar: string;
  plays: number;
  likes: number;
  tipsCaola: number;
  tipsNvda: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'WHALE DEGEN';
  isOfficial?: boolean;
  isCustom?: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'gameclub_community_levels_v2';
const TIPS_STORAGE_KEY = 'gameclub_user_tips_v2';

// Rich, handcrafted initial community levels created by famous crypto degens
export const INITIAL_COMMUNITY_LEVELS: CommunityLevel[] = [
  {
    id: 101,
    title: "0xSatoshi's Genesis Vault",
    subtitle: 'Protect the sacred Genesis block from short-seller bot swarms!',
    author: '0xSatoshi',
    authorAddress: '0x1A1z...8888',
    authorAvatar: '₿',
    plays: 1420,
    likes: 388,
    tipsCaola: 2450,
    tipsNvda: 14.5,
    difficulty: 'MEDIUM',
    isOfficial: false,
    createdAt: '2026-03-01',
    characterPos: { x: 200, y: 410 },
    hives: [{ x: 200, y: 70, beeCount: 16 }],
    platforms: [
      { x: 200, y: 500, w: 140, h: 60, color: '#13182b', borderColor: '#f59e0b', label: 'VAULT' },
      { x: 70, y: 340, w: 90, h: 24, color: '#1a1f38', borderColor: '#3b82f6' },
      { x: 330, y: 340, w: 90, h: 24, color: '#1a1f38', borderColor: '#3b82f6' },
    ],
    anchorPins: [
      { x: 120, y: 270, label: 'PIN A' },
      { x: 280, y: 270, label: 'PIN B' },
    ],
    hazards: [
      { x: 200, y: 645, w: 260, h: 36, type: 'spikes' },
    ],
    maxInk: 750,
    countdownTime: 9,
    rewardCaola: 65,
    rewardNvdaShards: 1.5,
  },
  {
    id: 102,
    title: "Vitalik's Gas Optimization",
    subtitle: 'Tiny gas limit! Construct a hyper-efficient nano canopy!',
    author: 'Vitalik.eth',
    authorAddress: '0xd8dA...1337',
    authorAvatar: 'Ξ',
    plays: 980,
    likes: 245,
    tipsCaola: 1820,
    tipsNvda: 9.0,
    difficulty: 'HARD',
    isOfficial: false,
    createdAt: '2026-03-04',
    characterPos: { x: 200, y: 440 },
    hives: [
      { x: 100, y: 80, beeCount: 9 },
      { x: 300, y: 80, beeCount: 9 },
    ],
    platforms: [
      { x: 200, y: 530, w: 80, h: 70, color: '#111827', borderColor: '#06b6d4', label: 'EIP-4844' },
      { x: 80, y: 390, w: 100, h: 24, angle: 0.25, color: '#1e293b' },
      { x: 320, y: 390, w: 100, h: 24, angle: -0.25, color: '#1e293b' },
    ],
    anchorPins: [
      { x: 200, y: 290, label: 'BLOB' },
    ],
    hazards: [
      { x: 80, y: 645, w: 120, h: 36, type: 'spikes' },
      { x: 320, y: 645, w: 120, h: 36, type: 'spikes' },
    ],
    maxInk: 480, // tight gas limit
    countdownTime: 8,
    rewardCaola: 90,
    rewardNvdaShards: 2.0,
  },
  {
    id: 103,
    title: "Pepe's Citadel of Rare Memes",
    subtitle: 'Dual liquidation hives attacking from the sky! Diamond hands only!',
    author: 'PepeChad',
    authorAddress: '0x4200...6969',
    authorAvatar: '🐸',
    plays: 1850,
    likes: 512,
    tipsCaola: 3600,
    tipsNvda: 22.0,
    difficulty: 'WHALE DEGEN',
    isOfficial: false,
    createdAt: '2026-03-08',
    characterPos: { x: 200, y: 420 },
    hives: [
      { x: 80, y: 70, beeCount: 12 },
      { x: 200, y: 55, beeCount: 8 },
      { x: 320, y: 70, beeCount: 12 },
    ],
    platforms: [
      { x: 200, y: 490, w: 110, h: 50, color: '#111827', borderColor: '#22c55e', label: 'PEPE' },
      { x: 60, y: 280, w: 80, h: 20, color: '#1e293b' },
      { x: 340, y: 280, w: 80, h: 20, color: '#1e293b' },
    ],
    anchorPins: [
      { x: 120, y: 240, label: 'FROG 1' },
      { x: 200, y: 220, label: 'MOON' },
      { x: 280, y: 240, label: 'FROG 2' },
    ],
    hazards: [
      { x: 200, y: 645, w: 340, h: 36, type: 'spikes' },
    ],
    maxInk: 900,
    countdownTime: 10,
    rewardCaola: 120,
    rewardNvdaShards: 3.0,
  },
  {
    id: 104,
    title: 'Solana 65K TPS Squeeze',
    subtitle: 'High frequency attack! Anchor shield to the validator pillars!',
    author: 'SolDegen',
    authorAddress: '0x7bB2...4040',
    authorAvatar: '◎',
    plays: 720,
    likes: 189,
    tipsCaola: 1150,
    tipsNvda: 6.5,
    difficulty: 'EASY',
    isOfficial: false,
    createdAt: '2026-03-10',
    characterPos: { x: 200, y: 390 },
    hives: [{ x: 200, y: 65, beeCount: 12 }],
    platforms: [
      { x: 200, y: 470, w: 120, h: 40, color: '#111827', borderColor: '#a855f7', label: 'SOL' },
      { x: 90, y: 550, w: 120, h: 30, color: '#1e293b' },
      { x: 310, y: 550, w: 120, h: 30, color: '#1e293b' },
    ],
    anchorPins: [
      { x: 100, y: 300, label: 'NODE 1' },
      { x: 300, y: 300, label: 'NODE 2' },
    ],
    hazards: [],
    maxInk: 700,
    countdownTime: 7,
    rewardCaola: 50,
    rewardNvdaShards: 1.0,
  },
];

export function getCommunityLevels(): CommunityLevel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_COMMUNITY_LEVELS;
    const parsed = JSON.parse(raw) as CommunityLevel[];
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_COMMUNITY_LEVELS;
    return parsed;
  } catch {
    return INITIAL_COMMUNITY_LEVELS;
  }
}

export function saveCommunityLevels(levels: CommunityLevel[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
  } catch {
    // Ignore
  }
}

export function addCustomLevel(newLevel: CommunityLevel): CommunityLevel[] {
  const current = getCommunityLevels();
  const updated = [newLevel, ...current];
  saveCommunityLevels(updated);
  return updated;
}

export function tipCommunityLevel(levelId: number, tipCaola: number, tipNvda: number): CommunityLevel[] {
  const current = getCommunityLevels();
  const updated = current.map((lvl) => {
    if (lvl.id === levelId) {
      return {
        ...lvl,
        tipsCaola: (lvl.tipsCaola || 0) + tipCaola,
        tipsNvda: Math.round(((lvl.tipsNvda || 0) + tipNvda) * 10) / 10,
        likes: lvl.likes + 1,
      };
    }
    return lvl;
  });
  saveCommunityLevels(updated);
  return updated;
}

export function recordCommunityPlay(levelId: number): CommunityLevel[] {
  const current = getCommunityLevels();
  const updated = current.map((lvl) => {
    if (lvl.id === levelId) {
      return {
        ...lvl,
        plays: lvl.plays + 1,
      };
    }
    return lvl;
  });
  saveCommunityLevels(updated);
  return updated;
}
