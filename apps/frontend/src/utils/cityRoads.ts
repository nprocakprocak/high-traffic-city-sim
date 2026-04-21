import { CityCell, GridPosition } from '../types/cell';

export function extractRoadPositions(cityGrid: CityCell[][]): GridPosition[] {
  return cityGrid
    .flatMap((row, y) => 
      row.map((cell, x) => cell.type === 'road' ? cell.position : null)
  ).filter(Boolean) as GridPosition[];
}

export function getRandomRoadPosition(roadPositions: GridPosition[]): GridPosition | null {
  if (roadPositions.length === 0) {
    return null;
  }

  return roadPositions[Math.floor(Math.random() * roadPositions.length)];
}
