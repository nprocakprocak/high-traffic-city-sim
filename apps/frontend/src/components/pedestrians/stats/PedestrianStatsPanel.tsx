import { useShallow } from "zustand/react/shallow";
import { usePedestriansStore } from "../../../stores/pedestriansStore";
import { PedestrianChartsColumn } from "./PedestrianChartsColumn";
import { StatsSpawnColumn } from "./StatsSpawnColumn";

export interface PedestrianStatsPanelProps {
  onSpawnIntervalChange: (value: number) => void;
  isWebSocketEventBufferingEnabled: boolean;
}

export function PedestrianStatsPanel({
  onSpawnIntervalChange,
  isWebSocketEventBufferingEnabled,
}: PedestrianStatsPanelProps) {
  const { totalCount, runningCount, walkingCount, moodCounters } = usePedestriansStore(
    useShallow((state) => ({
      totalCount: state.stats.totalCount,
      runningCount: state.stats.pace.runningCount,
      walkingCount: state.stats.pace.walkingCount,
      moodCounters: state.stats.mood,
    })),
  );

  return (
    <div
      className="w-full min-w-0 max-w-full rounded-lg border border-gray-200/90 bg-stone-50/90 p-4"
      aria-label="Statistics and charts"
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 md:items-start md:gap-8">
        <StatsSpawnColumn
          totalCount={totalCount}
          onSpawnIntervalChange={onSpawnIntervalChange}
          isWebSocketEventBufferingEnabled={isWebSocketEventBufferingEnabled}
        />
        <PedestrianChartsColumn
          totalCount={totalCount}
          runningCount={runningCount}
          walkingCount={walkingCount}
          moodCounters={moodCounters}
        />
      </div>
    </div>
  );
}
