import { PlayerAvatar } from "./PlayerAvatar";
import React, { useState } from "react";
import { Contestant, Player, RoomData } from "../../../shared/src/types";
import { RotateCcw, Trophy, CheckSquare, Square, Play, ShieldAlert } from "lucide-react";

interface UnsoldRoundViewProps {
  room: RoomData;
  contestant: Contestant;
  onStartUnsoldRound: (selectedPlayerIds?: string[]) => void;
  onEndAuction: () => void;
}

export const UnsoldRoundView: React.FC<UnsoldRoundViewProps> = ({
  room,
  contestant,
  onStartUnsoldRound,
  onEndAuction,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    room.unsoldPool.map((p) => p.id)
  );

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(room.unsoldPool.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4 pb-24 text-white">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900/60 via-ipl-card to-[#0A121E] border border-purple-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-2">
        <span className="bg-purple-500/20 text-purple-300 font-extrabold text-xs px-3 py-1 rounded-full border border-purple-500/40 uppercase tracking-widest inline-block">
          PRD SECTION 4.14 � ACCELERATED ROUND
        </span>
        <h1 className="font-teko text-4xl sm:text-5xl font-extrabold text-white tracking-wide uppercase leading-none">
          UNSOLD PLAYER ROUND
        </h1>
        <p className="text-xs text-slate-300 max-w-lg mx-auto">
          The main player pool has concluded! {room.unsoldPool.length} players went unsold or were skipped. Franchises can now bid on recalled unsold stars or finalize squads for 100-point evaluation.
        </p>
      </div>

      {/* Unsold Players Selector */}
      <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#1E304F] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Available Unsold Players ({room.unsoldPool.length})
            </h2>
          </div>

          {contestant.isHost && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={selectAll}
                className="text-purple-300 hover:text-white font-semibold underline"
              >
                Select All
              </button>
              <span className="text-slate-600">�</span>
              <button
                onClick={deselectAll}
                className="text-slate-400 hover:text-white font-semibold underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
          {room.unsoldPool.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => contestant.isHost && togglePlayer(p.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition ${
                  contestant.isHost ? "cursor-pointer" : ""
                } ${
                  isSelected
                    ? "bg-[#1E304F] border-purple-400/60 shadow-md"
                    : "bg-[#0A121E] border-[#1E304F] opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {contestant.isHost && (
                    <div className="shrink-0 text-purple-400">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  )}
                  <img
                    src={p.photo}
                    alt={p.displayName}
                    className="w-9 h-9 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {p.primaryRole} � {p.ratings.overall} OVR
                    </p>
                  </div>
                </div>

                <span className="font-teko text-lg font-bold text-ipl-yellow shrink-0">
                  {p.basePriceDisplay}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons for Host */}
        {contestant.isHost ? (
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onStartUnsoldRound(selectedIds)}
              disabled={selectedIds.length === 0}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              START RE-AUCTION ({selectedIds.length} PLAYERS)
            </button>

            <button
              onClick={onEndAuction}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-lg transition active:scale-95"
            >
              <Trophy className="w-4 h-4" />
              FINALIZE SQUADS & EVALUATE SCORES
            </button>
          </div>
        ) : (
          <div className="p-3.5 bg-[#0A121E] border border-[#1E304F] rounded-xl text-center text-xs text-slate-300">
            Waiting for the host to start the unsold player re-auction or conclude to results...
          </div>
        )}
      </div>
    </div>
  );
};
