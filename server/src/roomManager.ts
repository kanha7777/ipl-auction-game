import { Server } from "socket.io";
import {
  AuctionConfig,
  Bid,
  Contestant,
  CurrentAuctionItem,
  Player,
  RoomData,
  RoomState,
} from "../../shared/src/types";
import { generateAuctionPool } from "../../shared/src/poolGenerator";
import { calculateNextBid, roundCurrency, validateBid } from "../../shared/src/rules";
import { evaluateAllSquads } from "../../shared/src/evaluation";
import { evaluateBotBid } from "./botService";

const DEFAULT_CONFIG: AuctionConfig = {
  startingPurse: 120.0,
  playerCount: 40,
  minSquadSize: 12,
  maxSquadSize: 18,
  maxOverseas: 5,
  minWicketkeepers: 1,
  timerDuration: 7,
};

export class RoomManager {
  private rooms: Map<string, RoomData> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private botTimeouts: Map<string, NodeJS.Timeout[]> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public generateRoomId(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const fullId = `IPL-${code}`;
    if (this.rooms.has(fullId)) {
      return this.generateRoomId();
    }
    return fullId;
  }

  public createRoom(
    hostName: string,
    teamName: string,
    teamColor: string,
    teamLogo: string,
    socketId: string
  ): { room: RoomData; contestant: Contestant } {
    const roomId = this.generateRoomId();
    const contestantId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reconnectToken = `tok_${Math.random().toString(36).substring(2, 15)}`;

    const host: Contestant = {
      id: contestantId,
      socketId,
      name: hostName || "Host",
      teamName: teamName || "Chennai Super Kings",
      teamColor: teamColor || "#F9CD05",
      teamSecondaryColor: "#005BAA",
      teamLogo: teamLogo || "\uD83C\uDFC6",
      purse: DEFAULT_CONFIG.startingPurse,
      squad: [],
      isHost: true,
      isBot: false,
      isConnected: true,
      reconnectToken,
    };

    const room: RoomData = {
      id: roomId,
      hostId: contestantId,
      state: "LOBBY",
      config: { ...DEFAULT_CONFIG },
      contestants: [host],
      pool: [],
      currentAuctionItem: null,
      unsoldPool: [],
      soldHistory: [],
      evaluationResults: null,
      winnerExplanation: null,
    };

    this.rooms.set(roomId, room);
    return { room, contestant: host };
  }

  public joinRoom(
    roomId: string,
    name: string,
    teamName: string,
    teamColor: string,
    teamLogo: string,
    socketId: string,
    reconnectToken?: string
  ): { room?: RoomData; contestant?: Contestant; error?: string } {
    const room = this.rooms.get(roomId.toUpperCase().trim());
    if (!room) {
      return { error: "Room not found. Please verify the Room ID." };
    }

    // Reconnection check
    if (reconnectToken) {
      const existing = room.contestants.find((c) => c.reconnectToken === reconnectToken);
      if (existing) {
        existing.socketId = socketId;
        existing.isConnected = true;
        return { room, contestant: existing };
      }
    }

    // Check if room is locked
    if (room.state !== "LOBBY" && room.state !== "CONFIGURATION") {
      return { error: "Auction has already started! No new joins allowed." };
    }

    if (room.contestants.length >= 20) {
      return { error: "Room is full (max 20 contestants)." };
    }

    const contestantId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReconnectToken = `tok_${Math.random().toString(36).substring(2, 15)}`;

    const contestant: Contestant = {
      id: contestantId,
      socketId,
      name: name || `Contestant ${room.contestants.length + 1}`,
      teamName: teamName || `Team ${room.contestants.length + 1}`,
      teamColor: teamColor || "#004BA0",
      teamSecondaryColor: "#D1AB3E",
      teamLogo: teamLogo || "\uD83C\uDFC6",
      purse: room.config.startingPurse,
      squad: [],
      isHost: false,
      isBot: false,
      isConnected: true,
      reconnectToken: newReconnectToken,
    };

    room.contestants.push(contestant);
    return { room, contestant };
  }

  public addBot(roomId: string, hostId: string): { room?: RoomData; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) {
      return { error: "Unauthorized or room not found." };
    }

