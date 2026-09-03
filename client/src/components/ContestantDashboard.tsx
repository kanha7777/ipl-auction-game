import React from "react";
import { Contestant, AuctionConfig } from "../../../shared/src/types";
import { formatCrores, calculateSquadNeeds, calculateMaxLegalBid } from "../../../shared/src/rules";
import { Wallet, Users, Globe, Sparkles, ShieldCheck } from "lucide-react";

interface ContestantDashboardProps {
  contestant: Contestant;
  config: AuctionConfig;
}

export const ContestantDashboard: React.FC<ContestantDashboardProps> = ({ contestant, config }) => {
  const needs = calculateSquadNeeds(contestant, config);
  const maxLegalBid = calculateMaxLegalBid(contestant, config);

  return (
    <div className="bg-[#0E1A2B] border-b border-[#1E304F] px-3 py-2 text-white shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col gap-2">
        {/* Top row: Team identity + Key metrics */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Team Name & Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl filter drop-shadow">{contestant.teamLogo}</span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate leading-tight text-slate-100">
                {contestant.teamName}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {contestant.name} {contestant.isHost ? "• Host" : ""}
              </p>
            </div>
          </div>

          {/* Key Quick Counters */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Purse Badge */}
            <div className="bg-[#131F33] border border-[#1E304F] rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-inner">
              <Wallet className="w-3.5 h-3.5 text-ipl-yellow shrink-0" />
              <div>
                <span className="text-[9px] text-slate-400 block -mb-1 font-semibold uppercase">Purse</span>
                <span className="font-teko text-base sm:text-lg font-bold text-ipl-yellow leading-none tracking-wide">
                  {formatCrores(contestant.purse)}
                </span>
              </div>
            </div>

            {/* Squad Count Badge */}
            <div className="bg-[#131F33] border border-[#1E304F] rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-inner">
              <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div>
                <span className="text-[9px] text-slate-400 block -mb-1 font-semibold uppercase">Squad</span>
                <span className="font-teko text-base sm:text-lg font-bold text-white leading-none tracking-wide">
                  {contestant.squad.length}<span className="text-[10px] text-slate-400">/{config.maxSquadSize}</span>
                </span>
              </div>
            </div>

            {/* Overseas Badge */}
            <div className="bg-[#131F33] border border-[#1E304F] rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-inner">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[9px] text-slate-400 block -mb-1 font-semibold uppercase">Overseas</span>
                <span className="font-teko text-base sm:text-lg font-bold text-emerald-300 leading-none tracking-wide">
                  {needs.overseasCount}<span className="text-[10px] text-slate-400">/{config.maxOverseas}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: Dynamic Squad Needs in non-overlapping dedicated scroll container */}
        <div className="flex items-center justify-between gap-2 border-t border-[#16233B] pt-1.5 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-ipl-accent shrink-0" /> Needs:
            </span>
            {needs.summary.map((need, idx) => (
              <span
                key={idx}
                className="shrink-0 bg-[#131F33] text-slate-200 border border-[#243B60] px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap shadow-sm"
              >
                {need}
              </span>
            ))}
          </div>

          <div className="shrink-0 flex items-center gap-1 text-[10px] text-slate-400 font-medium pl-1 bg-[#0E1A2B]">
            <ShieldCheck className="w-3 h-3 text-ipl-accent" />
            <span className="hidden sm:inline">Max Bid:</span>
            <span className="text-ipl-accent font-bold">{formatCrores(maxLegalBid)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};