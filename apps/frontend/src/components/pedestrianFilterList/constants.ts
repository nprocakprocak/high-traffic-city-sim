import type { Pedestrian } from "@high-traffic-city-sim/types";

export const MOOD_LABEL: Record<Pedestrian["mood"], string> = {
  happy: "Happy",
  sad: "Sad",
  angry: "Angry",
  excited: "Excited",
  scared: "Scared",
  shocked: "Shocked",
};

export const MOOD_ORDER: Pedestrian["mood"][] = [
  "happy",
  "sad",
  "angry",
  "excited",
  "scared",
  "shocked",
];

export const RUNNING_VELOCITY_THRESHOLD = 5;
export const THIRSTY_THRESHOLD = 4;

export const LIST_HEIGHT = 544;
export const ROW_HEIGHT = 40;
export const OVERSCAN_COUNT = 6;

export const ROW_GRID =
  "grid grid-cols-[2.25rem_minmax(0,8.5rem)_minmax(0,6.25rem)_minmax(0,5.25rem)_minmax(0,6.5rem)] items-center gap-2 px-2.5";
