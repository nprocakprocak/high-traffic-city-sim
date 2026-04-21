export type CellType = 'road' | 'building' | 'park' | 'empty';

export interface GridPosition {
  x: number;
  y: number;
}

export interface CityCell {
  type: CellType;
  position: GridPosition;
}
