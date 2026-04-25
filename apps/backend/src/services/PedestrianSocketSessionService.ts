import type { Pedestrian } from "@high-traffic-city-sim/types";
import type { Socket } from "socket.io";
import { PedestrianService } from "./PedestrianService.js";
import { PedestrianSpawnService } from "./PedestrianSpawnService.js";

export class PedestrianSocketSessionService {
  private readonly removalTimeouts: ReturnType<typeof setTimeout>[] = [];
  private readonly updateTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly activePedestrians = new Set<string>();

  private spawnIntervalMultiplier = PedestrianSpawnService.defaultMultiplier();
  private spawnIntervalMs = PedestrianSpawnService.intervalMsForMultiplier(
    PedestrianSpawnService.defaultMultiplier(),
  );
  private intervalId: ReturnType<typeof setInterval> | undefined;

  constructor(private readonly socket: Socket) {}

  start(): void {
    this.scheduleSpawnInterval();
  }

  stop(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

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

  setSpawnIntervalMultiplier(value: unknown): void {
    this.spawnIntervalMultiplier = PedestrianSpawnService.clampMultiplier(value);
    this.spawnIntervalMs = PedestrianSpawnService.intervalMsForMultiplier(
      this.spawnIntervalMultiplier,
    );
    this.scheduleSpawnInterval();
  }

  private scheduleSpawnInterval(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.emitPedestrianSpawnBatch();
    }, this.spawnIntervalMs);
  }

  private emitPedestrianSpawnBatch(): void {
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