    if (room.contestants.length >= 20) {
      return { error: "Max 20 contestants allowed." };
    }

    const botPresets = [
      { name: "Mumbai Indians (AI)", color: "#004BA0", logo: "\u26A1" },
      { name: "Royal Challengers (AI)", color: "#EC1C24", logo: "\uD83D\uDD25" },
      { name: "Kolkata Knight Riders (AI)", color: "#3A225D", logo: "\u2694\uFE0F" },
      { name: "Gujarat Titans (AI)", color: "#1B2133", logo: "\uD83D\uDEE1\uFE0F" },
      { name: "Rajasthan Royals (AI)", color: "#EA1A85", logo: "\uD83D\uDC51" },
      { name: "Sunrisers Hyderabad (AI)", color: "#F26522", logo: "\uD83E\uDD85" },
      { name: "Delhi Capitals (AI)", color: "#0078FF", logo: "\uD83D\uDC2F" },
      { name: "Lucknow Super Giants (AI)", color: "#A72056", logo: "\uD83C\uDF2A\uFE0F" },
      { name: "Punjab Kings (AI)", color: "#ED1B24", logo: "\uD83E\uDD81" },
    ];

    const availablePreset = botPresets.find(
      (p) => !room.contestants.some((c) => c.teamName === p.name)
    ) || {
      name: `AI Franchise ${room.contestants.length + 1}`,
      color: "#2C3E50",
      logo: "\uD83C\uDFC6",
    };

