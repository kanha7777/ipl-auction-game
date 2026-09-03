import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { RoomData, Contestant, CurrentAuctionItem, SquadScoreBreakdown } from "../../shared/src/types";
import { sounds } from "./soundEffects";
import { TopBar } from "./components/TopBar";
import { ContestantDashboard } from "./components/ContestantDashboard";
import { BottomNav, TabType } from "./components/BottomNav";
import { LandingView } from "./components/LandingView";
import { LobbyView } from "./components/LobbyView";
import { AuctionTab } from "./components/AuctionTab";
import { SquadTab } from "./components/SquadTab";
import { TeamsTab } from "./components/TeamsTab";
import { InfoTab } from "./components/InfoTab";
import { UnsoldRoundView } from "./components/UnsoldRoundView";
import { ResultsView } from "./components/ResultsView";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";

export const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<RoomData | null>(null);
  const [contestantId, setContestantId] = useState<string | null>(null);
  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("auction");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [soldInterstitial, setSoldInterstitial] = useState<{ player: any; buyer: any; price: number } | null>(null);
  const [unsoldInterstitial, setUnsoldInterstitial] = useState<any | null>(null);

  // Derive the active contestant directly from room data to ensure live synchronization
  const currentContestant: Contestant | null =
    room?.contestants.find((c) => c.id === (contestantId || contestant?.id)) || contestant;

  const updateRoomAndContestant = (updatedRoom: RoomData) => {
    setRoom(updatedRoom);
    setContestant((prev) => {
      const activeId = contestantId || prev?.id;
      if (!activeId) return prev;
      return updatedRoom.contestants.find((c) => c.id === activeId) || prev;
    });
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    const s = io(SERVER_URL, {
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      console.log("Connected to server:", s.id);
      const savedToken = localStorage.getItem("ipl_auction_token");
      const savedRoomId = localStorage.getItem("ipl_auction_room_id");
      if (savedToken && savedRoomId) {
        s.emit("join_room", { roomId: savedRoomId, reconnectToken: savedToken }, (res: any) => {
          if (res.success && res.room && res.contestant) {
            setRoom(res.room);
            setContestant(res.contestant);
            setContestantId(res.contestant.id);
          }
        });
      }
    });

    s.on("room_state_updated", (updatedRoom: RoomData) => {
      updateRoomAndContestant(updatedRoom);
    });

    s.on("player_presented", (data: { room: RoomData; item: CurrentAuctionItem }) => {
      updateRoomAndContestant(data.room);
      setSoldInterstitial(null);
      setUnsoldInterstitial(null);
      sounds.playGavel();
    });

    s.on("timer_tick", (data: { timer: number }) => {
      setRoom((prev) => {
        if (!prev || !prev.currentAuctionItem) return prev;
        return {
          ...prev,
          currentAuctionItem: {
            ...prev.currentAuctionItem,
            timer: data.timer,
          },
        };
      });
    });

    s.on("bid_placed", (data: any) => {
      updateRoomAndContestant(data.room);
      sounds.playBid();
    });

    s.on("player_sold", (data: any) => {
      updateRoomAndContestant(data.room);
      setSoldInterstitial(data);
      sounds.playSoldFanfare();
      setTimeout(() => setSoldInterstitial(null), 2400);
    });

    s.on("player_unsold", (data: any) => {
      updateRoomAndContestant(data.room);
      setUnsoldInterstitial(data.player);
      sounds.playGavel();
      setTimeout(() => setUnsoldInterstitial(null), 2400);
    });

    s.on("auction_paused", (updatedRoom: RoomData) => {
      updateRoomAndContestant(updatedRoom);
    });

    s.on("auction_resumed", (updatedRoom: RoomData) => {
      updateRoomAndContestant(updatedRoom);
    });

    s.on("player_restarted", (data: any) => {
      updateRoomAndContestant(data.room);
      sounds.playGavel();
    });

    s.on("auction_completed", (data: { room: RoomData; results: SquadScoreBreakdown[] }) => {
      updateRoomAndContestant(data.room);
      setActiveTab("auction");
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [contestantId]);

  const handleCreateRoom = (hostName: string, teamName: string, teamColor: string, teamLogo: string) => {
    if (!socket) return;
    setLoading(true);
    setError(null);
    socket.emit("create_room", { hostName, teamName, teamColor, teamLogo }, (res: any) => {
      setLoading(false);
      if (res.success && res.room && res.contestant) {
        setRoom(res.room);
        setContestant(res.contestant);
        setContestantId(res.contestant.id);
        localStorage.setItem("ipl_auction_token", res.contestant.reconnectToken);
        localStorage.setItem("ipl_auction_room_id", res.room.id);
      } else {
        setError(res.error || "Failed to create room");
      }
    });
  };

  const handleJoinRoom = (roomId: string, name: string, teamName: string, teamColor: string, teamLogo: string) => {
    if (!socket) return;
    setLoading(true);
    setError(null);
    socket.emit("join_room", { roomId, name, teamName, teamColor, teamLogo }, (res: any) => {
      setLoading(false);
      if (res.success && res.room && res.contestant) {
        setRoom(res.room);
        setContestant(res.contestant);
        setContestantId(res.contestant.id);
        localStorage.setItem("ipl_auction_token", res.contestant.reconnectToken);
        localStorage.setItem("ipl_auction_room_id", res.room.id);
      } else {
        setError(res.error || "Failed to join room");
      }
    });
  };

  const handleAddBot = () => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("add_bot", { roomId: room.id, hostId: currentContestant.id });
  };

  const handleRemoveContestant = (id: string) => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("remove_contestant", { roomId: room.id, hostId: currentContestant.id, contestantId: id });
  };

  const handleUpdateConfig = (cfg: any) => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("update_config", { roomId: room.id, hostId: currentContestant.id, config: cfg });
  };

  const handlePreparePool = () => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("prepare_pool", { roomId: room.id, hostId: currentContestant.id });
  };

  const handleStartAuction = () => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("start_auction", { roomId: room.id, hostId: currentContestant.id });
  };

  const handlePlaceBid = () => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("place_bid", { roomId: room.id, contestantId: currentContestant.id });
  };

  const handlePause = () => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("pause_auction", { roomId: room.id, hostId: currentContestant.id });
  };

  const handleResume = () => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("resume_auction", { roomId: room.id, hostId: currentContestant.id });
  };

  const handleSkip = () => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("skip_player", { roomId: room.id, hostId: currentContestant.id });
  };

  const handleMarkUnsold = () => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("mark_unsold", { roomId: room.id, hostId: currentContestant.id });
  };

  const handleRestart = () => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("restart_player", { roomId: room.id, hostId: currentContestant.id });
  };

  const handleStartUnsoldRound = (selectedPlayerIds?: string[]) => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("start_unsold_round", { roomId: room.id, hostId: currentContestant.id, selectedPlayerIds });
  };

  const handleEndAuction = () => {
    if (!socket || !room || !currentContestant) return;
    socket.emit("end_auction", { roomId: room.id, hostId: currentContestant.id });
  };

  const handlePlayAgain = () => {
    localStorage.removeItem("ipl_auction_token");
    localStorage.removeItem("ipl_auction_room_id");
    setRoom(null);
    setContestant(null);
    setContestantId(null);
  };

  // If not joined a room yet -> Show Landing View
  if (!room || !currentContestant) {
    return (
      <LandingView
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        loading={loading}
        error={error}
      />
    );
  }

  // If in Lobby or Configuration -> Show Lobby View
  if (room.state === "LOBBY" || room.state === "CONFIGURATION" || room.state === "POOL_READY") {
    return (
      <div className="min-h-screen bg-[#080E18]">
        <TopBar room={room} contestant={currentContestant} onAddBot={handleAddBot} />
        <LobbyView
          room={room}
          contestant={currentContestant}
          onStartAuction={handleStartAuction}
          onAddBot={handleAddBot}
          onRemoveContestant={handleRemoveContestant}
          onUpdateConfig={handleUpdateConfig}
          onPreparePool={handlePreparePool}
        />
      </div>
    );
  }

  // If in Unsold Round -> Show Unsold Round View
  if (room.state === "UNSOLD_ROUND") {
    return (
      <div className="min-h-screen bg-[#080E18]">
        <TopBar room={room} contestant={currentContestant} />
        <ContestantDashboard contestant={currentContestant} config={room.config} />
        <UnsoldRoundView
          room={room}
          contestant={currentContestant}
          onStartUnsoldRound={handleStartUnsoldRound}
          onEndAuction={handleEndAuction}
        />
      </div>
    );
  }

  // If in Results View -> Show Results View
  if (room.state === "RESULTS" && room.evaluationResults) {
    return (
      <div className="min-h-screen bg-[#080E18]">
        <TopBar room={room} contestant={currentContestant} />
        <ResultsView
          room={room}
          results={room.evaluationResults}
          onPlayAgain={handlePlayAgain}
        />
      </div>
    );
  }

  // If Finalizing -> Show Loading screen
  if (room.state === "FINALIZING") {
    return (
      <div className="min-h-screen bg-[#080E18] flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-4xl shadow-2xl animate-pulse">
          🏆
        </div>
        <h2 className="font-teko text-4xl font-bold text-white tracking-wide animate-pulse">
          CALCULATING SCORES...
        </h2>
        <p className="text-sm text-slate-400">Running the 100-Point Squad Evaluation Model</p>
      </div>
    );
  }

  // In Active Auction -> Mobile 4-tab Layout with Persistent Dashboard
  return (
    <div className="min-h-screen bg-[#080E18] flex flex-col">
      <TopBar room={room} contestant={currentContestant} />
      <ContestantDashboard contestant={currentContestant} config={room.config} />

      {/* Main Content Area based on Tab */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "auction" && (
          <AuctionTab
            room={room}
            contestant={currentContestant}
            item={room.currentAuctionItem}
            onPlaceBid={handlePlaceBid}
            onPause={handlePause}
            onResume={handleResume}
            onSkip={handleSkip}
            onMarkUnsold={handleMarkUnsold}
            onRestart={handleRestart}
            onEndAuction={handleEndAuction}
          />
        )}

        {activeTab === "squad" && <SquadTab contestant={currentContestant} />}

        {activeTab === "teams" && (
          <TeamsTab room={room} currentUserId={currentContestant.id} />
        )}

        {activeTab === "info" && <InfoTab room={room} />}
      </main>

      {/* Sold Interstitial Modal Overlay */}
      {soldInterstitial && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-gradient-to-tr from-emerald-950 via-ipl-card to-[#0A121E] border-2 border-emerald-400 rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl glow-gold">
            <span className="text-4xl mb-2 block">🎉</span>
            <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-xs px-3 py-1 rounded-full border border-emerald-400/40 uppercase tracking-widest inline-block mb-2">
              SOLD!
            </span>
            <h3 className="font-teko text-3xl font-bold text-white uppercase leading-none">
              {soldInterstitial.player.displayName}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Sold to <span className="text-ipl-yellow font-bold">{soldInterstitial.buyer.teamName}</span>
            </p>
            <div className="font-teko text-4xl font-extrabold text-ipl-yellow mt-2">
              ₹{soldInterstitial.price} Cr
            </div>
          </div>
        </div>
      )}

      {/* Unsold Interstitial Modal Overlay */}
      {unsoldInterstitial && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-[#0A121E] border-2 border-rose-500/50 rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl">
            <span className="text-4xl mb-2 block">🔨</span>
            <span className="bg-rose-500/20 text-rose-300 font-extrabold text-xs px-3 py-1 rounded-full border border-rose-400/40 uppercase tracking-widest inline-block mb-2">
              UNSOLD
            </span>
            <h3 className="font-teko text-3xl font-bold text-white uppercase leading-none">
              {unsoldInterstitial.displayName}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Player moved to Unsold Pool (Re-entry in Unsold Round)
            </p>
          </div>
        </div>
      )}

      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        squadCount={currentContestant.squad.length}
        teamsCount={room.contestants.length}
      />
    </div>
  );
};