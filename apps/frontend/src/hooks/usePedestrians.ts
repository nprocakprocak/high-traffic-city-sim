import { Pedestrian } from "@high-traffic-city-sim/types";
import { useCallback } from "react";
import { usePedestriansStore } from "../stores/pedestriansStore";
import { CityCell, GridPosition } from "../types/cell";
import { getRandomRoadPosition } from "../utils/cityRoads";
import { convertGridPathToPixelPoints, findPath } from "../utils/pathFinder";
import { useWebSocket } from "./useWebSocket";

interface UsePedestriansProps {
  cityGrid: CityCell[][];
  roadPositions: GridPosition[];
}

export function usePedestrians({ cityGrid, roadPositions }: UsePedestriansProps) {
  const addPedestrian = usePedestriansStore((state) => state.addPedestrian);
  const removePedestrian = usePedestriansStore((state) => state.removePedestrian);
  const updatePedestrian = usePedestriansStore((state) => state.updatePedestrian);

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

      addPedestrian(pedestrian);
    },
    [addPedestrian, cityGrid, roadPositions],
  );

  const { error, setSpawnInterval } = useWebSocket(
    onNewPedestrian,
    removePedestrian,
    updatePedestrian,
  );

  return {
    updatePedestrian,
    error,
    setSpawnInterval,
  };
}
