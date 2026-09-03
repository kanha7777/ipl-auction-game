import React, { useState } from "react";
import { Contestant, RoomData } from "../../../shared/src/types";
import { sounds } from "../soundEffects";
import { Volume2, VolumeX, Copy, Check, Share2, Bot, Shield, Circle } from "lucide-react";

interface TopBarProps {
  room: RoomData;
  contestant: Contestant;
  onAddBot?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ room, contestant, onAddBot }) => {
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(!sounds.enabled);

  const handleCopy = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my IPL Auction Room!",
          text: `Join my private IPL All-Time Auction room: ${room.id}`,
          url: window.location.href,
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const toggleAudio = () => {
    sounds.enabled = !sounds.enabled;
    setMuted(!sounds.enabled);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0E1A2B]/95 backdrop-blur-md border-b border-[#1E304F] px-3 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Room Badge & Team */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#131F33] border border-[#1E304F] rounded-lg px-2.5 py-1">
            <span className="text-xs text-slate-400 font-semibold tracking-wider">ROOM:</span>
            <span className="font-teko text-lg text-ipl-yellow tracking-widest leading-none pt-0.5 font-bold">
              {room.id}
            </span>
            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-white transition p-0.5 ml-1"
              title="Copy Room ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleShare}
              className="text-slate-400 hover:text-white transition p-0.5"
              title="Share Room"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {contestant.isHost && (
            <span className="hidden sm:inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              <Shield className="w-3 h-3" /> Host
            </span>
          )}
        </div>

        {/* Center: Live Status */}
        <div className="flex items-center gap-1.5">
          <Circle className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            {room.contestants.length} {room.contestants.length === 1 ? "Contestant" : "Contestants"}
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {contestant.isHost && room.state === "LOBBY" && onAddBot && (
            <button
              onClick={onAddBot}
              className="flex items-center gap-1 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-400/40 transition active:scale-95"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">+ AI Bot</span>
            </button>
          )}

          <button
            onClick={toggleAudio}
            className="bg-[#131F33] hover:bg-[#1E304F] text-slate-300 hover:text-white p-1.5 rounded-lg border border-[#1E304F] transition active:scale-95"
            title={muted ? "Unmute Sound" : "Mute Sound"}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
