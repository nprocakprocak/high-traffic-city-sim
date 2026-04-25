import { MoodShareSection } from "./MoodShareSection";
import { PaceShareSection } from "./PaceShareSection";
import type { PedestrianStatsMoodCounters } from "../../../types/pedestrianStats";

interface PedestrianChartsColumnProps {
  totalCount: number;
  runningCount: number;
  walkingCount: number;
  moodCounters: PedestrianStatsMoodCounters;
}

export function PedestrianChartsColumn({
  totalCount,
  runningCount,
  walkingCount,
  moodCounters,
}: PedestrianChartsColumnProps) {
  return (
    <div
      className="min-w-0 space-y-5 border-t border-stone-200/80 pt-5 md:border-t-0 md:pt-0 md:border-l md:pl-8"
      aria-label="Charts"
    >
      <MoodShareSection totalCount={totalCount} moodCounters={moodCounters} />
      <PaceShareSection runningCount={runningCount} walkingCount={walkingCount} />
    </div>
  );
}
