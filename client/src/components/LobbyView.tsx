import React, { useState } from "react";
import { Contestant, RoomData, AuctionConfig, Player } from "../../../shared/src/types";
import { formatCrores } from "../../../shared/src/rules";
import { Users, Settings, Play, Bot, Trash2, Shield, Eye, RefreshCw, Layers, CheckCircle2 } from "lucide-react";

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
  const [playerCount, setPlayerCount] = useState(room.config.playerCount);
  const [minSquad, setMinSquad] = useState(room.config.minSquadSize);
  const [maxSquad, setMaxSquad] = useState(room.config.maxSquadSize);
  const [maxOverseas, setMaxOverseas] = useState(room.config.maxOverseas);

  const minRequiredPool = room.contestants.length * room.config.minSquadSize;
  const isPoolValid = room.config.playerCount >= minRequiredPool;

  const handleSaveConfig = () => {
    onUpdateConfig({
      playerCount: Number(playerCount),
      minSquadSize: Number(minSquad),
      maxSquadSize: Number(maxSquad),
      maxOverseas: Number(maxOverseas),
    });
    setShowConfigModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-ipl-blue via-[#13223A] to-[#0E1A2B] border border-[#1E304F] rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-ipl-card border border-ipl-yellow/40 flex items-center justify-center text-2xl shadow-inner">
            {contestant.teamLogo}
          </div>
          <div>
            <h1 className="font-teko text-3xl font-bold text-white tracking-wide leading-none">
              AUCTION LOBBY
            </h1>
            <p className="text-xs text-slate-300">
              Host: <span className="font-bold text-ipl-yellow">{room.contestants.find((c) => c.isHost)?.name}</span> � Purse: <span className="font-bold text-emerald-400">?{room.config.startingPurse} Cr</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {contestant.isHost && (
            <>
              <button
                onClick={() => setShowConfigModal(true)}
                className="flex-1 sm:flex-initial bg-[#131F33] hover:bg-[#1E304F] text-slate-200 border border-[#1E304F] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Settings className="w-4 h-4 text-ipl-accent" />
                Configure
              </button>
              <button
                onClick={() => {
                  onPreparePool();
                  setShowPoolPreview(true);
                }}
                className="flex-1 sm:flex-initial bg-[#131F33] hover:bg-[#1E304F] text-slate-200 border border-[#1E304F] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Eye className="w-4 h-4 text-ipl-yellow" />
                Preview Pool
              </button>
            </>
          )}
        </div>
      </div>

      {/* Contestant Grid */}
      <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-ipl-accent" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Contestants ({room.contestants.length}/20)
            </h2>
          </div>

          {contestant.isHost && room.contestants.length < 20 && (
            <button
              onClick={onAddBot}
              className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              <Bot className="w-3.5 h-3.5" />
              Add AI Bot Franchise
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {room.contestants.map((c) => (
            <div
              key={c.id}
              className="bg-[#0A121E] border border-[#1E304F] rounded-xl p-3.5 flex items-center justify-between gap-2 shadow-sm transition hover:border-slate-600"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl filter drop-shadow">{c.teamLogo}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-100 truncate">{c.teamName}</p>
                    {c.isHost && (
                      <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                        HOST
                      </span>
                    )}
                    {c.isBot && (
                      <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-indigo-500/30">
                        AI BOT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{c.name} � {formatCrores(c.purse)}</p>
                </div>
              </div>

              {contestant.isHost && !c.isHost && (
                <button
                  onClick={() => onRemoveContestant(c.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition"
                  title="Remove contestant"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Validation Notice */}
        {!isPoolValid && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <span>??</span>
            <span>
              Configured pool size ({room.config.playerCount}) is lower than minimum needed for {room.contestants.length} teams ({minRequiredPool} players). Please increase player count in configuration.
            </span>
          </div>
        )}

        {/* Start Auction button */}
        {contestant.isHost ? (
          <div className="pt-3">
            <button
              onClick={onStartAuction}
              disabled={room.contestants.length < 1}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-base shadow-lg shadow-emerald-500/20 transition active:scale-[0.99]"
            >
              <Play className="w-5 h-5 fill-black" />
              START LIVE IPL AUCTION NOW
            </button>
            <p className="text-center text-[11px] text-slate-400 mt-1.5">
              Room will lock immediately upon auction start. 7-second timer per player.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-[#0A121E] border border-[#1E304F] rounded-xl text-center">
            <p className="text-sm font-semibold text-slate-300">
              Waiting for the host (<span className="text-ipl-yellow">{room.contestants.find((c) => c.isHost)?.name}</span>) to start the auction...
            </p>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ipl-card border border-[#1E304F] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E304F] pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-ipl-accent" />
                Auction Configuration
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ?
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Player Count in Auction Pool
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                  {[20, 30, 40, 50, 60, 75, 100].map((count) => (
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
                <p>� Starting Purse: <span className="text-ipl-yellow font-bold">₹120 Cr</span> (Fixed MVP)</p>
                <p>� Countdown Timer: <span className="text-ipl-yellow font-bold">7 Seconds</span> (Resets on bid)</p>
                <p>� Marquee Opening sequence enabled automatically</p>
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
                  className="text-slate-400 hover:text-white text-sm font-bold ml-2"
                >
                  ?
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
                            ?? OS
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {p.primaryRole} � {p.secondaryRole}
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
