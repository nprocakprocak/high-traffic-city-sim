import type { Pedestrian } from "@high-traffic-city-sim/types";
import { isRunning, isThirsty } from "../../domain/pedestrians/rules";
import type { PedestrianFilterSelection } from "../../types/pedestrianFilters";
import type { PedestrianSort } from "../../types/pedestrianSort";

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
        ? isRunning(pedestrian.velocity)
        : !isRunning(pedestrian.velocity));
    const thirstMatches =
      selectedFilters.thirst === "all" ||
      (selectedFilters.thirst === "thirsty"
        ? isThirsty(pedestrian.thirst)
        : !isThirsty(pedestrian.thirst));

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
        const leftPace = isRunning(leftPedestrian.velocity) ? 0 : 1;
        const rightPace = isRunning(rightPedestrian.velocity) ? 0 : 1;
        comparison = leftPace - rightPace;
        break;
      }
      case "thirst": {
        const leftThirst = isThirsty(leftPedestrian.thirst) ? 1 : 0;
        const rightThirst = isThirsty(rightPedestrian.thirst) ? 1 : 0;
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
