import { CityGrid } from "./CityGrid";
import { GridCell } from "./GridCell";
import { CityCell, GridPosition } from "../types/cell";
import { Pedestrian } from "@high-traffic-city-sim/types";
import { PedestriansLayer } from "./PedestriansLayer";
import { useCallback } from "react";

interface CityMapProps {
  cityGrid: CityCell[][];
  pedestrians: Pedestrian[];
  onPedestrianStop: (id: string) => void;
}

export function CityMap({ cityGrid, pedestrians, onPedestrianStop }: CityMapProps) {
  const rows = cityGrid.length;
  const cols = cityGrid[0]?.length ?? 0;

  const renderCell = useCallback(
    (position: GridPosition) => {
      return (
        <GridCell
          isLastRow={position.y === rows - 1}
          isLastColumn={position.x === cols - 1}
          type={cityGrid[position.y][position.x].type}
        />
      );
    },
    [cityGrid, rows, cols],
  );

  return (
    <div className="relative grid">
      <CityGrid cityGrid={cityGrid} renderCell={renderCell} />
      <PedestriansLayer pedestrians={pedestrians} onPedestrianStop={onPedestrianStop} />
    </div>
  );
}
