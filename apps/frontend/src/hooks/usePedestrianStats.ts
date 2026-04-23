import { Pedestrian } from "@high-traffic-city-sim/types";
import { useMemo } from "react";

const RUNNING_VELOCITY_THRESHOLD = 5;
const THIRSTY_THRESHOLD = 4;

export interface PedestrianStats {
  totalCount: number;
  pace: {
    runningCount: number;
    walkingCount: number;
  };
  mood: {
    happyCount: number;
    sadCount: number;
    angryCount: number;
    excitedCount: number;
    scaredCount: number;
    shockedCount: number;
  };
  thirst: {
    thirstyCount: number;
    notThirstyCount: number;
  };
}

export function usePedestrianStats(pedestriansMap: Map<string, Pedestrian>): PedestrianStats {
  return useMemo(() => {
    const total = pedestriansMap.size;
    if (total === 0) {
      return {
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
    }

    let runningCount = 0;
    let happyCount = 0;
    let sadCount = 0;
    let angryCount = 0;
    let excitedCount = 0;
    let scaredCount = 0;
    let shockedCount = 0;
    let thirstyCount = 0;

    for (const pedestrian of pedestriansMap.values()) {
      if (pedestrian.velocity > RUNNING_VELOCITY_THRESHOLD) {
        runningCount += 1;
      }
      if (pedestrian.thirst <= THIRSTY_THRESHOLD) {
        thirstyCount += 1;
      }

      switch (pedestrian.mood) {
        case "happy":
          happyCount += 1;
          break;
        case "sad":
          sadCount += 1;
          break;
        case "angry":
          angryCount += 1;
          break;
        case "excited":
          excitedCount += 1;
          break;
        case "scared":
          scaredCount += 1;
          break;
        case "shocked":
          shockedCount += 1;
          break;
      }
    }

    return {
      totalCount: total,
      pace: {
        runningCount,
        walkingCount: total - runningCount,
      },
      mood: {
        happyCount,
        sadCount,
        angryCount,
        excitedCount,
        scaredCount,
        shockedCount,
      },
      thirst: {
        thirstyCount,
        notThirstyCount: total - thirstyCount,
      },
    };
  }, [pedestriansMap]);
}
