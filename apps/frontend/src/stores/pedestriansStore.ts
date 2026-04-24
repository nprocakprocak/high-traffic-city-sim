import type { Pedestrian } from "@high-traffic-city-sim/types";
import { create } from "zustand";

const RUNNING_VELOCITY_THRESHOLD = 5;
const THIRSTY_THRESHOLD = 4;

export interface PedestrianStatsMoodCounters {
  happyCount: number;
  sadCount: number;
  angryCount: number;
  excitedCount: number;
  scaredCount: number;
  shockedCount: number;
}

export interface PedestrianStatsPaceCounters {
  runningCount: number;
  walkingCount: number;
}

export interface PedestrianStatsThirstCounters {
  thirstyCount: number;
  notThirstyCount: number;
}

export interface PedestrianStatsSummary {
  totalCount: number;
  pace: PedestrianStatsPaceCounters;
  mood: PedestrianStatsMoodCounters;
  thirst: PedestrianStatsThirstCounters;
}

interface PedestriansState {
  pedestrianIds: string[];
  pedestriansById: Record<string, Pedestrian>;
  stats: PedestrianStatsSummary;
  addPedestrian: (pedestrian: Pedestrian) => void;
  updatePedestrian: (id: string, updates: Partial<Omit<Pedestrian, "id">>) => void;
  removePedestrian: (id: string) => void;
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

function applyAddStats(source: PedestrianStatsSummary, pedestrian: Pedestrian): PedestrianStatsSummary {
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

export const usePedestriansStore = create<PedestriansState>((set) => ({
  pedestrianIds: [],
  pedestriansById: {},
  stats: EMPTY_STATS,
  addPedestrian: (pedestrian) =>
    set((state) => {
      const existing = state.pedestriansById[pedestrian.id];
      if (existing) {
        return {
          pedestriansById: {
            ...state.pedestriansById,
            [pedestrian.id]: pedestrian,
          },
        };
      }

      return {
        pedestrianIds: [...state.pedestrianIds, pedestrian.id],
        pedestriansById: {
          ...state.pedestriansById,
          [pedestrian.id]: pedestrian,
        },
        stats: applyAddStats(state.stats, pedestrian),
      };
    }),
  updatePedestrian: (id, updates) =>
    set((state) => {
      const current = state.pedestriansById[id];
      if (!current) {
        return state;
      }

      const nextPedestrian = {
        ...current,
        ...updates,
      };
      const paceChanged =
        (current.velocity > RUNNING_VELOCITY_THRESHOLD) !==
        (nextPedestrian.velocity > RUNNING_VELOCITY_THRESHOLD);
      const thirstChanged =
        (current.thirst <= THIRSTY_THRESHOLD) !== (nextPedestrian.thirst <= THIRSTY_THRESHOLD);
      const moodChanged = current.mood !== nextPedestrian.mood;

      if (!paceChanged && !thirstChanged && !moodChanged) {
        return {
          pedestriansById: {
            ...state.pedestriansById,
            [id]: nextPedestrian,
          },
        };
      }

      const stats = cloneStats(state.stats);
      if (paceChanged) {
        removePace(stats, current);
        addPace(stats, nextPedestrian);
      }
      if (thirstChanged) {
        removeThirst(stats, current);
        addThirst(stats, nextPedestrian);
      }
      if (moodChanged) {
        removeMood(stats, current);
        addMood(stats, nextPedestrian);
      }

      return {
        pedestriansById: {
          ...state.pedestriansById,
          [id]: nextPedestrian,
        },
        stats,
      };
    }),
  removePedestrian: (id) =>
    set((state) => {
      const current = state.pedestriansById[id];
      if (!current) {
        return state;
      }

      const nextById = { ...state.pedestriansById };
      delete nextById[id];

      return {
        pedestrianIds: state.pedestrianIds.filter((pedestrianId) => pedestrianId !== id),
        pedestriansById: nextById,
        stats: applyRemoveStats(state.stats, current),
      };
    }),
}));
