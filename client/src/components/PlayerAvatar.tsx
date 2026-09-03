import React from "react";
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
  // Extract athletic initials (e.g. Virat Kohli -> VK, MS Dhoni -> MSD, AB de Villiers -> ABD)
  const getInitials = (name: string) => {
    const clean = name.replace(/[()]/g, "").trim();
    if (clean.toLowerCase().includes("de villiers")) return "ABD";
    if (clean.toLowerCase().includes("dhoni")) return "MSD";
    if (clean.toLowerCase().includes("bravo")) return "DJB";
    if (clean.toLowerCase().includes("russell")) return "DRE";
    if (clean.toLowerCase().includes("gayle")) return "CG";
    if (clean.toLowerCase().includes("kohli")) return "VK";
    if (clean.toLowerCase().includes("rohit")) return "RS";
    if (clean.toLowerCase().includes("bumrah")) return "JB";
    if (clean.toLowerCase().includes("malinga")) return "SLM";
    if (clean.toLowerCase().includes("narine")) return "SPN";

    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    if (parts.length === 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const roleStyles: Record<string, { bg: string; icon: string; textGrad: string }> = {
    Batter: {
      bg: "bg-gradient-to-tr from-[#0F2B5C] via-[#1E3A8A] to-[#2563EB]",
      icon: "🏏",
      textGrad: "text-amber-300",
    },
    Bowler: {
      bg: "bg-gradient-to-tr from-[#5A0E1A] via-[#991B1B] to-[#DC2626]",
      icon: "🎯",
      textGrad: "text-amber-300",
    },
    "All-rounder": {
      bg: "bg-gradient-to-tr from-[#064E3B] via-[#047857] to-[#059669]",
      icon: "⚡",
      textGrad: "text-amber-300",
    },
    Wicketkeeper: {
      bg: "bg-gradient-to-tr from-[#713F12] via-[#B45309] to-[#D97706]",
      icon: "🧤",
      textGrad: "text-yellow-200",
    },
  };

  const style = roleStyles[player.primaryRole] || {
    bg: "bg-gradient-to-tr from-[#1E293B] to-[#334155]",
    icon: "🏏",
    textGrad: "text-amber-300",
  };

  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-12 h-12 rounded-xl",
    lg: "w-16 h-16 rounded-2xl",
    xl: "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl",
  };

  const textSizes = {
    sm: "text-xs font-bold",
    md: "text-lg font-extrabold",
    lg: "text-2xl font-extrabold",
    xl: "text-3xl sm:text-4xl font-extrabold",
  };

  const iconPositions = {
    sm: "text-[8px] -bottom-0.5 -right-0.5",
    md: "text-xs bottom-0.5 right-0.5",
    lg: "text-sm bottom-1 right-1",
    xl: "text-base bottom-1.5 right-1.5",
  };

  const tierBorders: Record<string, string> = {
    Marquee: "border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/20",
    Icon: "border-2 border-purple-400 ring-2 ring-purple-400/30 shadow-lg shadow-purple-500/20",
    Elite: "border border-sky-400/80 shadow-md",
    Pro: "border border-[#243B60]",
    Value: "border border-[#243B60]",
  };

  const borderClass = showTierGlow ? tierBorders[player.tier] || "border border-[#243B60]" : "border border-[#243B60]";

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden shadow-xl select-none ${style.bg} ${sizeClasses[size]} ${borderClass} ${className}`}
    >
      {/* Subtle sports textured mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />

      {/* Bold Player Initials */}
      <span
        className={`font-teko tracking-wider leading-none ${style.textGrad} ${textSizes[size]} drop-shadow-md z-10`}
      >
        {getInitials(player.fullName)}
      </span>

      {/* Mini Role Badge */}
      <span className={`absolute ${iconPositions[size]} filter drop-shadow z-10 pointer-events-none`}>
        {style.icon}
      </span>
    </div>
  );
};