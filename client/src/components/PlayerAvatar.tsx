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

  // Generate clean fallback profile picture if photo is missing or fails to load
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    player.fullName
  )}&background=0F1D32&color=F59E0B&size=256&bold=true&format=svg`;

  const sizeClasses = {
    sm: "w-9 h-9 text-xs rounded-xl",
    md: "w-14 h-14 text-sm rounded-2xl",
    lg: "w-20 h-20 text-lg rounded-2xl",
    xl: "w-24 h-24 sm:w-28 sm:h-28 text-xl rounded-3xl",
  };

  const tierBorders: Record<string, string> = {
    Marquee: "border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20",
    Icon: "border-purple-400 ring-2 ring-purple-400/30 shadow-purple-500/20",
    Elite: "border-sky-400 ring-1 ring-sky-400/30",
    Pro: "border-[#1E304F]",
    Value: "border-[#1E304F]",
  };

  const glowClass = showTierGlow ? tierBorders[player.tier] || "border-[#1E304F]" : "border-[#1E304F]";

  const src = imgError || !player.photo ? fallbackUrl : player.photo;

  return (
    <div
      className={`relative inline-block shrink-0 overflow-hidden border bg-[#0A121E] shadow-lg ${sizeClasses[size]} ${glowClass} ${className}`}
    >
      <img
        src={src}
        alt={player.fullName}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
    </div>
  );
};
