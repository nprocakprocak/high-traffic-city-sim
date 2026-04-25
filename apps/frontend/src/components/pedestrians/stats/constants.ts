import { Pedestrian } from "@high-traffic-city-sim/types";

export const PIE_CENTER = 50;
export const PIE_RADIUS = 44;
export const PIE_ANIMATION_DURATION_MS = 180;

export const MOOD_COLORS: Record<Pedestrian["mood"], string> = {
  happy: "#5dbe8f",
  sad: "#4fa8d4",
  angry: "#e09090",
  excited: "#e0b84a",
  scared: "#8f7fd4",
  shocked: "#d484a8",
};

export const MOOD_ORDER: Pedestrian["mood"][] = [
  "happy",
  "sad",
  "angry",
  "excited",
  "scared",
  "shocked",
];
