import type { Pedestrian } from "@high-traffic-city-sim/types";
import type { MoodCountersShape } from "../types";

export function getMoodCount(mood: Pedestrian["mood"], moodCounters: MoodCountersShape): number {
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
