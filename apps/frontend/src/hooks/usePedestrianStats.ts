import { Pedestrian } from "@high-traffic-city-sim/types";
import { useMemo } from "react";

const RUNNING_VELOCITY_THRESHOLD = 5;

export interface PedestrianStats {
  pace: {
    totalCount: number;
    runningCount: number;
    walkingCount: number;
  };
}

export function usePedestrianStats(pedestriansMap: Map<string, Pedestrian>): PedestrianStats {
  return useMemo(() => {
    const total = pedestriansMap.size;
    if (total === 0) {
      return {
        pace: {
          totalCount: 0,
          runningCount: 0,
          walkingCount: 0,
        },
      };
    }

    let runningCount = 0;

    for (const pedestrian of pedestriansMap.values()) {
      if (pedestrian.velocity > RUNNING_VELOCITY_THRESHOLD) {
        runningCount += 1;
      }
    }

    return {
      pace: {
        totalCount: total,
        runningCount,
        walkingCount: total - runningCount,
      },
    };
  }, [pedestriansMap]);
}
