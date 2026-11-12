import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import confetti from 'canvas-confetti';
import { LevelConfig } from './levels';
import { AvatarRenderer, CAOLA_IMG_SRC } from './avatars';
import { retroAudio } from './audio';

interface GameCanvasProps {
  level: LevelConfig;
  avatarId: string;
  onGameStateChange: (state: 'READY' | 'COUNTDOWN' | 'SUCCESS' | 'FAIL') => void;
  onInkChange: (ratio: number) => void;
  onCountdownChange: (seconds: number) => void;
  resetSignal: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  avatarId,
  onGameStateChange,
  onInkChange,
  onCountdownChange,
  resetSignal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Matter.js references
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const characterBodyRef = useRef<Matter.Body | null>(null);
  const beeBodiesRef = useRef<Matter.Body[]>([]);
  const lineBodyRef = useRef<Matter.Body | null>(null);

  // Game internal state
  const gameStateRef = useRef<'READY' | 'COUNTDOWN' | 'SUCCESS' | 'FAIL'>('READY');
  const isDrawingRef = useRef<boolean>(false);
  const currentPointsRef = useRef<{ x: number; y: number }[]>([]);
  const usedInkRef = useRef<number>(0);
  const countdownTimerRef = useRef<number>(level.countdownTime);
  const countdownIntervalRef = useRef<number | null>(null);

  const [stunnedExpression, setStunnedExpression] = useState(false);

  // Direct Caola Cutout Image reference
  const caolaImageRef = useRef<HTMLImageElement | null>(null);

  const VIRTUAL_WIDTH = 400;
  const VIRTUAL_HEIGHT = 640;
  // Large, high-visibility character radius
  const CHAR_RADIUS = 36;
  const BEE_RADIUS = 10;

  useEffect(() => {
    AvatarRenderer.init();
    const img = new Image();
    img.src = CAOLA_IMG_SRC;
    img.onload = () => {
      caolaImageRef.current = img;
    };
    caolaImageRef.current = img;
  }, []);

  const getCanvasCoords = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;

