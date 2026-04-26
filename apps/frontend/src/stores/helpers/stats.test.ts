import type { Pedestrian } from "@high-traffic-city-sim/types";
import { describe, expect, it } from "vitest";
import { nextStats } from "./stats";

function buildPedestrian(id: string, overrides: Partial<Pedestrian> = {}): Pedestrian {
  return {
    id,
    name: `Pedestrian ${id}`,
    mood: "happy",
    velocity: 4,
    thirst: 3,
    ...overrides,
  };
}

function buildById(items: Pedestrian[]): Record<string, Pedestrian> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

describe("nextStats", () => {
  it("counts total and mood counters for all pedestrians", () => {
    const pedestrians = [
      buildPedestrian("a", { mood: "happy" }),
      buildPedestrian("b", { mood: "sad" }),
      buildPedestrian("c", { mood: "sad" }),
    ];

    const result = nextStats(
      pedestrians.map((item) => item.id),
      buildById(pedestrians),
      { mood: "all", pace: "all", thirst: "all" },
    );

    expect(result.totalCount).toBe(3);
    expect(result.mood.happyCount).toBe(1);
    expect(result.mood.sadCount).toBe(2);
  });

  it("applies filter chain for pace and thirst counters", () => {
    const pedestrians = [
      buildPedestrian("a", { mood: "happy", velocity: 6, thirst: 1 }),
      buildPedestrian("b", { mood: "happy", velocity: 3, thirst: 1 }),
      buildPedestrian("c", { mood: "happy", velocity: 6, thirst: 3 }),
      buildPedestrian("d", { mood: "sad", velocity: 6, thirst: 1 }),
    ];

    const result = nextStats(
      pedestrians.map((item) => item.id),
      buildById(pedestrians),
      { mood: "happy", pace: "running", thirst: "all" },
    );

    expect(result.pace.runningCount).toBe(2);
    expect(result.pace.walkingCount).toBe(1);
    expect(result.thirst.thirstyCount).toBe(1);
    expect(result.thirst.notThirstyCount).toBe(1);
  });

  it("handles threshold edges for running and thirsty", () => {
    const pedestrians = [
      buildPedestrian("velocity5", { velocity: 5, thirst: 1 }),
      buildPedestrian("velocity6", { velocity: 6, thirst: 2 }),
    ];

    const result = nextStats(
      pedestrians.map((item) => item.id),
      buildById(pedestrians),
      { mood: "all", pace: "all", thirst: "all" },
    );

    expect(result.pace.runningCount).toBe(1);
    expect(result.pace.walkingCount).toBe(1);
    expect(result.thirst.thirstyCount).toBe(1);
    expect(result.thirst.notThirstyCount).toBe(1);
  });
});
