import { PedestrianChartsColumn } from "./PedestrianChartsColumn";
import { StatsSpawnColumn } from "./StatsSpawnColumn";
import type { PedestrianStatsMoodCounters } from "./types";

export interface PedestrianStatsPanelProps {
  onSpawnIntervalChange: (value: number) => void;
  totalCount: number;
  runningCount: number;
  walkingCount: number;
  moodCounters: PedestrianStatsMoodCounters;
}

export function PedestrianStatsPanel({
  onSpawnIntervalChange,
  totalCount,
  runningCount,
  walkingCount,
  moodCounters,
}: PedestrianStatsPanelProps) {
  return (
    <div
      className="w-full min-w-0 max-w-full rounded-lg border border-gray-200/90 bg-stone-50/90 p-4"
      aria-label="Statistics and charts"
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 md:items-start md:gap-8">
        <StatsSpawnColumn totalCount={totalCount} onSpawnIntervalChange={onSpawnIntervalChange} />
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