    return {
      x: Math.max(5, Math.min(VIRTUAL_WIDTH - 5, (clientX - rect.left) * scaleX)),
      y: Math.max(5, Math.min(VIRTUAL_HEIGHT - 5, (clientY - rect.top) * scaleY)),
    };
  }, []);

  // --- OBSTACLE PENETRATION BLOCKING ---
  // Solid platforms, walls, ground, and character are rigid obstacles: brush CANNOT penetrate inside or through them!
  const isPointInObstacle = useCallback((px: number, py: number): boolean => {
    // 1. Character Body
    const cBody = characterBodyRef.current;
    if (cBody) {
      const dist = Math.hypot(px - cBody.position.x, py - cBody.position.y);
      if (dist <= CHAR_RADIUS + 2) return true;
    }

    // 2. Platforms & Terrain blocks
    for (const p of level.platforms) {
      let dx = px - p.x;
      let dy = py - p.y;
      if (p.angle) {
        const cos = Math.cos(-p.angle);
        const sin = Math.sin(-p.angle);
        const rx = dx * cos - dy * sin;
        const ry = dx * sin + dy * cos;
        dx = rx;
        dy = ry;
      }
      if (Math.abs(dx) <= p.w / 2 + 3 && Math.abs(dy) <= p.h / 2 + 3) {
        return true;
      }
    }

    // 3. Canvas Outer Bounds
    if (px < 4 || px > VIRTUAL_WIDTH - 4 || py < 4 || py > VIRTUAL_HEIGHT - 4) {
      return true;
    }

    return false;
  }, [level]);

  const segmentHitsObstacle = useCallback((p1: { x: number; y: number }, p2: { x: number; y: number }): boolean => {
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const steps = Math.max(3, Math.ceil(dist / 4));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const sx = p1.x + (p2.x - p1.x) * t;
      const sy = p1.y + (p2.y - p1.y) * t;
      if (isPointInObstacle(sx, sy)) return true;
    }
    return false;
  }, [isPointInObstacle]);

  const triggerFail = useCallback((reason: string) => {
    if (gameStateRef.current !== 'COUNTDOWN' && gameStateRef.current !== 'READY') return;
    gameStateRef.current = 'FAIL';
    onGameStateChange('FAIL');
    setStunnedExpression(true);
    retroAudio.playStung();
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, [onGameStateChange]);

  const triggerSuccess = useCallback(() => {
    if (gameStateRef.current !== 'COUNTDOWN') return;
    gameStateRef.current = 'SUCCESS';
    onGameStateChange('SUCCESS');
    retroAudio.playWin();
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    try {
      confetti({
        particleCount: 90,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ccff00', '#f59e0b', '#ec4899', '#ffffff'],
      });
    } catch {
      // Ignore
    }
  }, [onGameStateChange]);

  const setupPhysicsWorld = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    retroAudio.stopSwarmBuzz();

    if (runnerRef.current && engineRef.current) {
      Matter.Runner.stop(runnerRef.current);
    }
    if (engineRef.current) {
      Matter.World.clear(engineRef.current.world, false);
      Matter.Engine.clear(engineRef.current);
    }

    gameStateRef.current = 'READY';
    onGameStateChange('READY');
    isDrawingRef.current = false;
    currentPointsRef.current = [];
    usedInkRef.current = 0;
    onInkChange(1);
    countdownTimerRef.current = level.countdownTime;
    onCountdownChange(level.countdownTime);
    setStunnedExpression(false);
    lineBodyRef.current = null;
    beeBodiesRef.current = [];

    const engine = Matter.Engine.create({
      enableSleeping: false,
      positionIterations: 16,
      velocityIterations: 16,
      constraintIterations: 6,
    });
    engine.gravity.y = 1.2;

    const world = engine.world;

    // Boundaries
    const wallOptions: Matter.IChamferableBodyDefinition = {
      isStatic: true,
      friction: 0.9,
      restitution: 0.1,
    };
    const walls = [
      Matter.Bodies.rectangle(-15, VIRTUAL_HEIGHT / 2, 30, VIRTUAL_HEIGHT * 2, wallOptions),
      Matter.Bodies.rectangle(VIRTUAL_WIDTH + 15, VIRTUAL_HEIGHT / 2, 30, VIRTUAL_HEIGHT * 2, wallOptions),
      Matter.Bodies.rectangle(VIRTUAL_WIDTH / 2, -20, VIRTUAL_WIDTH * 2, 40, wallOptions),
    ];
    Matter.World.add(world, walls);

    // Platforms
    level.platforms.forEach((p) => {
      const plat = Matter.Bodies.rectangle(p.x, p.y, p.w, p.h, {
        isStatic: true,
        angle: p.angle || 0,
        friction: 0.92,
        restitution: 0.05,
      });
      Matter.World.add(world, plat);
    });

    // Anchor Pins (Validator nodes)
    if (level.anchorPins) {
      level.anchorPins.forEach((pin) => {
        const pinBody = Matter.Bodies.circle(pin.x, pin.y, 12, {
          isStatic: true,
          friction: 0.95,
          restitution: 0.05,
        });
        Matter.World.add(world, pinBody);
      });
    }

    // Hero Character (Large radius = 36)
    const char = Matter.Bodies.circle(level.characterPos.x, level.characterPos.y, CHAR_RADIUS, {
      friction: 0.85,
      frictionAir: 0.03,
      restitution: 0.1,
      density: 0.006,
      mass: 10,
    });
    characterBodyRef.current = char;
    Matter.World.add(world, char);

    // ================================================================
    // CRITICAL: BULLETPROOF BEE-CHARACTER COLLISION DETECTION
    // Listen to Matter.js physical contact events (collisionStart & collisionActive)
    // ================================================================
    const checkMatterCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
      const cBody = characterBodyRef.current;
      if (!cBody || (gameStateRef.current !== 'COUNTDOWN' && gameStateRef.current !== 'READY')) return;

      for (let i = 0; i < event.pairs.length; i++) {
        const pair = event.pairs[i];
        if (
          (pair.bodyA === cBody && beeBodiesRef.current.includes(pair.bodyB)) ||
          (pair.bodyB === cBody && beeBodiesRef.current.includes(pair.bodyA))
        ) {
          triggerFail('Caola got stung by bees!');
          return;
        }
      }
    };
    Matter.Events.on(engine, 'collisionStart', checkMatterCollision);
    Matter.Events.on(engine, 'collisionActive', checkMatterCollision);

    // Continuous tick checks for position, proximity, and hazards
    Matter.Events.on(engine, 'beforeUpdate', () => {
      if (gameStateRef.current !== 'COUNTDOWN') return;

      const cBody = characterBodyRef.current;
      if (!cBody) return;

      const charPos = cBody.position;

      // Fail: Fell into the abyss
      if (charPos.y > VIRTUAL_HEIGHT - 10) {
        triggerFail('Caola fell into the liquidation pit!');
        return;
      }

      // Fail: Touched Spikes
      if (level.hazards) {
        for (const hz of level.hazards) {
          if (
            Math.abs(charPos.x - hz.x) < hz.w / 2 + CHAR_RADIUS * 0.7 &&
            Math.abs(charPos.y - hz.y) < hz.h / 2 + CHAR_RADIUS * 0.7
          ) {
            triggerFail('Caola hit liquidation spikes!');
            return;
          }
        }
      }

      // Swarm movement & PROXIMITY CHECK (guarantees hit even at fast speeds)
      const now = performance.now() * 0.005;
      const bees = beeBodiesRef.current;
      // Physical contact distance: CHAR_RADIUS (36) + BEE_RADIUS (10) + buffer (5) = 51px
      const contactThreshold = CHAR_RADIUS + BEE_RADIUS + 4;

      for (let i = 0; i < bees.length; i++) {
        const bee = bees[i];
        const dx = charPos.x - bee.position.x;
        const dy = charPos.y - bee.position.y;
        const dist = Math.hypot(dx, dy);

        // Immediate Stung check!
        if (dist <= contactThreshold) {
          triggerFail('Caola got stung by bees!');
          return;
        }

        // Steer towards character
        if (dist > 5) {
          const forceMagnitude = 0.00055; // aggressive swarm
          const nx = dx / dist;
          const ny = dy / dist;

          const wobble = Math.sin(now * 3 + i * 1.5) * 0.0003;
          const perpX = -ny * wobble;
          const perpY = nx * wobble;

          Matter.Body.applyForce(bee, bee.position, {
            x: nx * forceMagnitude + perpX,
            y: ny * forceMagnitude + perpY,
          });

          const maxSpeed = 5.4;
          const speed = Math.hypot(bee.velocity.x, bee.velocity.y);
          if (speed > maxSpeed) {
            Matter.Body.setVelocity(bee, {
              x: (bee.velocity.x / speed) * maxSpeed,
              y: (bee.velocity.y / speed) * maxSpeed,
            });
          }
        }
      }
    });

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    engineRef.current = engine;
    runnerRef.current = runner;
  }, [level, onGameStateChange, onInkChange, onCountdownChange, triggerFail]);

  // Convert drawn stroke to physical compound body
  const finalizeDrawing = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const points = currentPointsRef.current;
    if (points.length < 2) {
      currentPointsRef.current = [];
      usedInkRef.current = 0;
      onInkChange(1);
      return;
    }

    const engine = engineRef.current;
    if (!engine) return;

    // Build compound physics body
    const parts: Matter.Body[] = [];
    const THICKNESS = 16;
    const RADIUS = THICKNESS / 2;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) continue;

      const angle = Math.atan2(dy, dx);
      const cx = (p1.x + p2.x) / 2;
      const cy = (p1.y + p2.y) / 2;

      const rect = Matter.Bodies.rectangle(cx, cy, len, THICKNESS, {
        angle,
        chamfer: { radius: 3 },
      });
      parts.push(rect);
      parts.push(Matter.Bodies.circle(p1.x, p1.y, RADIUS));
    }
    const lastP = points[points.length - 1];
    parts.push(Matter.Bodies.circle(lastP.x, lastP.y, RADIUS));

    if (parts.length > 0) {
      const compoundLine = Matter.Body.create({
        parts,
        friction: 0.92,
        frictionAir: 0.02,
        restitution: 0.08,
        density: 0.006,
      });

      Matter.World.add(engine.world, compoundLine);
      lineBodyRef.current = compoundLine;
    }

    // Launch bees & start survival timer
    gameStateRef.current = 'COUNTDOWN';
    onGameStateChange('COUNTDOWN');
    retroAudio.startSwarmBuzz();

    const newBees: Matter.Body[] = [];
    level.hives.forEach((hive) => {
      for (let i = 0; i < hive.beeCount; i++) {
        const offsetX = (Math.random() - 0.5) * 24;
        const offsetY = 14 + Math.random() * 16;
        const bee = Matter.Bodies.circle(hive.x + offsetX, hive.y + offsetY, BEE_RADIUS, {
          frictionAir: 0.04,
          restitution: 0.35,
          density: 0.0012,
          mass: 0.5,
        });

        Matter.Body.setVelocity(bee, {
          x: (Math.random() - 0.5) * 3,
          y: 2.2 + Math.random() * 2,
        });

        Matter.World.add(engine.world, bee);
        newBees.push(bee);
      }
    });
    beeBodiesRef.current = newBees;

    countdownTimerRef.current = level.countdownTime;
    onCountdownChange(level.countdownTime);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = window.setInterval(() => {
      countdownTimerRef.current -= 1;
      onCountdownChange(countdownTimerRef.current);
      retroAudio.playTick();

      if (countdownTimerRef.current <= 0) {
        clearInterval(countdownIntervalRef.current!);
        countdownIntervalRef.current = null;
        triggerSuccess();
      }
    }, 1000);
  }, [level, onGameStateChange, onInkChange, onCountdownChange, triggerSuccess]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'READY') return;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);

    const pt = getCanvasCoords(e.nativeEvent);

    // Obstacle Check: Cannot start inside platform or character
    if (isPointInObstacle(pt.x, pt.y)) {
      return;
    }

    isDrawingRef.current = true;
    currentPointsRef.current = [pt];
    usedInkRef.current = 0;
    onInkChange(1);
    retroAudio.playDrawTick();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || gameStateRef.current !== 'READY') return;
    const pt = getCanvasCoords(e.nativeEvent);
    const pts = currentPointsRef.current;
    if (pts.length === 0) return;

    const last = pts[pts.length - 1];

    // Obstacle Check: Cannot draw through platforms, terrain, or character body!
    if (isPointInObstacle(pt.x, pt.y) || segmentHitsObstacle(last, pt)) {
      return; // Blocked at obstacle surface
    }

    const dist = Math.hypot(pt.x - last.x, pt.y - last.y);

    if (dist >= 8) {
      const remainingInk = level.maxInk - usedInkRef.current;
      if (dist >= remainingInk) {
        const ratio = remainingInk / dist;
        const finalX = last.x + (pt.x - last.x) * ratio;
        const finalY = last.y + (pt.y - last.y) * ratio;
        if (!isPointInObstacle(finalX, finalY)) {
          pts.push({ x: finalX, y: finalY });
        }
        usedInkRef.current = level.maxInk;
        onInkChange(0);
        finalizeDrawing();
        return;
      }

      usedInkRef.current += dist;
      pts.push(pt);
      onInkChange(Math.max(0, 1 - usedInkRef.current / level.maxInk));
      if (pts.length % 3 === 0) {
        retroAudio.playDrawTick();
      }
    }
  };

  const handlePointerUp = () => {
    if (isDrawingRef.current && gameStateRef.current === 'READY') {
      finalizeDrawing();
    }
  };

  useEffect(() => {
    setupPhysicsWorld();
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      retroAudio.stopSwarmBuzz();
      if (runnerRef.current && engineRef.current) {
        Matter.Runner.stop(runnerRef.current);
      }
    };
  }, [level, resetSignal, setupPhysicsWorld]);

  // =========================================================================
  // DENSE DEGEN WEB3 CRYPTO ART CANVAS RENDERING LOOP
  // Pixel Art + Neon Candlesticks + Floating Memecoins + Laser Shield
  // =========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina High-DPI Setup
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = VIRTUAL_WIDTH * dpr;
    canvas.height = VIRTUAL_HEIGHT * dpr;

    let animId: number;

    const render = () => {
      ctx.save();
      ctx.scale(dpr, dpr);
      const time = performance.now() * 0.001;

      // 1. Cyberpunk Dark Space Canvas Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
      bgGrad.addColorStop(0, '#090a12');
      bgGrad.addColorStop(0.4, '#0f1325');
      bgGrad.addColorStop(1, '#151933');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Cyber Matrix Holographic Grid Lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < VIRTUAL_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, VIRTUAL_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < VIRTUAL_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(VIRTUAL_WIDTH, y);
        ctx.stroke();
      }

      // 2. Animated Volumetric 3D Candlestick Chart (with Real Depth and Light Bloom)
      ctx.save();
      const candles = [
        { x: 26, h: 80, y: 370, green: true },
        { x: 58, h: 120, y: 330, green: true },
        { x: 92, h: 55, y: 355, green: false },
        { x: 124, h: 145, y: 280, green: true },
        { x: 156, h: 95, y: 300, green: true },
        { x: 276, h: 85, y: 335, green: true },
        { x: 308, h: 165, y: 265, green: true },
        { x: 340, h: 130, y: 285, green: true },
        { x: 372, h: 195, y: 235, green: true },
      ];
      candles.forEach((c) => {
        const cW = 20;
        const depth = 6;
        const mainColor = c.green ? '#10b981' : '#ef4444';
        const shadowColor = c.green ? '#065f46' : '#991b1b';
        const lightColor = c.green ? '#6ee7b7' : '#fca5a5';

        // Laser Wick (Glowing line running through)
        ctx.strokeStyle = mainColor;
        ctx.shadowColor = mainColor;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.x + cW / 2, c.y - 14);
        ctx.lineTo(c.x + cW / 2, c.y + c.h + 14);
        ctx.stroke();

        // 3D Right Extrusion Face (Volume)
        ctx.fillStyle = shadowColor;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(c.x + cW, c.y);
        ctx.lineTo(c.x + cW + depth, c.y - depth * 0.7);
        ctx.lineTo(c.x + cW + depth, c.y + c.h - depth * 0.7);
        ctx.lineTo(c.x + cW, c.y + c.h);
        ctx.closePath();
        ctx.fill();

        // 3D Top Highlight Face
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + depth, c.y - depth * 0.7);
        ctx.lineTo(c.x + cW + depth, c.y - depth * 0.7);
        ctx.lineTo(c.x + cW, c.y);
        ctx.closePath();
        ctx.fill();

        // Front Face with Vertical Metallic Gradient
        const faceGrad = ctx.createLinearGradient(0, c.y, 0, c.y + c.h);
        faceGrad.addColorStop(0, c.green ? 'rgba(52, 211, 153, 0.45)' : 'rgba(248, 113, 113, 0.4)');
        faceGrad.addColorStop(1, c.green ? 'rgba(5, 150, 105, 0.25)' : 'rgba(220, 38, 38, 0.2)');
        ctx.fillStyle = faceGrad;
        ctx.fillRect(c.x, c.y, cW, c.h);

        // Specular Neon Rim
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(c.x, c.y, cW, c.h);
      });
      ctx.restore();

      // 3. Floating Web3 Metallic Crypto Medallions (BTC, ETH, SOL, PEPE, 💎🙌)
      const memes = [
        { type: 'BTC', x: 48, y: 130 + Math.sin(time * 2 + 1) * 8, size: 22 },
        { type: 'ETH', x: 352, y: 140 + Math.sin(time * 2 + 2) * 8, size: 22 },
        { type: 'SOL', x: 68, y: 240 + Math.sin(time * 2 + 3) * 8, size: 20 },
        { type: 'PEPE', x: 332, y: 230 + Math.sin(time * 2 + 4) * 8, size: 22 },
        { type: 'DIAMOND', x: 200, y: 95 + Math.sin(time * 2 + 5) * 6, size: 18 },
      ];
      memes.forEach((m) => {
        ctx.save();
        ctx.translate(m.x, m.y);

        if (m.type === 'BTC') {
          // Volumetric 3D Burnished Gold Bitcoin Coin
          const rad = m.size / 2;
          const grad = ctx.createRadialGradient(-rad * 0.3, -rad * 0.3, rad * 0.1, 0, 0, rad);
          grad.addColorStop(0, '#fff3b0');
          grad.addColorStop(0.3, '#f59e0b');
          grad.addColorStop(0.8, '#b45309');
          grad.addColorStop(1, '#78350f');

          ctx.fillStyle = grad;
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, rad, 0, Math.PI * 2);
          ctx.fill();

          // Beveled rim
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Embossed B
          ctx.font = `bold ${Math.round(m.size * 0.7)}px system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#451a03';
          ctx.fillText('₿', 0.5, 0.5);
          ctx.fillStyle = '#fffbeb';
          ctx.fillText('₿', 0, 0);
        } else if (m.type === 'ETH') {
          // Volumetric 3D Refractive Ethereum Diamond
          const w = m.size * 0.6;
          const h = m.size;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;

          // Top facet
          const gradTop = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, 0);
          gradTop.addColorStop(0, 'rgba(125, 211, 252, 0.95)');
          gradTop.addColorStop(1, 'rgba(56, 189, 248, 0.4)');
          ctx.fillStyle = gradTop;
          ctx.beginPath();
          ctx.moveTo(0, -h / 2);
          ctx.lineTo(w / 2, 0);
          ctx.lineTo(0, h * 0.15);
          ctx.lineTo(-w / 2, 0);
          ctx.closePath();
          ctx.fill();

          // Bottom facet
          const gradBot = ctx.createLinearGradient(0, 0, 0, h / 2);
          gradBot.addColorStop(0, 'rgba(14, 165, 233, 0.85)');
          gradBot.addColorStop(1, 'rgba(99, 102, 241, 0.3)');
          ctx.fillStyle = gradBot;
          ctx.beginPath();
          ctx.moveTo(-w / 2, 0);
          ctx.lineTo(0, h * 0.15);
          ctx.lineTo(w / 2, 0);
          ctx.lineTo(0, h / 2);
          ctx.closePath();
          ctx.fill();

          // Specular glint
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (m.type === 'SOL') {
          // Metallic Solana Badge with Neon Cyber Sheen
          const rad = m.size / 2;
          const grad = ctx.createLinearGradient(-rad, -rad, rad, rad);
          grad.addColorStop(0, '#c084fc');
          grad.addColorStop(0.5, '#06b6d4');
          grad.addColorStop(1, '#10b981');
          ctx.fillStyle = grad;
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, rad, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          ctx.font = `bold ${Math.round(m.size * 0.65)}px system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#0f172a';
          ctx.fillText('◎', 0, 0);
        } else if (m.type === 'PEPE') {
          // 3D Metallic Pepe Emblem
          const rad = m.size / 2;
          ctx.fillStyle = '#166534';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, rad, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.font = `${Math.round(m.size * 0.75)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🐸', 0, 0);
        } else if (m.type === 'DIAMOND') {
          // Floating 3D Diamond Hands
          ctx.font = `${m.size}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.fillText('💎', 0, 0);
        }

        ctx.restore();
      });

      // 4. Draw Hazards (Liquidation Spikes / Red Candles)
      if (level.hazards) {
        level.hazards.forEach((hz) => {
          if (hz.type === 'spikes') {
            const count = Math.floor(hz.w / 16);
            const w = hz.w / count;
            const startX = hz.x - hz.w / 2;
            const topY = hz.y - hz.h / 2;
            const botY = hz.y + hz.h / 2;

            ctx.save();
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
              const sx = startX + i * w;
              ctx.moveTo(sx, botY);
              ctx.lineTo(sx + w / 2, topY);
              ctx.lineTo(sx + w, botY);
            }
            ctx.closePath();
            ctx.fill();

            // Neon crimson outline
            ctx.strokeStyle = '#ffe4e6';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      // 5. Draw Platforms (Heavy Industrial Cyberpunk Blocks with Rich Material Texture)
      level.platforms.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        if (p.angle) ctx.rotate(p.angle);

        const hw = p.w / 2;
        const hh = p.h / 2;
        const edgeColor = p.borderColor || '#10b981';

        // Deep drop shadow onto background matrix
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;

        // Volumetric Metallic Carbon Core Body
        const platGrad = ctx.createLinearGradient(-hw, -hh, -hw, hh);
        platGrad.addColorStop(0, '#1e2438');
        platGrad.addColorStop(0.2, '#141829');
        platGrad.addColorStop(0.8, '#0d111e');
        platGrad.addColorStop(1, '#070911');
        ctx.fillStyle = platGrad;
        ctx.fillRect(-hw, -hh, p.w, p.h);

        // Reset drop shadow for sharp specular details
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Beveled Neon Laser Outer Frame
        ctx.strokeStyle = edgeColor;
        ctx.shadowColor = edgeColor;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-hw, -hh, p.w, p.h);

        // Top Volumetric Laser Conduit Rim
        const topLaserGrad = ctx.createLinearGradient(-hw, -hh, hw, -hh);
        topLaserGrad.addColorStop(0, '#ccff00');
        topLaserGrad.addColorStop(0.5, '#ffffff');
        topLaserGrad.addColorStop(1, '#ccff00');
        ctx.fillStyle = topLaserGrad;
        ctx.shadowColor = '#ccff00';
        ctx.shadowBlur = 10;
        ctx.fillRect(-hw, -hh, p.w, 3.5);

        // Micro Circuit Traces
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-hw + 12, 0);
        ctx.lineTo(hw - 12, 0);
        ctx.stroke();

        // Corner Metallic Hex Bolts / Rivets with Specular Gleam
        if (p.w >= 28 && p.h >= 16) {
          const boltOffsets = [
            [-hw + 6, -hh + 6],
            [hw - 6, -hh + 6],
            [-hw + 6, hh - 6],
            [hw - 6, hh - 6],
          ];
          boltOffsets.forEach(([bx, by]) => {
            const bGrad = ctx.createRadialGradient(bx - 0.5, by - 0.5, 0.5, bx, by, 3);
            bGrad.addColorStop(0, '#ffffff');
            bGrad.addColorStop(0.4, '#94a3b8');
            bGrad.addColorStop(1, '#334155');
            ctx.fillStyle = bGrad;
            ctx.beginPath();
            ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // Platform Center Label (if defined)
        if (p.label) {
          ctx.font = '900 9px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = edgeColor;
          ctx.shadowColor = edgeColor;
          ctx.shadowBlur = 6;
          ctx.fillText(p.label, 0, 0);
        }

        ctx.restore();
      });

      // 6. Draw Anchor Pins (Volumetric 3D Spherical Staking Nodes)
      if (level.anchorPins) {
        level.anchorPins.forEach((pin, pIdx) => {
          ctx.save();
          ctx.translate(pin.x, pin.y);

          // Pulsing Holographic Orbital Ring
          const pulse = Math.sin(time * 4 + pIdx) * 2;
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 16 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          // 3D Spherical Brass Core with Radial Specular Volume
          const pinGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 13);
          pinGrad.addColorStop(0, '#ffffff');
          pinGrad.addColorStop(0.25, '#fef08a');
          pinGrad.addColorStop(0.55, '#f59e0b');
          pinGrad.addColorStop(0.85, '#b45309');
          pinGrad.addColorStop(1, '#451a03');

          ctx.fillStyle = pinGrad;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, 12, 0, Math.PI * 2);
          ctx.fill();

          // Specular Ring
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Cyber Volt Core Eye
          ctx.fillStyle = '#ccff00';
          ctx.shadowColor = '#ccff00';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        });
      }

      // 7. Draw Beehives (Cyber Short-Seller Hive)
      level.hives.forEach((h, hIdx) => {
        ctx.save();
        ctx.translate(h.x, h.y);

        const sway = Math.sin(time * 3 + hIdx) * 0.05;
        ctx.rotate(sway);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, -32);
        ctx.lineTo(0, -16);
        ctx.stroke();

        // Neon Honeycomb tiers
        const tiers = [
          { y: -13, w: 22, h: 8, col: '#f59e0b' },
          { y: -5, w: 34, h: 10, col: '#fbbf24' },
          { y: 5, w: 44, h: 12, col: '#facc15' },
          { y: 16, w: 32, h: 10, col: '#f59e0b' },
        ];

        tiers.forEach((t) => {
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(-t.w / 2, t.y - t.h / 2, t.w, t.h);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.strokeRect(-t.w / 2, t.y - t.h / 2, t.w, t.h);
        });

        // Hive Plasma Core
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 6, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // 8. Draw Currently Active Drawing Stroke (Neon Smart Contract Firewall)
      if (isDrawingRef.current && currentPointsRef.current.length > 1) {
        const strokePts = currentPointsRef.current;

        // Outer Neon Glow
        ctx.save();
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(strokePts[0].x, strokePts[0].y);
        for (let i = 1; i < strokePts.length; i++) ctx.lineTo(strokePts[i].x, strokePts[i].y);
        ctx.stroke();

        // Inner Electric Volt Conduit
        ctx.strokeStyle = '#ccff00';
        ctx.lineWidth = 12;
        ctx.stroke();

        // White Core Laser Beam
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
      }

      // 9. Draw Finalized Physical Line Body
      if (lineBodyRef.current) {
        const body = lineBodyRef.current;
        const parts = body.parts.slice(1);

        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 2.5;

        parts.forEach((part) => {
          ctx.beginPath();
          const v = part.vertices;
          ctx.moveTo(v[0].x, v[0].y);
          for (let vi = 1; vi < v.length; vi++) ctx.lineTo(v[vi].x, v[vi].y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        });

        // Glowing Cyber Rivets
        ctx.fillStyle = '#ccff00';
        ctx.shadowColor = '#ccff00';
        ctx.shadowBlur = 6;
        parts.forEach((part) => {
          ctx.beginPath();
          ctx.arc(part.position.x, part.position.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      }

      // 10. Draw Hero Character (LARGE, CRISP, HIGH-DEFINITION CAOLA MEME!)
      const cBody = characterBodyRef.current;
      if (cBody) {
        ctx.save();
        ctx.translate(cBody.position.x, cBody.position.y);
        ctx.rotate(cBody.angle);

        // Ground Neon Shadow
        ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, CHAR_RADIUS - 2, 28, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // DRAW CUTOUT CAOLA MEME IMAGE (High Resolution, Diameter 76px!)
        if (avatarId === 'caola') {
          const img = caolaImageRef.current || AvatarRenderer.caolaImage;
          const drawSize = CHAR_RADIUS * 2 + 6; // ~78px large size

          // Holographic Neon Rim
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 10;

          if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
          } else {
            const avCanvas = AvatarRenderer.getAvatarCanvas(avatarId, 76);
            ctx.drawImage(avCanvas, -38, -38, 76, 76);
          }
        } else {
          const avCanvas = AvatarRenderer.getAvatarCanvas(avatarId, 76);
          ctx.drawImage(avCanvas, -38, -38, 76, 76);
        }

        // Bling Gold Diamond Chain / Meme Accessories
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💎', 22, -18);

        // Stunned REKT dizzy effect if failed
        if (stunnedExpression) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-14, -6); ctx.lineTo(-4, 4);
          ctx.moveTo(-4, -6); ctx.lineTo(-14, 4);
          ctx.moveTo(4, -6); ctx.lineTo(14, 4);
          ctx.moveTo(14, -6); ctx.lineTo(4, 4);
          ctx.stroke();

          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.fillStyle = '#ef4444';
          ctx.fillText('REKT!', 0, -42);
        }

        ctx.restore();
      }

      // 11. Draw Liquidation Bot Bees (Red Laser Eyes + Flying Wings)
      const bees = beeBodiesRef.current;
      const wingFrame = Math.floor(time * 24) % 2;

      bees.forEach((bee) => {
        ctx.save();
        ctx.translate(bee.position.x, bee.position.y);
        const heading = Math.atan2(bee.velocity.y, bee.velocity.x);
        ctx.rotate(heading);

        // Flapping Cyber Wings
        ctx.fillStyle = wingFrame === 0 ? 'rgba(0, 240, 255, 0.85)' : 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(-5, -13, 10, 7);
        ctx.fillRect(-5, 6, 10, 7);

        // Bee Body: Cyber Striped Diamond
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(3, -7);
        ctx.lineTo(-8, -5);
        ctx.lineTo(-13, 0); // laser stinger
        ctx.lineTo(-8, 5);
        ctx.lineTo(3, 7);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dark Carbon Stripes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-5, -6, 4, 12);
        ctx.fillRect(0, -7, 4, 14);

        // Glowing Red Laser Eyes
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 6;
        ctx.fillRect(4, -4, 3, 2.5);
        ctx.fillRect(4, 1.5, 3, 2.5);

        // Glowing Laser Needle Stinger
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-15, -1, 3, 2);

        ctx.restore();
      });

      // In-game text instructions removed per user request (keeps viewport clean and focused)

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [level, avatarId, stunnedExpression]);

  return (
    <div className="relative w-full max-w-[430px] mx-auto select-none touch-none aspect-[400/640] rounded-2xl overflow-hidden border-3 border-black shadow-[4px_4px_0px_#000000] bg-[#0a0b14]">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block cursor-crosshair"
      />
    </div>
  );
};
