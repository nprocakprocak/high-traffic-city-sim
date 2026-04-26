import type { Pedestrian } from "@high-traffic-city-sim/types";
import type { PedestrianSort, PedestrianSortColumn } from "../types/pedestrianSort";
import type { PedestrianFilterSelection } from "../types/pedestrianFilters";
import type { PedestrianStatsSummary } from "../types/pedestrianStats";

export type PedestrianFieldUpdates = Partial<Omit<Pedestrian, "id">>;
export type PedestrianUpdate = { id: string; updates: PedestrianFieldUpdates };

export interface PedestriansState {
  pedestrianIds: string[];
  filteredPedestrianIds: string[];
  mapDisplayedPedestrianIds: string[];
  pedestriansById: Record<string, Pedestrian>;
  stats: PedestrianStatsSummary;
  selectedFilters: PedestrianFilterSelection;
  selectedSort: PedestrianSort;
  setSelectedSortColumn: (column: PedestrianSortColumn) => void;
  setSelectedFilters: (filters: PedestrianFilterSelection) => void;
  addPedestrians: (pedestrians: Pedestrian[]) => void;
  updatePedestrians: (items: PedestrianUpdate[]) => void;
  removePedestrians: (ids: string[]) => void;
}
