import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { PedestrianService } from "./services/PedestrianService.js";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

function randomRemovalDelayMs(): number {
  const seconds = 5 + Math.floor(Math.random() * 16);
  return seconds * 1000;
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  const removalTimeouts: ReturnType<typeof setTimeout>[] = [];

  const intervalId = setInterval(() => {
    const pedestrian = PedestrianService.generateRandomPedestrian();
    socket.emit("pedestrian", pedestrian);

    const timeoutId = setTimeout(() => {
      socket.emit("remove_pedestrian", pedestrian.id);
    }, randomRemovalDelayMs());
    removalTimeouts.push(timeoutId);
  }, 200);

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    clearInterval(intervalId);
    for (const timeoutId of removalTimeouts) {
      clearTimeout(timeoutId);
    }
    removalTimeouts.length = 0;
  });
});

httpServer.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`);
});
