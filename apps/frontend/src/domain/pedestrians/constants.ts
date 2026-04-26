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

export const MOOD_EMOJI_MAP: Record<Pedestrian["mood"], string> = {
  happy: "🙂",
  sad: "😢",
  angry: "😡",
  excited: "🤩",
  scared: "😨",
  shocked: "😵‍💫",
};
