/**
 * Flux Realtime mini-service — Socket.IO on port 3003.
 *
 * Broadcasts live vault balance + forecast run notifications to connected
 * Flux clients. The Next.js API layer emits events here whenever:
 *   - a forecast run completes (with new vault balance)
 *   - a manual vault deposit/withdraw happens
 *   - a new chat message arrives
 *
 * Clients connect via io("/?XTransformPort=3003") (Caddy forwards).
 */
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

interface ClientState {
  id: string;
  connectedAt: number;
  lastSeen: number;
}

const clients = new Map<string, ClientState>();

// In-memory mirror of the latest flux snapshot (kept fresh by API POSTs)
let latestSnapshot: {
  vaultBalance: number;
  vaultGoal: number;
  lastRunAt: string | null;
  runNumber: number;
  projectedIncome: number;
  coverageRatio: number;
} = {
  vaultBalance: 12100,
  vaultGoal: 30000,
  lastRunAt: null,
  runNumber: 0,
  projectedIncome: 0,
  coverageRatio: 0,
};

io.on("connection", (socket) => {
  clients.set(socket.id, { id: socket.id, connectedAt: Date.now(), lastSeen: Date.now() });
  console.log(`[flux-realtime] client connected: ${socket.id} (${clients.size} online)`);

  // Send the current snapshot immediately
  socket.emit("snapshot", latestSnapshot);

  socket.on("ping-flux", () => {
    const c = clients.get(socket.id);
    if (c) c.lastSeen = Date.now();
    socket.emit("pong-flux", { t: Date.now() });
  });

  // Internal: API layer emits "vault-update" / "forecast-run" / "chat-update"
  socket.on("vault-update", (data: { vaultBalance: number; vaultGoal?: number; note?: string }) => {
    latestSnapshot = { ...latestSnapshot, vaultBalance: data.vaultBalance, vaultGoal: data.vaultGoal ?? latestSnapshot.vaultGoal };
    io.emit("vault-update", { ...latestSnapshot, note: data.note, at: new Date().toISOString() });
    console.log(`[flux-realtime] vault-update → ₹${data.vaultBalance}`);
  });

  socket.on("forecast-run", (data: { runNumber: number; projectedIncome: number; coverageRatio: number; vaultBalance: number; vaultAction: string; vaultDelta: number }) => {
    latestSnapshot = {
      ...latestSnapshot,
      runNumber: data.runNumber,
      projectedIncome: data.projectedIncome,
      coverageRatio: data.coverageRatio,
      vaultBalance: data.vaultBalance,
      lastRunAt: new Date().toISOString(),
    };
    io.emit("forecast-run", { ...data, at: latestSnapshot.lastRunAt });
    console.log(`[flux-realtime] forecast-run #${data.runNumber} → vault ₹${data.vaultBalance}`);
  });

  socket.on("chat-update", (data: { role: string; preview: string }) => {
    io.emit("chat-update", { ...data, at: new Date().toISOString() });
  });

  // Heartbeat tick every 30s — pushes a small "live" pulse so dashboards
  // can show the green "Live" dot honestly.
  socket.on("disconnect", () => {
    clients.delete(socket.id);
    console.log(`[flux-realtime] client disconnected: ${socket.id} (${clients.size} online)`);
  });

  socket.on("error", (err) => {
    console.error(`[flux-realtime] socket error (${socket.id}):`, err);
  });
});

// Periodic live-pulse broadcast
setInterval(() => {
  io.emit("pulse", { online: clients.size, at: new Date().toISOString(), vaultBalance: latestSnapshot.vaultBalance });
}, 30000);

const PORT = 3003;
httpServer.listen(PORT, () => {
  console.log(`[flux-realtime] Socket.IO server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("[flux-realtime] SIGTERM, shutting down...");
  httpServer.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  console.log("[flux-realtime] SIGINT, shutting down...");
  httpServer.close(() => process.exit(0));
});
