import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { PedestrianSocketSessionService } from "./services/PedestrianSocketSessionService.js";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  const session = new PedestrianSocketSessionService(socket);
  session.start();

  socket.on("set_spawn_interval_mult", (value: unknown) => {
    session.setSpawnIntervalMultiplier(value);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    session.stop();
  });
});

httpServer.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`);
});
