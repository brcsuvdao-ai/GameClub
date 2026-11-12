/**
 * Avatars & Voxel Characters for GameClub
 * Directly uses the user's transparent cutout Caola image as default hero!
 */

export interface AvatarOption {
  id: string;
  name: string;
  label: string;
  sizeTag: 'LARGE' | 'MEDIUM' | 'SMALL';
  color: string;
  accent: string;
  desc: string;
  imgSrc?: string;
}

export const CAOLA_IMG_SRC = '/caola.png';

export const AVATAR_LIST: AvatarOption[] = [
  {
    id: 'caola',
    name: 'Caola',
    label: 'Caola 🐨',
    sizeTag: 'LARGE',
    color: '#8492a6',
    accent: '#ccff00',
    desc: 'Chief Vibe Officer · Sunglasses Meme Koala',
    imgSrc: CAOLA_IMG_SRC,
  },
  {
    id: 'kiln_warden',
    name: 'Kiln Warden',
    label: 'Kiln Warden 🔥',
    sizeTag: 'LARGE',
    color: '#d64527',
    accent: '#ffb703',
    desc: 'Smelting Sentinel · Glowing Amber Eyes',
  },
  {
    id: 'root_notary',
    name: 'Root Notary',
    label: 'Root Notary 🌱',
    sizeTag: 'MEDIUM',
    color: '#6c584c',
    accent: '#55a630',
    desc: 'Forest Arbiter · Green Sprout Visor',
  },
  {
    id: 'paper_comet',
    name: 'Paper Comet',
    label: 'Paper Comet ⚡',
    sizeTag: 'SMALL',
    color: '#f77f00',
    accent: '#d946ef',
    desc: 'Speed Courier · Purple Neon Gaze',
  },
  {
    id: 'tide_teller',
    name: 'Tide Teller',
    label: 'Tide Teller ⚓',
    sizeTag: 'LARGE',
    color: '#2a9d8f',
    accent: '#e9c46a',
    desc: 'Harbor Master · Captain Sailor Cap',
  },
  {
    id: 'site_boss',
    name: 'Site Boss',
    label: 'Site Boss ⛏️',
    sizeTag: 'LARGE',
    color: '#e0a96d',
    accent: '#ffea00',
    desc: 'Excavation Lead · Hardhat Headlamp',
  },
  {
    id: 'paper_muse',
    name: 'Paper Muse',
    label: 'Paper Muse 🔮',
    sizeTag: 'MEDIUM',
    color: '#8338ec',
    accent: '#f72585',
    desc: 'Synthetic Oracle · Lavender Glow Visor',
  },
];

export class AvatarRenderer {
  private static cachedCanvases: Map<string, HTMLCanvasElement> = new Map();
  public static caolaImage: HTMLImageElement | null = null;
  private static customImages: Map<string, HTMLImageElement> = new Map();

  static init() {
    if (!this.caolaImage) {
      const img = new Image();
      img.src = CAOLA_IMG_SRC;
      img.onload = () => {
        this.cachedCanvases.delete('caola');
      };
      this.caolaImage = img;
    }
  }

