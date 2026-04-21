export interface Pedestrian {
  id: string;
  name: string;
  mood: 'happy' | 'sad' | 'neutral';
  velocity: number;
  thirst: number;
  pathPoints?: { x: number; y: number }[];
  destination?: { x: number; y: number };
}
