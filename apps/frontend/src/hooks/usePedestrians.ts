import { Pedestrian } from "@high-traffic-city-sim/types";
import { useCallback, useMemo, useState } from "react";
import { CityCell, GridPosition } from "../types/cell";
import { getRandomRoadPosition } from "../utils/cityRoads";
import { useWebSocket } from "./useWebSocket";
import { convertGridPathToPixelPoints, findPath } from "../utils/pathFinder";

interface UsePedestriansProps {
  cityGrid: CityCell[][];
  roadPositions: GridPosition[];
}

export function usePedestrians({ cityGrid, roadPositions }: UsePedestriansProps) {
  const [pedestriansMap, setPedestriansMap] = useState<Map<string, Pedestrian>>(new Map());
  const pedestrians = useMemo(() => Array.from(pedestriansMap.values()), [pedestriansMap]);

  const onNewPedestrian = useCallback(
    (sockPedestrian: Pedestrian) => {
      const startPosition = getRandomRoadPosition(roadPositions);
      const destination = getRandomRoadPosition(roadPositions);

      if (!startPosition || !destination) {
        return;
      }

      const path = findPath(cityGrid, startPosition, destination);
      const pathPoints = convertGridPathToPixelPoints(path);

      const pedestrian: Pedestrian = {
        ...sockPedestrian,
        pathPoints,
        destination,
      };

      setPedestriansMap((prev) => {
        const map = new Map(prev);
        map.set(pedestrian.id, pedestrian);
        return map;
      });
    },
    [cityGrid, roadPositions],
  );

  const removePedestrian = useCallback((id: string) => {
    setPedestriansMap((prev) => {
      const map = new Map(prev);
      map.delete(id);
      return map;
    });
  }, []);

  const updatePedestrian = useCallback((id: string, updates: Partial<Omit<Pedestrian, "id">>) => {
    setPedestriansMap((prev) => {
      const map = new Map(prev);
      const p = map.get(id);
      if (p) {
        map.set(id, { ...p, ...updates });
      }
      return map;
    });
  }, []);

  const { error } = useWebSocket(onNewPedestrian, removePedestrian, updatePedestrian);

  return {
    pedestrians,
    pedestriansMap,
    removePedestrian,
    updatePedestrian,
    error,
  };
}
