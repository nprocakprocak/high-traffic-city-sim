import type { Pedestrian } from "@high-traffic-city-sim/types";
import { create } from "zustand";
import type { PedestrianSort } from "../types/pedestrianSort";
import { DEFAULT_FILTERS, DEFAULT_SORT, EMPTY_STATS } from "./defaults";
import { nextFilteredAndSortedPedestrianIds } from "./helpers/filterSort";
import { nextMapDisplayedPedestrianIds } from "./helpers/mapDisplay";
import { nextStats } from "./helpers/stats";
import type { PedestriansState } from "./types";
export type { PedestrianFieldUpdates, PedestrianUpdate } from "./types";

export const usePedestriansStore = create<PedestriansState>((set) => ({
  pedestrianIds: [],
  filteredPedestrianIds: [],
  mapDisplayedPedestrianIds: [],
  pedestriansById: {},
  stats: EMPTY_STATS,
  eventsPerSecond: 0,
  selectedFilters: DEFAULT_FILTERS,
  selectedSort: DEFAULT_SORT,
  setSelectedSortColumn: (column) =>
    set((state) => {
      let nextSort: PedestrianSort;
      if (state.selectedSort.column !== column || state.selectedSort.direction === "none") {
        nextSort = {
          column,
          direction: "asc",
        };
      } else if (state.selectedSort.direction === "asc") {
        nextSort = {
          column,
          direction: "desc",
        };
      } else {
        nextSort = {
          column: null,
          direction: "none",
        };
      }

      return {
        selectedSort: nextSort,
        filteredPedestrianIds: nextFilteredAndSortedPedestrianIds(
          state.pedestrianIds,
          state.pedestriansById,
          state.selectedFilters,
          nextSort,
        ),
      };
    }),
  setSelectedFilters: (filters) =>
    set((state) => ({
      selectedFilters: filters,
      filteredPedestrianIds: nextFilteredAndSortedPedestrianIds(
        state.pedestrianIds,
        state.pedestriansById,
        filters,
        state.selectedSort,
      ),
      stats: nextStats(state.pedestrianIds, state.pedestriansById, filters),
    })),
  setEventsPerSecond: (value) => set({ eventsPerSecond: value }),
  addPedestrians: (incoming) =>
    set((state) => {
      if (incoming.length === 0) {
        return state;
      }
      const nextById: Record<string, Pedestrian> = { ...state.pedestriansById };
      for (const p of incoming) {
        nextById[p.id] = p;
      }

      const newIdOrder: string[] = [];
      for (const p of incoming) {
        newIdOrder.push(p.id);
      }

      const nextPedestrianIds = [...state.pedestrianIds, ...newIdOrder];

      return {
        pedestrianIds: nextPedestrianIds,
        filteredPedestrianIds: nextFilteredAndSortedPedestrianIds(
          nextPedestrianIds,
          nextById,
          state.selectedFilters,
          state.selectedSort,
        ),
        mapDisplayedPedestrianIds: nextMapDisplayedPedestrianIds(nextPedestrianIds),
        pedestriansById: nextById,
        stats: nextStats(nextPedestrianIds, nextById, state.selectedFilters),
      };
    }),
  updatePedestrians: (items) =>
    set((state) => {
      if (items.length === 0) {
        return state;
      }

      const nextById: Record<string, Pedestrian> = { ...state.pedestriansById };

      for (const { id, updates } of items) {
        const current = nextById[id];
        if (!current) {
          continue;
        }

        const nextPedestrian: Pedestrian = {
          ...current,
          ...updates,
        };
        nextById[id] = nextPedestrian;
      }

      return {
        pedestriansById: nextById,
        filteredPedestrianIds: nextFilteredAndSortedPedestrianIds(
          state.pedestrianIds,
          nextById,
          state.selectedFilters,
          state.selectedSort,
        ),
        stats: nextStats(state.pedestrianIds, nextById, state.selectedFilters),
      };
    }),
  removePedestrians: (ids) =>
    set((state) => {
      if (ids.length === 0) {
        return state;
      }
      const toRemove = new Set(ids);
      const nextById: Record<string, Pedestrian> = { ...state.pedestriansById };

      for (const id of toRemove) {
        const current = nextById[id];
        if (!current) {
          continue;
        }
        delete nextById[id];
      }

      const nextPedestrianIds = state.pedestrianIds.filter(
        (pedestrianId) => !toRemove.has(pedestrianId),
      );

      return {
        pedestrianIds: nextPedestrianIds,
        filteredPedestrianIds: nextFilteredAndSortedPedestrianIds(
          nextPedestrianIds,
          nextById,
          state.selectedFilters,
          state.selectedSort,
        ),
        mapDisplayedPedestrianIds: nextMapDisplayedPedestrianIds(nextPedestrianIds),
        pedestriansById: nextById,
        stats: nextStats(nextPedestrianIds, nextById, state.selectedFilters),
      };
    }),
}));
