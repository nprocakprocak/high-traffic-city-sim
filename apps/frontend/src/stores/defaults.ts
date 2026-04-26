import type { PedestrianSort } from "../types/pedestrianSort";
import type { PedestrianFilterSelection } from "../types/pedestrianFilters";
import type { PedestrianStatsSummary } from "../types/pedestrianStats";

export const EMPTY_STATS: PedestrianStatsSummary = {
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

export const DEFAULT_FILTERS: PedestrianFilterSelection = {
  mood: "all",
  pace: "all",
  thirst: "all",
};

export const DEFAULT_SORT: PedestrianSort = {
  column: null,
  direction: "none",
};
