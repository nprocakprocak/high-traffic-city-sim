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
      <p className="text-sm text-slate-700">
        Total pedestrians:{" "}
        <span className="font-medium text-slate-900 tabular-nums">{totalCount}</span>
      </p>
      <div className="space-y-2">
        <p className="rounded-md border border-violet-200 bg-violet-100 px-3 py-2 text-sm font-medium text-violet-950">
          Slide right to generate more pedestrians
        </p>
        <SpawnIntervalSlider value={spawnIntervalMult} onChange={onSpawnIntChange} />
        <p className="text-xs leading-relaxed text-slate-600">
          Pedestrians are added, updated, and removed in real time via WebSocket. Each pedestrian
          follows a randomly generated path, randomly walking or running. Each is assigned a random
          mood and gradually becomes thirsty over time.
        </p>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="rounded-md border border-sky-300 bg-sky-100 px-3 py-2 text-sm font-medium text-slate-900"
        >
          Buffering WebSocket messages:{" "}
          <span
            className={
              isWebSocketEventBufferingEnabled
                ? "font-semibold text-emerald-800"
                : "font-semibold text-red-800"
            }
          >
            {isWebSocketEventBufferingEnabled ? "On" : "Off"}
          </span>
        </p>
      </div>
    </div>
  );
}
