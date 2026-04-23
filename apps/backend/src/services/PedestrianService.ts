import { randomUUID } from 'crypto';
import { Pedestrian } from '@high-traffic-city-sim/types';

export class PedestrianService {
  private static readonly NAMES = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
    'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter',
    'Quinn', 'Rose', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
    'Yara', 'Zane'
  ];

  private static readonly MOOD_WEIGHTS: { mood: Pedestrian["mood"]; cumulativeWeight: number }[] = [
    { mood: "happy", cumulativeWeight: 47 },
    { mood: "sad", cumulativeWeight: 60 },
    { mood: "angry", cumulativeWeight: 68 },
    { mood: "excited", cumulativeWeight: 84 },
    { mood: "scared", cumulativeWeight: 91 },
    { mood: "shocked", cumulativeWeight: 100 },
  ];

  static randomMood(): Pedestrian["mood"] {
    const roll = Math.random() * 100;

    for (const { mood, cumulativeWeight } of this.MOOD_WEIGHTS) {
      if (roll < cumulativeWeight) {
        return mood;
      }
    }

    return "shocked";
  }

  static randomVelocity(): number {
    const lowRange = [2, 3, 4];
    const highRange = [7, 8, 9, 10];
    const selectedRange = Math.random() < 0.7 ? lowRange : highRange;
    return selectedRange[Math.floor(Math.random() * selectedRange.length)];
  }

  static randomRemovalDelayMs(): number {
    const seconds = 30 + Math.floor(Math.random() * 271); // 30-300 seconds
    return seconds * 1000;
  }

  static randomVelocityUpdateDelayMs(): number {
    const seconds = 2 + Math.floor(Math.random() * 5); // 2-6 seconds
    return seconds * 1000;
  }

  static randomPedestrianUpdate(): Pick<Pedestrian, "velocity"> | Pick<Pedestrian, "mood"> {
    if (Math.random() < 0.5) {
      return { velocity: this.randomVelocity() };
    }
    return { mood: this.randomMood() };
  }

  static generateRandomPedestrian(): Pedestrian {
    return {
      id: randomUUID(),
      name: this.NAMES[Math.floor(Math.random() * this.NAMES.length)],
      mood: this.randomMood(),
      velocity: this.randomVelocity(),
      thirst: Math.floor(Math.random() * 3) + 8 // 8-10
    };
  }
}