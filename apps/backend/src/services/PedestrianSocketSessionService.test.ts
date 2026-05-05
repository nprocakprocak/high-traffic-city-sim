import type { Pedestrian } from "@high-traffic-city-sim/types";
import type { Socket } from "socket.io";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PedestrianService } from "./PedestrianService.js";
import { PedestrianSpawnService } from "./PedestrianSpawnService.js";
import { PedestrianSocketSessionService } from "./PedestrianSocketSessionService.js";

interface EmittedSocketEvent {
  event: string;
  payload: unknown;
}

function createSocketMock(): { socket: Socket; emitted: EmittedSocketEvent[] } {
  const emitted: EmittedSocketEvent[] = [];
  const socket = {
    emit: vi.fn((event: string, payload: unknown) => {
      emitted.push({ event, payload });
      return true;
    }),
    handshake: { address: "127.0.0.1" },
  } as unknown as Socket;

  return { socket, emitted };
}

function mockedPedestrian(id: string): Pedestrian {
  return {
    id,
    name: `Pedestrian ${id}`,
    mood: "happy",
    velocity: 4,
    thirst: 3,
  };
}

describe("PedestrianSocketSessionService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("starts spawning once and emits batches on interval", () => {
    const { socket, emitted } = createSocketMock();
    const session = new PedestrianSocketSessionService(socket, 0);
    let idCounter = 0;
    const defaultSpawnInterval = PedestrianSpawnService.intervalMsForMultiplier(
      PedestrianSpawnService.defaultMultiplier(),
    );

    vi.spyOn(PedestrianService, "generateRandomPedestrian").mockImplementation(() => {
      idCounter += 1;
      return mockedPedestrian(`p-${idCounter}`);
    });
    vi.spyOn(PedestrianService, "randomVelocityUpdateDelayMs").mockReturnValue(60_000);
    vi.spyOn(PedestrianService, "randomRemovalDelayMs").mockReturnValue(120_000);

    session.start();
    session.start();

    vi.advanceTimersByTime(defaultSpawnInterval);

    const spawnEvents = emitted.filter((item) => item.event === "pedestrians");
    expect(spawnEvents).toHaveLength(1);
    expect((spawnEvents[0].payload as Pedestrian[]).length).toBe(1);
  });

  it("reschedules spawn interval when multiplier changes while running", () => {
    const { socket, emitted } = createSocketMock();
    const session = new PedestrianSocketSessionService(socket, 0);
    let idCounter = 0;
    const defaultSpawnInterval = PedestrianSpawnService.intervalMsForMultiplier(
      PedestrianSpawnService.defaultMultiplier(),
    );
    const fastSpawnInterval = PedestrianSpawnService.intervalMsForMultiplier(1);

    vi.spyOn(PedestrianService, "generateRandomPedestrian").mockImplementation(() => {
      idCounter += 1;
      return mockedPedestrian(`p-${idCounter}`);
    });
    vi.spyOn(PedestrianService, "randomVelocityUpdateDelayMs").mockReturnValue(60_000);
    vi.spyOn(PedestrianService, "randomRemovalDelayMs").mockReturnValue(120_000);

    session.start();
    vi.advanceTimersByTime(defaultSpawnInterval);
    session.setSpawnIntervalMultiplier(1);
    vi.advanceTimersByTime(fastSpawnInterval * 2);

    const spawnEvents = emitted.filter((item) => item.event === "pedestrians");
    expect(spawnEvents.length).toBeGreaterThanOrEqual(3);
  });

  it("stops scheduled updates and removals after shutdown", () => {
    const { socket, emitted } = createSocketMock();
    const session = new PedestrianSocketSessionService(socket, 0);
    const defaultSpawnInterval = PedestrianSpawnService.intervalMsForMultiplier(
      PedestrianSpawnService.defaultMultiplier(),
    );

    vi.spyOn(PedestrianService, "generateRandomPedestrian").mockReturnValue(mockedPedestrian("single"));
    vi.spyOn(PedestrianService, "randomVelocityUpdateDelayMs").mockReturnValue(10);
    vi.spyOn(PedestrianService, "randomRemovalDelayMs").mockReturnValue(20);

    session.start();
    vi.advanceTimersByTime(defaultSpawnInterval);
    session.shutdown();
    vi.advanceTimersByTime(1_000);

    const updateEvents = emitted.filter((item) => item.event === "update_pedestrian");
    const removeEvents = emitted.filter((item) => item.event === "remove_pedestrian");
    const spawnEvents = emitted.filter((item) => item.event === "pedestrians");
    expect(spawnEvents).toHaveLength(1);
    expect(updateEvents).toHaveLength(0);
    expect(removeEvents).toHaveLength(0);
  });

  it("emits removal and stops further updates after pedestrian lifetime ends", () => {
    const { socket, emitted } = createSocketMock();
    const session = new PedestrianSocketSessionService(socket, 0);
    const defaultSpawnInterval = PedestrianSpawnService.intervalMsForMultiplier(
      PedestrianSpawnService.defaultMultiplier(),
    );
    const removalDelayMs = 25;

    vi.spyOn(PedestrianService, "generateRandomPedestrian").mockReturnValue(mockedPedestrian("single"));
    vi.spyOn(PedestrianService, "randomVelocityUpdateDelayMs").mockReturnValue(10);
    vi.spyOn(PedestrianService, "randomRemovalDelayMs").mockReturnValue(removalDelayMs);

    session.start();
    vi.advanceTimersByTime(defaultSpawnInterval);
    vi.advanceTimersByTime(removalDelayMs - 1);

    const updatesBeforeRemoval = emitted.filter((item) => item.event === "update_pedestrian");
    expect(updatesBeforeRemoval.length).toBeGreaterThan(0);

    vi.advanceTimersByTime(1);
    const removeEvents = emitted.filter((item) => item.event === "remove_pedestrian");
    expect(removeEvents).toHaveLength(1);
    expect(removeEvents[0].payload).toBe("single");

    const updatesAtRemoval = emitted.filter((item) => item.event === "update_pedestrian").length;
    vi.advanceTimersByTime(200);
    const updatesAfterRemoval = emitted.filter((item) => item.event === "update_pedestrian").length;
    expect(updatesAfterRemoval).toBe(updatesAtRemoval);
  });
});
