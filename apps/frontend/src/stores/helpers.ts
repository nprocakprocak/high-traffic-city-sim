import type { Pedestrian } from "@high-traffic-city-sim/types";
import {
  MAP_MAX_DISPLAYED_PEDESTRIANS,
  RUNNING_VELOCITY_THRESHOLD,
  THIRSTY_THRESHOLD,
} from "../constants";
import type { PedestrianSort } from "../components/pedestrians/filterList/types";
import type { PedestrianFilterSelection } from "../types/pedestrianFilters";
import type { PedestrianStatsSummary } from "../types/pedestrianStats";

function isRunning(velocity: number): boolean {
  return velocity > RUNNING_VELOCITY_THRESHOLD;
}

function isThirsty(thirst: number): boolean {
  return thirst <= THIRSTY_THRESHOLD;
}

export function nextMapDisplayedPedestrianIds(pedestrianIds: string[]): string[] {
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

function sortFilteredPedestrianIds(
  filteredPedestrianIds: string[],
  pedestriansById: Record<string, Pedestrian>,
  selectedSort: PedestrianSort,
): string[] {
  if (
    filteredPedestrianIds.length <= 1 ||
    selectedSort.direction === "none" ||
    !selectedSort.column
  ) {
    return filteredPedestrianIds;
  }

  const directionFactor = selectedSort.direction === "asc" ? 1 : -1;
  const sortedPedestrianIds = [...filteredPedestrianIds];

  sortedPedestrianIds.sort((leftId, rightId) => {
    const leftPedestrian = pedestriansById[leftId];
    const rightPedestrian = pedestriansById[rightId];
    if (!leftPedestrian || !rightPedestrian) {
      return 0;
    }

    let comparison = 0;
    switch (selectedSort.column) {
      case "name":
        comparison = leftPedestrian.name.localeCompare(rightPedestrian.name);
        break;
      case "mood":
        comparison = leftPedestrian.mood.localeCompare(rightPedestrian.mood);
        break;
      case "pace": {
        const leftPace = leftPedestrian.velocity > RUNNING_VELOCITY_THRESHOLD ? 0 : 1;
        const rightPace = rightPedestrian.velocity > RUNNING_VELOCITY_THRESHOLD ? 0 : 1;
        comparison = leftPace - rightPace;
        break;
      }
      case "thirst": {
        const leftThirst = leftPedestrian.thirst <= THIRSTY_THRESHOLD ? 1 : 0;
        const rightThirst = rightPedestrian.thirst <= THIRSTY_THRESHOLD ? 1 : 0;
        comparison = leftThirst - rightThirst;
        break;
      }
    }

    return comparison * directionFactor;
  });

  return sortedPedestrianIds;
}

export function nextFilteredAndSortedPedestrianIds(
  pedestrianIds: string[],
  pedestriansById: Record<string, Pedestrian>,
  selectedFilters: PedestrianFilterSelection,
  selectedSort: PedestrianSort,
): string[] {
  const filteredPedestrianIds = nextFilteredPedestrianIds(
    pedestrianIds,
    pedestriansById,
    selectedFilters,
  );

  return sortFilteredPedestrianIds(filteredPedestrianIds, pedestriansById, selectedSort);
}

export function nextStats(
  pedestrianIds: string[],
  pedestriansById: Record<string, Pedestrian>,
  selectedFilters: PedestrianFilterSelection,
): PedestrianStatsSummary {
  const stats: PedestrianStatsSummary = {
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

  for (const id of pedestrianIds) {
    const pedestrian = pedestriansById[id];
    if (!pedestrian) {
      continue;
    }

    stats.totalCount += 1;

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

    const moodMatches = selectedFilters.mood === "all" || pedestrian.mood === selectedFilters.mood;
    if (!moodMatches) {
      continue;
    }

    if (isRunning(pedestrian.velocity)) {
      stats.pace.runningCount += 1;
    } else {
      stats.pace.walkingCount += 1;
    }

    const paceMatches =
      selectedFilters.pace === "all" ||
      (selectedFilters.pace === "running"
        ? isRunning(pedestrian.velocity)
        : !isRunning(pedestrian.velocity));
    if (!paceMatches) {
      continue;
    }

    if (isThirsty(pedestrian.thirst)) {
      stats.thirst.thirstyCount += 1;
    } else {
      stats.thirst.notThirstyCount += 1;
    }
  }

  return stats;
}
