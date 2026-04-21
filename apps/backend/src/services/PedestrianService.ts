import { randomUUID } from 'crypto';
import { Pedestrian } from '@high-traffic-city-sim/types';

export class PedestrianService {
  private static readonly NAMES = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
    'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter',
    'Quinn', 'Rose', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
    'Yara', 'Zane'
  ];

  private static readonly MOODS: Pedestrian['mood'][] = ['happy', 'sad', 'neutral'];

  static generateRandomPedestrian(): Pedestrian {
    return {
      id: randomUUID(),
      name: this.NAMES[Math.floor(Math.random() * this.NAMES.length)],
      mood: this.MOODS[Math.floor(Math.random() * this.MOODS.length)],
      velocity: Math.floor(Math.random() * 10) + 1, // 1-10
      thirst: Math.floor(Math.random() * 3) + 8 // 8-10
    };
  }
}