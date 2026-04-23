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

const DEFAULT_SPAWN_MULT = 8;
const SPAWN_BASE_MS = 100;

const clampSpawnMult = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    return DEFAULT_SPAWN_MULT;
  }
  return Math.min(10, Math.max(1, Math.trunc(n)));
};

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  const removalTimeouts: ReturnType<typeof setTimeout>[] = [];
  const updateTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  const activePedestrians = new Set<string>();

  let spawnIntervalMs = SPAWN_BASE_MS * DEFAULT_SPAWN_MULT;
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const emitOnePedestrian = () => {
    const pedestrian = PedestrianService.generateRandomPedestrian();
    socket.emit("pedestrian", pedestrian);
    activePedestrians.add(pedestrian.id);
    let currentThirst = pedestrian.thirst;

    const schedulePedestrianUpdate = () => {
      const timeoutId = setTimeout(() => {
        if (!activePedestrians.has(pedestrian.id)) {
          return;
        }

        currentThirst = Math.max(0, currentThirst - 1);
        socket.emit("update_pedestrian", {
          id: pedestrian.id,
          thirst: currentThirst,
          ...PedestrianService.randomPedestrianUpdate(),
        });
        schedulePedestrianUpdate();
      }, PedestrianService.randomVelocityUpdateDelayMs());

      updateTimeouts.set(pedestrian.id, timeoutId);
    };
    schedulePedestrianUpdate();

    const timeoutId = setTimeout(() => {
      activePedestrians.delete(pedestrian.id);
      const updateTimeoutId = updateTimeouts.get(pedestrian.id);
      if (updateTimeoutId) {
        clearTimeout(updateTimeoutId);
        updateTimeouts.delete(pedestrian.id);
      }
      socket.emit("remove_pedestrian", pedestrian.id);
    }, PedestrianService.randomRemovalDelayMs());
    removalTimeouts.push(timeoutId);
  };

  const scheduleSpawnInterval = () => {
    if (intervalId !== undefined) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(emitOnePedestrian, spawnIntervalMs);
  };

  scheduleSpawnInterval();

  socket.on("set_spawn_interval_mult", (value: unknown) => {
    spawnIntervalMs = SPAWN_BASE_MS * clampSpawnMult(value);
    scheduleSpawnInterval();
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (intervalId !== undefined) {
      clearInterval(intervalId);
    }
    for (const timeoutId of removalTimeouts) {
      clearTimeout(timeoutId);
    }
    for (const timeoutId of updateTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    updateTimeouts.clear();
    activePedestrians.clear();
    removalTimeouts.length = 0;
  });
});

httpServer.listen(port, () => {
  console.log(`Backend is running at http://localhost:${port}`);
});
