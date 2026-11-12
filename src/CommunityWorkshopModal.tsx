import React, { useState } from 'react';
import { CommunityLevel, tipCommunityLevel } from './communityLevels';
import { retroAudio } from './audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  Coins,
  Cpu,
  Play,
  Heart,
  Plus,
  X,
  Flame,
  Award,
  Wallet,
  CheckCircle2,
} from 'lucide-react';

interface CommunityWorkshopModalProps {
  levels: CommunityLevel[];
  onSelectLevel: (level: CommunityLevel) => void;
  onOpenStudio: () => void;
  onClose: () => void;
  caolaBalance: number;
  nvdaShards: number;
  onUpdateBalance: (deltaCaola: number, deltaNvda: number) => void;
  onLevelsUpdate: (newLevels: CommunityLevel[]) => void;
}

export const CommunityWorkshopModal: React.FC<CommunityWorkshopModalProps> = ({
  levels,
  onSelectLevel,
  onOpenStudio,
  onClose,
  caolaBalance,
  nvdaShards,
  onUpdateBalance,
  onLevelsUpdate,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'HOT' | 'TIPPED' | 'MY'>('ALL');
  const [activeTipTarget, setActiveTipTarget] = useState<CommunityLevel | null>(null);
  const [tipSuccessMessage, setTipSuccessMessage] = useState<string | null>(null);

  // Filtered levels
  const filteredLevels = levels.filter((lvl) => {
    if (filter === 'HOT') return lvl.plays > 800;
    if (filter === 'TIPPED') return (lvl.tipsCaola || 0) > 1000;
    if (filter === 'MY') return lvl.isCustom;
    return true;
  });

  // Handle Tip Execution
  const executeTip = (caolaAmount: number, nvdaAmount: number) => {
    if (!activeTipTarget) return;

    if (caolaAmount > caolaBalance || nvdaAmount > nvdaShards) {
      retroAudio.playStung();
      return;
    }

    // Deduct user balance
    onUpdateBalance(-caolaAmount, -nvdaAmount);

    // Increment creator level tips
    const updated = tipCommunityLevel(activeTipTarget.id, caolaAmount, nvdaAmount);
    onLevelsUpdate(updated);

    retroAudio.playWin();
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch {
      // Ignore
    }

    const tipLabel = caolaAmount > 0 ? `${caolaAmount} $caola` : `${nvdaAmount} NVDA Shard`;
    setTipSuccessMessage(`Tipped ${tipLabel} to ${activeTipTarget.author}! WAGMI 🚀`);
    setTimeout(() => {
      setTipSuccessMessage(null);
      setActiveTipTarget(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto animate-in fade-in">
      <div className="neo-box w-full max-w-[430px] max-h-[92vh] rounded-2xl bg-[#121626] border-2 border-cyan-400 text-white p-4 flex flex-col gap-3 shadow-[0_0_35px_rgba(0,240,255,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ccff00] text-black font-black flex items-center justify-center text-sm shadow-[1.5px_1.5px_0px_#000]">
              🌐
            </div>
            <div>
              <h3 className="font-black text-sm text-[#00f0ff] leading-none">
                COMMUNITY WORKSHOP
              </h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Play user-made stages, earn rewards & tip creators!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenStudio}
              className="px-2.5 py-1 text-[10px] font-black bg-[#ccff00] text-black border border-black rounded-lg flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000] hover:bg-[#d5ff1a] transition-all"
            >
              <Plus size={13} />
              <span>CREATE</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-400 flex items-center justify-center text-slate-300 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-black/60 rounded-xl border border-cyan-500/40 text-[10px] font-bold">
          <button
            onClick={() => setFilter('ALL')}
            className={`py-1.5 rounded-lg transition-all ${
              filter === 'ALL' ? 'bg-[#ccff00] text-black font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilter('HOT')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-0.5 ${
              filter === 'HOT' ? 'bg-[#ccff00] text-black font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame size={12} className="text-amber-500" />
            <span>HOT</span>
          </button>
          <button
            onClick={() => setFilter('TIPPED')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-0.5 ${
              filter === 'TIPPED' ? 'bg-[#ccff00] text-black font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={12} className="text-cyan-400" />
            <span>TOP TIPPED</span>
          </button>
          <button
            onClick={() => setFilter('MY')}
            className={`py-1.5 rounded-lg transition-all ${
              filter === 'MY' ? 'bg-[#ccff00] text-black font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            MY STAGES
          </button>
        </div>

        {/* Community Levels Scrollable List */}
        <div className="flex-1 overflow-y-auto max-h-[54vh] flex flex-col gap-2.5 pr-0.5">
          {filteredLevels.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs font-bold bg-slate-900/50 rounded-xl border border-slate-800">
              No levels found in this category. Click "+ CREATE" to publish your own mission!
            </div>
          ) : (
            filteredLevels.map((lvl) => (
              <div
                key={lvl.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400/80 transition-all flex flex-col gap-2 shadow-sm"
              >
                {/* Level Title & Creator Info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-black/60 border border-slate-700 flex items-center justify-center text-base">
                      {lvl.authorAvatar || '🐨'}
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-white leading-tight">
                        {lvl.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 font-medium">
                        by <span className="text-cyan-300 font-bold">{lvl.author}</span> · {lvl.authorAddress}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      lvl.difficulty === 'EASY'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : lvl.difficulty === 'MEDIUM'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : lvl.difficulty === 'HARD'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    }`}
                  >
                    {lvl.difficulty}
                  </span>
                </div>

                <p className="text-[10px] text-slate-300 font-normal leading-snug">
                  {lvl.subtitle}
                </p>

                {/* Metrics: Plays, Likes, Tips Earned */}
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <span>🎮 {lvl.plays} plays</span>
                    <span className="flex items-center gap-0.5 text-rose-400">
                      <Heart size={10} className="fill-rose-400" />
                      {lvl.likes}
                    </span>
                    <span className="text-amber-300 font-black">
                      🪙 {lvl.tipsCaola} tips
                    </span>
                  </div>

                  {/* Actions: PLAY & TIP */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        retroAudio.playClick();
                        setActiveTipTarget(lvl);
                      }}
                      className="px-2 py-1 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400 hover:text-black font-black text-[10px] flex items-center gap-1 transition-all"
                    >
                      <Sparkles size={11} />
                      <span>TIP (打赏)</span>
                    </button>

                    <button
                      onClick={() => onSelectLevel(lvl)}
                      className="px-2.5 py-1 rounded-md bg-[#ccff00] text-black font-black text-[10px] border border-black flex items-center gap-1 hover:bg-[#d5ff1a] transition-all shadow-sm"
                    >
                      <Play size={11} className="fill-black" />
                      <span>PLAY</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tip Dialog Modal */}
        {activeTipTarget && (
          <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="neo-box w-full max-w-[320px] rounded-2xl bg-[#141829] border-2 border-amber-400 p-4 flex flex-col gap-3 shadow-[0_0_25px_rgba(245,158,11,0.35)] text-center">
              <div className="w-12 h-12 rounded-full bg-amber-400 border-2 border-black mx-auto flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000]">
                💎
              </div>

              <div>
                <h4 className="font-black text-sm text-amber-300">
                  TIP STAGE CREATOR
                </h4>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                  Reward <span className="font-black text-white">{activeTipTarget.author}</span> for this stage!
                </p>
              </div>

              {tipSuccessMessage ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black animate-in zoom-in">
                  {tipSuccessMessage}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 text-xs font-black">
                    <button
                      onClick={() => executeTip(20, 0)}
                      disabled={caolaBalance < 20}
                      className="py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-400 hover:bg-slate-700 text-amber-300 flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Coins size={14} />
                      <span>20 $caola</span>
                    </button>

                    <button
                      onClick={() => executeTip(50, 0)}
                      disabled={caolaBalance < 50}
                      className="py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-400 hover:bg-slate-700 text-amber-300 flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Coins size={14} />
                      <span>50 $caola</span>
                    </button>

                    <button
                      onClick={() => executeTip(100, 0)}
                      disabled={caolaBalance < 100}
                      className="py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-amber-400 hover:bg-slate-700 text-amber-300 flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Coins size={14} />
                      <span>100 $caola</span>
                    </button>

                    <button
                      onClick={() => executeTip(0, 1.0)}
                      disabled={nvdaShards < 1.0}
                      className="py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-cyan-400 hover:bg-slate-700 text-cyan-300 flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Cpu size={14} />
                      <span>1 NVDA Shard</span>
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-400 font-bold">
                    Your balance: {caolaBalance} $caola · {nvdaShards} NVDA Shards
                  </div>

                  <button
                    onClick={() => setActiveTipTarget(null)}
                    className="w-full py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300"
                  >
                    CANCEL
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
