import type { Pedestrian } from "@high-traffic-city-sim/types";
import { create } from "zustand";
import {
  MAP_MAX_DISPLAYED_PEDESTRIANS,
  RUNNING_VELOCITY_THRESHOLD,
  THIRSTY_THRESHOLD,
} from "../constants";
import type { PedestrianFilterSelection } from "../types/pedestrianFilters";
import type { PedestrianStatsSummary } from "../types/pedestrianStats";

export type PedestrianFieldUpdates = Partial<Omit<Pedestrian, "id">>;
export type PedestrianUpdate = { id: string; updates: PedestrianFieldUpdates };

interface PedestriansState {
  pedestrianIds: string[];
  filteredPedestrianIds: string[];
  mapDisplayedPedestrianIds: string[];
  pedestriansById: Record<string, Pedestrian>;
  stats: PedestrianStatsSummary;
  selectedFilters: PedestrianFilterSelection;
  setSelectedFilters: (filters: PedestrianFilterSelection) => void;
  addPedestrians: (pedestrians: Pedestrian[]) => void;
  updatePedestrians: (items: PedestrianUpdate[]) => void;
  removePedestrians: (ids: string[]) => void;
}

const EMPTY_STATS: PedestrianStatsSummary = {
  totalCount: 0,
  pace: {
    runningCount: 0,
    walkingCount: 0,
  },
  mood: {
    happyCount: 0,
    sadCount: 0,
    angryCount: 0,
    excitedCount: 0,
    scaredCount: 0,
    shockedCount: 0,
  },
  thirst: {
    thirstyCount: 0,
    notThirstyCount: 0,
  },
};

const DEFAULT_FILTERS: PedestrianFilterSelection = {
  mood: "all",
  pace: "all",
  thirst: "all",
};

function addPace(stats: PedestrianStatsSummary, pedestrian: Pedestrian): void {
  if (pedestrian.velocity > RUNNING_VELOCITY_THRESHOLD) {
    stats.pace.runningCount += 1;
  } else {
    stats.pace.walkingCount += 1;
  }
}

function removePace(stats: PedestrianStatsSummary, pedestrian: Pedestrian): void {
  if (pedestrian.velocity > RUNNING_VELOCITY_THRESHOLD) {
    stats.pace.runningCount -= 1;
  } else {
    stats.pace.walkingCount -= 1;
  }
}

function addThirst(stats: PedestrianStatsSummary, pedestrian: Pedestrian): void {
  if (pedestrian.thirst <= THIRSTY_THRESHOLD) {
    stats.thirst.thirstyCount += 1;
  } else {
    stats.thirst.notThirstyCount += 1;
  }
}

function removeThirst(stats: PedestrianStatsSummary, pedestrian: Pedestrian): void {
  if (pedestrian.thirst <= THIRSTY_THRESHOLD) {
    stats.thirst.thirstyCount -= 1;
  } else {
    stats.thirst.notThirstyCount -= 1;
  }
}

function addMood(stats: PedestrianStatsSummary, pedestrian: Pedestrian): void {
  switch (pedestrian.mood) {
    case "happy":
      stats.mood.happyCount += 1;
      break;
    case "sad":
      stats.mood.sadCount += 1;
      break;
    case "angry":
      stats.mood.angryCount += 1;
      break;
    case "excited":
      stats.mood.excitedCount += 1;
      break;
    case "scared":
      stats.mood.scaredCount += 1;
      break;
    case "shocked":
      stats.mood.shockedCount += 1;
      break;
  }
}

function removeMood(stats: PedestrianStatsSummary, pedestrian: Pedestrian): void {
  switch (pedestrian.mood) {
    case "happy":
      stats.mood.happyCount -= 1;
      break;
    case "sad":
      stats.mood.sadCount -= 1;
      break;
    case "angry":
      stats.mood.angryCount -= 1;
      break;
    case "excited":
      stats.mood.excitedCount -= 1;
      break;
    case "scared":
      stats.mood.scaredCount -= 1;
      break;
    case "shocked":
      stats.mood.shockedCount -= 1;
      break;
  }
}

function cloneStats(source: PedestrianStatsSummary): PedestrianStatsSummary {
  return {
    totalCount: source.totalCount,
    pace: { ...source.pace },
    mood: { ...source.mood },
    thirst: { ...source.thirst },
  };
}

function applyAddStats(
  source: PedestrianStatsSummary,
  pedestrian: Pedestrian,
): PedestrianStatsSummary {
  const stats = cloneStats(source);
  stats.totalCount += 1;
  addPace(stats, pedestrian);
  addThirst(stats, pedestrian);
  addMood(stats, pedestrian);
  return stats;
}

function applyRemoveStats(
  source: PedestrianStatsSummary,
  pedestrian: Pedestrian,
): PedestrianStatsSummary {
  const stats = cloneStats(source);
  stats.totalCount -= 1;
  removePace(stats, pedestrian);
  removeThirst(stats, pedestrian);
  removeMood(stats, pedestrian);
  return stats;
}

function nextMapDisplayedPedestrianIds(pedestrianIds: string[]): string[] {
  if (pedestrianIds.length <= MAP_MAX_DISPLAYED_PEDESTRIANS) {
    return pedestrianIds;
  }
  return pedestrianIds.slice(-MAP_MAX_DISPLAYED_PEDESTRIANS);
}

