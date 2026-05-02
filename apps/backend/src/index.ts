import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { getPedestriansFor } from "./services/DatabaseService.js";
import { PedestrianSocketSessionService } from "./services/PedestrianSocketSessionService.js";

const app = express();
const url = process.env.RAILWAY_PUBLIC_DOMAIN;
const corsOrigin = process.env.CORS_ORIGIN;
const port = Number(process.env.PORT);

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
  const session = new PedestrianSocketSessionService(socket, pedestriansCount);

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
  console.log(`Backend is running at ${url}:${port}`);
});
