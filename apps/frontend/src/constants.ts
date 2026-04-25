import type { Pedestrian } from "@high-traffic-city-sim/types";

export const CITY_CELL_SIZE = 15;

export const CITY_GRID_ROWS = 30;
export const CITY_GRID_COLS = 50;

export const MAP_MAX_DISPLAYED_PEDESTRIANS = 200;

export const MOOD_EMOJI_MAP: Record<Pedestrian["mood"], string> = {
  happy: "🙂",
  sad: "😢",
  angry: "😡",
  excited: "🤩",
  scared: "😨",
  shocked: "😵‍💫",
};
