import React, { useState } from "react";
import { RoomData, Contestant, Player } from "../../../shared/src/types";
import { PlayerAvatar } from "./PlayerAvatar";
import {
  Users,
  Copy,
  Check,
  Play,
  UserPlus,
  Settings,
  Layers,
  Crown,
  Trash2,
  Share2,
  RefreshCw,
  Sparkles,
  X,
  Clock,
} from "lucide-react";

interface LobbyViewProps {
  room: RoomData;
  contestant: Contestant;
  onStartAuction: () => void;
  onAddBot: () => void;
  onRemoveContestant: (id: string) => void;
  onUpdateConfig: (config: any) => void;
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
  const isHost = contestant.isHost;
  const [copied, setCopied] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPoolPreview, setShowPoolPreview] = useState(false);

  // Editable config state
  const [playerCount, setPlayerCount] = useState(room.config.playerCount);
  const [minSquad, setMinSquad] = useState(room.config.minSquadSize);
  const [maxSquad, setMaxSquad] = useState(room.config.maxSquadSize);
  const [maxOverseas, setMaxOverseas] = useState(room.config.maxOverseas);
  const [timerDuration, setTimerDuration] = useState(room.config.timerDuration || 7);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join IPL All-Time Auction Room",
        text: `Join my IPL Auction room! Code: ${room.id}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyCode();
    }
  };

  const handleSaveConfig = () => {
    onUpdateConfig({
      playerCount,
      minSquadSize: minSquad,
      maxSquadSize: maxSquad,
      maxOverseas,
      timerDuration,
    });
    setShowConfigModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-20 animate-in fade-in duration-300">
      {/* Room Code Banner & Share */}
      <div className="bg-gradient-to-r from-ipl-card via-[#13223A] to-ipl-card border border-[#1E304F] rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <span className="text-[10px] uppercase tracking-widest text-amber-400 font-extrabold block">
            ROOM CODE • SHARE WITH FRIENDS
          </span>
          <div className="flex items-center gap-2 justify-center sm:justify-start mt-0.5">
            <span className="font-teko text-4xl font-bold tracking-widest text-white">{room.id}</span>
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-[#0A121E] hover:bg-[#1E304F] border border-[#243B60] text-slate-300 hover:text-white transition"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-[#0A121E] hover:bg-[#1E304F] border border-[#243B60] text-slate-300 hover:text-white transition sm:hidden"
              title="Share Link"
            >
              <Share2 className="w-4 h-4 text-ipl-accent" />
            </button>
          </div>
        </div>

        {/* Quick Rules Summary Pill */}
        <div className="flex items-center gap-2 flex-wrap justify-center text-xs text-slate-300 bg-[#0A121E]/80 border border-[#1E304F] px-3 py-2 rounded-xl">
          <span>💰 Purse: <strong className="text-ipl-yellow">₹120 Cr</strong></span>
          <span>•</span>
          <span>🏏 Pool: <strong className="text-white">{room.pool.length || room.config.playerCount}</strong> Players</span>
          <span>•</span>
          <span>⏱️ Timer: <strong className="text-white">{room.config.timerDuration || 7}s</strong></span>
        </div>
      </div>

      {/* Contestants Grid */}
      <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-ipl-accent" /> Contestants ({room.contestants.length}/20)
          </h2>
          {isHost && (
            <button
              onClick={onAddBot}
              className="bg-[#131F33] hover:bg-[#1E304F] text-ipl-accent border border-[#243B60] hover:border-ipl-accent text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add AI Team
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {room.contestants.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition ${
                c.id === contestant.id
                  ? "bg-gradient-to-r from-[#13223A] to-[#1E355A] border-ipl-yellow/50 shadow-md"
                  : "bg-[#0A121E] border-[#1E304F]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl filter drop-shadow">{c.teamLogo}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs font-bold text-white truncate">{c.teamName}</h3>
                    {c.isHost && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {c.name} {c.isBot ? "• AI Franchise" : ""} {c.id === contestant.id ? "• (You)" : ""}
                  </p>
                </div>
              </div>

              {isHost && c.id !== contestant.id && (
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
              Configure Rules & Timer
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
            The host is configuring rules, timer, and finalizing contestants. The live auction will begin automatically.
          </p>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ipl-card border border-[#1E304F] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1E304F] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-ipl-accent" />
                Auction Configuration & Timer
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Bidding Timer Duration Config */}
              <div className="bg-[#0A121E] p-3 rounded-xl border border-[#1E304F]">
                <label className="block font-semibold text-slate-200 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Clock className="w-3.5 h-3.5" /> Bidding Timer Countdown
                  </span>
                  <span className="text-ipl-yellow font-bold text-xs">{timerDuration} Seconds</span>
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(Math.max(3, Math.min(60, Number(e.target.value))))}
                    className="w-full bg-[#131F33] border border-[#243B60] focus:border-ipl-yellow rounded-xl px-3 py-2 text-sm font-bold text-ipl-yellow outline-none"
                    placeholder="Enter seconds (3 - 60)"
                  />
                  <span className="text-xs text-slate-400 shrink-0 font-medium">Sec / Bid</span>
                </div>
                {/* Timer Quick Pills */}
                <div className="grid grid-cols-6 gap-1">
                  {[5, 7, 10, 15, 20, 30].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTimerDuration(t)}
                      className={`py-1 rounded-lg border text-xs font-bold transition ${
                        timerDuration === t
                          ? "bg-ipl-yellow text-black border-ipl-yellow"
                          : "bg-[#131F33] text-slate-300 border-[#243B60]"
                      }`}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Count in Pool */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Player Count in Auction Pool</span>
                  <span className="text-ipl-yellow font-bold text-xs">{playerCount} Players</span>
                </label>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    min="15"
                    max="1000"
                    step="5"
                    value={playerCount}
                    onChange={(e) => setPlayerCount(Math.max(15, Number(e.target.value)))}
                    className="w-full bg-[#0A121E] border border-[#1E304F] focus:border-ipl-yellow rounded-xl px-3 py-2 text-sm font-bold text-ipl-yellow outline-none"
                    placeholder="Enter any pool size (e.g. 300, 400)"
                  />
                  <span className="text-xs text-slate-400 shrink-0 font-medium">Custom Pool</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                  {[40, 80, 150, 200, 300, 400, 500, 600].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPlayerCount(count)}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition ${
                        playerCount === count
                          ? "bg-ipl-yellow text-black border-ipl-yellow shadow-md"
                          : "bg-[#0A121E] text-slate-300 border-[#1E304F] hover:bg-[#131F33]"
                      }`}
                    >
                      {count} Players
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-amber-300 mt-1 flex items-center gap-1">
                  <span>💡 Dynamic Pool:</span> Enter any size (300+, 400+, 500+). Auto-scales for {room.contestants.length} teams.
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
                <p>• Starting Purse: <span className="text-ipl-yellow font-bold">₹120 Cr</span></p>
                <p>• Countdown Timer: <span className="text-ipl-yellow font-bold">{timerDuration} Seconds</span> (Resets on each bid)</p>
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
                    <PlayerAvatar player={p} size="sm" />
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