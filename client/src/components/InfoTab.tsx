import React from "react";
import { RoomData } from "../../../shared/src/types";
import { HelpCircle, Layers, TrendingUp, Award, ShieldAlert } from "lucide-react";

interface InfoTabProps {
  room: RoomData;
}

export const InfoTab: React.FC<InfoTabProps> = ({ room }) => {
  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-4 pb-24 text-slate-200">
      {/* 100-Point Squad Evaluation Breakdown */}
      <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-[#1E304F] pb-2">
          <Award className="w-4 h-4 text-ipl-yellow" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            100-Point Squad Evaluation Model (PRD Section 5)
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          The winner is decided by comprehensive squad balance and quality across 9 weighted categories � not just star power or max spending.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-[#0A121E] p-2.5 rounded-xl border border-[#1E304F]">
            <div className="flex justify-between font-bold">
              <span>?? Batting Firepower</span>
              <span className="text-ipl-yellow font-teko text-base">20 Pts</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Top 6 batters ratings, strike rates, averages, and milestones.</p>
          </div>

          <div className="bg-[#0A121E] p-2.5 rounded-xl border border-[#1E304F]">
            <div className="flex justify-between font-bold">
              <span>?? Bowling Arsenal</span>
              <span className="text-ipl-yellow font-teko text-base">20 Pts</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Frontline 5 bowlers, pace-spin balance, death bowling economy.</p>
          </div>

          <div className="bg-[#0A121E] p-2.5 rounded-xl border border-[#1E304F]">
            <div className="flex justify-between font-bold">
              <span>? All-Rounders</span>
              <span className="text-ipl-yellow font-teko text-base">15 Pts</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Genuine 3D players providing lower-order hitting & 4 overs.</p>
          </div>

          <div className="bg-[#0A121E] p-2.5 rounded-xl border border-[#1E304F]">
            <div className="flex justify-between font-bold">
              <span>?? Wicketkeeping</span>
              <span className="text-ipl-yellow font-teko text-base">10 Pts</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Primary keeper quality and backup wicketkeeping option.</p>
          </div>

          <div className="bg-[#0A121E] p-2.5 rounded-xl border border-[#1E304F]">
            <div className="flex justify-between font-bold">
              <span>?? Squad Depth</span>
              <span className="text-ipl-yellow font-teko text-base">10 Pts</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Bench strength across positions to handle match rotations.</p>
          </div>

          <div className="bg-[#0A121E] p-2.5 rounded-xl border border-[#1E304F]">
            <div className="flex justify-between font-bold">
              <span>?? Role Coverage</span>
              <span className="text-ipl-yellow font-teko text-base">10 Pts</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Openers, Middle Order, Finishers, Pace, Spin, and Death Specialists.</p>
          </div>

          <div className="bg-[#0A121E] p-2.5 rounded-xl border border-[#1E304F]">
            <div className="flex justify-between font-bold">
              <span>???? Indian/Overseas Balance</span>
              <span className="text-ipl-yellow font-teko text-base">5 Pts</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Impactful overseas stars within 5 limit + strong domestic core.</p>
          </div>

          <div className="bg-[#0A121E] p-2.5 rounded-xl border border-[#1E304F]">
            <div className="flex justify-between font-bold">
              <span>?? Squad Flexibility</span>
              <span className="text-ipl-yellow font-teko text-base">5 Pts</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Left-Right hand batting combinations & varied bowling styles.</p>
          </div>

          <div className="bg-[#0A121E] p-2.5 rounded-xl border border-[#1E304F] sm:col-span-2">
            <div className="flex justify-between font-bold">
              <span>?? Value / Purse Management</span>
              <span className="text-ipl-yellow font-teko text-base">5 Pts</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">ROI per Crore spent, avoiding overpays while maintaining enough budget.</p>
          </div>
        </div>
      </div>

      {/* Dynamic Increments Guide */}
      <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-[#1E304F] pb-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Bidding Increments (PRD Section 4.12)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-[#0A121E] p-2 rounded-xl border border-[#1E304F]">
            <span className="text-[10px] text-slate-400 block">₹0.30 � ₹2.00 Cr</span>
            <span className="font-teko text-lg font-bold text-emerald-400">+₹0.10 Cr</span>
          </div>
          <div className="bg-[#0A121E] p-2 rounded-xl border border-[#1E304F]">
            <span className="text-[10px] text-slate-400 block">₹2.00 � ₹10.00 Cr</span>
            <span className="font-teko text-lg font-bold text-emerald-400">+₹0.50 Cr</span>
          </div>
          <div className="bg-[#0A121E] p-2 rounded-xl border border-[#1E304F]">
            <span className="text-[10px] text-slate-400 block">₹10.00 � ₹20.00 Cr</span>
            <span className="font-teko text-lg font-bold text-emerald-400">+₹1.00 Cr</span>
          </div>
          <div className="bg-[#0A121E] p-2 rounded-xl border border-[#1E304F]">
            <span className="text-[10px] text-slate-400 block">₹20.00 Cr+</span>
            <span className="font-teko text-lg font-bold text-emerald-400">+₹2.00 Cr</span>
          </div>
        </div>
      </div>

      {/* Smart Purse Protection Info */}
      <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-4 shadow-xl space-y-2">
        <div className="flex items-center gap-2 border-b border-[#1E304F] pb-2">
          <ShieldAlert className="w-4 h-4 text-ipl-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Smart Purse Protection (PRD Section 4.18)
          </h2>
        </div>
        <p className="text-xs text-slate-300">
          The auction engine automatically reserves ₹0.30 Cr minimum for every remaining slot required to fulfill your minimum squad quota ({room.config.minSquadSize} players). You will never get stuck with an illegal or incomplete squad!
        </p>
      </div>

      {/* Upcoming Player Queue Preview */}
      {room.pool.length > 0 && (
        <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-4 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#1E304F] pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              Upcoming in Queue ({room.pool.length} Players Left)
            </h3>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {room.pool.slice(0, 8).map((p, idx) => (
              <div
                key={p.id}
                className="bg-[#0A121E] p-2 rounded-xl border border-[#1E304F] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 w-4">#{idx + 1}</span>
                  <span className="font-bold text-white truncate">{p.displayName}</span>
                  <span className="text-[10px] text-slate-400">({p.primaryRole})</span>
                </div>
                <span className="font-teko text-base font-bold text-ipl-yellow">
                  {p.basePriceDisplay}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
