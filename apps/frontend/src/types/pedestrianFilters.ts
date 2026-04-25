import type { Pedestrian } from "@high-traffic-city-sim/types";

export interface PedestrianFilterSelection {
  mood: "all" | Pedestrian["mood"];
  pace: "all" | "running" | "walking";
  thirst: "all" | "thirsty" | "notThirsty";
}
