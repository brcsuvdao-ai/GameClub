import React, { useState, useRef, useEffect } from 'react';
import { GameCanvas } from './GameCanvas';
import { LEVELS, LevelConfig } from './levels';
import { AVATAR_LIST, AvatarRenderer } from './avatars';
import { retroAudio } from './audio';
import {
  CommunityLevel,
  getCommunityLevels,
  addCustomLevel,
  recordCommunityPlay,
} from './communityLevels';
import { CommunityWorkshopModal } from './CommunityWorkshopModal';
import { LevelStudio } from './LevelStudio';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Upload,
  Trophy,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Shield,
  Coins,
  Cpu,
  Wallet,
  Menu as MenuIcon,
  X,
  Info,
  CheckCircle2,
  Flame,
  Award,
  Plus,
  Heart,
  Globe,
  Hammer,
} from 'lucide-react';

export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [activeCommunityLevel, setActiveCommunityLevel] = useState<CommunityLevel | null>(null);
  const [communityLevels, setCommunityLevels] = useState<CommunityLevel[]>(getCommunityLevels());

  const [avatarId, setAvatarId] = useState<string>('caola');
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);

  // Game states
  const [gameState, setGameState] = useState<'READY' | 'COUNTDOWN' | 'SUCCESS' | 'FAIL'>('READY');
  const [inkRatio, setInkRatio] = useState<number>(1.0);
  const [countdown, setCountdown] = useState<number>(LEVELS[0].countdownTime);
  const [resetSignal, setResetSignal] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [unlockedLevels, setUnlockedLevels] = useState<number>(1);

  // Unified Menu Modal & Workshop states
  const [showMenuModal, setShowMenuModal] = useState<boolean>(false);
  const [menuTab, setMenuTab] = useState<'LOCKER' | 'DEX' | 'RANKS' | 'RULES'>('LOCKER');
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showWorkshop, setShowWorkshop] = useState<boolean>(false);
  const [showStudio, setShowStudio] = useState<boolean>(false);

  // Web3 & Meme Economy
  const [caolaBalance, setCaolaBalance] = useState<number>(1420);
  const [nvdaShards, setNvdaShards] = useState<number>(3.5);
  const [tokenizedNvdaShares, setTokenizedNvdaShares] = useState<number>(1);
  const [stakedCaola, setStakedCaola] = useState<number>(500);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Current playing level (official or community)
  const currentLevel: LevelConfig = activeCommunityLevel || LEVELS[currentLevelIndex] || LEVELS[0];

  // Restart level
  const handleRestart = () => {
    retroAudio.playClick();
    setResetSignal((prev) => prev + 1);
  };

  // Next level
  const handleNextLevel = () => {
    retroAudio.playClick();
    if (activeCommunityLevel) {
      // Find next community level or return to campaign
      const cIdx = communityLevels.findIndex((l) => l.id === activeCommunityLevel.id);
      if (cIdx >= 0 && cIdx < communityLevels.length - 1) {
        setActiveCommunityLevel(communityLevels[cIdx + 1]);
      } else {
        setActiveCommunityLevel(null);
        setCurrentLevelIndex(0);
      }
      setResetSignal((prev) => prev + 1);
      return;
    }

    if (currentLevelIndex < LEVELS.length - 1) {
      const nextIndex = currentLevelIndex + 1;
      setCurrentLevelIndex(nextIndex);
      setUnlockedLevels((prev) => Math.max(prev, nextIndex + 1));
      setResetSignal((prev) => prev + 1);
    } else {
      setCurrentLevelIndex(0);
      setResetSignal((prev) => prev + 1);
    }
  };

  // Select level from campaign modal
  const handleSelectLevel = (idx: number) => {
    retroAudio.playClick();
    setActiveCommunityLevel(null);
    setCurrentLevelIndex(idx);
    setShowLevelSelect(false);
    setResetSignal((prev) => prev + 1);
  };

  // Select community level to play
  const handleSelectCommunityLevel = (lvl: CommunityLevel) => {
    retroAudio.playClick();
    setActiveCommunityLevel(lvl);
    setShowWorkshop(false);
    const updated = recordCommunityPlay(lvl.id);
    setCommunityLevels(updated);
    setResetSignal((prev) => prev + 1);
  };

  // Published new level from LevelStudio
  const handlePublishNewLevel = (newLevel: CommunityLevel) => {
    const updated = addCustomLevel(newLevel);
    setCommunityLevels(updated);
    setShowStudio(false);
    setCaolaBalance((prev) => prev + 100); // +100 $caola Creator Minting Reward!
    setActiveCommunityLevel(newLevel);
    setResetSignal((prev) => prev + 1);
  };

  // Handle custom avatar upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const customId = AvatarRenderer.setCustomAvatar(dataUrl);
        setCustomAvatarPreview(dataUrl);
        setAvatarId(customId);
        retroAudio.playClick();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    retroAudio.enabled = next;
    if (next) retroAudio.playClick();
  };

  // Claim & Level Win Rewards
  const handleWinClaim = () => {
    setCaolaBalance((prev) => prev + currentLevel.rewardCaola);
    setNvdaShards((prev) => Math.round((prev + currentLevel.rewardNvdaShards) * 10) / 10);
    handleNextLevel();
  };

  // Redeem 10 NVDA Shards for 1 Tokenized NVDA Stock
  const handleMintStock = () => {
    if (nvdaShards >= 10) {
      setNvdaShards((prev) => Math.round((prev - 10) * 10) / 10);
      setTokenizedNvdaShares((prev) => prev + 1);
      retroAudio.playWin();
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {
        // Ignore
      }
    }
  };

  // Stake $caola
  const handleStake = () => {
    if (caolaBalance >= 100) {
      setCaolaBalance((prev) => prev - 100);
      setStakedCaola((prev) => prev + 100);
      retroAudio.playClick();
    }
  };

  const openMenuTab = (tab: 'LOCKER' | 'DEX' | 'RANKS' | 'RULES') => {
    retroAudio.playClick();
    setMenuTab(tab);
    setShowMenuModal(true);
  };

  const getStars = () => {
    if (inkRatio > 0.55) return 3;
    if (inkRatio > 0.25) return 2;
    return 1;
  };

  return (
    <div className="min-h-screen bg-[#070911] text-slate-100 flex flex-col items-center justify-start p-2 pb-6 select-none overflow-x-hidden font-sans">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* =========================================================================
          HIGH-POLISH CYBERPUNK HUD BAR (With Real Depth, Gloss, and Metallic Glow)
          ========================================================================= */}
      <header className="w-full max-w-[420px] rounded-2xl p-2.5 mb-2 bg-gradient-to-b from-[#141829] to-[#0d101d] border-2 border-cyan-400/40 shadow-[0_4px_20px_rgba(0,240,255,0.18)] flex flex-col gap-1.5 backdrop-blur-md">
        <div className="flex items-center justify-between gap-1.5">
          {/* Logo & Level / Mode Selector */}
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ccff00] to-[#e6ff66] border-2 border-black flex items-center justify-center font-black text-xs text-black shadow-[2px_2px_0px_#000]">
              GC
            </div>

            {activeCommunityLevel ? (
              <button
                onClick={() => setShowWorkshop(true)}
                className="px-2 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400 text-cyan-300 font-black text-[11px] flex items-center gap-1 hover:bg-cyan-500/25 transition-all truncate max-w-[110px]"
                title="Community Stage (Click to browse workshop)"
              >
                <Globe size={11} className="text-cyan-400 shrink-0" />
                <span className="truncate">{activeCommunityLevel.title}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLevelSelect(true)}
                className="px-2 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400/60 hover:bg-cyan-500/25 text-cyan-300 font-black text-xs flex items-center gap-1 transition-all"
                title="Select Mission Level"
              >
                <span>LVL {currentLevel.id}/{LEVELS.length}</span>
                <span className="text-[10px] text-slate-400 font-normal">▼</span>
              </button>
            )}
          </div>

          {/* Gas (Ink) Progress Bar */}
          <div className="flex-1 max-w-[130px] flex flex-col gap-0.5 px-1">
            <div className="flex items-center justify-between text-[9px] font-black tracking-wide">
              <span className="text-cyan-300">GAS (INK)</span>
              <span className="text-[#ccff00]">{Math.round(inkRatio * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/80 rounded-full border border-cyan-500/50 overflow-hidden p-[1px] shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-75 shadow-sm ${
                  inkRatio > 0.4
                    ? 'bg-gradient-to-r from-[#22c55e] to-[#ccff00]'
                    : inkRatio > 0.2
                    ? 'bg-gradient-to-r from-[#f59e0b] to-[#fde047]'
                    : 'bg-gradient-to-r from-[#ef4444] to-[#f87171]'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, inkRatio * 100))}%` }}
              />
            </div>
          </div>

          {/* Survival Timer Badge */}
          <div className="flex flex-col items-center justify-center px-2 py-0.5 bg-gradient-to-b from-[#ccff00] to-[#b3e600] rounded-md border border-black shadow-[1.5px_1.5px_0px_#000] min-w-[50px]">
            <span className="text-[7px] font-black tracking-wider uppercase text-black leading-none">
              SURVIVE
            </span>
            <span className="text-xs font-black text-black leading-tight">{countdown}s</span>
          </div>

          {/* Action Buttons: Workshop, Restart & Menu */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                retroAudio.playClick();
                setShowWorkshop(true);
              }}
              className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-cyan-300 hover:text-white hover:border-cyan-400 transition-all shadow-sm"
              title="Open Community Workshop & Stage Builder"
            >
              <Globe size={15} />
            </button>

            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 transition-all shadow-sm"
              title="Restart Level"
            >
              <RotateCcw size={15} />
            </button>

            <button
              onClick={() => openMenuTab('LOCKER')}
              className="px-2 py-1 rounded-lg bg-gradient-to-b from-[#ccff00] to-[#a3d900] text-black font-black text-[11px] border border-black flex items-center gap-1 shadow-[2px_2px_0px_#000] hover:brightness-110 transition-all"
              title="Open GameClub Menu"
            >
              <MenuIcon size={13} />
              <span>MENU</span>
            </button>
          </div>
        </div>

        {/* Currency Strip & Stage Creator Quick Link */}
        <div className="flex items-center justify-between text-[10px] font-bold px-1 pt-1 border-t border-slate-800/80 text-slate-300">
          <button
            onClick={() => openMenuTab('DEX')}
            className="flex items-center gap-1 hover:text-[#ccff00] transition-colors"
          >
            <Coins size={12} className="text-amber-400" />
            <span className="font-black text-amber-300">{caolaBalance} $caola</span>
          </button>

          <button
            onClick={() => openMenuTab('DEX')}
            className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
          >
            <Cpu size={12} className="text-cyan-400" />
            <span className="text-cyan-300 font-extrabold">{nvdaShards} NVDA Shards</span>
          </button>

          <button
            onClick={() => {
              retroAudio.playClick();
              setShowStudio(true);
            }}
            className="flex items-center gap-1 text-[#ccff00] hover:underline font-black"
          >
            <Hammer size={11} />
            <span>+ BUILD STAGE</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN GAME CANVAS (Immersive, high-texture depth, NO text clutter)
          ========================================================================= */}
      <main className="relative w-full max-w-[420px] flex-1 flex flex-col items-center justify-center">
        <GameCanvas
          level={currentLevel}
          avatarId={avatarId}
          onGameStateChange={setGameState}
          onInkChange={setInkRatio}
          onCountdownChange={setCountdown}
          resetSignal={resetSignal}
        />

        {/* =====================================================================
            CAMPAIGN LEVEL SELECTOR MODAL
            ===================================================================== */}
        {showLevelSelect && (
          <div className="absolute inset-0 z-40 bg-black/85 flex flex-col items-center justify-center p-4 backdrop-blur-md">
            <div className="neo-box w-full max-w-[340px] p-4 rounded-2xl bg-[#141829] border-2 border-cyan-400 text-white flex flex-col gap-3 shadow-[0_0_25px_rgba(0,240,255,0.3)]">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗺️</span>
                  <span className="font-black text-sm text-cyan-300">CAMPAIGN MISSIONS</span>
                </div>
                <button
                  onClick={() => setShowLevelSelect(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {LEVELS.map((lvl, idx) => {
                  const isLocked = idx >= unlockedLevels;
                  const isCurrent = idx === currentLevelIndex && !activeCommunityLevel;
                  return (
                    <button
                      key={lvl.id}
                      disabled={isLocked}
                      onClick={() => handleSelectLevel(idx)}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center font-black transition-all border ${
                        isCurrent
                          ? 'bg-[#ccff00] text-black border-black shadow-[2px_2px_0px_#000]'
                          : isLocked
                          ? 'bg-slate-800/50 text-slate-500 border-slate-700/50 cursor-not-allowed opacity-50'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-cyan-400 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-sm font-black">{lvl.id}</span>
                      <span className="text-[8px] uppercase tracking-wider font-bold">
                        {isLocked ? 'LOCK' : `LVL ${lvl.id}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setShowLevelSelect(false);
                    setShowWorkshop(true);
                  }}
                  className="text-xs text-cyan-300 hover:text-[#ccff00] font-black flex items-center gap-1"
                >
                  <Globe size={13} />
                  <span>EXPLORE COMMUNITY STAGES ➔</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VICTORY MODAL (WAGMI 🚀 + Creator Royalty & Tip Option)
            ===================================================================== */}
        {gameState === 'SUCCESS' && (
          <div className="absolute inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
            <div className="neo-box w-full max-w-[330px] p-5 rounded-2xl bg-[#141829] border-2 border-[#ccff00] text-center flex flex-col items-center gap-3 shadow-[0_0_30px_rgba(204,255,0,0.35)]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#ccff00] to-[#d9ff33] border-2 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000]">
                🚀
              </div>

              <div>
                <h2 className="text-lg font-black tracking-wider text-[#ccff00]">
                  WAGMI! STAGE CLEARED!
                </h2>
                <p className="text-xs text-cyan-300 font-bold mt-0.5">
                  {activeCommunityLevel
                    ? `Proof-of-Shield Verified on ${activeCommunityLevel.title}!`
                    : 'Proof-of-Shield Verified! Caola HODLed strong!'}
                </p>
              </div>

              {/* Stars */}
              <div className="flex gap-1.5 text-amber-400 text-2xl">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < getStars() ? 'text-amber-400 drop-shadow-[0_0_6px_#f59e0b]' : 'text-slate-600'}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Rewards Breakdown */}
              <div className="w-full rounded-xl p-2.5 bg-black/60 border border-cyan-500/40 flex items-center justify-around text-xs font-black">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Coins size={15} />
                  <span>+{currentLevel.rewardCaola} $caola</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <Cpu size={15} />
                  <span>+{currentLevel.rewardNvdaShards} NVDA Shards</span>
                </div>
              </div>

              {/* Community Creator Tip Callout */}
              {activeCommunityLevel && (
                <div className="w-full p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-[11px] font-bold flex items-center justify-between">
                  <span>Author: {activeCommunityLevel.author}</span>
                  <button
                    onClick={() => setShowWorkshop(true)}
                    className="px-2 py-0.5 rounded bg-amber-400 text-black font-black text-[10px] hover:bg-amber-300"
                  >
                    TIP CREATOR 💎
                  </button>
                </div>
              )}

              <div className="w-full flex flex-col gap-2 mt-1">
                <button
                  onClick={handleWinClaim}
                  className="neo-btn-volt w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <span>CLAIM REWARDS & NEXT STAGE</span>
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={handleRestart}
                  className="w-full py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 hover:border-cyan-400 transition-all"
                >
                  REPLAY FOR 3 STARS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            DEFEAT MODAL (REKT 💥)
            ===================================================================== */}
        {gameState === 'FAIL' && (
          <div className="absolute inset-0 z-50 bg-black/85 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
            <div className="neo-box w-full max-w-[330px] p-5 rounded-2xl bg-[#141829] border-2 border-rose-500 text-center flex flex-col items-center gap-3 shadow-[0_0_30px_rgba(244,63,94,0.35)]">
              <div className="w-14 h-14 rounded-full bg-rose-500 border-2 border-black flex items-center justify-center text-2xl text-white shadow-[3px_3px_0px_#000]">
                💥
              </div>

              <div>
                <h2 className="text-lg font-black tracking-wider text-rose-500">
                  REKT! STAGE FAILED!
                </h2>
                <p className="text-xs text-slate-300 font-bold mt-0.5">
                  Liquidated! Short-seller bees stung Caola or hazard touched.
                </p>
              </div>

              <div className="text-[11px] bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/40 text-amber-200 font-bold text-left flex items-start gap-1.5">
                <span className="text-sm">💡</span>
                <span>
                  <strong>Tip:</strong> Platforms & Caola are solid obstacles! Hook an umbrella arch over the anchor pins in open air without intersecting them!
                </span>
              </div>

              <div className="w-full flex flex-col gap-2 mt-1">
                <button
                  onClick={handleRestart}
                  className="neo-btn-volt w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={15} />
                  <span>TRY AGAIN (RE-DRAW)</span>
                </button>

                <button
                  onClick={() => setShowLevelSelect(true)}
                  className="w-full py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 hover:border-cyan-400 transition-all"
                >
                  SELECT MISSION
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          COMMUNITY WORKSHOP & TIPPING MODAL
          ========================================================================= */}
      {showWorkshop && (
        <CommunityWorkshopModal
          levels={communityLevels}
          onSelectLevel={handleSelectCommunityLevel}
          onOpenStudio={() => {
            setShowWorkshop(false);
            setShowStudio(true);
          }}
          onClose={() => setShowWorkshop(false)}
          caolaBalance={caolaBalance}
          nvdaShards={nvdaShards}
          onUpdateBalance={(deltaCaola, deltaNvda) => {
            setCaolaBalance((prev) => prev + deltaCaola);
            setNvdaShards((prev) => Math.round((prev + deltaNvda) * 10) / 10);
          }}
          onLevelsUpdate={(newLevels) => setCommunityLevels(newLevels)}
        />
      )}

      {/* =========================================================================
          LEVEL STUDIO (CUSTOM LEVEL BUILDER & VERIFIER)
          ========================================================================= */}
      {showStudio && (
        <LevelStudio
          onPublish={handlePublishNewLevel}
          onClose={() => setShowStudio(false)}
          userAddress="0xCA0LA...4209"
        />
      )}

      {/* =========================================================================
          UNIFIED `☰ MENU` MODAL (All auxiliary features organized here cleanly)
          ========================================================================= */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 backdrop-blur-md animate-in fade-in">
          <div className="neo-box w-full max-w-[420px] max-h-[92vh] overflow-y-auto rounded-2xl bg-[#141829] border-2 border-cyan-400 text-white p-4 flex flex-col gap-3 shadow-[0_0_35px_rgba(0,240,255,0.25)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#ccff00] border-2 border-black flex items-center justify-center font-black text-black">
                  GC
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#00f0ff] tracking-tight">GAMECLUB HUB</h3>
                  <div className="text-[10px] text-slate-400 font-bold">
                    PROTECT CAOLA · DEGEN HEADQUARTERS
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMenuModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-400 flex items-center justify-center text-slate-300 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Menu Tabs: LOCKER | NVDA DEX | RANKS | RULES */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-black/60 rounded-xl border border-cyan-500/40">
              <button
                onClick={() => setMenuTab('LOCKER')}
                className={`py-1.5 text-[10px] font-black rounded-lg transition-all flex flex-col items-center justify-center ${
                  menuTab === 'LOCKER'
                    ? 'bg-[#ccff00] text-black shadow-[1.5px_1.5px_0px_#000]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>👤 HEROES</span>
              </button>
              <button
                onClick={() => setMenuTab('DEX')}
                className={`py-1.5 text-[10px] font-black rounded-lg transition-all flex flex-col items-center justify-center ${
                  menuTab === 'DEX'
                    ? 'bg-[#ccff00] text-black shadow-[1.5px_1.5px_0px_#000]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📈 NVDA DEX</span>
              </button>
              <button
                onClick={() => setMenuTab('RANKS')}
                className={`py-1.5 text-[10px] font-black rounded-lg transition-all flex flex-col items-center justify-center ${
                  menuTab === 'RANKS'
                    ? 'bg-[#ccff00] text-black shadow-[1.5px_1.5px_0px_#000]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🏆 RANKS</span>
              </button>
              <button
                onClick={() => setMenuTab('RULES')}
                className={`py-1.5 text-[10px] font-black rounded-lg transition-all flex flex-col items-center justify-center ${
                  menuTab === 'RULES'
                    ? 'bg-[#ccff00] text-black shadow-[1.5px_1.5px_0px_#000]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⚙️ RULES</span>
              </button>
            </div>

            {/* ---------------- TAB 1: HEROES LOCKER ---------------- */}
            {menuTab === 'LOCKER' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-xs text-white">CHARACTER LOCKER</h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Select your hero or upload custom photo
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-1 text-[10px] font-black bg-[#ccff00] text-black border border-black rounded-lg flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000]"
                  >
                    <Upload size={12} />
                    <span>UPLOAD</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_LIST.map((av) => {
                    const isSelected = avatarId === av.id;
                    return (
                      <button
                        key={av.id}
                        onClick={() => {
                          retroAudio.playClick();
                          setAvatarId(av.id);
                        }}
                        className={`rounded-xl p-2 flex flex-col items-center text-center transition-all border ${
                          isSelected
                            ? 'bg-[#ccff00]/20 border-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.3)] ring-1 ring-[#ccff00]'
                            : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div
                          className="w-12 h-12 rounded-lg border border-black mb-1.5 flex items-center justify-center overflow-hidden shadow-sm"
                          style={{ backgroundColor: av.color }}
                        >
                          {av.id === 'caola' ? (
                            <img
                              src="/caola.png"
                              alt="Caola Cutout"
                              className="w-full h-full object-contain p-0.5"
                            />
                          ) : (
                            <span className="text-xl">🤖</span>
                          )}
                        </div>
                        <span className="font-black text-[11px] truncate w-full text-slate-100">
                          {av.name}
                        </span>
                        <span className="text-[8px] font-black tracking-wider text-slate-400 uppercase">
                          {av.sizeTag}
                        </span>
                      </button>
                    );
                  })}

                  {/* Custom Avatar Slot */}
                  <button
                    onClick={() => {
                      if (customAvatarPreview) {
                        retroAudio.playClick();
                        setAvatarId('custom_active');
                      } else {
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`rounded-xl p-2 flex flex-col items-center text-center transition-all border ${
                      avatarId.startsWith('custom_')
                        ? 'bg-[#ccff00]/20 border-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.3)] ring-1 ring-[#ccff00]'
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg border border-black mb-1.5 flex items-center justify-center overflow-hidden bg-slate-700">
                      {customAvatarPreview ? (
                        <img src={customAvatarPreview} alt="User Custom" className="w-full h-full object-cover" />
                      ) : (
                        <Upload size={18} className="text-slate-400" />
                      )}
                    </div>
                    <span className="font-black text-[11px] truncate w-full text-slate-100">CUSTOM</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase">
                      {customAvatarPreview ? 'ACTIVE' : 'UPLOAD'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ---------------- TAB 2: NVDA DEX & STOCKS ---------------- */}
            {menuTab === 'DEX' && (
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-black text-cyan-300">
                      <Cpu size={16} />
                      <span>$NVDA TOKENIZED STOCK</span>
                    </div>
                    <span className="text-emerald-400 font-extrabold text-[11px] bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                      $148.50 (+18.4%) 🚀
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold pt-1 text-slate-300">
                    <span>NVIDIA SHARDS (nvida碎片):</span>
                    <span className="font-black text-cyan-400">{nvdaShards} / 10 Shards</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full border border-cyan-500/40 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_#00f0ff]"
                      style={{ width: `${Math.min(100, (nvdaShards / 10) * 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-slate-700/60 text-slate-300">
                    <span>OWNED $NVDA SHARES:</span>
                    <span className="font-black text-emerald-400 text-sm">
                      {tokenizedNvdaShares} Shares
                    </span>
                  </div>

                  <button
                    onClick={handleMintStock}
                    disabled={nvdaShards < 10}
                    className={`mt-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                      nvdaShards >= 10
                        ? 'neo-btn-volt'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>REDEEM 10 SHARDS ➔ 1 $NVDA SHARE</span>
                  </button>
                </div>

                {/* GPU Cloud Staking Pool */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-amber-300">GPU CLUSTER STAKING</span>
                    <span className="text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                      69.42% APY
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium">
                    Stake your $caola currency to power GPU AI compute clusters and harvest daily yield.
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                    <span className="text-amber-200">STAKED: {stakedCaola} $caola</span>
                    <button
                      onClick={handleStake}
                      disabled={caolaBalance < 100}
                      className="px-2.5 py-1 text-[10px] font-black bg-amber-400 text-black rounded-lg border border-black hover:bg-amber-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      STAKE +100
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 3: LEADERBOARD ---------------- */}
            {menuTab === 'RANKS' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-black text-white">DEGEN LEADERBOARD</h4>
                  <span className="text-[10px] text-emerald-400 font-black animate-pulse">● LIVE</span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs font-bold">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-400">#1</span>
                      <span className="text-slate-200">0xSatoshi...8888</span>
                    </div>
                    <span className="font-black text-amber-300">8,920 $caola</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-400">#2</span>
                      <span className="text-slate-200">0xVitalik...1337</span>
                    </div>
                    <span className="font-black text-slate-300">6,400 $caola</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-400">#3</span>
                      <span className="text-slate-200">0xPepeChad...4200</span>
                    </div>
                    <span className="font-black text-slate-300">4,150 $caola</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#ccff00]/15 border-2 border-[#ccff00] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#ccff00]">#42</span>
                      <span className="text-white font-black">0xCA0LA...4209 (You)</span>
                    </div>
                    <span className="font-black text-[#ccff00]">{caolaBalance} $caola</span>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB 4: RULES & SETTINGS ---------------- */}
            {menuTab === 'RULES' && (
              <div className="flex flex-col gap-3 text-xs">
                {/* Audio SFX Toggle */}
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {audioEnabled ? <Volume2 size={16} className="text-cyan-400" /> : <VolumeX size={16} className="text-rose-400" />}
                    <span className="font-bold">Sound Effects & Buzz</span>
                  </div>
                  <button
                    onClick={toggleAudio}
                    className={`px-3 py-1 rounded-lg text-xs font-black border ${
                      audioEnabled
                        ? 'bg-[#ccff00] text-black border-black'
                        : 'bg-slate-700 text-slate-400 border-slate-600'
                    }`}
                  >
                    {audioEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Obstacle Physics Rules */}
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex flex-col gap-2 text-slate-200">
                  <div className="flex items-center gap-1.5 font-black text-cyan-300">
                    <Shield size={16} />
                    <span>OBSTACLE PHYSICS RULES</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                    1. <strong>Solid Obstacles:</strong> Platforms, walls, ground, and Caola are solid rigid bodies. Your drawing laser cannot cross through them.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                    2. <strong>Hook in Open Air:</strong> Draw shields in open air and hook them over pins or platform corners to create stable roofs against bees.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                    3. <strong>Instant Bee Sting:</strong> If even one bee touches Caola, the mission fails immediately!
                  </p>
                </div>

                <div className="text-[10px] text-slate-400 text-center font-bold">
                  GameClub v2.5 · Protected by Proof-of-Shield™
                </div>
              </div>
            )}

            {/* Modal Bottom CTA */}
            <button
              onClick={() => setShowMenuModal(false)}
              className="neo-btn-volt w-full py-2.5 rounded-xl text-xs font-black mt-1"
            >
              RESUME GAME ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