function nextFilteredPedestrianIds(
  pedestrianIds: string[],
  pedestriansById: Record<string, Pedestrian>,
  selectedFilters: PedestrianFilterSelection,
): string[] {
  if (
    selectedFilters.mood === "all" &&
    selectedFilters.pace === "all" &&
    selectedFilters.thirst === "all"
  ) {
    return pedestrianIds;
  }

  return pedestrianIds.filter((id) => {
    const pedestrian = pedestriansById[id];
    if (!pedestrian) {
      return false;
    }

    const moodMatches = selectedFilters.mood === "all" || pedestrian.mood === selectedFilters.mood;
    const paceMatches =
      selectedFilters.pace === "all" ||
      (selectedFilters.pace === "running"
        ? pedestrian.velocity > RUNNING_VELOCITY_THRESHOLD
        : pedestrian.velocity <= RUNNING_VELOCITY_THRESHOLD);
    const thirstMatches =
      selectedFilters.thirst === "all" ||
      (selectedFilters.thirst === "thirsty"
        ? pedestrian.thirst <= THIRSTY_THRESHOLD
        : pedestrian.thirst > THIRSTY_THRESHOLD);

    return moodMatches && paceMatches && thirstMatches;
  });
}

export const usePedestriansStore = create<PedestriansState>((set) => ({
  pedestrianIds: [],
  filteredPedestrianIds: [],
  mapDisplayedPedestrianIds: [],
  pedestriansById: {},
  stats: EMPTY_STATS,
  selectedFilters: DEFAULT_FILTERS,
  setSelectedFilters: (filters) =>
    set((state) => ({
      selectedFilters: filters,
      filteredPedestrianIds: nextFilteredPedestrianIds(
        state.pedestrianIds,
        state.pedestriansById,
        filters,
      ),
    })),
  addPedestrians: (incoming) =>
    set((state) => {
      if (incoming.length === 0) {
        return state;
      }
      const nextById: Record<string, Pedestrian> = { ...state.pedestriansById };
      for (const p of incoming) {
        nextById[p.id] = p;
      }

      const newIdOrder: string[] = [];
      let nextStats = cloneStats(state.stats);

      for (const p of incoming) {
        newIdOrder.push(p.id);
        nextStats = applyAddStats(nextStats, p);
      }

      const nextPedestrianIds = [...state.pedestrianIds, ...newIdOrder];

      return {
        pedestrianIds: nextPedestrianIds,
        filteredPedestrianIds: nextFilteredPedestrianIds(
          nextPedestrianIds,
          nextById,
          state.selectedFilters,
        ),
        mapDisplayedPedestrianIds: nextMapDisplayedPedestrianIds(nextPedestrianIds),
        pedestriansById: nextById,
        stats: nextStats,
      };
    }),
  updatePedestrians: (items) =>
    set((state) => {
      if (items.length === 0) {
        return state;
      }

      const nextById: Record<string, Pedestrian> = { ...state.pedestriansById };
      let nextStats: PedestrianStatsSummary = cloneStats(state.stats);

      for (const { id, updates } of items) {
        const current = nextById[id];
        if (!current) {
          continue;
        }

        // anyUpdated = true;
        const nextPedestrian: Pedestrian = {
          ...current,
          ...updates,
        };
        const paceChanged =
          current.velocity > RUNNING_VELOCITY_THRESHOLD !==
          nextPedestrian.velocity > RUNNING_VELOCITY_THRESHOLD;
        const thirstChanged =
          current.thirst <= THIRSTY_THRESHOLD !== nextPedestrian.thirst <= THIRSTY_THRESHOLD;
        const moodChanged = current.mood !== nextPedestrian.mood;

        nextById[id] = nextPedestrian;

        if (!paceChanged && !thirstChanged && !moodChanged) {
          continue;
        }

        if (paceChanged) {
          removePace(nextStats, current);
          addPace(nextStats, nextPedestrian);
        }
        if (thirstChanged) {
          removeThirst(nextStats, current);
          addThirst(nextStats, nextPedestrian);
        }
        if (moodChanged) {
          removeMood(nextStats, current);
          addMood(nextStats, nextPedestrian);
        }
      }

      return {
        pedestriansById: nextById,
        filteredPedestrianIds: nextFilteredPedestrianIds(
          state.pedestrianIds,
          nextById,
          state.selectedFilters,
        ),
        stats: nextStats,
      };
    }),
  removePedestrians: (ids) =>
    set((state) => {
      if (ids.length === 0) {
        return state;
      }
      const toRemove = new Set(ids);
      const nextById: Record<string, Pedestrian> = { ...state.pedestriansById };
      let nextStats: PedestrianStatsSummary = state.stats;

      for (const id of toRemove) {
        const current = nextById[id];
        if (!current) {
          continue;
        }
        delete nextById[id];
        nextStats = applyRemoveStats(nextStats, current);
      }

      const nextPedestrianIds = state.pedestrianIds.filter(
        (pedestrianId) => !toRemove.has(pedestrianId),
      );

      return {
        pedestrianIds: nextPedestrianIds,
        filteredPedestrianIds: nextFilteredPedestrianIds(
          nextPedestrianIds,
          nextById,
          state.selectedFilters,
        ),
        mapDisplayedPedestrianIds: nextMapDisplayedPedestrianIds(nextPedestrianIds),
        pedestriansById: nextById,
        stats: nextStats,
      };
    }),
}));
