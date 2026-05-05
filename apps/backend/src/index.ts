import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { loadServerEnv } from "./config/serverEnv.js";
import { getPedestriansFor, saveVisitsFor } from "./services/DatabaseService.js";
import { PedestrianSocketSessionService } from "./services/PedestrianSocketSessionService.js";

const { railwayPublicDomain, corsOrigin, port } = loadServerEnv();

const app = express();

app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  console.log(`Client connected: ${socket.id}`);
  const clientIp = socket.handshake.address;
  const pedestriansCount = await getPedestriansFor(clientIp);

  if (pedestriansCount === undefined) {
    await saveVisitsFor(clientIp, 0);
  }
  
  const session = new PedestrianSocketSessionService(socket, pedestriansCount ?? 0);

  socket.on("session_start", async () => {
    session.start();
  });

  socket.on("session_stop", () => {
    if (session.isSessionRunning()) {
      session.pauseSpawn();
    }
  });

  socket.on("set_spawn_interval_mult", (value: unknown) => {
    session.setSpawnIntervalMultiplier(value);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    session.shutdown();
  });
});

httpServer.listen(port, () => {
  console.log(`Backend is running at ${railwayPublicDomain}:${port}`);
});
