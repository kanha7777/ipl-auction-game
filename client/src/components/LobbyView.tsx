import React, { useState } from "react";
import { RoomData, Contestant, AuctionConfig } from "../../../shared/src/types";
import { formatCrores } from "../../../shared/src/rules";
import {
  Users,
  Settings,
  Bot,
  Play,
  Share2,
  Trash2,
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Crown,
  X
} from "lucide-react";

interface LobbyViewProps {
  room: RoomData;
  contestant: Contestant;
  onStartAuction: () => void;
  onAddBot: () => void;
  onRemoveContestant: (id: string) => void;
  onUpdateConfig: (config: Partial<AuctionConfig>) => void;
  onPreparePool: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  contestant,
  onStartAuction,
  onAddBot,
  onRemoveContestant,
  onUpdateConfig,
  onPreparePool,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPoolPreview, setShowPoolPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Config state
  const [playerCount, setPlayerCount] = useState(room.config.playerCount);
  const [minSquad, setMinSquad] = useState(room.config.minSquadSize);
  const [maxSquad, setMaxSquad] = useState(room.config.maxSquadSize);
  const [maxOverseas, setMaxOverseas] = useState(room.config.maxOverseas);

  const isHost = contestant.isHost;
  const host = room.contestants.find((c) => c.isHost);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = () => {
    onUpdateConfig({
      playerCount,
      minSquadSize: minSquad,
      maxSquadSize: maxSquad,
      maxOverseas,
    });
    setShowConfigModal(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 pb-20">
      {/* Lobby Header Card */}
      <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-ipl-yellow/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0A121E] border border-ipl-yellow/40 flex items-center justify-center text-3xl shadow-inner">
              {contestant.teamLogo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-teko text-3xl font-bold tracking-wide text-white leading-none">
                  AUCTION LOBBY
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Host: <span className="text-ipl-yellow font-semibold">{host?.name || "Host"}</span> • Purse: <span className="text-emerald-400 font-semibold">{formatCrores(room.config.startingPurse)}</span>
              </p>
            </div>
          </div>

          {/* Room ID Badge & Share */}
          <div className="flex items-center gap-2 bg-[#0A121E] border border-[#1E304F] p-2 rounded-xl">
            <div className="text-left px-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">
                Room Code
              </span>
              <span className="font-teko text-xl font-bold text-ipl-yellow tracking-widest leading-none">
                {room.id}
              </span>
            </div>
            <button
              onClick={handleCopyLink}
              className="bg-[#1E304F] hover:bg-[#284068] text-white p-2 rounded-lg text-xs flex items-center gap-1 transition active:scale-95"
              title="Copy Room Code"
            >
              {copied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline text-[11px] font-semibold">
                {copied ? "Copied" : "Copy"}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Rules Pills */}
        <div className="mt-4 pt-3 border-t border-[#1E304F] flex flex-wrap items-center gap-2 text-xs">
          <span className="bg-[#0A121E] text-slate-300 px-2.5 py-1 rounded-lg border border-[#1E304F]">
            👥 <strong className="text-white">{room.contestants.length}/20</strong> Franchises
          </span>
          <span className="bg-[#0A121E] text-slate-300 px-2.5 py-1 rounded-lg border border-[#1E304F]">
            🏏 Pool: <strong className="text-white">{room.pool.length || room.config.playerCount}</strong> Players (Auto-scaled)
          </span>
          <span className="bg-[#0A121E] text-slate-300 px-2.5 py-1 rounded-lg border border-[#1E304F]">
            🛡️ Squad: <strong className="text-white">{room.config.minSquadSize}–{room.config.maxSquadSize}</strong> (Max {room.config.maxOverseas} OS)
          </span>
          <span className="bg-[#0A121E] text-slate-300 px-2.5 py-1 rounded-lg border border-[#1E304F]">
            ⏱️ Timer: <strong className="text-white">{room.config.timerDuration}s</strong>
          </span>
        </div>
      </div>

      {/* Contestants Grid */}
      <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-ipl-accent" /> Contestants ({room.contestants.length}/20)
          </h2>

          {isHost && room.contestants.length < 20 && (
            <button
              onClick={onAddBot}
              className="bg-[#131F33] hover:bg-[#1E304F] text-ipl-yellow border border-ipl-yellow/30 text-xs font-semibold py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Add AI Franchise</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {room.contestants.map((c) => (
            <div
              key={c.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition ${
                c.id === contestant.id
                  ? "bg-[#131F33] border-ipl-yellow/60 shadow-md"
                  : "bg-[#0A121E] border-[#1E304F]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl filter drop-shadow">{c.teamLogo}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">{c.teamName}</p>
                    {c.isHost && (
                      <span className="bg-amber-500/20 text-ipl-yellow text-[9px] font-extrabold px-1.5 py-0.2 rounded border border-amber-500/30 uppercase">
                        Host
                      </span>
                    )}
                    {c.isBot && (
                      <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-indigo-500/30 uppercase">
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {c.name} • {formatCrores(c.purse)}
                  </p>
                </div>
              </div>

              {isHost && !c.isHost && (
                <button
                  onClick={() => onRemoveContestant(c.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition"
                  title="Remove from room"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Host Controls & Actions */}
      {isHost ? (
        <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-4 space-y-3 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" /> Host Controls
          </h2>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className="bg-[#131F33] hover:bg-[#1E304F] text-white border border-[#2A3F64] font-semibold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Settings className="w-4 h-4 text-ipl-accent" />
              Configure Rules
            </button>

            <button
              onClick={() => {
                onPreparePool();
                setShowPoolPreview(true);
              }}
              className="bg-[#131F33] hover:bg-[#1E304F] text-white border border-[#2A3F64] font-semibold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Layers className="w-4 h-4 text-ipl-yellow" />
              Preview Pool
            </button>
          </div>

          <button
            onClick={onStartAuction}
            disabled={room.contestants.length < 2}
            className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-black font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2 transition active:scale-95 uppercase tracking-wider"
          >
            <Play className="w-4 h-4 fill-current" />
            START ALL-TIME AUCTION
          </button>

          {room.contestants.length < 2 && (
            <p className="text-[11px] text-amber-300 text-center">
              Add at least 1 more franchise (or AI bot) to start the auction.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-[#0A121E] border border-[#1E304F] rounded-2xl p-4 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-ipl-yellow flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-teko text-xl font-bold text-white">Waiting for Host to Start...</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            The host is configuring rules and finalizing contestants. The live auction will begin automatically.
          </p>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ipl-card border border-[#1E304F] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E304F] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-ipl-accent" />
                Auction Configuration
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Player Count in Auction Pool
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                  {[30, 45, 60, 80, 100, 120, 140, 160].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPlayerCount(count)}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-bold ${
                        playerCount === count
                          ? "bg-ipl-yellow text-black border-ipl-yellow"
                          : "bg-[#0A121E] text-slate-300 border-[#1E304F]"
                      }`}
                    >
                      {count} Players
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-amber-300 mt-1">
                  💡 Auto-scaled for {room.contestants.length} teams (Minimum recommended: {Math.max(30, room.contestants.length * minSquad + 6)} players)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Min Squad Size</label>
                  <input
                    type="number"
                    min="11"
                    max="16"
                    value={minSquad}
                    onChange={(e) => setMinSquad(Number(e.target.value))}
                    className="w-full bg-[#0A121E] border border-[#1E304F] rounded-lg p-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Squad Size</label>
                  <input
                    type="number"
                    min="15"
                    max="22"
                    value={maxSquad}
                    onChange={(e) => setMaxSquad(Number(e.target.value))}
                    className="w-full bg-[#0A121E] border border-[#1E304F] rounded-lg p-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Max Overseas Players</label>
                <input
                  type="number"
                  min="4"
                  max="8"
                  value={maxOverseas}
                  onChange={(e) => setMaxOverseas(Number(e.target.value))}
                  className="w-full bg-[#0A121E] border border-[#1E304F] rounded-lg p-2 text-sm text-white"
                />
              </div>

              <div className="bg-[#0A121E] p-3 rounded-xl border border-[#1E304F] text-[11px] text-slate-400 space-y-1">
                <p>• Starting Purse: <span className="text-ipl-yellow font-bold">₹120 Cr</span> (Fixed MVP)</p>
                <p>• Countdown Timer: <span className="text-ipl-yellow font-bold">7 Seconds</span> (Resets on bid)</p>
                <p>• Marquee Opening sequence enabled automatically</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-3 py-2 bg-[#131F33] hover:bg-[#1E304F] rounded-xl text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-ipl-yellow hover:bg-amber-400 text-black font-bold rounded-xl text-xs shadow-md"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pool Preview Modal */}
      {showPoolPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ipl-card border border-[#1E304F] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E304F] pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-ipl-yellow" />
                  Player Pool Preview ({room.pool.length} Players)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Marquee opening pattern followed by role rotation
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onPreparePool}
                  className="bg-[#131F33] hover:bg-[#1E304F] text-xs font-semibold text-ipl-accent px-2.5 py-1.5 rounded-lg border border-[#1E304F] flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                </button>
                <button
                  onClick={() => setShowPoolPreview(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto py-3 space-y-2 flex-1 pr-1">
              {room.pool.map((p, idx) => (
                <div
                  key={p.id}
                  className="bg-[#0A121E] border border-[#1E304F] rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-teko text-base font-bold text-slate-400 w-6 text-center">
                      #{idx + 1}
                    </span>
                    <img src={p.photo} alt={p.displayName} className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white truncate">{p.displayName}</span>
                        {p.isMarquee && (
                          <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1 rounded">
                            MARQUEE
                          </span>
                        )}
                        {p.isOverseas && (
                          <span className="bg-sky-500/20 text-sky-300 text-[9px] font-bold px-1 rounded">
                            ✈️ OS
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {p.primaryRole} • {p.secondaryRole}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-teko text-base font-bold text-ipl-yellow block leading-none">
                      {p.basePriceDisplay}
                    </span>
                    <span className="text-[10px] text-slate-400">Rating: {p.ratings.overall}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#1E304F] pt-3 flex justify-end">
              <button
                onClick={() => setShowPoolPreview(false)}
                className="px-4 py-2 bg-ipl-yellow hover:bg-amber-400 text-black font-bold rounded-xl text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};