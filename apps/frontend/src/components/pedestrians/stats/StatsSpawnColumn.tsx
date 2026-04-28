import { useCallback, useState } from "react";
import { usePedestriansStore } from "../../../stores/pedestriansStore";
import { SpawnIntervalSlider } from "./SpawnIntervalSlider";

interface StatsSpawnColumnProps {
  totalCount: number;
  onSpawnIntervalChange: (value: number) => void;
  onStartSession: () => void;
  onStopSession: () => void;
  isWebSocketEventBufferingEnabled: boolean;
}

export function StatsSpawnColumn({
  totalCount,
  onSpawnIntervalChange,
  onStartSession,
  onStopSession,
  isWebSocketEventBufferingEnabled,
}: StatsSpawnColumnProps) {
  const [spawnIntervalMult, setSpawnIntervalMultState] = useState(16);
  const [isRunning, setIsRunning] = useState(false);
  const eventsPerSecond = usePedestriansStore((state) => state.eventsPerSecond);

  const onSpawnIntChange = useCallback(
    (value: number) => {
      setSpawnIntervalMultState(value);
      onSpawnIntervalChange(value);
    },
    [onSpawnIntervalChange],
  );

  const onToggleRunning = useCallback(() => {
    if (isRunning) {
      onStopSession();
      setIsRunning(false);
    } else {
      onStartSession();
      onSpawnIntervalChange(spawnIntervalMult);
      setIsRunning(true);
    }
  }, [isRunning, onStartSession, onStopSession, onSpawnIntervalChange, spawnIntervalMult]);

  return (
    <div className="min-w-0 space-y-4" aria-label="Stats and spawn rate">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          aria-pressed={isRunning}
          onClick={onToggleRunning}
          className={`min-w-[110px] shrink-0 rounded-md border px-2.5 py-1 text-sm font-medium shadow-sm transition motion-reduce:transition-none ${
            isRunning
              ? "border-stone-200/90 bg-stone-50/70 text-stone-700 hover:border-violet-200/90 hover:bg-violet-50/80"
              : "border-violet-300/90 bg-violet-100/85 text-violet-900"
          }`}
        >
          {isRunning ? "Stop" : "Start"}
        </button>
        <p className="text-sm text-slate-700">
          Total pedestrians:{" "}
          <span className="font-medium text-slate-900 tabular-nums">{totalCount}</span>
        </p>
      </div>
      <div className="space-y-2">
        <p className="rounded-md border border-violet-200 bg-violet-100 px-3 py-2 text-sm font-medium text-violet-950">
          {isRunning
            ? "Slide right to generate more pedestrians"
            : "Click start to generate traffic"}
        </p>
        {isRunning ? (
          <>
            <SpawnIntervalSlider value={spawnIntervalMult} onChange={onSpawnIntChange} />
            <p className="text-xs leading-relaxed text-slate-600">
              Pedestrians are added, updated, and removed in real time via WebSocket. Each
              pedestrian follows a randomly generated path, randomly walking or running. Each is
              assigned a random mood and gradually becomes thirsty over time.
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
            <p
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="rounded-md border px-3 py-2 text-sm font-medium"
              style={{
                borderColor: "#5dbe8f",
                backgroundColor: "#5dbe8f33",
                color: "#14532d",
              }}
            >
              WebSocket updates per second:{" "}
              <span className="font-semibold tabular-nums">{eventsPerSecond.toFixed(1)}</span>
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
