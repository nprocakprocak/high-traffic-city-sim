import type { Pedestrian } from "@high-traffic-city-sim/types";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, DEFAULT_SORT, EMPTY_STATS } from "./defaults";
import { usePedestriansStore } from "./pedestriansStore";

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

function resetStoreState(): void {
  usePedestriansStore.setState({
    pedestrianIds: [],
    filteredPedestrianIds: [],
    mapDisplayedPedestrianIds: [],
    pedestriansById: {},
    stats: EMPTY_STATS,
    eventsPerSecond: 0,
    selectedFilters: DEFAULT_FILTERS,
    selectedSort: DEFAULT_SORT,
  });
}

describe("usePedestriansStore", () => {
  beforeEach(() => {
    resetStoreState();
  });

  it("cycles sort direction on repeated column selection", () => {
    const store = usePedestriansStore.getState();

    store.setSelectedSortColumn("name");
    expect(usePedestriansStore.getState().selectedSort).toEqual({
      column: "name",
      direction: "asc",
    });

    usePedestriansStore.getState().setSelectedSortColumn("name");
    expect(usePedestriansStore.getState().selectedSort).toEqual({
      column: "name",
      direction: "desc",
    });

    usePedestriansStore.getState().setSelectedSortColumn("name");
    expect(usePedestriansStore.getState().selectedSort).toEqual({
      column: null,
      direction: "none",
    });
  });

  it("adds, updates and removes pedestrians while keeping derived state in sync", () => {
    const store = usePedestriansStore.getState();
    const alpha = buildPedestrian("a", { mood: "happy", velocity: 6, thirst: 1 });
    const beta = buildPedestrian("b", { mood: "sad", velocity: 3, thirst: 3 });

    store.addPedestrians([alpha, beta]);
    let state = usePedestriansStore.getState();
    expect(state.pedestrianIds).toEqual(["a", "b"]);
    expect(state.filteredPedestrianIds).toEqual(["a", "b"]);
    expect(state.mapDisplayedPedestrianIds).toEqual(["a", "b"]);
    expect(state.stats.totalCount).toBe(2);
    expect(state.stats.mood.happyCount).toBe(1);
    expect(state.stats.mood.sadCount).toBe(1);

    state.updatePedestrians([{ id: "b", updates: { mood: "happy", velocity: 8, thirst: 1 } }]);
    state = usePedestriansStore.getState();
    expect(state.pedestriansById.b.mood).toBe("happy");
    expect(state.stats.mood.happyCount).toBe(2);
    expect(state.stats.mood.sadCount).toBe(0);
    expect(state.stats.pace.runningCount).toBe(2);
    expect(state.stats.thirst.thirstyCount).toBe(2);

    state.removePedestrians(["a"]);
    state = usePedestriansStore.getState();
    expect(state.pedestrianIds).toEqual(["b"]);
    expect(state.filteredPedestrianIds).toEqual(["b"]);
    expect(state.mapDisplayedPedestrianIds).toEqual(["b"]);
    expect(state.pedestriansById.a).toBeUndefined();
    expect(state.stats.totalCount).toBe(1);
    expect(state.stats.mood.happyCount).toBe(1);
  });

  it("ignores updates for missing pedestrians", () => {
    const store = usePedestriansStore.getState();
    store.addPedestrians([buildPedestrian("a")]);
    store.updatePedestrians([{ id: "does-not-exist", updates: { mood: "angry", velocity: 10 } }]);

    const state = usePedestriansStore.getState();
    expect(state.pedestriansById.a.mood).toBe("happy");
    expect(state.pedestriansById.a.velocity).toBe(4);
    expect(state.stats.totalCount).toBe(1);
  });
});
