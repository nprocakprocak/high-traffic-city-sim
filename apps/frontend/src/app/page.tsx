"use client";

import { usePedestrians } from "../hooks/usePedestrians";
import { ErrorDisplay } from "../components/ErrorDisplay";
import { CityMap } from "../components/CityMap";
import { PedestrianStatsPanel } from "../components/PedestrianStatsPanel";
import { generateCityGrid } from "../utils/cityGridGenerator";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { extractRoadPositions, getRandomRoadPosition } from "../utils/cityRoads";
import { CityCell } from "../types/cell";
import { GridPosition } from "../types/cell";
import { convertGridPathToPixelPoints, findPath } from "../utils/pathFinder";
import { CITY_CELL_SIZE, CITY_GRID_COLS, CITY_GRID_ROWS } from "../constants";

export default function HomePage() {
  const [cityGrid, setCityGrid] = useState<CityCell[][]>([]);
  const [roadPositions, setRoadPositions] = useState<GridPosition[]>([]);
  const { pedestrians, pedestriansMap, updatePedestrian, error } = usePedestrians({
    cityGrid,
    roadPositions,
  });
  const pedestriansMapRef = useRef(pedestriansMap);

  useEffect(() => {
    pedestriansMapRef.current = pedestriansMap;
  }, [pedestriansMap]);

  const newDestination = useCallback(
    (id: string) => {
      if (cityGrid.length === 0 || roadPositions.length === 0) {
        return;
      }

      const startPosition = pedestriansMapRef.current.get(id)?.destination;
      const destination = getRandomRoadPosition(roadPositions);
      if (!startPosition || !destination) {
        return;
      }

      const path = findPath(cityGrid, startPosition, destination);
      const pathPoints = convertGridPathToPixelPoints(path);

      updatePedestrian(id, { pathPoints, destination });
    },
    [cityGrid, roadPositions, updatePedestrian],
  );

  useEffect(() => {
    const cityGrid = generateCityGrid(CITY_GRID_ROWS, CITY_GRID_COLS);
    setCityGrid(cityGrid);
    setRoadPositions(extractRoadPositions(cityGrid));
  }, []);

  return (
    <main className="min-h-screen p-6">
      <ErrorDisplay error={error} />

      <div className="mx-auto max-w-[1920px]">
        <div
          className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[var(--map-col)_minmax(0,1fr)]"
          style={
            {
              ["--map-col" as string]: `min(100%, ${CITY_GRID_COLS * CITY_CELL_SIZE}px)`,
            } as CSSProperties
          }
        >
          <div className="flex min-w-0 w-full max-w-full flex-col gap-4">
            <section className="w-fit max-w-full" aria-label="City map">
              <CityMap
                cityGrid={cityGrid}
                pedestrians={pedestrians}
                onPedestrianStop={newDestination}
              />
            </section>

            <div className="w-full min-w-0 max-w-full">
              <PedestrianStatsPanel totalPedestrians={pedestrians.length} />
            </div>
          </div>

          <section
            className="flex min-h-[min(60vh,720px)] min-w-0 w-full flex-col rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-4 text-sm text-gray-500 xl:min-h-0"
            aria-label="Pedestrian lists"
          >
            Filterable pedestrian lists go here
          </section>
        </div>
      </div>
    </main>
  );
}