    const botContestant: Contestant = {
      id: `bot_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: availablePreset.name,
      teamName: availablePreset.name,
      teamColor: availablePreset.color,
      teamSecondaryColor: "#FFFFFF",
      teamLogo: availablePreset.logo,
      purse: room.config.startingPurse,
      squad: [],
      isHost: false,
      isBot: true,
      isConnected: true,
    };

    room.contestants.push(botContestant);
    return { room };
  }

  public removeContestant(roomId: string, hostId: string, contestantId: string): RoomData | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) return null;
    room.contestants = room.contestants.filter((c) => c.id !== contestantId);
    return room;
  }

  public updateConfig(roomId: string, hostId: string, config: Partial<AuctionConfig>): RoomData | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) return null;
    room.config = { ...room.config, ...config };
    // Update contestants' initial purse if still in lobby
    if (room.state === "LOBBY" || room.state === "CONFIGURATION") {
      room.contestants.forEach((c) => {
        c.purse = room.config.startingPurse;
      });
    }
    return room;
  }

  public preparePool(roomId: string, hostId: string): RoomData | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) return null;
    room.pool = generateAuctionPool(room.config.playerCount);
    room.state = "POOL_READY";
    return room;
  }

  public startAuction(roomId: string, hostId: string): RoomData | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) return null;
    if (room.pool.length === 0) {
      room.pool = generateAuctionPool(room.config.playerCount);
    }
    room.state = "AUCTION_RUNNING";
    this.nextPlayer(room);
    return room;
  }

  private nextPlayer(room: RoomData) {
    this.clearRoomTimers(room.id);

    if (room.pool.length === 0) {
      // Main pool finished. Check unsold round
      if (room.unsoldPool.length > 0 && room.state !== "UNSOLD_ROUND") {
        room.state = "UNSOLD_ROUND";
        this.io.to(room.id).emit("room_state_updated", room);
        return;
      } else {
        // Auction complete -> Finalizing & Results
        this.finalizeAuction(room);
        return;
      }
    }

    const nextPlayer = room.pool.shift()!;
    const totalItems = (room.currentAuctionItem?.totalItems || (room.pool.length + 1));
    const itemIndex = totalItems - room.pool.length;

    room.currentAuctionItem = {
      player: nextPlayer,
      itemIndex,
      totalItems,
      currentBid: 0,
      leadingBidder: null,
      bidHistory: [],
      timer: room.config.timerDuration,
      timerRunning: true,
      isUnsoldRound: room.state === "UNSOLD_ROUND",
    };

    this.io.to(room.id).emit("player_presented", {
      room,
      item: room.currentAuctionItem,
    });

    this.startTimer(room);
    this.scheduleBotBids(room);
  }

  private startTimer(room: RoomData) {
    this.clearTimer(room.id);

    const interval = setInterval(() => {
      if (!room.currentAuctionItem || !room.currentAuctionItem.timerRunning) return;

      room.currentAuctionItem.timer = roundCurrency(room.currentAuctionItem.timer - 0.5);

      this.io.to(room.id).emit("timer_tick", {
        timer: room.currentAuctionItem.timer,
        timerDuration: room.config.timerDuration,
      });

      if (room.currentAuctionItem.timer <= 0) {
        this.handleTimerExpiry(room);
      }
    }, 500);

    this.timers.set(room.id, interval);
  }

  private handleTimerExpiry(room: RoomData) {
    this.clearTimer(room.id);
    const item = room.currentAuctionItem;
    if (!item) return;

    item.timerRunning = false;

    if (item.leadingBidder && item.currentBid > 0) {
      // Player is SOLD
      const buyer = room.contestants.find((c) => c.id === item.leadingBidder!.id);
      if (buyer) {
        buyer.purse = roundCurrency(buyer.purse - item.currentBid);
        buyer.squad.push({
          player: item.player,
          price: item.currentBid,
          timestamp: Date.now(),
        });
        room.soldHistory.push({
          player: item.player,
          buyer,
          price: item.currentBid,
        });

        this.io.to(room.id).emit("player_sold", {
          player: item.player,
          buyer,
          price: item.currentBid,
          room,
        });
      }
    } else {
      // Player is UNSOLD
      room.unsoldPool.push(item.player);
      this.io.to(room.id).emit("player_unsold", {
        player: item.player,
        room,
      });
    }

    // Intermission before next player
    setTimeout(() => {
      this.nextPlayer(room);
    }, 2500);
  }

  public placeBid(
    roomId: string,
    contestantId: string
  ): { success: boolean; reason?: string; room?: RoomData } {
    const room = this.rooms.get(roomId);
    if (!room || room.state !== "AUCTION_RUNNING" || !room.currentAuctionItem) {
      return { success: false, reason: "Auction is not actively running" };
    }

    const contestant = room.contestants.find((c) => c.id === contestantId);
    if (!contestant) {
      return { success: false, reason: "Contestant not found in room" };
    }

    const item = room.currentAuctionItem;
    const validation = validateBid(
      contestant,
      item.player,
      item.currentBid,
      item.leadingBidder?.id || null,
      room.config
    );

    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }

    const bidAmount = validation.nextBidAmount;

    // Apply bid
    item.currentBid = bidAmount;
    item.leadingBidder = contestant;
    const newBid: Bid = {
      contestantId: contestant.id,
      contestantName: contestant.name,
      teamName: contestant.teamName,
      teamColor: contestant.teamColor,
      amount: bidAmount,
      timestamp: Date.now(),
    };
    item.bidHistory.push(newBid);

    // Reset 7-second timer on valid bid
    item.timer = room.config.timerDuration;
    item.timerRunning = true;

    this.io.to(room.id).emit("bid_placed", {
      bid: newBid,
      currentBid: item.currentBid,
      leadingBidder: item.leadingBidder,
      item,
      room,
    });

    // Re-schedule bots
    this.scheduleBotBids(room);

    return { success: true, room };
  }

  private scheduleBotBids(room: RoomData) {
    this.clearBotTimeouts(room.id);
    const item = room.currentAuctionItem;
    if (!item || !item.timerRunning) return;

    const botContestants = room.contestants.filter((c) => c.isBot);
    const timeouts: NodeJS.Timeout[] = [];

    botContestants.forEach((bot) => {
      const decision = evaluateBotBid(bot, item, room.config);
      if (decision.shouldBid) {
        const timeout = setTimeout(() => {
          if (
            room.state === "AUCTION_RUNNING" &&
            room.currentAuctionItem &&
            room.currentAuctionItem.player.id === item.player.id &&
            room.currentAuctionItem.timerRunning &&
            room.currentAuctionItem.leadingBidder?.id !== bot.id
          ) {
            this.placeBid(room.id, bot.id);
          }
        }, decision.delayMs);
        timeouts.push(timeout);
      }
    });

    this.botTimeouts.set(room.id, timeouts);
  }

  // Host Controls: Pause / Resume / Skip / Mark Unsold / Restart Player
  public pauseAuction(roomId: string, hostId: string): RoomData | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId || !room.currentAuctionItem) return null;
    room.currentAuctionItem.timerRunning = false;
    room.state = "AUCTION_PAUSED";
    this.io.to(room.id).emit("auction_paused", room);
    return room;
  }

  public resumeAuction(roomId: string, hostId: string): RoomData | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId || !room.currentAuctionItem) return null;
    room.currentAuctionItem.timerRunning = true;
    room.state = "AUCTION_RUNNING";
    this.io.to(room.id).emit("auction_resumed", room);
    return room;
  }

  public skipPlayer(roomId: string, hostId: string): RoomData | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId || !room.currentAuctionItem) return null;
    // Move current player to unsold pool
    room.unsoldPool.push(room.currentAuctionItem.player);
    this.io.to(room.id).emit("player_skipped", {
      player: room.currentAuctionItem.player,
      room,
    });
    this.nextPlayer(room);
    return room;
  }

  public markUnsold(roomId: string, hostId: string): RoomData | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId || !room.currentAuctionItem) return null;
    room.currentAuctionItem.timer = 0;
    this.handleTimerExpiry(room);
    return room;
  }

  public restartPlayer(roomId: string, hostId: string): RoomData | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId || !room.currentAuctionItem) return null;
    const item = room.currentAuctionItem;
    item.currentBid = 0;
    item.leadingBidder = null;
    item.bidHistory = [];
    item.timer = room.config.timerDuration;
    item.timerRunning = true;

    this.io.to(room.id).emit("player_restarted", { item, room });
    this.startTimer(room);
    this.scheduleBotBids(room);
    return room;
  }

  public startUnsoldRound(roomId: string, hostId: string, selectedPlayerIds?: string[]): RoomData | null {
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId) return null;
    if (selectedPlayerIds && selectedPlayerIds.length > 0) {
      const selected = room.unsoldPool.filter((p) => selectedPlayerIds.includes(p.id));
      room.unsoldPool = room.unsoldPool.filter((p) => !selectedPlayerIds.includes(p.id));
      room.pool.push(...selected);
    } else {
      room.pool.push(...room.unsoldPool);
      room.unsoldPool = [];
    }

    room.state = "AUCTION_RUNNING";
    this.nextPlayer(room);
    return room;
  }

  public finalizeAuction(room: RoomData) {
    this.clearRoomTimers(room.id);
    room.state = "RESULTS";
    room.currentAuctionItem = null;

    // Run 100-Point Squad Evaluation Model
    const evaluationResults = evaluateAllSquads(room.contestants, room.config);
    room.evaluationResults = evaluationResults;
    room.winnerExplanation = evaluationResults[0]?.winnerExplanation || null;

    this.io.to(room.id).emit("auction_completed", {
      room,
      results: evaluationResults,
    });
  }

  private clearTimer(roomId: string) {
    const timer = this.timers.get(roomId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(roomId);
    }
  }

  private clearBotTimeouts(roomId: string) {
    const timeouts = this.botTimeouts.get(roomId);
    if (timeouts) {
      timeouts.forEach((t) => clearTimeout(t));
      this.botTimeouts.delete(roomId);
    }
  }

  public clearRoomTimers(roomId: string) {
    this.clearTimer(roomId);
    this.clearBotTimeouts(roomId);
  }

  public getRoom(roomId: string): RoomData | undefined {
    return this.rooms.get(roomId.toUpperCase().trim());
  }

  public handleDisconnect(socketId: string) {
    for (const room of this.rooms.values()) {
      const contestant = room.contestants.find((c) => c.socketId === socketId);
      if (contestant) {
        contestant.isConnected = false;
        this.io.to(room.id).emit("contestant_status_changed", {
          contestantId: contestant.id,
          isConnected: false,
          room,
        });
      }
    }
  }
}
