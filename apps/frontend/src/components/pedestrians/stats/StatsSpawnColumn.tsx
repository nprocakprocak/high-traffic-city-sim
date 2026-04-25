import { useCallback, useState } from "react";
import { SpawnIntervalSlider } from "./SpawnIntervalSlider";

interface StatsSpawnColumnProps {
  totalCount: number;
  onSpawnIntervalChange: (value: number) => void;
  isWebSocketEventBufferingEnabled: boolean;
}

export function StatsSpawnColumn({
  totalCount,
  onSpawnIntervalChange,
  isWebSocketEventBufferingEnabled,
}: StatsSpawnColumnProps) {
  const [spawnIntervalMult, setSpawnIntervalMultState] = useState(16);

  const onSpawnIntChange = useCallback(
    (value: number) => {
      setSpawnIntervalMultState(value);
      onSpawnIntervalChange(value);
    },
    [onSpawnIntervalChange],
  );

  return (
    <div className="min-w-0 space-y-4" aria-label="Stats and spawn rate">
      <p className="text-sm text-gray-600">
        Total pedestrians:{" "}
        <span className="font-medium text-gray-800 tabular-nums">{totalCount}</span>
      </p>
      <div className="space-y-2">
        <p className="rounded-md border border-violet-200/90 bg-violet-50/85 px-3 py-2 text-sm font-medium text-violet-900/80">
          Slide right to generate more pedestrians
        </p>
        <SpawnIntervalSlider value={spawnIntervalMult} onChange={onSpawnIntChange} />
        <p className="text-xs leading-relaxed text-gray-500">
          Pedestrians are added/updated/removed live over WebSocket.
        </p>
        <p className="rounded-md border border-blue-200/90 bg-blue-50/85 px-3 py-2 text-sm font-medium text-blue-900/80">
          Buffering WebSocket messages:{" "}
          <span
            className={
              isWebSocketEventBufferingEnabled
                ? "font-semibold text-emerald-600"
                : "font-semibold text-red-600"
            }
          >
            {isWebSocketEventBufferingEnabled ? "On" : "Off"}
          </span>
        </p>
      </div>
    </div>
  );
}
