import type { Pedestrian } from "@high-traffic-city-sim/types";

export const CITY_CELL_SIZE = 15;

export const CITY_GRID_ROWS = 30;
export const CITY_GRID_COLS = 50;

export const MAP_MAX_DISPLAYED_PEDESTRIANS = 200;

export const PEDESTRIAN_WEBSOCKET_BUFFERING_THRESHOLD = 1500;
export const PEDESTRIAN_WEBSOCKET_BUFFER_FLUSH_MS = 200;
export const RUNNING_VELOCITY_THRESHOLD = 5;
export const THIRSTY_THRESHOLD = 1;

export const MOOD_EMOJI_MAP: Record<Pedestrian["mood"], string> = {
  happy: "🙂",
  sad: "😢",
  angry: "😡",
  excited: "🤩",
  scared: "😨",
  shocked: "😵‍💫",
};
