import { PlayerAvatar } from "./PlayerAvatar";
import React, { useState } from "react";
import { Contestant, RoomData } from "../../../shared/src/types";
import { formatCrores } from "../../../shared/src/rules";
import { Users2, Wallet, Globe, ChevronDown, ChevronUp } from "lucide-react";

interface TeamsTabProps {
  room: RoomData;
  currentUserId: string;
}

export const TeamsTab: React.FC<TeamsTabProps> = ({ room, currentUserId }) => {
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedTeamId(expandedTeamId === id ? null : id);
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-3 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Users2 className="w-4 h-4 text-ipl-accent" /> Competing Franchises ({room.contestants.length})
        </h2>
      </div>

      <div className="space-y-2.5">
        {room.contestants.map((c) => {
          const isUser = c.id === currentUserId;
          const isExpanded = expandedTeamId === c.id;
          const overseasCount = c.squad.filter((s) => s.player.isOverseas).length;

          return (
            <div
              key={c.id}
              className={`bg-ipl-card border rounded-2xl transition-all overflow-hidden ${
                isUser ? "border-ipl-yellow/50 shadow-md" : "border-[#1E304F]"
              }`}
            >
              {/* Franchise Card Header */}
              <button
                onClick={() => toggleExpand(c.id)}
                className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#131F33] transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl filter drop-shadow">{c.teamLogo}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white truncate">{c.teamName}</p>
                      {isUser && (
                        <span className="bg-ipl-yellow/20 text-ipl-yellow text-[9px] font-bold px-1.5 py-0.2 rounded border border-ipl-yellow/30">
                          YOU
                        </span>
                      )}
                      {c.isBot && (
                        <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-indigo-500/30">
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{c.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-teko text-lg font-bold text-ipl-yellow block leading-none">
                      {formatCrores(c.purse)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {c.squad.length} Players • {overseasCount}/5 OS
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Squad View */}
              {isExpanded && (
                <div className="border-t border-[#1E304F] bg-[#0A121E] p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                    <span>Bought Players ({c.squad.length})</span>
                    <span>Price</span>
                  </div>

                  {c.squad.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-2 text-center">
                      No players acquired yet
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {c.squad.map((item) => (
                        <div
                          key={item.player.id}
                          className="bg-[#131F33] border border-[#1E304F] rounded-lg p-2 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs">{item.player.isOverseas ? "✈️" : "🇮🇳"}</span>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-200 truncate leading-tight">
                                {item.player.displayName}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {item.player.primaryRole} • {item.player.ratings.overall} OVR
                              </p>
                            </div>
                          </div>
                          <span className="font-teko text-base font-bold text-ipl-yellow shrink-0">
                            {formatCrores(item.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};