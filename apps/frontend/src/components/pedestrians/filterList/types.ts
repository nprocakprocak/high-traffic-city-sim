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

export type PedestrianSortColumn = "name" | "mood" | "pace" | "thirst";
export type PedestrianSortDirection = "asc" | "desc";

export interface PedestrianSort {
  column: PedestrianSortColumn;
  direction: PedestrianSortDirection;
}

export interface PedestrianFilterChip {
  id: string;
  label: string;
}
