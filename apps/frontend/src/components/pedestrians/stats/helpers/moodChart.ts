import type { Pedestrian } from "@high-traffic-city-sim/types";
import { PedestrianStatsMoodCounters } from "../types";

export function moodLabel(mood: Pedestrian["mood"]): string {
  const labels: Record<Pedestrian["mood"], string> = {
    happy: "Happy",
    sad: "Sad",
    angry: "Angry",
    excited: "Excited",
    scared: "Scared",
    shocked: "Shocked",
  };
  return labels[mood];
}

export function moodCount(
  mood: Pedestrian["mood"],
  moodCounters: PedestrianStatsMoodCounters,
): number {
  switch (mood) {
    case "happy":
      return moodCounters.happyCount;
    case "sad":
      return moodCounters.sadCount;
    case "angry":
      return moodCounters.angryCount;
    case "excited":
      return moodCounters.excitedCount;
    case "scared":
      return moodCounters.scaredCount;
    case "shocked":
      return moodCounters.shockedCount;
  }
}

