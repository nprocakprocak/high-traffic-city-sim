import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { PedestrianSocketSessionService } from "./services/PedestrianSocketSessionService.js";

const app = express();
const url = process.env.RAILWAY_PUBLIC_DOMAIN ? process.env.RAILWAY_PUBLIC_DOMAIN : "http://localhost";
const corsOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN : "http://localhost:3000";
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  const session = new PedestrianSocketSessionService(socket);

  socket.on("session_start", () => {
    session.start();
  });

  socket.on("session_stop", () => {
    session.pauseSpawn();
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
