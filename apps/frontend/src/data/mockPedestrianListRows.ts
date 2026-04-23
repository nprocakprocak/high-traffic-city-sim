import type { Pedestrian } from "@high-traffic-city-sim/types";

export interface MockListPedestrian {
  id: string;
  name: string;
  mood: Pedestrian["mood"];
  velocity: number;
  thirst: number;
}

export const MOCK_PEDESTRIAN_LIST_ROWS: MockListPedestrian[] = [
  { id: "m-1", name: "Avery Park", mood: "happy", velocity: 1.2, thirst: 22 },
  { id: "m-2", name: "Jordan Lee", mood: "sad", velocity: 3.1, thirst: 88 },
  { id: "m-3", name: "Morgan Hill", mood: "angry", velocity: 4.2, thirst: 40 },
  { id: "m-4", name: "Riley Fox", mood: "excited", velocity: 2.8, thirst: 15 },
  { id: "m-5", name: "Quinn Nash", mood: "scared", velocity: 1.9, thirst: 70 },
  { id: "m-6", name: "Sage Brown", mood: "shocked", velocity: 2.2, thirst: 55 },
  { id: "m-7", name: "Casey Reed", mood: "happy", velocity: 3.6, thirst: 8 },
  { id: "m-8", name: "Drew White", mood: "sad", velocity: 1.1, thirst: 90 },
  { id: "m-9", name: "Parker West", mood: "angry", velocity: 4, thirst: 33 },
  { id: "m-10", name: "Alex Kim", mood: "excited", velocity: 2.5, thirst: 12 },
  { id: "m-11", name: "Reese Chen", mood: "scared", velocity: 1.5, thirst: 62 },
  { id: "m-12", name: "Jamie Ortiz", mood: "happy", velocity: 3, thirst: 4 },
  { id: "m-13", name: "Kai Flores", mood: "shocked", velocity: 1.6, thirst: 95 },
  { id: "m-14", name: "Terry Blake", mood: "sad", velocity: 2.4, thirst: 18 },
  { id: "m-15", name: "Dana Singh", mood: "angry", velocity: 4.1, thirst: 50 },
  { id: "m-16", name: "Cameron Ellis", mood: "excited", velocity: 2.9, thirst: 6 },
  { id: "m-17", name: "Jesse Moreno", mood: "happy", velocity: 1, thirst: 77 },
  { id: "m-18", name: "River Cole", mood: "scared", velocity: 2, thirst: 66 },
];
