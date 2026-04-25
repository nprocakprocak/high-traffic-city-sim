const DEFAULT_SPAWN_MULT = 16;
const MIN_SPAWN_MULT = 1;
const MAX_SPAWN_MULT = 20;
const SPAWN_BASE_MS = 50;

export class PedestrianSpawnService {
  static defaultMultiplier(): number {
    return DEFAULT_SPAWN_MULT;
  }

  static clampMultiplier(value: unknown): number {
    const numericValue = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(numericValue)) {
      return DEFAULT_SPAWN_MULT;
    }

    return Math.min(MAX_SPAWN_MULT, Math.max(MIN_SPAWN_MULT, Math.trunc(numericValue)));
  }

  static intervalMsForMultiplier(multiplier: number): number {
    return SPAWN_BASE_MS * multiplier;
  }

  static batchSizeForMultiplier(multiplier: number): number {
    if (multiplier >= 1 && multiplier <= 2) {
      return 10;
    }
    if (multiplier >= 3 && multiplier <= 5) {
      return 8;
    }
    if (multiplier >= 6 && multiplier <= 9) {
      return 4;
    }
    if (multiplier >= 10 && multiplier <= 15) {
      return 2;
    }

    return 1;
  }
}
