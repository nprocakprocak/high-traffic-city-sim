import type { Pedestrian } from "@high-traffic-city-sim/types";
import type {
  PedestrianStatsMoodCounters,
  PedestrianStatsPaceCounters,
  PedestrianStatsThirstCounters,
} from "../../../types/pedestrianStats";

export interface PedestrianFilterListProps {
  totalCount: number;
  paceCounters: PedestrianStatsPaceCounters;
  moodCounters: PedestrianStatsMoodCounters;
  thirstCounters: PedestrianStatsThirstCounters;
}

export type MoodCountersShape = PedestrianFilterListProps["moodCounters"];

export interface PedestrianRowListProps {
  getPedestrianId: (index: number) => string | undefined;
}

export interface PedestrianFilterSelection {
  mood: "all" | Pedestrian["mood"];
  pace: "all" | "running" | "walking";
  thirst: "all" | "thirsty" | "notThirsty";
}

export interface PedestrianFilterChip {
  id: string;
  label: string;
}
