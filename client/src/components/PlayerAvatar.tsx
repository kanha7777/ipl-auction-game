import React, { useState } from "react";
import { Player } from "../../../shared/src/types";

interface PlayerAvatarProps {
  player: Player;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTierGlow?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  size = "md",
  className = "",
  showTierGlow = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Extract athletic initials (e.g. Virat Kohli -> VK, Andre Russell -> AR, MS Dhoni -> MSD)
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    if (parts.length === 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const roleGradients: Record<string, { bg: string; icon: string; border: string }> = {
    Batter: {
      bg: "from-blue-900 via-indigo-950 to-slate-950",
      icon: "🏏",
      border: "border-blue-500/40",
    },
    Bowler: {
      bg: "from-rose-950 via-red-950 to-slate-950",
      icon: "🎯",
      border: "border-rose-500/40",
    },
    "All-rounder": {
      bg: "from-emerald-950 via-teal-950 to-slate-950",
      icon: "⚡",
      border: "border-emerald-500/40",
    },
    Wicketkeeper: {
      bg: "from-amber-950 via-yellow-950 to-slate-950",
      icon: "🧤",
      border: "border-amber-500/40",
    },
  };

  const roleStyle = roleGradients[player.primaryRole] || {
    bg: "from-slate-900 to-slate-950",
    icon: "🏏",
    border: "border-slate-700",
  };

  const sizeClasses = {
    sm: "w-9 h-9 text-xs rounded-xl",
    md: "w-14 h-14 text-sm rounded-2xl",
    lg: "w-20 h-20 text-base rounded-2xl",
    xl: "w-24 h-24 sm:w-28 sm:h-28 text-lg rounded-3xl",
  };

  const textSizes = {
    sm: "text-[12px]",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl sm:text-4xl",
  };

  const iconSizes = {
    sm: "text-[9px] -bottom-0.5 -right-0.5",
    md: "text-xs bottom-0.5 right-0.5",
    lg: "text-sm bottom-1 right-1",
    xl: "text-base bottom-1.5 right-1.5",
  };

  const tierBorders: Record<string, string> = {
    Marquee: "border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20",
    Icon: "border-purple-400 ring-2 ring-purple-400/30 shadow-purple-500/20",
    Elite: "border-sky-400 ring-1 ring-sky-400/30",
    Pro: "border-[#1E304F]",
    Value: "border-[#1E304F]",
  };

  const glowClass = showTierGlow ? tierBorders[player.tier] || "border-[#1E304F]" : "border-[#1E304F]";

  const hasValidPhoto = player.photo && !imgError && !player.photo.includes("bottts");

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden border shadow-xl select-none ${sizeClasses[size]} ${glowClass} ${className}`}
    >
      {hasValidPhoto ? (
        <img
          src={player.photo}
          alt={player.displayName}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-105"
          loading="eager"
        />
      ) : (
        /* High-Quality Cricketer Profile Avatar with Initials & Role Badge */
        <div
          className={`w-full h-full bg-gradient-to-tr ${roleStyle.bg} flex flex-col items-center justify-center relative p-1`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:8px_8px]" />
          <span
            className={`font-teko font-extrabold tracking-wider leading-none text-ipl-yellow ${textSizes[size]} drop-shadow`}
          >
            {getInitials(player.fullName)}
          </span>
          <span className={`absolute ${iconSizes[size]} filter drop-shadow`}>
            {roleStyle.icon}
          </span>
        </div>
      )}
    </div>
  );
};