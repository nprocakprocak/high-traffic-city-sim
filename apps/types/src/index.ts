export interface Pedestrian {
  id: string;
  name: string;
  mood: 'happy' | 'sad' | 'angry' | 'excited' | 'scared' | 'shocked';
  velocity: number;
  thirst: number;
  pathPoints?: { x: number; y: number }[];
  destination?: { x: number; y: number };
}

export const PEDESTRIAN_LIMIT_EXCEEDED_SOCKET_EVENT = "pedestrian_limit_exceeded" as const;

export interface PedestrianLimitExceededPayload {
  message: string;
}
