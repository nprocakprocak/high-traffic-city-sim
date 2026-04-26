import type { Pedestrian } from "@high-traffic-city-sim/types";
import { describe, expect, it } from "vitest";
import type { PedestrianFilterSelection } from "../../types/pedestrianFilters";
import type { PedestrianSort } from "../../types/pedestrianSort";
import { nextFilteredAndSortedPedestrianIds } from "./filterSort";

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

const NO_FILTERS: PedestrianFilterSelection = {
  mood: "all",
  pace: "all",
  thirst: "all",
};

const NO_SORT: PedestrianSort = {
  column: null,
  direction: "none",
};

describe("nextFilteredAndSortedPedestrianIds", () => {
  it("returns all ids when no filters are selected", () => {
    const pedestrians = [buildPedestrian("a"), buildPedestrian("b")];
    const ids = pedestrians.map((item) => item.id);

    const result = nextFilteredAndSortedPedestrianIds(
      ids,
      buildById(pedestrians),
      NO_FILTERS,
      NO_SORT,
    );

    expect(result).toEqual(["a", "b"]);
  });

  it("applies mood, pace, and thirst filters together", () => {
    const pedestrians = [
      buildPedestrian("a", { mood: "happy", velocity: 6, thirst: 1 }),
      buildPedestrian("b", { mood: "happy", velocity: 3, thirst: 1 }),
      buildPedestrian("c", { mood: "sad", velocity: 6, thirst: 1 }),
      buildPedestrian("d", { mood: "happy", velocity: 6, thirst: 2 }),
    ];
    const ids = pedestrians.map((item) => item.id);

    const result = nextFilteredAndSortedPedestrianIds(
      ids,
      buildById(pedestrians),
      { mood: "happy", pace: "running", thirst: "thirsty" },
      NO_SORT,
    );

    expect(result).toEqual(["a"]);
  });

  it("handles threshold edges for running and thirsty", () => {
    const pedestrians = [
      buildPedestrian("atRunThreshold", { velocity: 5, thirst: 1 }),
      buildPedestrian("aboveRunThreshold", { velocity: 6, thirst: 2 }),
    ];
    const ids = pedestrians.map((item) => item.id);
    const byId = buildById(pedestrians);

    const runningResult = nextFilteredAndSortedPedestrianIds(
      ids,
      byId,
      { mood: "all", pace: "running", thirst: "all" },
      NO_SORT,
    );
    const thirstyResult = nextFilteredAndSortedPedestrianIds(
      ids,
      byId,
      { mood: "all", pace: "all", thirst: "thirsty" },
      NO_SORT,
    );

    expect(runningResult).toEqual(["aboveRunThreshold"]);
    expect(thirstyResult).toEqual(["atRunThreshold"]);
  });

  it("sorts by selected column and direction", () => {
    const pedestrians = [
      buildPedestrian("a", { name: "Zed" }),
      buildPedestrian("b", { name: "Ala" }),
      buildPedestrian("c", { name: "Mona" }),
    ];
    const ids = pedestrians.map((item) => item.id);
    const byId = buildById(pedestrians);

    const asc = nextFilteredAndSortedPedestrianIds(ids, byId, NO_FILTERS, {
      column: "name",
      direction: "asc",
    });
    const desc = nextFilteredAndSortedPedestrianIds(ids, byId, NO_FILTERS, {
      column: "name",
      direction: "desc",
    });

    expect(asc).toEqual(["b", "c", "a"]);
    expect(desc).toEqual(["a", "c", "b"]);
  });
});
