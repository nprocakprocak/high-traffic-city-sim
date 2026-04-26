import type { Pedestrian } from "@high-traffic-city-sim/types";
import { getMoodCount } from "../../domain/pedestrians/stats";
import { isRunning, isThirsty } from "../../domain/pedestrians/rules";
import type { PedestrianFilterSelection } from "../../types/pedestrianFilters";
import type { PedestrianStatsSummary } from "../../types/pedestrianStats";

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
    const currentMoodCount = getMoodCount(pedestrian.mood, stats.mood);
    const nextMoodCount = currentMoodCount + 1;

    switch (pedestrian.mood) {
      case "happy":
        stats.mood.happyCount = nextMoodCount;
        break;
      case "sad":
        stats.mood.sadCount = nextMoodCount;
        break;
      case "angry":
        stats.mood.angryCount = nextMoodCount;
        break;
      case "excited":
        stats.mood.excitedCount = nextMoodCount;
        break;
      case "scared":
        stats.mood.scaredCount = nextMoodCount;
        break;
      case "shocked":
        stats.mood.shockedCount = nextMoodCount;
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
