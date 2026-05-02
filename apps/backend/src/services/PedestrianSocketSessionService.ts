import { PEDESTRIAN_LIMIT_EXCEEDED_SOCKET_EVENT, PedestrianLimitExceededPayload, type Pedestrian } from "@high-traffic-city-sim/types";
import type { Socket } from "socket.io";
import { PedestrianService } from "./PedestrianService.js";
import { PedestrianSpawnService } from "./PedestrianSpawnService.js";
import { saveVisitsFor } from "./DatabaseService.js";
import { PERSIST_INTERVAL_MS } from "./constants.js";
import { MAX_PEDESTRIANS_PER_IP } from "../constants.js";

export class PedestrianSocketSessionService {
  private readonly removalTimeouts: ReturnType<typeof setTimeout>[] = [];
  private readonly updateTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly activePedestrians = new Set<string>();

  private spawnIntervalMultiplier = PedestrianSpawnService.defaultMultiplier();
  private spawnIntervalMs = PedestrianSpawnService.intervalMsForMultiplier(
    PedestrianSpawnService.defaultMultiplier(),
  );
  private intervalId: ReturnType<typeof setInterval> | undefined;
  private visitsIntervalId: ReturnType<typeof setInterval> | undefined;
  private isRunning = false;

  constructor(private readonly socket: Socket, private readonly initialPedestriansCount: number) {
    this.persistActivePedestriansCount();
  }

  start(): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.scheduleSpawnInterval();
    this.scheduleVisitsPersistence();
  }

  pauseSpawn(): void {
    this.isRunning = false;

    this.clearSpawnIntervals();

    this.persistActivePedestriansCount();
  }

  shutdown(): void {
    this.isRunning = false;
    this.clearSpawnIntervals();

    for (const timeoutId of this.removalTimeouts) {
      clearTimeout(timeoutId);
    }
    this.removalTimeouts.length = 0;

    for (const timeoutId of this.updateTimeouts.values()) {
      clearTimeout(timeoutId);
    }
    this.updateTimeouts.clear();
    this.activePedestrians.clear();
  }

  clearSpawnIntervals(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    if (this.visitsIntervalId !== undefined) {
      clearInterval(this.visitsIntervalId);
      this.visitsIntervalId = undefined;
    }
  }

  setSpawnIntervalMultiplier(value: unknown): void {
    this.spawnIntervalMultiplier = PedestrianSpawnService.clampMultiplier(value);
    this.spawnIntervalMs = PedestrianSpawnService.intervalMsForMultiplier(
      this.spawnIntervalMultiplier,
    );
    if (this.isRunning) {
      this.scheduleSpawnInterval();
    }
  }

  isSessionRunning(): boolean {
    return this.isRunning;
  }

  private scheduleSpawnInterval(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.emitPedestrianSpawnBatch();
    }, this.spawnIntervalMs);
  }

  private scheduleVisitsPersistence(): void {
    if (this.visitsIntervalId !== undefined) {
      clearInterval(this.visitsIntervalId);
    }

    this.visitsIntervalId = setInterval(() => {
      this.persistActivePedestriansCount();
    }, PERSIST_INTERVAL_MS);
  }

  private persistActivePedestriansCount(): void {
    const clientIp = this.socket.handshake.address;
    const activePedestriansCount = this.initialPedestriansCount + this.activePedestrians.size;

    void saveVisitsFor(clientIp, activePedestriansCount).catch((error: unknown) => {
      console.error(`Failed to persist pedestrians count for IP ${clientIp}`, error);
    });
  }

  private emitPedestrianSpawnBatch(): void {
    const pedestriansCount = this.initialPedestriansCount + this.activePedestrians.size;
    if (pedestriansCount >= MAX_PEDESTRIANS_PER_IP) {
      const payload: PedestrianLimitExceededPayload = {
        message: "I'm sorry, but this demo has quota limits and I can't generate more pedestrians for you. Try a different device.",
      };
      this.socket.emit(PEDESTRIAN_LIMIT_EXCEEDED_SOCKET_EVENT, payload);
      this.pauseSpawn();
      return;
    }

    const batchSize = PedestrianSpawnService.batchSizeForMultiplier(this.spawnIntervalMultiplier);
    const batch: Pedestrian[] = [];

    for (let index = 0; index < batchSize; index += 1) {
      const pedestrian = PedestrianService.generateRandomPedestrian();
      batch.push(pedestrian);
      this.registerSpawnedPedestrian(pedestrian);
    }

    this.socket.emit("pedestrians", batch);
  }

  private registerSpawnedPedestrian(pedestrian: Pedestrian): void {
    this.activePedestrians.add(pedestrian.id);
    let currentThirst = pedestrian.thirst;

    const schedulePedestrianUpdate = () => {
      const updateTimeoutId = setTimeout(() => {
        if (!this.activePedestrians.has(pedestrian.id)) {
          return;
        }

        currentThirst = Math.max(0, currentThirst - 1);
        this.socket.emit("update_pedestrian", {
          id: pedestrian.id,
          thirst: currentThirst,
          ...PedestrianService.randomPedestrianUpdate(),
        });

        schedulePedestrianUpdate();
      }, PedestrianService.randomVelocityUpdateDelayMs());

      this.updateTimeouts.set(pedestrian.id, updateTimeoutId);
    };

    schedulePedestrianUpdate();

    const removalTimeoutId = setTimeout(() => {
      this.activePedestrians.delete(pedestrian.id);
      const updateTimeoutId = this.updateTimeouts.get(pedestrian.id);
      if (updateTimeoutId) {
        clearTimeout(updateTimeoutId);
        this.updateTimeouts.delete(pedestrian.id);
      }
      this.socket.emit("remove_pedestrian", pedestrian.id);
    }, PedestrianService.randomRemovalDelayMs());

    this.removalTimeouts.push(removalTimeoutId);
  }
}
