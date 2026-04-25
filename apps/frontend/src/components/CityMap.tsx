import { CityGrid } from "./CityGrid";
import { GridCell } from "./GridCell";
import { CityCell, GridPosition } from "../types/cell";
import { PedestriansLayer } from "./PedestriansLayer";
import { MAP_MAX_DISPLAYED_PEDESTRIANS } from "../constants";
import { usePedestriansStore } from "../stores/pedestriansStore";
import { useCallback } from "react";

interface CityMapProps {
  cityGrid: CityCell[][];
  onPedestrianStop: (id: string) => void;
}

export function CityMap({ cityGrid, onPedestrianStop }: CityMapProps) {
  const pedestrianCount = usePedestriansStore((s) => s.pedestrianIds.length);
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
      <PedestriansLayer onPedestrianStop={onPedestrianStop} />
      {pedestrianCount > MAP_MAX_DISPLAYED_PEDESTRIANS ? (
        <p
          className="pointer-events-none absolute bottom-0 right-0 z-10 max-w-[min(100%,18rem)] bg-stone-100/95 px-2 py-1.5 text-right text-[10px] leading-tight text-stone-600 sm:text-xs"
          role="status"
        >
          The city map displays only the last {MAP_MAX_DISPLAYED_PEDESTRIANS} pedestrians.
        </p>
      ) : null}
    </div>
  );
}