  static setCustomAvatar(dataUrl: string): string {
    const customId = 'custom_' + Date.now();
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      this.customImages.set(customId, img);
      this.cachedCanvases.delete(customId);
    };
    return customId;
  }

  static getAvatarCanvas(avatarId: string, size: number = 64): HTMLCanvasElement {
    const cacheKey = `${avatarId}_${size}`;
    const cached = this.cachedCanvases.get(cacheKey);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    if (avatarId === 'caola') {
      this.drawCutoutCaola(ctx, size);
    } else if (avatarId.startsWith('custom_') && this.customImages.has(avatarId)) {
      this.drawCustomImage(ctx, size, this.customImages.get(avatarId)!);
    } else {
      switch (avatarId) {
        case 'kiln_warden':
          this.drawKilnWarden(ctx, size);
          break;
        case 'root_notary':
          this.drawRootNotary(ctx, size);
          break;
        case 'paper_comet':
          this.drawPaperComet(ctx, size);
          break;
        case 'tide_teller':
          this.drawTideTeller(ctx, size);
          break;
        case 'site_boss':
          this.drawSiteBoss(ctx, size);
          break;
        case 'paper_muse':
          this.drawPaperMuse(ctx, size);
          break;
        default:
          this.drawCutoutCaola(ctx, size);
      }
    }

    this.cachedCanvases.set(cacheKey, canvas);
    return canvas;
  }

  // Draw the exact cutout Caola Meme image uploaded by user directly
  private static drawCutoutCaola(ctx: CanvasRenderingContext2D, size: number) {
    if (this.caolaImage && this.caolaImage.complete && this.caolaImage.naturalWidth > 0) {
      ctx.drawImage(this.caolaImage, 0, 0, size, size);
    } else {
      const img = new Image();
      img.src = CAOLA_IMG_SRC;
      img.onload = () => {
        this.caolaImage = img;
        ctx.drawImage(img, 0, 0, size, size);
      };
    }
  }

  // Draw Custom Uploaded Image
  private static drawCustomImage(ctx: CanvasRenderingContext2D, size: number, img: HTMLImageElement) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.44, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0, size, size);
    ctx.restore();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.44, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 1. Kiln Warden (Red cubic robot with golden glowing eyes & chimney)
  private static drawKilnWarden(ctx: CanvasRenderingContext2D, s: number) {
    const u = s / 64;
    ctx.save();
    ctx.fillStyle = '#471408';
    ctx.fillRect(28 * u, 4 * u, 8 * u, 8 * u);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(30 * u, 2 * u, 4 * u, 3 * u);

    ctx.fillStyle = '#d63417';
    ctx.fillRect(12 * u, 12 * u, 40 * u, 38 * u);
    ctx.fillStyle = '#a6240d';
    ctx.fillRect(12 * u, 46 * u, 40 * u, 4 * u);
    ctx.lineWidth = 2.5 * u;
    ctx.strokeStyle = '#1a0603';
    ctx.strokeRect(12 * u, 12 * u, 40 * u, 38 * u);

    ctx.fillStyle = '#fef08a';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6 * u;
    ctx.fillRect(18 * u, 24 * u, 10 * u, 12 * u);
    ctx.fillRect(36 * u, 24 * u, 10 * u, 12 * u);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5 * u;
    ctx.strokeRect(18 * u, 24 * u, 10 * u, 12 * u);
    ctx.strokeRect(36 * u, 24 * u, 10 * u, 12 * u);

    ctx.fillStyle = '#450a0a';
    ctx.fillRect(30 * u, 40 * u, 4 * u, 3 * u);
    ctx.restore();
  }

  // 2. Root Notary
  private static drawRootNotary(ctx: CanvasRenderingContext2D, s: number) {
    const u = s / 64;
    ctx.save();
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(30 * u, 4 * u, 4 * u, 6 * u);
    ctx.beginPath();
    ctx.arc(32 * u, 3 * u, 4 * u, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5c4d3c';
    ctx.fillRect(12 * u, 12 * u, 40 * u, 38 * u);
    ctx.fillStyle = '#413528';
    ctx.fillRect(12 * u, 46 * u, 40 * u, 4 * u);
    ctx.lineWidth = 2.5 * u;
    ctx.strokeStyle = '#1f1913';
    ctx.strokeRect(12 * u, 12 * u, 40 * u, 38 * u);

    ctx.fillStyle = '#bbf7d0';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 6 * u;
    ctx.fillRect(18 * u, 24 * u, 10 * u, 12 * u);
    ctx.fillRect(36 * u, 24 * u, 10 * u, 12 * u);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1.5 * u;
    ctx.strokeRect(18 * u, 24 * u, 10 * u, 12 * u);
    ctx.strokeRect(36 * u, 24 * u, 10 * u, 12 * u);
    ctx.restore();
  }

  // 3. Paper Comet
  private static drawPaperComet(ctx: CanvasRenderingContext2D, s: number) {
    const u = s / 64;
    ctx.save();
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(30 * u, 3 * u, 4 * u, 9 * u);

    ctx.fillStyle = '#ea580c';
    ctx.fillRect(14 * u, 12 * u, 36 * u, 38 * u);
    ctx.lineWidth = 2.5 * u;
    ctx.strokeStyle = '#431407';
    ctx.strokeRect(14 * u, 12 * u, 36 * u, 38 * u);

    ctx.fillStyle = '#f5d0fe';
    ctx.shadowColor = '#d946ef';
    ctx.shadowBlur = 6 * u;
    ctx.fillRect(19 * u, 24 * u, 9 * u, 11 * u);
    ctx.fillRect(36 * u, 24 * u, 9 * u, 11 * u);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // 4. Tide Teller
  private static drawTideTeller(ctx: CanvasRenderingContext2D, s: number) {
    const u = s / 64;
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(10 * u, 6 * u, 44 * u, 8 * u);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(12 * u, 12 * u, 40 * u, 4 * u);

    ctx.fillStyle = '#2dd4bf';
    ctx.fillRect(14 * u, 16 * u, 36 * u, 34 * u);
    ctx.lineWidth = 2.5 * u;
    ctx.strokeStyle = '#134e4a';
    ctx.strokeRect(14 * u, 16 * u, 36 * u, 34 * u);

    ctx.fillStyle = '#cffafe';
    ctx.fillRect(19 * u, 26 * u, 9 * u, 10 * u);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(36 * u, 26 * u, 9 * u, 10 * u);
    ctx.restore();
  }

  // 5. Site Boss
  private static drawSiteBoss(ctx: CanvasRenderingContext2D, s: number) {
    const u = s / 64;
    ctx.save();
    ctx.fillStyle = '#64748b';
    ctx.fillRect(12 * u, 8 * u, 40 * u, 7 * u);
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 8 * u;
    ctx.fillRect(36 * u, 16 * u, 11 * u, 14 * u);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(14 * u, 15 * u, 36 * u, 35 * u);
    ctx.lineWidth = 2.5 * u;
    ctx.strokeStyle = '#422006';
    ctx.strokeRect(14 * u, 15 * u, 36 * u, 35 * u);

    ctx.fillStyle = '#1c1917';
    ctx.fillRect(20 * u, 27 * u, 7 * u, 7 * u);
    ctx.restore();
  }

  // 6. Paper Muse
  private static drawPaperMuse(ctx: CanvasRenderingContext2D, s: number) {
    const u = s / 64;
    ctx.save();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(29 * u, 6 * u, 6 * u, 6 * u);

    ctx.fillStyle = '#9333ea';
    ctx.fillRect(14 * u, 12 * u, 36 * u, 38 * u);
    ctx.lineWidth = 2.5 * u;
    ctx.strokeStyle = '#3b0764';
    ctx.strokeRect(14 * u, 12 * u, 36 * u, 38 * u);

    ctx.fillStyle = '#f3e8ff';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 8 * u;
    ctx.fillRect(19 * u, 24 * u, 10 * u, 12 * u);
    ctx.fillRect(35 * u, 24 * u, 10 * u, 12 * u);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
