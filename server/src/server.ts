import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import fs from "fs";
import { RoomManager } from "./roomManager";
import { ALL_TIME_PLAYERS } from "../../shared/src/data/players";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const roomManager = new RoomManager(io);

// Health & Database REST Endpoints
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/api/players", (req, res) => {
  res.json({ count: ALL_TIME_PLAYERS.length, players: ALL_TIME_PLAYERS });
});

// Serve frontend static build if dist exists
const clientDistPath = path.resolve(__dirname, "../../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Socket.IO Real-Time Handlers
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Create Room
  socket.on("create_room", (data, callback) => {
    try {
      const { hostName, teamName, teamColor, teamLogo } = data;
      const { room, contestant } = roomManager.createRoom(
        hostName,
        teamName,
        teamColor,
        teamLogo,
        socket.id
      );
      socket.join(room.id);
      callback({ success: true, room, contestant });
      console.log(`Room created: ${room.id} by ${contestant.name}`);
    } catch (e: any) {
      callback({ success: false, error: e.message || "Failed to create room" });
    }
  });

  // Join Room
  socket.on("join_room", (data, callback) => {
    try {
      const { roomId, name, teamName, teamColor, teamLogo, reconnectToken } = data;
      const res = roomManager.joinRoom(
        roomId,
        name,
        teamName,
        teamColor,
        teamLogo,
        socket.id,
        reconnectToken
      );

      if (res.error || !res.room || !res.contestant) {
        callback({ success: false, error: res.error || "Failed to join room" });
        return;
      }

      socket.join(res.room.id);
      io.to(res.room.id).emit("room_state_updated", res.room);
      callback({ success: true, room: res.room, contestant: res.contestant });
      console.log(`User ${res.contestant.name} joined room ${res.room.id}`);
    } catch (e: any) {
      callback({ success: false, error: e.message || "Failed to join room" });
    }
  });

  // Add AI Bot
  socket.on("add_bot", (data, callback) => {
    const { roomId, hostId } = data;
    const res = roomManager.addBot(roomId, hostId);
    if (res.room) {
      io.to(roomId).emit("room_state_updated", res.room);
      callback?.({ success: true, room: res.room });
    } else {
      callback?.({ success: false, error: res.error });
    }
  });

  // Remove Contestant
  socket.on("remove_contestant", (data, callback) => {
    const { roomId, hostId, contestantId } = data;
    const updated = roomManager.removeContestant(roomId, hostId, contestantId);
    if (updated) {
      io.to(roomId).emit("room_state_updated", updated);
      callback?.({ success: true, room: updated });
    }
  });

  // Update Auction Config
  socket.on("update_config", (data, callback) => {
    const { roomId, hostId, config } = data;
    const updated = roomManager.updateConfig(roomId, hostId, config);
    if (updated) {
      io.to(roomId).emit("room_state_updated", updated);
      callback?.({ success: true, room: updated });
    }
  });

  // Prepare Pool Preview
  socket.on("prepare_pool", (data, callback) => {
    const { roomId, hostId } = data;
    const updated = roomManager.preparePool(roomId, hostId);
    if (updated) {
      io.to(roomId).emit("room_state_updated", updated);
      callback?.({ success: true, room: updated });
    }
  });

  // Start Auction
  socket.on("start_auction", (data, callback) => {
    const { roomId, hostId } = data;
    const updated = roomManager.startAuction(roomId, hostId);
    if (updated) {
      callback?.({ success: true, room: updated });
    }
  });

  // Single-Tap Bid
  socket.on("place_bid", (data, callback) => {
    const { roomId, contestantId } = data;
    const res = roomManager.placeBid(roomId, contestantId);
    callback?.(res);
  });

  // Host Auction Controls (PRD 4.5)
  socket.on("pause_auction", (data) => {
    roomManager.pauseAuction(data.roomId, data.hostId);
  });

  socket.on("resume_auction", (data) => {
    roomManager.resumeAuction(data.roomId, data.hostId);
  });

  socket.on("skip_player", (data) => {
    roomManager.skipPlayer(data.roomId, data.hostId);
  });

  socket.on("mark_unsold", (data) => {
    roomManager.markUnsold(data.roomId, data.hostId);
  });

  socket.on("restart_player", (data) => {
    roomManager.restartPlayer(data.roomId, data.hostId);
  });

  socket.on("start_unsold_round", (data) => {
    roomManager.startUnsoldRound(data.roomId, data.hostId, data.selectedPlayerIds);
  });

  socket.on("end_auction", (data) => {
    const room = roomManager.getRoom(data.roomId);
    if (room && room.hostId === data.hostId) {
      roomManager.finalizeAuction(room);
    }
  });

  socket.on("disconnect", () => {
    roomManager.handleDisconnect(socket.id);
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(Number(PORT), "0.0.0.0", () => {
  const localIp = require("os").networkInterfaces(); const ip = Object.values(localIp).flat().find((i: any) => i?.family === "IPv4" && !i.internal)?.address || "localhost"; console.log(`IPL Auction Engine listening:`); console.log(`  Local:   http://localhost:${PORT}`); console.log(`  Network: http://${ip}:${PORT}  <-- open this on your phone`);;
});
