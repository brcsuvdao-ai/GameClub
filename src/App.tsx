import React, { useEffect, useRef, useState } from 'react';
import {
  CANVAS_W,
  CANVAS_H,
  GAME_SHARE_URL,
  GPU_TO_RTX_RATE,
  GameClubEngine,
  GameSnapshot,
  ShipUpgrades,
} from './gameEngine';
import { RTX_GPU_DATA_URI } from './spritesData';

type LobbyTab = 'HOME' | 'UPGRADE' | 'EXCHANGE' | 'INTEL';

const UPGRADE_META: {
  key: keyof ShipUpgrades;
  title: string;
  desc: string;
}[] = [
  { key: 'cannons', title: 'PLASMA CANNONS', desc: 'Adds forward barrels, damage & wing missiles' },
  { key: 'firerate', title: 'CYCLER CORE', desc: 'Boosts forward cannon & missile cadence' },
  { key: 'hull', title: 'TITANIUM HULL', desc: '+45 Max HP per level' },
  { key: 'thrusters', title: 'ION THRUSTERS', desc: 'Flight speed & GPU magnet range' },
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameClubEngine | null>(null);

  const [lobbyTab, setLobbyTab] = useState<LobbyTab>('HOME');
  const [exchangeMsg, setExchangeMsg] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [screenshotPreviewUrl, setScreenshotPreviewUrl] = useState<string | null>(null);

  const [snapshot, setSnapshot] = useState<GameSnapshot>({
    phase: 'LOBBY',
    sector: 1,
    maxSector: 1,
    caola: 120,
    runCaola: 0,
    gpus: 0,
    runGpus: 0,
    rtxStonk: 0,
    enemiesDestroyed: 0,
    hp: 100,
    maxHp: 100,
    progress: 0,
    bossActive: false,
    autoFire: false,
    weaponMode: 'PULSE',
    empCooldown: 0,
    empMaxCooldown: 14,
    overdriveCooldown: 0,
    overdriveMaxCooldown: 18,
    overdriveTimer: 0,
    upgrades: { cannons: 1, firerate: 1, hull: 1, thrusters: 1 },
    highScore: 0,
    missionsCleared: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new GameClubEngine(canvas, (nextSnap) => {
      setSnapshot(nextSnap);
    });
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (screenshotPreviewUrl) URL.revokeObjectURL(screenshotPreviewUrl);
    };
  }, [screenshotPreviewUrl]);

  const buildXShareUrl = () => {
    const resultLabel =
      snapshot.phase === 'VICTORY'
        ? `SECTOR ${snapshot.sector} CLEARED`
        : `SECTOR ${snapshot.sector} // KIA`;
    const tweetText = `GameClub Battle Report [${resultLabel}] — Earned ${snapshot.runCaola} $CAOLA & ${snapshot.runGpus} RTX GPUs! Portfolio: ${snapshot.rtxStonk.toFixed(2)} $RTX Stonk.`;
    const params = new URLSearchParams({
      text: tweetText,
      url: GAME_SHARE_URL,
    });
    return `https://x.com/intent/tweet?${params.toString()}`;
  };

  // === MODULE: SHARE TO X ===
  const handleSharePrepare = async () => {
    const engine = engineRef.current;
    if (!engine) return;
    const blob = await engine.captureScreenshotBlob();
    if (!blob) return;

    const previewUrl = URL.createObjectURL(blob);
    setScreenshotPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return previewUrl;
    });

    let copied = false;
    try {
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        copied = true;
      }
    } catch {
      copied = false;
    }

    const dl = document.createElement('a');
    dl.href = previewUrl;
    dl.download = `gameclub-caola-${snapshot.runCaola}.png`;
    document.body.appendChild(dl);
    dl.click();
    dl.remove();

    setShareStatus(
      copied
        ? 'SCREENSHOT COPIED & SAVED — PASTE INTO X POST!'
        : 'SCREENSHOT SAVED (.PNG) — ATTACH TO X POST!'
    );
  };

  const handleLaunch = () => {
    setShareStatus(null);
    setExchangeMsg(null);
    engineRef.current?.startMission(snapshot.sector);
  };

  const handleReturnLobby = () => {
    setShareStatus(null);
    setLobbyTab('HOME');
    engineRef.current?.returnToLobby();
  };

  const handleUpgrade = (key: keyof ShipUpgrades) => {
    engineRef.current?.upgradeShip(key);
  };

  const handleSwapGpus = (count: number) => {
    const res = engineRef.current?.exchangeGpusForRtxStonk(count);
    if (res && res.swapped > 0) {
      setExchangeMsg(
        `SWAPPED ${res.swapped} RTX GPU -> +${res.stonkGained.toFixed(2)} $RTX STONK!`
      );
    } else {
      setExchangeMsg('NO RTX GPUs IN CARGO! DESTROY RTX TRANSPORT SHIPS.');
    }
  };

  const isLobby = snapshot.phase === 'LOBBY';
  const isEndScreen = snapshot.phase === 'VICTORY' || snapshot.phase === 'GAMEOVER';

  return (
    <div className="w-full h-[100dvh] bg-[#060811] flex items-center justify-center overflow-hidden p-1 sm:p-2 font-mono">
      <div className="relative h-full max-h-[860px] aspect-[9/16] max-w-full border-2 border-[#38e8ff]/55 bg-[#060811] shadow-[0_0_28px_rgba(56,232,255,0.2)] overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="pixel-canvas w-full h-full block"
        />

        {/* HANGAR LOBBY TOP TELEMETRY BAR */}
        {isLobby && (
          <div className="absolute inset-x-0 top-0 z-20 px-2 py-2 flex items-center justify-between text-[10px] font-bold tracking-wider">
            <div className="text-[#b8f8ff]">
              <span className="text-[#38e8ff]">GAMECLUB</span> // BAY
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-[#0e1526] border border-[#22c55e]/60 text-[#86efac]">
                {snapshot.caola} $CAOLA
              </span>
              <span className="px-1.5 py-0.5 bg-[#0e1526] border border-[#facc15]/60 text-[#fde047]">
                {snapshot.gpus} GPU
              </span>
              <span className="px-1.5 py-0.5 bg-[#0e1526] border border-[#38e8ff]/60 text-[#b8f8ff]">
                {snapshot.rtxStonk.toFixed(2)} $RTX
              </span>
            </div>
          </div>
        )}

        {/* HANGAR LOBBY LOWER TERMINAL MENU */}
        {isLobby && (
          <div className="absolute inset-x-2.5 top-[47%] bottom-2.5 z-20 bg-[#080c18]/95 border-2 border-[#38e8ff]/70 flex flex-col overflow-hidden">
            {/* Sub-header */}
            <div className="px-2.5 py-1.5 bg-[#0f172a] border-b border-[#38e8ff]/40 flex items-center justify-between text-[10px] font-bold">
              <span className="text-[#38e8ff]">
                {lobbyTab === 'HOME' && 'COMMAND TERMINAL // READY'}
                {lobbyTab === 'UPGRADE' && 'HANGAR BAY // SHIP UPGRADES'}
                {lobbyTab === 'EXCHANGE' && 'STONK DEX // GPU -> $RTX'}
                {lobbyTab === 'INTEL' && 'RESISTANCE BRIEFING // INTEL'}
              </span>
              {lobbyTab !== 'HOME' && (
                <button
                  onClick={() => {
                    setExchangeMsg(null);
                    setLobbyTab('HOME');
                  }}
                  className="px-2 py-0.5 bg-[#1e293b] hover:bg-[#334155] border border-[#38e8ff] text-[#b8f8ff] cursor-pointer"
                >
                  [ BACK ]
                </button>
              )}
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-2.5 flex flex-col justify-between gap-2">
              {lobbyTab === 'HOME' && (
                <>
                  <div className="p-2 bg-[#0d1324] border border-[#5d486e] text-[10px] leading-relaxed text-[#b7bfc2]">
                    <div className="text-[#86efac] font-bold mb-0.5">
                      OBJECTIVE: RAID RTX TRANSPORTS
                    </div>
                    Destroy Nexus Synth <span className="text-[#fde047] font-bold">RTX Transport Ships</span> to capture{' '}
                    <span className="text-[#86efac] font-bold">RTX VIBE GPUs</span>, then swap them for{' '}
                    <span className="text-[#38e8ff] font-bold">$RTX Stonk</span>! Earn{' '}
                    <span className="text-[#86efac]">$CAOLA</span> from combat to upgrade cannons &amp; hull.
                  </div>

                  {/* Sector Progression Selector */}
                  <div className="px-2 py-1.5 bg-[#0d1324] border border-[#334155] flex items-center justify-between text-[10px] font-bold">
                    <span className="text-[#8f979a]">TARGET SECTOR:</span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={snapshot.sector <= 1}
                        onClick={() => engineRef.current?.setSector(snapshot.sector - 1)}
                        className="px-2 py-0.5 bg-[#12182b] border border-[#38e8ff]/60 text-[#b8f8ff] disabled:opacity-35 cursor-pointer"
                      >
                        &lt;
                      </button>
                      <span className="text-[#fde047] min-w-[74px] text-center">
                        SECTOR 0{snapshot.sector}
                      </span>
                      <button
                        disabled={snapshot.sector >= snapshot.maxSector}
                        onClick={() => engineRef.current?.setSector(snapshot.sector + 1)}
                        className="px-2 py-0.5 bg-[#12182b] border border-[#38e8ff]/60 text-[#b8f8ff] disabled:opacity-35 cursor-pointer"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-auto">
                    <button
                      onClick={handleLaunch}
                      className="w-full py-2.5 bg-[#0891b2] hover:bg-[#0ea5e9] border-2 border-[#b8f8ff] text-white text-xs font-bold tracking-widest cursor-pointer active:translate-y-0.5"
                    >
                      [ LAUNCH SECTOR 0{snapshot.sector} ]
                    </button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setLobbyTab('UPGRADE')}
                        className="py-2 bg-[#12182b] hover:bg-[#1e293b] border border-[#38e8ff] text-[#b8f8ff] text-[11px] font-bold cursor-pointer"
                      >
                        [ UPGRADE SHIP ]
                      </button>
                      <button
                        onClick={() => {
                          setExchangeMsg(null);
                          setLobbyTab('EXCHANGE');
                        }}
                        className="py-2 bg-[#11241a] hover:bg-[#163323] border border-[#22c55e] text-[#86efac] text-[11px] font-bold cursor-pointer"
                      >
                        [ $RTX EXCHANGE ]
                      </button>
                    </div>
                    <button
                      onClick={() => setLobbyTab('INTEL')}
                      className="w-full py-1.5 bg-[#1c1528] hover:bg-[#2d2140] border border-[#9d7bb8] text-[#e9d5ff] text-[11px] font-bold cursor-pointer"
                    >
                      [ INTEL, WEAPONS &amp; SKILLS ]
                    </button>
                  </div>
                </>
              )}

              {lobbyTab === 'UPGRADE' && (
                <div className="flex flex-col gap-1.5">
                  {UPGRADE_META.map((u) => {
                    const lvl = snapshot.upgrades[u.key];
                    const maxed = lvl >= 4;
                    const cost = lvl * 120;
                    const canBuy = !maxed && snapshot.caola >= cost;
                    return (
                      <div
                        key={u.key}
                        className="p-2 bg-[#0d1324] border border-[#334155] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-[#b8f8ff] flex items-center gap-1.5">
                            <span>{u.title}</span>
                            <span className="text-[#facc15]">LV.{lvl}/4</span>
                          </div>
                          <div className="text-[9px] text-[#8f979a] truncate">{u.desc}</div>
                        </div>
                        <button
                          disabled={!canBuy}
                          onClick={() => handleUpgrade(u.key)}
                          className={`shrink-0 px-2 py-1.5 text-[10px] font-bold border ${
                            maxed
                              ? 'bg-[#1e293b] border-[#475569] text-[#94a3b8] cursor-default'
                              : canBuy
                              ? 'bg-[#0891b2] hover:bg-[#0ea5e9] border-[#b8f8ff] text-white cursor-pointer'
                              : 'bg-[#121622] border-[#334155] text-[#64748b] cursor-not-allowed'
                          }`}
                        >
                          {maxed ? 'MAX' : `${cost} $CAOLA`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {lobbyTab === 'EXCHANGE' && (
                <div className="flex flex-col gap-2">
                  <div className="p-2 bg-[#0d1324] border border-[#22c55e]/60 flex items-center gap-2.5">
                    <img
                      src={RTX_GPU_DATA_URI}
                      alt="RTX VIBE GPU"
                      className="w-20 h-12 object-contain pixel-canvas shrink-0 bg-[#060811] p-1 border border-[#334155]"
                    />
                    <div className="text-[10px] leading-snug">
                      <div className="text-[#86efac] font-bold">RTX VIBE GPU -&gt; $RTX STONK</div>
                      <div className="text-[#b7bfc2]">
                        RATE: <span className="text-[#fde047] font-bold">1 GPU = {GPU_TO_RTX_RATE.toFixed(2)} $RTX</span>
                      </div>
                      <div className="text-[#38e8ff] mt-0.5">
                        HELD: {snapshot.gpus} GPUs | {snapshot.rtxStonk.toFixed(2)} $RTX
                      </div>
                    </div>
                  </div>

                  {exchangeMsg && (
                    <div className="px-2 py-1.5 bg-[#0f291e] border border-[#22c55e] text-[#86efac] text-[10px] font-bold text-center">
                      {exchangeMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      disabled={snapshot.gpus < 1}
                      onClick={() => handleSwapGpus(1)}
                      className={`py-2.5 text-[10px] font-bold border ${
                        snapshot.gpus >= 1
                          ? 'bg-[#15803d] hover:bg-[#16a34a] border-[#86efac] text-white cursor-pointer'
                          : 'bg-[#121622] border-[#334155] text-[#64748b] cursor-not-allowed'
                      }`}
                    >
                      [ SWAP 1 GPU ]
                    </button>
                    <button
                      disabled={snapshot.gpus < 1}
                      onClick={() => handleSwapGpus(snapshot.gpus)}
                      className={`py-2.5 text-[10px] font-bold border ${
                        snapshot.gpus >= 1
                          ? 'bg-[#0891b2] hover:bg-[#0ea5e9] border-[#b8f8ff] text-white cursor-pointer'
                          : 'bg-[#121622] border-[#334155] text-[#64748b] cursor-not-allowed'
                      }`}
                    >
                      [ SWAP ALL ({snapshot.gpus}) ]
                    </button>
                  </div>

                  <div className="text-[9px] text-[#8f979a] text-center mt-auto">
                    GPUs convert exclusively into tokenized $RTX Stonk. Earn $CAOLA in combat for ship upgrades!
                  </div>
                </div>
              )}

              {lobbyTab === 'INTEL' && (
                <div className="text-[10px] leading-relaxed text-[#b7bfc2] space-y-1.5">
                  <div className="p-2 bg-[#0d1324] border border-[#5d486e]">
                    <div className="text-[#38e8ff] font-bold mb-0.5">2149 // NEXUS SYNTH MONOPOLY</div>
                    Mega-corp <span className="text-[#ff4d6d] font-bold">Nexus Synth</span> hoarded all{' '}
                    <span className="text-[#86efac] font-bold">RTX VIBE GPUs</span>. Pilot Caola raids orbital{' '}
                    <span className="text-[#fde047] font-bold">RTX Transport Ships</span> to reclaim GPUs for{' '}
                    <span className="text-[#38e8ff] font-bold">$RTX Stonk</span>!
                  </div>
                  <div className="p-2 bg-[#0d1324] border border-[#334155]">
                    <div className="text-[#fde047] font-bold mb-0.5">WEAPONS &amp; SKILLS (FORWARD FIRE)</div>
                    <div>• Weapons (1/2/3 or HUD): PULSE, SPREAD Fan, RAIL Pierce</div>
                    <div>• Skills: [Q / EMP] Clears Bullets · [E / OVR] Shield + Rapid</div>
                    <div>• Move: WASD / Joystick / Drag · Fire: Space / Click / F Auto</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* END SCREEN TERMINAL ACTION BAR */}
        {isEndScreen && (
          <div className="absolute inset-x-4 bottom-6 z-20 flex flex-col gap-2">
            {shareStatus && (
              <div className="px-2 py-1.5 bg-[#0e1320]/95 border border-[#22c55e] text-[#86efac] text-[10px] font-bold text-center tracking-wider">
                {shareStatus}
              </div>
            )}

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={handleReturnLobby}
                className="py-2.5 px-1 bg-[#1c1528] hover:bg-[#2d2140] text-[#e9d5ff] border-2 border-[#9d7bb8] text-[10px] font-bold tracking-wider cursor-pointer active:translate-y-0.5"
              >
                [ HANGAR ]
              </button>

              <button
                onClick={handleLaunch}
                className="py-2.5 px-1 bg-[#121622] hover:bg-[#1d2436] text-[#b8f8ff] border-2 border-[#38e8ff] text-[10px] font-bold tracking-wider cursor-pointer active:translate-y-0.5"
              >
                {snapshot.phase === 'VICTORY' ? `[ SEC ${snapshot.maxSector} ]` : '[ REPLAY ]'}
              </button>

              <a
                href={buildXShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSharePrepare}
                className="py-2.5 px-1 bg-[#0891b2] hover:bg-[#0ea5e9] text-white border-2 border-[#b8f8ff] text-[10px] font-bold tracking-wider text-center flex items-center justify-center cursor-pointer active:translate-y-0.5 no-underline"
              >
                [ SHARE X ]
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
