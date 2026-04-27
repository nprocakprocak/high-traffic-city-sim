import { CellType, CityCell } from "../types/cell";

const MIN_FOOTPRINT_SIZE = 4;
const MAX_FOOTPRINT_SIZE = 8;
const ADDITIONAL_PLACEMENT_ATTEMPTS = 30;

interface Position {
  row: number;
  col: number;
}

function randomIntInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createBaseGrid(rows: number, cols: number): CityCell[][] {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      type: "park" as CellType,
      position: { x: col, y: row },
    })),
  );
}

function createBuildingFootprint(): CityCell[][] {
  const width = randomIntInclusive(MIN_FOOTPRINT_SIZE, MAX_FOOTPRINT_SIZE);
  const height = randomIntInclusive(MIN_FOOTPRINT_SIZE, MAX_FOOTPRINT_SIZE);
  const footprint: CityCell[][] = new Array(height);

  for (let row = 0; row < height; row++) {
    const rowCells: CityCell[] = new Array(width);
    const isTopOrBottom = row === 0 || row === height - 1;

    for (let col = 0; col < width; col++) {
      const isBorder = isTopOrBottom || col === 0 || col === width - 1;
      rowCells[col] = { type: isBorder ? "road" : "building", position: { x: col, y: row } };
    }

    footprint[row] = rowCells;
  }

  return footprint;
}

function stampFootprint(
  grid: CityCell[][],
  footprint: CityCell[][],
  startRow: number,
  startCol: number,
): void {
  const footprintRows = footprint.length;
  const footprintCols = footprint[0].length;

  for (let row = 0; row < footprintRows; row++) {
    for (let col = 0; col < footprintCols; col++) {
      grid[startRow + row][startCol + col] = {
        ...footprint[row][col],
        position: {
          x: startCol + col,
          y: startRow + row,
        },
      };
    }
  }
}

function canPlaceWithoutOverlap(
  grid: CityCell[][],
  footprint: CityCell[][],
  startRow: number,
  startCol: number,
): boolean {
  const footprintRows = footprint.length;
  const footprintCols = footprint[0].length;

  for (let row = 0; row < footprintRows; row++) {
    for (let col = 0; col < footprintCols; col++) {
      const targetCellType = grid[startRow + row][startCol + col].type;
      const footprintCellType = footprint[row][col].type;
      const isRoadOnRoadOverlap = targetCellType === "road" && footprintCellType === "road";

      if (targetCellType !== "park" && !isRoadOnRoadOverlap) {
        return false;
      }
    }
  }

  return true;
}

function touchesExistingDevelopment(
  grid: CityCell[][],
  footprint: CityCell[][],
  startRow: number,
  startCol: number,
): boolean {
  const gridRows = grid.length;
  const gridCols = grid[0].length;
  const footprintRows = footprint.length;
  const footprintCols = footprint[0].length;

  for (let row = startRow - 1; row <= startRow + footprintRows; row++) {
    if (row < 0 || row >= gridRows) {
      continue;
    }

    for (let col = startCol - 1; col <= startCol + footprintCols; col++) {
      if (col < 0 || col >= gridCols) {
        continue;
      }

      if (grid[row][col].type !== "park") {
        return true;
      }
    }
  }

  return false;
}

function findCandidatePositions(grid: CityCell[][], footprint: CityCell[][]): Position[] {
  const gridRows = grid.length;
  const gridCols = grid[0].length;
  const footprintRows = footprint.length;
  const footprintCols = footprint[0].length;
  const maxStartRow = gridRows - footprintRows;
  const maxStartCol = gridCols - footprintCols;
  const candidates: Position[] = [];

  if (maxStartRow < 0 || maxStartCol < 0) {
    return candidates;
  }

  for (let row = 0; row <= maxStartRow; row++) {
    for (let col = 0; col <= maxStartCol; col++) {
      if (
        canPlaceWithoutOverlap(grid, footprint, row, col) &&
        touchesExistingDevelopment(grid, footprint, row, col)
      ) {
        candidates.push({ row, col });
      }
    }
  }

  return candidates;
}

function placeSeedBuilding(grid: CityCell[][], footprint: CityCell[][]): boolean {
  const gridRows = grid.length;
  const gridCols = grid[0].length;
  const footprintRows = footprint.length;
  const footprintCols = footprint[0].length;
  const maxStartRow = gridRows - footprintRows;
  const maxStartCol = gridCols - footprintCols;

  if (maxStartRow < 0 || maxStartCol < 0) {
    return false;
  }

  const startRow = randomIntInclusive(0, maxStartRow);
  const startCol = randomIntInclusive(0, maxStartCol);
  stampFootprint(grid, footprint, startRow, startCol);
  return true;
}

function tryPlaceAdjacentBuilding(grid: CityCell[][], footprint: CityCell[][]): boolean {
  const candidates = findCandidatePositions(grid, footprint);
  if (candidates.length === 0) {
    return false;
  }

  const { row, col } = candidates[randomIntInclusive(0, candidates.length - 1)];
  stampFootprint(grid, footprint, row, col);
  return true;
}

export function generateCityGrid(rows: number, cols: number): CityCell[][] {
  if (rows <= 0 || cols <= 0) {
    return [];
  }

  const grid = createBaseGrid(rows, cols);
  const seedFootprint = createBuildingFootprint();

  if (!placeSeedBuilding(grid, seedFootprint)) {
    return grid;
  }

  let attemptsWithoutPlacement = 0;
  while (attemptsWithoutPlacement < ADDITIONAL_PLACEMENT_ATTEMPTS) {
    const placed = tryPlaceAdjacentBuilding(grid, createBuildingFootprint());
    attemptsWithoutPlacement = placed ? 0 : attemptsWithoutPlacement + 1;
  }

  return grid;
}
