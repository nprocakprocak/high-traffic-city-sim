export type PedestrianSortColumn = "name" | "mood" | "pace" | "thirst";
export type PedestrianSortDirection = "none" | "asc" | "desc";

export interface PedestrianSort {
  column: PedestrianSortColumn | null;
  direction: PedestrianSortDirection;
}
