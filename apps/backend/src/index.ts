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

const DEFAULT_SPAWN_MULT = 16;
const SPAWN_BASE_MS = 50;

const clampSpawnMult = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) {
    return DEFAULT_SPAWN_MULT;
  }
  return Math.min(20, Math.max(1, Math.trunc(n)));
};

const pedestrianBatchSizeForMult = (mult: number): number => {
  if (mult >= 1 && mult <= 2) {
    return 5;
  }
  if (mult >= 3 && mult <= 5) {
    return 4;
  }
  if (mult >= 6 && mult <= 9) {
    return 3;
  }
  if (mult >= 10 && mult <= 15) {
    return 2;
  }
  return 1;
};

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  const removalTimeouts: ReturnType<typeof setTimeout>[] = [];
  const updateTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  const activePedestrians = new Set<string>();

  let spawnIntervalMult = DEFAULT_SPAWN_MULT;
  let spawnIntervalMs = SPAWN_BASE_MS * DEFAULT_SPAWN_MULT;
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const registerSpawnedPedestrian = (
    pedestrian: ReturnType<typeof PedestrianService.generateRandomPedestrian>,
  ) => {
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

  const emitPedestrianSpawnBatch = () => {
    const batchSize = pedestrianBatchSizeForMult(spawnIntervalMult);
    const batch: ReturnType<typeof PedestrianService.generateRandomPedestrian>[] = [];
    for (let i = 0; i < batchSize; i += 1) {
      const pedestrian = PedestrianService.generateRandomPedestrian();
      batch.push(pedestrian);
      registerSpawnedPedestrian(pedestrian);
    }
    socket.emit("pedestrians", batch);
  };

  const scheduleSpawnInterval = () => {
    if (intervalId !== undefined) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(emitPedestrianSpawnBatch, spawnIntervalMs);
  };

  scheduleSpawnInterval();

  socket.on("set_spawn_interval_mult", (value: unknown) => {
    spawnIntervalMult = clampSpawnMult(value);
    spawnIntervalMs = SPAWN_BASE_MS * spawnIntervalMult;
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
