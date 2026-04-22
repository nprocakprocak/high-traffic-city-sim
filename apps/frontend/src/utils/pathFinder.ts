import { CITY_CELL_SIZE } from "../constants";
import { CityCell, GridPosition } from "../types/cell";

export function findPath(
  cityGrid: CityCell[][],
  from: GridPosition,
  to: GridPosition,
): GridPosition[] {
  const height = cityGrid.length;
  if (height === 0) return [];

  const width = cityGrid[0]?.length ?? 0;
  if (width === 0) return [];

  const inBounds = (position: GridPosition): boolean =>
    position.y >= 0 && position.y < height && position.x >= 0 && position.x < width;

  const isRoad = (position: GridPosition): boolean =>
    inBounds(position) && cityGrid[position.y][position.x].type === "road";

  if (!isRoad(from) || !isRoad(to)) return [];

  const keyOf = (position: GridPosition): string => `${position.x},${position.y}`;
  const heuristic = (a: GridPosition, b: GridPosition): number =>
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  const openSet: GridPosition[] = [from];
  const cameFrom = new Map<string, GridPosition>();
  const gScore = new Map<string, number>([[keyOf(from), 0]]);
  const fScore = new Map<string, number>([[keyOf(from), heuristic(from, to)]]);

  const directions: GridPosition[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  while (openSet.length > 0) {
    let currentIndex = 0;
    let current = openSet[0];
    let currentBestF = fScore.get(keyOf(current)) ?? Infinity;

    for (let i = 1; i < openSet.length; i++) {
      const candidate = openSet[i];
      const candidateF = fScore.get(keyOf(candidate)) ?? Infinity;
      if (candidateF < currentBestF) {
        current = candidate;
        currentIndex = i;
        currentBestF = candidateF;
      }
    }

    if (current.x === to.x && current.y === to.y) {
      const path: GridPosition[] = [current];
      let currentKey = keyOf(current);

      while (cameFrom.has(currentKey)) {
        const previous = cameFrom.get(currentKey)!;
        path.push(previous);
        currentKey = keyOf(previous);
      }

      return path.reverse();
    }

    openSet.splice(currentIndex, 1);
    const currentG = gScore.get(keyOf(current)) ?? Infinity;

    for (const direction of directions) {
      const neighbor: GridPosition = {
        x: current.x + direction.x,
        y: current.y + direction.y,
      };

      if (!isRoad(neighbor)) continue;

      const neighborKey = keyOf(neighbor);
      const tentativeG = currentG + 1;

      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + heuristic(neighbor, to));

        if (!openSet.some((pos) => pos.x === neighbor.x && pos.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return [];
}

export function convertToOffsetPath(startPosition: GridPosition, path: GridPosition[]): string {
  const toPixels = (position: GridPosition): GridPosition => ({
    x: position.x * CITY_CELL_SIZE + CITY_CELL_SIZE / 2,
    y: position.y * CITY_CELL_SIZE + CITY_CELL_SIZE / 2,
  });

  const startInPixels = toPixels(startPosition);
  const segments = [`M ${startInPixels.x} ${startInPixels.y}`];

  for (const point of path) {
    if (point.x === startPosition.x && point.y === startPosition.y) {
      continue;
    }

    const pointInPixels = toPixels(point);
    segments.push(`L ${pointInPixels.x} ${pointInPixels.y}`);
  }

  return `path("${segments.join(" ")}")`;
}

export function convertGridPathToPixelPoints(path: GridPosition[]): GridPosition[] {
  return path.map((position) => ({
    x: position.x * CITY_CELL_SIZE + CITY_CELL_SIZE / 2,
    y: position.y * CITY_CELL_SIZE + CITY_CELL_SIZE / 2,
  }));
}
