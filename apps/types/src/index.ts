export interface Pedestrian {
  id: string;
  name: string;
  mood: 'happy' | 'sad' | 'angry' | 'excited' | 'scared' | 'shocked';
  velocity: number;
  thirst: number;
  pathPoints?: { x: number; y: number }[];
  destination?: { x: number; y: number };
}
