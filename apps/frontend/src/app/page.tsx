"use client";

import { usePedestrians } from "../hooks/usePedestrians";
import { ErrorDisplay } from "../components/ErrorDisplay";
import { PedestrianStats } from "../components/PedestrianStats";
import { PedestrianList } from "../components/PedestrianList";
import { CityMap } from "../components/CityMap";
import { generateCityGrid } from "../utils/cityGridGenerator";
import { useCallback, useEffect, useRef, useState } from "react";
import { extractRoadPositions, getRandomRoadPosition } from "../utils/cityRoads";
import { CityCell } from "../types/cell";
import { GridPosition } from "../types/cell";
import { convertGridPathToPixelPoints, findPath } from "../utils/pathFinder";

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
    const cityGrid = generateCityGrid(45, 60);
    setCityGrid(cityGrid);
    setRoadPositions(extractRoadPositions(cityGrid));
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <ErrorDisplay error={error} />
      <PedestrianStats totalPedestrians={pedestrians.length} />
      <CityMap cityGrid={cityGrid} pedestrians={pedestrians} onPedestrianStop={newDestination} />
      <PedestrianList pedestrians={pedestrians} />
    </main>
  );
}
