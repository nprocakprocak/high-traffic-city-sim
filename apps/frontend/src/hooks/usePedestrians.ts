import { Pedestrian } from "@high-traffic-city-sim/types";
import { useCallback } from "react";
import { PEDESTRIAN_WEBSOCKET_BUFFERING_THRESHOLD } from "../constants";
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
  const addPedestrians = usePedestriansStore((state) => state.addPedestrians);
  const removePedestrians = usePedestriansStore((state) => state.removePedestrians);
  const updatePedestrians = usePedestriansStore((state) => state.updatePedestrians);
  const pedestrianCount = usePedestriansStore((state) => state.pedestrianIds.length);
  const isWebSocketEventBufferingEnabled =
    pedestrianCount > PEDESTRIAN_WEBSOCKET_BUFFERING_THRESHOLD;

  const onNewPedestrians = useCallback(
    (sockPedestrians: Pedestrian[]) => {
      if (sockPedestrians.length === 0) {
        return;
      }

      const withPaths: Pedestrian[] = [];
      for (const sockPedestrian of sockPedestrians) {
        const startPosition = getRandomRoadPosition(roadPositions);
        const destination = getRandomRoadPosition(roadPositions);

        if (!startPosition || !destination) {
          continue;
        }

        const path = findPath(cityGrid, startPosition, destination);
        const pathPoints = convertGridPathToPixelPoints(path);

        withPaths.push({
          ...sockPedestrian,
          pathPoints,
          destination,
        });
      }

      if (withPaths.length > 0) {
        addPedestrians(withPaths);
      }
    },
    [addPedestrians, cityGrid, roadPositions],
  );

  const { error, setSpawnInterval } = useWebSocket(
    onNewPedestrians,
    removePedestrians,
    updatePedestrians,
    { isBufferingEnabled: isWebSocketEventBufferingEnabled },
  );

  return {
    updatePedestrians,
    error,
    setSpawnInterval,
    isWebSocketEventBufferingEnabled,
  };
}
