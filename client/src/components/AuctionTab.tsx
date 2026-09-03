import React, { useEffect } from "react";
import { Contestant, CurrentAuctionItem, RoomData } from "../../../shared/src/types";
import { formatCrores, validateBid } from "../../../shared/src/rules";
import { sounds } from "../soundEffects";
import {
  Gavel,
  Shield,
  Pause,
  Play,
  FastForward,
  XCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Award,
  Globe,
  CheckCircle2,
} from "lucide-react";

interface AuctionTabProps {
  onEndAuction?: () => void;
  room: RoomData;
  contestant: Contestant;
  item: CurrentAuctionItem | null;
  onPlaceBid: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onMarkUnsold: () => void;
  onRestart: () => void;
}

export const AuctionTab: React.FC<AuctionTabProps> = ({
  room,
  contestant,
  item,
  onPlaceBid,
  onPause,
  onResume,
  onSkip,
  onMarkUnsold,
  onRestart,
  onEndAuction,
}) => {
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-ipl-card border border-[#1E304F] flex items-center justify-center text-3xl mb-3 animate-pulse">🏏</div>
        <h2 className="font-teko text-3xl font-bold text-slate-200">Preparing Next Player...</h2>
        <p className="text-xs text-slate-400 mt-1">
          {room.state === "UNSOLD_ROUND" ? "Unsold Round in progress" : "Auction engine is spinning up"}
        </p>
      </div>
    );
  }

  const player = item.player;
  const validation = validateBid(
    contestant,
    player,
    item.currentBid,
    item.leadingBidder?.id || null,
    room.config
  );

  const nextBidAmount = validation.nextBidAmount;
  const isLeading = item.leadingBidder?.id === contestant.id;

  // Sound cues on timer thresholds
  useEffect(() => {
    if (item.timerRunning && item.timer <= 2.5 && item.timer > 0) {
      sounds.playTimerWarning();
    }
  }, [item.timer, item.timerRunning]);

  // Timer Bar styling
  const timerRatio = Math.max(0, Math.min(1, item.timer / room.config.timerDuration));
  const isDanger = item.timer <= 2.0;
  const isWarning = item.timer <= 3.5 && !isDanger;

  return (
    <div className="max-w-xl mx-auto p-3 sm:p-4 space-y-3 pb-24">
      {/* Top Banner: Item Progress & Marquee Tag */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold bg-[#131F33] px-2.5 py-1 rounded-lg border border-[#1E304F]">
          Player {item.itemIndex} of {item.totalItems}
        </span>

        <div className="flex items-center gap-1.5">
          {item.isUnsoldRound && (
            <span className="bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-500/30 text-[10px]">
              UNSOLD ROUND
            </span>
          )}
          {player.isMarquee && (
            <span className="bg-amber-500/20 text-ipl-yellow font-bold px-2.5 py-0.5 rounded-lg border border-amber-500/40 text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" /> MARQUEE SET
            </span>
          )}
        </div>
      </div>

      {/* Main Player Profile Card */}
      <div className="bg-ipl-card border border-[#1E304F] rounded-2xl p-4 shadow-2xl relative overflow-hidden">
        {/* Role & Nationality header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="bg-ipl-blue/80 text-white font-bold text-xs px-2.5 py-1 rounded-md uppercase tracking-wider border border-ipl-blue">
              {player.primaryRole}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {player.secondaryRole}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-[#0A121E] px-2.5 py-1 rounded-md border border-[#1E304F]">
            <span>{player.isOverseas ? "✈️" : "🇮🇳"}</span>
            <span className="font-semibold">{player.country}</span>
          </div>
        </div>

        {/* Player Photo + Key Highlights */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative shrink-0">
            <img
              src={player.photo}
              alt={player.displayName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-gradient-to-tr from-[#080E18] to-[#1E304F] border-2 border-slate-700 shadow-xl"
            />
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-teko text-lg font-bold px-2 py-0.2 rounded-lg shadow-md border border-yellow-200">
              {player.ratings.overall} OVR
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-teko text-2xl sm:text-3xl font-bold text-white tracking-wide truncate leading-none mb-1">
              {player.displayName}
            </h1>
            <p className="text-xs text-slate-300 font-medium truncate mb-2">
              {player.fullName} � {player.seasons} IPL Seasons
            </p>

            {/* Base Price Pill */}
            <div className="inline-flex items-center gap-2 bg-[#0A121E] border border-[#1E304F] px-3 py-1 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Base Price:</span>
              <span className="font-teko text-lg font-bold text-ipl-yellow leading-none">
                {player.basePriceDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* Career Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 bg-[#0A121E] p-2.5 rounded-xl border border-[#1E304F] mb-3 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Matches</span>
            <span className="font-teko text-base sm:text-lg font-bold text-white leading-none">
              {player.stats.matches}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Runs</span>
            <span className="font-teko text-base sm:text-lg font-bold text-white leading-none">
              {player.stats.runs}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Strike Rate</span>
            <span className="font-teko text-base sm:text-lg font-bold text-amber-400 leading-none">
              {player.stats.strikeRate}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Wickets</span>
            <span className="font-teko text-base sm:text-lg font-bold text-sky-400 leading-none">
              {player.stats.wickets}
            </span>
          </div>
        </div>

        {/* Component Ratings Bars */}
        <div className="grid grid-cols-3 gap-2 text-[11px] bg-[#0A121E]/60 p-2.5 rounded-xl border border-[#1E304F]/60">
          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>Batting</span>
              <span className="font-bold text-slate-200">{player.ratings.batting}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-ipl-yellow rounded-full" style={{ width: `${player.ratings.batting}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>Bowling</span>
              <span className="font-bold text-slate-200">{player.ratings.bowling}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-sky-400 rounded-full" style={{ width: `${player.ratings.bowling}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-0.5">
              <span>T20 Impact</span>
              <span className="font-bold text-slate-200">{player.ratings.t20Impact}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${player.ratings.t20Impact}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Live Current Bid & Leading Bidder Card */}
      <div className={`border rounded-2xl p-4 transition-all shadow-xl ${
        isLeading
          ? "bg-emerald-950/40 border-emerald-500/60 glow-gold"
          : item.currentBid > 0
          ? "bg-[#13223A] border-ipl-blue glow-blue"
          : "bg-ipl-card border-[#1E304F]"
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
              {item.currentBid > 0 ? "Current Highest Bid" : "Starting Bid"}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-teko text-4xl sm:text-5xl font-extrabold text-ipl-yellow leading-none tracking-wide">
                {item.currentBid > 0 ? formatCrores(item.currentBid) : formatCrores(player.basePrice)}
              </span>
              {item.currentBid === 0 && (
                <span className="text-xs text-slate-400 font-semibold">(Base Price)</span>
              )}
            </div>
          </div>

          {/* Leading Bidder Indicator */}
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Leading Franchise
            </span>
            {item.leadingBidder ? (
              <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                <span className="text-lg">{item.leadingBidder.teamLogo}</span>
                <span className={`text-xs font-bold truncate max-w-[130px] ${
                  isLeading ? "text-emerald-400" : "text-white"
                }`}>
                  {item.leadingBidder.teamName}
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-400 italic">No Bids Yet</span>
            )}
          </div>
        </div>

        {/* 7-Second Animated Countdown Progress Bar */}
        <div className="mt-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              ⏱️ Timer:
            </span>
            <span className={`font-teko text-xl font-bold leading-none ${
              isDanger ? "text-rose-400 animate-pulse-fast" : isWarning ? "text-amber-400" : "text-emerald-400"
            }`}>
              {Math.max(0, item.timer).toFixed(1)}s
            </span>
          </div>

          <div className="w-full h-3 bg-[#080E18] rounded-full overflow-hidden p-0.5 border border-[#1E304F]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isDanger
                  ? "bg-rose-500 animate-pulse-fast shadow-lg shadow-rose-500/50"
                  : isWarning
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`}
              style={{ width: `${timerRatio * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Large Thumb-Friendly Bid Button (Single Tap) */}
      <div className="pt-1">
        <button
          onClick={onPlaceBid}
          disabled={!validation.valid || !item.timerRunning}
          className={`w-full py-4 px-6 rounded-2xl flex flex-col items-center justify-center transition-all shadow-2xl active:scale-[0.98] ${
            isLeading
              ? "bg-emerald-600/60 border-2 border-emerald-400 text-white cursor-default"
              : validation.valid && item.timerRunning
              ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold shadow-yellow-500/20 glow-gold cursor-pointer"
              : "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-60"
          }`}
        >
          <div className="flex items-center gap-2">
            <Gavel className={`w-6 h-6 ${validation.valid && !isLeading ? "animate-gavel" : ""}`} />
            <span className="font-teko text-3xl font-extrabold tracking-wider leading-none pt-1">
              {isLeading
                ? "YOU ARE LEADING"
                : `BID ${formatCrores(nextBidAmount)}`}
            </span>
          </div>

          {!validation.valid && (
            <span className="text-[11px] font-semibold text-rose-300 mt-0.5">
              {validation.reason}
            </span>
          )}
          {validation.valid && !isLeading && (
            <span className="text-[11px] text-black/80 font-bold mt-0.5">
              Single Tap � Next increment auto-calculated
            </span>
          )}
        </button>
      </div>

      {/* Host Controls Panel (If Host) */}
      {contestant.isHost && (
        <div className="bg-[#0A121E] border border-[#1E304F] rounded-2xl p-3 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <Shield className="w-3.5 h-3.5 text-amber-400" /> Host Controls
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {room.state === "AUCTION_RUNNING" ? (
              <button
                onClick={onPause}
                className="bg-[#131F33] hover:bg-[#1E304F] text-amber-300 p-2 rounded-xl flex flex-col items-center gap-1 border border-[#1E304F]"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={onResume}
                className="bg-emerald-600/40 hover:bg-emerald-600/60 text-emerald-300 p-2 rounded-xl flex flex-col items-center gap-1 border border-emerald-500/40"
              >
                <Play className="w-4 h-4" />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={onSkip}
              className="bg-[#131F33] hover:bg-[#1E304F] text-slate-200 p-2 rounded-xl flex flex-col items-center gap-1 border border-[#1E304F]"
              title="Skip uncontested player to Unsold Pool"
            >
              <FastForward className="w-4 h-4 text-sky-400" />
              <span>Skip</span>
            </button>

            <button
              onClick={onMarkUnsold}
              className="bg-[#131F33] hover:bg-[#1E304F] text-slate-200 p-2 rounded-xl flex flex-col items-center gap-1 border border-[#1E304F]"
              title="Instantly mark player Unsold"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Unsold</span>
            </button>

            <button
              onClick={onRestart}
              className="bg-[#131F33] hover:bg-[#1E304F] text-slate-200 p-2 rounded-xl flex flex-col items-center gap-1 border border-[#1E304F]"
              title="Reset bids & timer for current player"
            >
              <RotateCcw className="w-4 h-4 text-purple-400" />
              <span>Restart</span>
            </button>
          </div>

          {onEndAuction && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to end the auction and declare the winner now?")) {
                  onEndAuction();
                }
              }}
              className="w-full mt-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition active:scale-98"
            >
              <Award className="w-3.5 h-3.5 text-rose-400" />
              <span>End Auction & Declare Champion Now</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

