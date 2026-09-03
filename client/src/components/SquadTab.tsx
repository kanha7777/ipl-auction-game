import React from "react";
import { Contestant, Role } from "../../../shared/src/types";
import { formatCrores } from "../../../shared/src/rules";
import { Shield, Sparkles, User, Award } from "lucide-react";

interface SquadTabProps {
  contestant: Contestant;
}

export const SquadTab: React.FC<SquadTabProps> = ({ contestant }) => {
  const squad = contestant.squad;
  const roles: Role[] = ["Batter", "Wicketkeeper", "All-rounder", "Bowler"];

  const totalSpent = squad.reduce((acc, s) => acc + s.price, 0);

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-4 pb-24">
      {/* Squad Summary Card */}
      <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0A121E] border border-ipl-yellow/40 flex items-center justify-center text-3xl shadow-inner">
            {contestant.teamLogo}
          </div>
          <div>
            <h1 className="font-teko text-2xl font-bold text-white leading-none">
              {contestant.teamName} SQUAD
            </h1>
            <p className="text-xs text-slate-400">
              {squad.length} Players • Total Spent: <span className="text-ipl-yellow font-bold">{formatCrores(totalSpent)}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Remaining Purse</span>
          <span className="font-teko text-2xl font-bold text-emerald-400 leading-none">
            {formatCrores(contestant.purse)}
          </span>
        </div>
      </div>

      {squad.length === 0 ? (
        <div className="bg-[#0A121E] border border-[#1E304F] rounded-2xl p-8 text-center space-y-2">
          <p className="text-3xl">??</p>
          <h3 className="font-teko text-2xl font-bold text-slate-200">No Players Bought Yet</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Head over to the Live Auction tab and place single-tap bids to build your dream squad!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map((role) => {
            const rolePlayers = squad.filter((s) => s.player.primaryRole === role);
            if (rolePlayers.length === 0) return null;

            return (
              <div key={role} className="bg-ipl-card border border-[#1E304F] rounded-2xl p-3.5 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-[#1E304F] pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-ipl-accent" />
                    {role}s ({rolePlayers.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rolePlayers.map((item) => {
                    const p = item.player;
                    return (
                      <div
                        key={p.id}
                        className="bg-[#0A121E] border border-[#1E304F] rounded-xl p-2.5 flex items-center justify-between gap-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={p.photo}
                            alt={p.displayName}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-xs font-bold text-white truncate">{p.displayName}</p>
                              {p.isOverseas && (
                                <span className="text-[10px]">??</span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">
                              {p.ratings.overall} OVR • {p.secondaryRole}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-teko text-lg font-bold text-ipl-yellow block leading-none">
                            {formatCrores(item.price)}
                          </span>
                          <span className="text-[9px] text-slate-400">Bought for</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
