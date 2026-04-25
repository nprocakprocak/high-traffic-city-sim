"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { CityMap } from "../components/CityMap";
import { ErrorDisplay } from "../components/ErrorDisplay";
import { PedestrianFilterList } from "../components/pedestrians/filterList/PedestrianFilterList";
import { PedestrianStatsPanel } from "../components/pedestrians/stats/PedestrianStatsPanel";  
import { CITY_CELL_SIZE, CITY_GRID_COLS, CITY_GRID_ROWS } from "../constants";
import { usePedestrians } from "../hooks/usePedestrians";
import { usePedestriansStore } from "../stores/pedestriansStore";
import { CityCell, GridPosition } from "../types/cell";
import { generateCityGrid } from "../utils/cityGridGenerator";
import { extractRoadPositions, getRandomRoadPosition } from "../utils/cityRoads";
import { convertGridPathToPixelPoints, findPath } from "../utils/pathFinder";

export default function HomePage() {
  const [cityGrid, setCityGrid] = useState<CityCell[][]>([]);
  const [roadPositions, setRoadPositions] = useState<GridPosition[]>([]);
  const { updatePedestrians, error, setSpawnInterval, isWebSocketEventBufferingEnabled } =
    usePedestrians({
    cityGrid,
    roadPositions,
    });
  const pedestriansStoreRef = useRef(usePedestriansStore);

  const newDestination = useCallback(
    (id: string) => {
      if (cityGrid.length === 0 || roadPositions.length === 0) {
        return;
      }

      const startPosition = pedestriansStoreRef.current.getState().pedestriansById[id]?.destination;
      const destination = getRandomRoadPosition(roadPositions);
      if (!startPosition || !destination) {
        return;
      }

      const path = findPath(cityGrid, startPosition, destination);
      const pathPoints = convertGridPathToPixelPoints(path);

      updatePedestrians([{ id, updates: { pathPoints, destination } }]);
    },
    [cityGrid, roadPositions, updatePedestrians],
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
                onPedestrianStop={newDestination}
              />
            </section>

            <div className="w-full min-w-0 max-w-full">
              <PedestrianStatsPanel
                onSpawnIntervalChange={setSpawnInterval}
                isWebSocketEventBufferingEnabled={isWebSocketEventBufferingEnabled}
              />
            </div>
          </div>

          <section
            className="flex w-full min-w-0 flex-col rounded-lg border border-stone-200/80 bg-stone-50/40 p-3 text-sm text-stone-700 shadow-sm"
            aria-label="Pedestrian lists"
          >
            <div className="min-h-0 w-full min-w-0 flex-1">
              <PedestrianFilterList />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
