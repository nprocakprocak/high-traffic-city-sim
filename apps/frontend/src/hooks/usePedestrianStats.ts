import { Pedestrian } from "@high-traffic-city-sim/types";
import { useMemo } from "react";

const RUNNING_VELOCITY_THRESHOLD = 5;

export interface PedestrianStats {
  pace: {
    runningPercent: number;
    walkingPercent: number;
  };
}

export function usePedestrianStats(pedestriansMap: Map<string, Pedestrian>): PedestrianStats {
  return useMemo(() => {
    const total = pedestriansMap.size;
    if (total === 0) {
      return {
        pace: {
          runningPercent: 0,
          walkingPercent: 0,
        },
      };
    }

    let runningCount = 0;

    for (const pedestrian of pedestriansMap.values()) {
      if (pedestrian.velocity > RUNNING_VELOCITY_THRESHOLD) {
        runningCount += 1;
      }
    }

    const runningPercent = Math.round((runningCount / total) * 100);

    return {
      pace: {
        runningPercent,
        walkingPercent: 100 - runningPercent,
      },
    };
  }, [pedestriansMap]);
}
