import { memo } from "react";
import { CityCell, GridPosition } from "../types/cell";

interface CityGridProps {
  cityGrid: CityCell[][];
  renderCell: (position: GridPosition) => React.ReactNode;
}

function CityGridComponent({ cityGrid, renderCell }: CityGridProps) {
  const rows = cityGrid.length;
  const cols = cityGrid[0]?.length ?? 0;

  return (
    <div className="[grid-area:1/1]">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div key={colIndex} className="grid">
              {renderCell(cityGrid[rowIndex][colIndex].position)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export const CityGrid = memo(CityGridComponent);
