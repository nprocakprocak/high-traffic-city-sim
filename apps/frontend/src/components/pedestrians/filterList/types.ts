import type { Pedestrian } from "@high-traffic-city-sim/types";

export interface PedestrianFilterListProps {
  pedestrians: Pedestrian[];
  totalCount: number;
  paceCounters: {
    runningCount: number;
    walkingCount: number;
  };
  moodCounters: {
    happyCount: number;
    sadCount: number;
    angryCount: number;
    excitedCount: number;
    scaredCount: number;
    shockedCount: number;
  };
  thirstCounters: {
    thirstyCount: number;
    notThirstyCount: number;
  };
}

export type MoodCountersShape = PedestrianFilterListProps["moodCounters"];

export type PedestrianRowListProps = {
  pedestrians: Pedestrian[];
};
