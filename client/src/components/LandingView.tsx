import React, { useState } from "react";
import { PlusCircle, LogIn, Sparkles } from "lucide-react";

interface LandingViewProps {
  onCreateRoom: (hostName: string, teamName: string, teamColor: string, teamLogo: string) => void;
  onJoinRoom: (roomId: string, name: string, teamName: string, teamColor: string, teamLogo: string) => void;
  loading: boolean;
  error: string | null;
}

const IPL_TEAMS = [
  { name: "Chennai Super Kings", short: "CSK", color: "#F9CD05", logo: "🦁" },
  { name: "Mumbai Indians", short: "MI", color: "#004BA0", logo: "⚡" },
  { name: "Royal Challengers Bengaluru", short: "RCB", color: "#EC1C24", logo: "🔥" },
  { name: "Kolkata Knight Riders", short: "KKR", color: "#3A225D", logo: "⚔️" },
  { name: "Rajasthan Royals", short: "RR", color: "#EA1A85", logo: "👑" },
  { name: "Sunrisers Hyderabad", short: "SRH", color: "#F26522", logo: "🦅" },
  { name: "Delhi Capitals", short: "DC", color: "#0078FF", logo: "🐯" },
  { name: "Gujarat Titans", short: "GT", color: "#1B2133", logo: "🛡️" },
  { name: "Lucknow Super Giants", short: "LSG", color: "#A72056", logo: "🌪️" },
  { name: "Punjab Kings", short: "PBKS", color: "#ED1B24", logo: "🦁" },
];

export const LandingView: React.FC<LandingViewProps> = ({
  onCreateRoom,
  onJoinRoom,
  loading,
  error,
}) => {
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(IPL_TEAMS[0]);
  const [customTeamName, setCustomTeamName] = useState("");

  const activeTeamName = customTeamName.trim() || selectedTeam.name;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateRoom(name.trim(), activeTeamName, selectedTeam.color, selectedTeam.logo);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roomId.trim()) return;
    onJoinRoom(roomId.trim().toUpperCase(), name.trim(), activeTeamName, selectedTeam.color, selectedTeam.logo);
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-ipl-card border border-[#1E304F] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Background glow header */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-ipl-yellow/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-ipl-blue/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-ipl-blue via-indigo-600 to-ipl-yellow p-0.5 shadow-xl mb-3">
            <div className="w-full h-full bg-[#0E1A2B] rounded-[14px] flex items-center justify-center text-3xl">
              🏏
            </div>
          </div>
          <h1 className="font-teko text-4xl font-bold tracking-wider text-white uppercase leading-none">
            IPL All-Time <span className="text-ipl-yellow">Auction</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time Multiplayer Auction Game • ₹120 Cr Purse
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Mode Selector */}
        {mode === "choose" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-yellow-500/20 transition-transform active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              CREATE PRIVATE ROOM
            </button>

            <button
              onClick={() => setMode("join")}
              className="w-full bg-[#1A2942] hover:bg-[#223657] text-white border border-[#2E4670] font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-transform active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5 text-ipl-accent" />
              JOIN EXISTING ROOM
            </button>

            <div className="pt-4 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-[#0A121E] px-3 py-1.5 rounded-full border border-[#1E304F]">
                <Sparkles className="w-3.5 h-3.5 text-ipl-yellow" />
                100-Point Squad Evaluation Model
              </div>
            </div>
          </div>
        )}

        {/* Create / Join Form */}
        {mode !== "choose" && (
          <form onSubmit={mode === "create" ? handleCreate : handleJoin} className="space-y-4">
            {mode === "join" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Room ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IPL-X7K29"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  className="w-full bg-[#0A121E] border border-[#1E304F] focus:border-ipl-yellow rounded-xl px-3.5 py-2.5 text-sm font-teko text-xl tracking-widest text-ipl-yellow placeholder:text-slate-600 outline-none transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Your Contestant Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter your name (e.g. Rahul)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0A121E] border border-[#1E304F] focus:border-ipl-yellow rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition"
              />
            </div>

            {/* Team Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Choose IPL Franchise
              </label>
              <div className="grid grid-cols-5 gap-1.5 mb-2">
                {IPL_TEAMS.map((team) => (
                  <button
                    key={team.short}
                    type="button"
                    onClick={() => setSelectedTeam(team)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition ${
                      selectedTeam.short === team.short
                        ? "bg-[#1E304F] border-ipl-yellow shadow-md"
                        : "bg-[#0A121E] border-[#1E304F] hover:bg-[#131F33] opacity-75"
                    }`}
                  >
                    <span className="text-xl">{team.logo}</span>
                    <span className="text-[10px] font-bold mt-0.5 text-slate-200">{team.short}</span>
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder={`Or custom team (Default: ${selectedTeam.name})`}
                value={customTeamName}
                onChange={(e) => setCustomTeamName(e.target.value)}
                className="w-full bg-[#0A121E] border border-[#1E304F] focus:border-ipl-yellow rounded-xl px-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 outline-none transition"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode("choose")}
                className="w-1/3 bg-[#131F33] hover:bg-[#1E304F] text-slate-300 font-semibold py-3 px-3 rounded-xl text-xs transition active:scale-95"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || (mode === "join" && !roomId.trim())}
                className="w-2/3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-50 text-black font-bold py-3 px-4 rounded-xl text-xs shadow-lg transition active:scale-95"
              >
                {loading ? "Connecting..." : mode === "create" ? "CREATE & ENTER LOBBY" : "JOIN AUCTION ROOM"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};