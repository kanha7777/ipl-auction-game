import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { RoomData, SquadScoreBreakdown } from "../../../shared/src/types";
import { formatCrores } from "../../../shared/src/rules";
import { sounds } from "../soundEffects";
import { Trophy, Medal, Sparkles, ChevronDown, ChevronUp, RotateCcw, Award, CheckCircle2, AlertTriangle } from "lucide-react";

interface ResultsViewProps {
  room: RoomData;
  results: SquadScoreBreakdown[];
  onPlayAgain: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ room, results, onPlayAgain }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(results[0]?.contestantId || null);

  useEffect(() => {
    // Trigger celebration fanfare and confetti explosion
    sounds.playSoldFanfare();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  const winner = results[0];
  const selectedBreakdown = results.find((r) => r.contestantId === selectedTeamId) || winner;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20 text-white">
      {/* Grand Championship Podium Banner */}
      <div className="bg-gradient-to-b from-amber-500/20 via-ipl-card to-[#0A121E] border-2 border-ipl-yellow/60 rounded-3xl p-6 text-center relative overflow-hidden shadow-2xl glow-gold">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-ipl-yellow/10 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-black shadow-xl mb-3">
          <Trophy className="w-10 h-10" />
        </div>

        <span className="bg-ipl-yellow/20 text-ipl-yellow font-extrabold text-xs px-3 py-1 rounded-full border border-ipl-yellow/40 uppercase tracking-widest inline-block mb-1">
          IPL AUCTION CHAMPION
        </span>

        <h1 className="font-teko text-5xl sm:text-6xl font-extrabold text-white tracking-wide uppercase leading-none mt-1">
          {winner?.teamName}
        </h1>

        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-3xl">{winner?.teamLogo}</span>
          <span className="text-sm font-semibold text-slate-300">{winner?.contestantName}</span>
          <span className="text-slate-500">•</span>
          <span className="font-teko text-2xl font-bold text-ipl-yellow">
            {winner?.totalScore} / 100 PTS
          </span>
        </div>

        {/* Winner Explanation Card (PRD 5) */}
        {winner?.winnerExplanation && (
          <div className="mt-4 p-4 bg-[#0A121E]/90 border border-ipl-yellow/30 rounded-2xl max-w-xl mx-auto shadow-inner">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-ipl-yellow mb-1 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Winning Formula
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {winner.winnerExplanation}
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#1E304F] pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Medal className="w-4 h-4 text-ipl-accent" /> Official Squad Rankings & Scores
          </h2>
        </div>

        <div className="space-y-2">
          {results.map((r, idx) => {
            const isSelected = selectedTeamId === r.contestantId;
            return (
              <div
                key={r.contestantId}
                onClick={() => setSelectedTeamId(r.contestantId)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  idx === 0
                    ? "bg-amber-500/10 border-ipl-yellow/50 hover:bg-amber-500/20"
                    : isSelected
                    ? "bg-[#1E304F] border-ipl-accent"
                    : "bg-[#0A121E] border-[#1E304F] hover:bg-[#131F33]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="font-teko text-2xl font-bold text-slate-400 w-6 text-center">
                    {idx === 0 ? "??" : idx === 1 ? "??" : idx === 2 ? "??" : `#${idx + 1}`}
                  </div>

                  <span className="text-2xl">{r.teamLogo}</span>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{r.teamName}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {r.contestantName} • {r.squadCount} Players • {formatCrores(r.totalSpent)} Spent
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-teko text-2xl sm:text-3xl font-extrabold text-ipl-yellow block leading-none">
                    {r.totalScore}
                  </span>
                  <span className="text-[10px] text-slate-400">Score / 100</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Team 9-Category Score Breakdown */}
      {selectedBreakdown && (
        <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E304F] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedBreakdown.teamLogo}</span>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {selectedBreakdown.teamName} Breakdown
                </h3>
                <p className="text-[11px] text-slate-400">
                  Rank #{selectedBreakdown.rank} • Total Score: {selectedBreakdown.totalScore}/100
                </p>
              </div>
            </div>
          </div>

          {/* 9 Categories Bar Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {Object.entries({
              "Batting (Max 20)": { val: selectedBreakdown.categoryScores.batting, max: 20 },
              "Bowling (Max 20)": { val: selectedBreakdown.categoryScores.bowling, max: 20 },
              "All-Rounders (Max 15)": { val: selectedBreakdown.categoryScores.allRound, max: 15 },
              "Wicketkeeping (Max 10)": { val: selectedBreakdown.categoryScores.wicketkeeping, max: 10 },
              "Squad Depth (Max 10)": { val: selectedBreakdown.categoryScores.squadDepth, max: 10 },
              "Role Coverage (Max 10)": { val: selectedBreakdown.categoryScores.roleCoverage, max: 10 },
              "Ind/OS Balance (Max 5)": { val: selectedBreakdown.categoryScores.balance, max: 5 },
              "Flexibility (Max 5)": { val: selectedBreakdown.categoryScores.flexibility, max: 5 },
              "Purse Value (Max 5)": { val: selectedBreakdown.categoryScores.purseManagement, max: 5 },
            }).map(([label, item]) => (
              <div key={label} className="bg-[#0A121E] p-2.5 rounded-xl border border-[#1E304F] space-y-1">
                <div className="flex justify-between font-semibold text-slate-300 text-[11px]">
                  <span>{label}</span>
                  <span className="font-bold text-ipl-yellow">{item.val}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ipl-yellow rounded-full transition-all duration-500"
                    style={{ width: `${(item.val / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-[#0A121E] p-3 rounded-xl border border-emerald-500/20 space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
              </h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {selectedBreakdown.strengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#0A121E] p-3 rounded-xl border border-amber-500/20 space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Observations
              </h4>
              <ul className="space-y-1 text-xs text-slate-300">
                {selectedBreakdown.weaknesses.length > 0 ? (
                  selectedBreakdown.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{w}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">No major vulnerabilities detected.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Play Again / Restart Auction */}
      <div className="text-center pt-2">
        <button
          onClick={onPlayAgain}
          className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold py-3.5 px-8 rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 mx-auto active:scale-95 transition"
        >
          <RotateCcw className="w-4 h-4" /> PLAY AGAIN / CREATE NEW AUCTION
        </button>
      </div>
    </div>
  );
};
