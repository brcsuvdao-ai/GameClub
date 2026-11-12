import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameCanvas } from './GameCanvas';
import { LevelConfig, PlatformDef, AnchorPinDef, HiveDef, HazardDef } from './levels';
import { CommunityLevel } from './communityLevels';
import { retroAudio } from './audio';
import confetti from 'canvas-confetti';
import {
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  UploadCloud,
  RotateCw,
  Sliders,
  Sparkles,
  Shield,
  Layers,
  HelpCircle,
  X,
  RotateCcw,
  Compass,
} from 'lucide-react';

interface LevelStudioProps {
  onPublish: (newLevel: CommunityLevel) => void;
  onClose: () => void;
  userAddress: string;
}

export const LevelStudio: React.FC<LevelStudioProps> = ({ onPublish, onClose, userAddress }) => {
  // Studio mode: 'EDIT' or 'TEST'
  const [mode, setMode] = useState<'EDIT' | 'TEST'>('EDIT');
  const [selectedTool, setSelectedTool] = useState<'PLATFORM' | 'PIN' | 'HIVE' | 'CAOLA' | 'SPIKES'>('PLATFORM');

  // Level configuration draft
  const [title, setTitle] = useState<string>('My Degen Fortress');
  const [subtitle, setSubtitle] = useState<string>('Survive the liquidation swarm with diamond hands!');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'WHALE DEGEN'>('MEDIUM');
  const [countdownTime, setCountdownTime] = useState<number>(8);
  const [maxInk, setMaxInk] = useState<number>(750);

  // Entities
  const [characterPos, setCharacterPos] = useState<{ x: number; y: number }>({ x: 200, y: 420 });
  const [hives, setHives] = useState<HiveDef[]>([{ x: 200, y: 70, beeCount: 14 }]);
  const [platforms, setPlatforms] = useState<PlatformDef[]>([
    { x: 200, y: 500, w: 120, h: 50, color: '#141829', borderColor: '#10b981', label: 'HODL' },
  ]);
  const [anchorPins, setAnchorPins] = useState<AnchorPinDef[]>([
    { x: 130, y: 310, label: 'PIN A' },
    { x: 270, y: 310, label: 'PIN B' },
  ]);
  const [hazards, setHazards] = useState<HazardDef[]>([
    { x: 200, y: 645, w: 240, h: 36, type: 'spikes' },
  ]);

  // Selected item index for editing
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'PLATFORM' | 'PIN' | 'HIVE' | 'SPIKES'; index: number } | null>(null);

  // Verification state (Must beat level to publish)
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [testGameState, setTestGameState] = useState<'READY' | 'COUNTDOWN' | 'SUCCESS' | 'FAIL'>('READY');
  const [testResetSignal, setTestResetSignal] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Draft LevelConfig object
  const currentDraftLevel: LevelConfig = {
    id: 9999,
    title,
    subtitle,
    characterPos,
    hives,
    platforms,
    anchorPins,
    hazards,
    maxInk,
    countdownTime,
    rewardCaola: difficulty === 'EASY' ? 40 : difficulty === 'MEDIUM' ? 70 : difficulty === 'HARD' ? 100 : 150,
    rewardNvdaShards: difficulty === 'EASY' ? 1.0 : difficulty === 'MEDIUM' ? 1.5 : difficulty === 'HARD' ? 2.5 : 3.5,
  };

  // Switch to Test Mode
  const startTestPlay = () => {
    retroAudio.playClick();
    setMode('TEST');
    setTestGameState('READY');
    setTestResetSignal((prev) => prev + 1);
  };

  // Test play completion handler
  const handleTestStateChange = (state: 'READY' | 'COUNTDOWN' | 'SUCCESS' | 'FAIL') => {
    setTestGameState(state);
    if (state === 'SUCCESS') {
      setIsVerified(true);
      retroAudio.playWin();
      try {
        confetti({ particleCount: 70, spread: 80 });
      } catch {
        // Ignore
      }
    }
  };

  // Add a platform
  const addPlatform = () => {
    retroAudio.playClick();
    setIsVerified(false);
    const newP: PlatformDef = {
      x: 150 + Math.random() * 100,
      y: 350 + Math.random() * 80,
      w: 100,
      h: 30,
      color: '#141829',
      borderColor: '#00f0ff',
      label: 'NODE',
    };
    setPlatforms((prev) => [...prev, newP]);
    setSelectedEntity({ type: 'PLATFORM', index: platforms.length });
  };

  // Add an anchor pin
  const addAnchorPin = () => {
    retroAudio.playClick();
    setIsVerified(false);
    const newPin: AnchorPinDef = {
      x: 100 + Math.random() * 200,
      y: 200 + Math.random() * 120,
      label: `PIN ${anchorPins.length + 1}`,
    };
    setAnchorPins((prev) => [...prev, newPin]);
    setSelectedEntity({ type: 'PIN', index: anchorPins.length });
  };

  // Add hazard spikes
  const addSpikes = () => {
    retroAudio.playClick();
    setIsVerified(false);
    const newH: HazardDef = {
      x: 200,
      y: 630,
      w: 160,
      h: 32,
      type: 'spikes',
    };
    setHazards((prev) => [...prev, newH]);
    setSelectedEntity({ type: 'SPIKES', index: hazards.length });
  };

  // Add hive
  const addHive = () => {
    if (hives.length >= 3) return;
    retroAudio.playClick();
    setIsVerified(false);
    const newH: HiveDef = {
      x: 100 + hives.length * 100,
      y: 75,
      beeCount: 10,
    };
    setHives((prev) => [...prev, newH]);
  };

  // Delete selected entity
  const deleteSelected = () => {
    if (!selectedEntity) return;
    retroAudio.playClick();
    setIsVerified(false);
    if (selectedEntity.type === 'PLATFORM') {
      setPlatforms((prev) => prev.filter((_, idx) => idx !== selectedEntity.index));
    } else if (selectedEntity.type === 'PIN') {
      setAnchorPins((prev) => prev.filter((_, idx) => idx !== selectedEntity.index));
    } else if (selectedEntity.type === 'SPIKES') {
      setHazards((prev) => prev.filter((_, idx) => idx !== selectedEntity.index));
    }
    setSelectedEntity(null);
  };

  // Publish Level
  const handlePublish = () => {
    if (!isVerified) return;
    retroAudio.playWin();
    const newCommunityLevel: CommunityLevel = {
      ...currentDraftLevel,
      id: Date.now(),
      author: 'You (Creator)',
      authorAddress: userAddress || '0xCA0LA...4209',
      authorAvatar: '🐨',
      plays: 1,
      likes: 1,
      tipsCaola: 0,
      tipsNvda: 0,
      difficulty,
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    onPublish(newCommunityLevel);
  };

  // Editor Interactive Canvas Click & Placement
  const handleEditorCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode !== 'EDIT') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 400 / rect.width;
    const scaleY = 640 / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    if (selectedTool === 'CAOLA') {
      setCharacterPos({ x, y });
      setIsVerified(false);
      retroAudio.playClick();
    } else if (selectedTool === 'HIVE') {
      if (hives.length < 3) {
        setHives((prev) => [...prev, { x, y: Math.min(y, 160), beeCount: 12 }]);
        setIsVerified(false);
        retroAudio.playClick();
      }
    } else if (selectedTool === 'PIN') {
      setAnchorPins((prev) => [...prev, { x, y, label: `PIN ${prev.length + 1}` }]);
      setIsVerified(false);
      retroAudio.playClick();
    } else if (selectedTool === 'PLATFORM') {
      setPlatforms((prev) => [
        ...prev,
        { x, y, w: 100, h: 32, color: '#141829', borderColor: '#00f0ff', label: 'PLAT' },
      ]);
      setIsVerified(false);
      retroAudio.playClick();
    } else if (selectedTool === 'SPIKES') {
      setHazards((prev) => [...prev, { x, y, w: 140, h: 32, type: 'spikes' }]);
      setIsVerified(false);
      retroAudio.playClick();
    }
  };

  // Render Visual Grid & Entities in Edit Mode
  useEffect(() => {
    if (mode !== 'EDIT') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 400, 640);

    // Deep Space Cyber Matrix Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 640);
    bgGrad.addColorStop(0, '#090a14');
    bgGrad.addColorStop(1, '#111528');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 400, 640);

    // Grid lines for precise level building
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 400; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 640);
      ctx.stroke();
    }
    for (let y = 0; y < 640; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(400, y);
      ctx.stroke();
    }

    // Draw Hazards Spikes
    hazards.forEach((hz, idx) => {
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      const count = Math.floor(hz.w / 14);
      const w = hz.w / count;
      const startX = hz.x - hz.w / 2;
      const topY = hz.y - hz.h / 2;
      const botY = hz.y + hz.h / 2;
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const sx = startX + i * w;
        ctx.moveTo(sx, botY);
        ctx.lineTo(sx + w / 2, topY);
        ctx.lineTo(sx + w, botY);
      }
      ctx.fill();
      ctx.strokeStyle = '#ffe4e6';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (selectedEntity?.type === 'SPIKES' && selectedEntity.index === idx) {
        ctx.strokeStyle = '#ccff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(hz.x - hz.w / 2 - 2, hz.y - hz.h / 2 - 2, hz.w + 4, hz.h + 4);
      }
      ctx.restore();
    });

    // Draw Platforms with metallic gradient
    platforms.forEach((p, idx) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.angle) ctx.rotate(p.angle);
      const hw = p.w / 2;
      const hh = p.h / 2;

      ctx.fillStyle = p.color || '#141829';
      ctx.fillRect(-hw, -hh, p.w, p.h);

      const edgeColor = p.borderColor || '#00f0ff';
      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(-hw, -hh, p.w, p.h);

      // Top neon strip
      ctx.fillStyle = '#ccff00';
      ctx.fillRect(-hw, -hh, p.w, 3);

      if (p.label) {
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(p.label, 0, 0);
      }

      if (selectedEntity?.type === 'PLATFORM' && selectedEntity.index === idx) {
        ctx.strokeStyle = '#ccff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-hw - 3, -hh - 3, p.w + 6, p.h + 6);
      }
      ctx.restore();
    });

    // Draw Anchor Pins
    anchorPins.forEach((pin, idx) => {
      ctx.save();
      ctx.translate(pin.x, pin.y);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ccff00';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      if (selectedEntity?.type === 'PIN' && selectedEntity.index === idx) {
        ctx.strokeStyle = '#ccff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Draw Hives
    hives.forEach((h) => {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${h.beeCount}🐝`, 0, 0);
      ctx.restore();
    });

    // Draw Caola Spawn Point
    ctx.save();
    ctx.translate(characterPos.x, characterPos.y);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐨', 0, 0);
    ctx.restore();
  }, [mode, platforms, anchorPins, hives, hazards, characterPos, selectedEntity]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="neo-box w-full max-w-[440px] max-h-[96vh] rounded-2xl bg-[#121626] border-2 border-cyan-400 text-white p-3 sm:p-4 flex flex-col gap-2.5 shadow-[0_0_35px_rgba(0,240,255,0.3)]">
        {/* Studio Top Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ccff00] text-black font-black flex items-center justify-center text-sm shadow-[1.5px_1.5px_0px_#000]">
              🛠️
            </div>
            <div>
              <h3 className="font-black text-sm text-[#00f0ff] leading-none">LEVEL STUDIO</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Build & verify custom missions for the community!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-400 flex items-center justify-center text-slate-300 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Toggle: EDIT vs TEST PLAY */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/60 rounded-xl border border-cyan-500/40">
          <button
            onClick={() => {
              retroAudio.playClick();
              setMode('EDIT');
            }}
            className={`py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === 'EDIT'
                ? 'bg-[#ccff00] text-black shadow-[1.5px_1.5px_0px_#000]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders size={14} />
            <span>EDIT WORKSPACE</span>
          </button>
          <button
            onClick={startTestPlay}
            className={`py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              mode === 'TEST'
                ? 'bg-cyan-400 text-black shadow-[1.5px_1.5px_0px_#000]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play size={14} />
            <span>TEST & VERIFY ▶</span>
          </button>
        </div>

        {/* WORKSPACE AREA */}
        {mode === 'EDIT' ? (
          <>
            {/* Tool Selection Palette */}
            <div className="flex items-center justify-between gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-700 text-[10px] font-bold">
              <span className="text-slate-400 px-1">CLICK TO PLACE:</span>
              <button
                onClick={() => setSelectedTool('PLATFORM')}
                className={`px-2 py-1 rounded-md transition-all ${
                  selectedTool === 'PLATFORM' ? 'bg-[#00f0ff] text-black font-black' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                🧱 Platform
              </button>
              <button
                onClick={() => setSelectedTool('PIN')}
                className={`px-2 py-1 rounded-md transition-all ${
                  selectedTool === 'PIN' ? 'bg-[#f59e0b] text-black font-black' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                📍 Pin
              </button>
              <button
                onClick={() => setSelectedTool('CAOLA')}
                className={`px-2 py-1 rounded-md transition-all ${
                  selectedTool === 'CAOLA' ? 'bg-[#ccff00] text-black font-black' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                🐨 Caola
              </button>
              <button
                onClick={() => setSelectedTool('HIVE')}
                className={`px-2 py-1 rounded-md transition-all ${
                  selectedTool === 'HIVE' ? 'bg-amber-400 text-black font-black' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                🐝 Hive
              </button>
              <button
                onClick={() => setSelectedTool('SPIKES')}
                className={`px-2 py-1 rounded-md transition-all ${
                  selectedTool === 'SPIKES' ? 'bg-rose-500 text-white font-black' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                ⚡ Spikes
              </button>
            </div>

            {/* Interactive Canvas Editor */}
            <div className="relative w-full aspect-[400/520] rounded-xl overflow-hidden border-2 border-black bg-[#0a0b14] shadow-inner">
              <canvas
                ref={canvasRef}
                width={400}
                height={640}
                onClick={handleEditorCanvasClick}
                className="w-full h-full block cursor-pointer"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 border border-cyan-400/50 text-[9px] font-bold text-cyan-300">
                Click canvas to place {selectedTool}
              </div>
            </div>

            {/* Quick Entity Actions */}
            <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
              <div className="flex items-center gap-1">
                <button
                  onClick={addPlatform}
                  className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-400 text-cyan-300"
                >
                  + Add Plat
                </button>
                <button
                  onClick={addAnchorPin}
                  className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:border-amber-400 text-amber-300"
                >
                  + Add Pin
                </button>
                <button
                  onClick={addSpikes}
                  className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:border-rose-400 text-rose-300"
                >
                  + Add Spikes
                </button>
              </div>

              {selectedEntity && (
                <button
                  onClick={deleteSelected}
                  className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500 hover:text-white flex items-center gap-1"
                >
                  <Trash2 size={11} />
                  <span>Del Selected</span>
                </button>
              )}
            </div>

            {/* Level Settings Strip */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold bg-black/40 p-2 rounded-xl border border-slate-800">
              <div>
                <label className="text-slate-400 block mb-0.5">MISSION TITLE</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsVerified(false);
                  }}
                  className="w-full px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-0.5">DIFFICULTY</label>
                <select
                  value={difficulty}
                  onChange={(e) => {
                    setDifficulty(e.target.value as any);
                    setIsVerified(false);
                  }}
                  className="w-full px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-[#ccff00] font-black text-xs"
                >
                  <option value="EASY">EASY (50 $caola)</option>
                  <option value="MEDIUM">MEDIUM (75 $caola)</option>
                  <option value="HARD">HARD (100 $caola)</option>
                  <option value="WHALE DEGEN">WHALE DEGEN (150 $caola)</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          /* TEST PLAY MODE */
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-black text-cyan-300">TEST PLAY VERIFICATION</span>
              <span className={`font-black text-[11px] px-2 py-0.5 rounded ${
                isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {isVerified ? 'VERIFIED BEATABLE ✅' : 'MUST SURVIVE TO PUBLISH ⚠️'}
              </span>
            </div>

            {/* Test Play Canvas */}
            <div className="relative w-full aspect-[400/520] rounded-xl overflow-hidden border-2 border-cyan-400 bg-[#0a0b14]">
              <GameCanvas
                level={currentDraftLevel}
                avatarId="caola"
                onGameStateChange={handleTestStateChange}
                onInkChange={() => {}}
                onCountdownChange={() => {}}
                resetSignal={testResetSignal}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  retroAudio.playClick();
                  setTestResetSignal((prev) => prev + 1);
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>RESET RUN</span>
              </button>

              <button
                onClick={() => setMode('EDIT')}
                className="flex-1 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs font-bold"
              >
                BACK TO EDIT
              </button>
            </div>
          </div>
        )}

        {/* Publish Action Button */}
        <div className="pt-1 border-t border-slate-800">
          <button
            onClick={handlePublish}
            disabled={!isVerified}
            className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              isVerified
                ? 'neo-btn-volt'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <UploadCloud size={15} />
            <span>
              {isVerified
                ? 'PUBLISH TO DEGEN WORKSHOP (MINT +100 $caola)'
                : 'COMPLETE TEST RUN TO UNLOCK PUBLISH'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
