import { useMemo } from "react";
import { MOOD_ORDER } from "./constants";
import { moodCount } from "./helpers/moodChart";
import { MoodShareChart } from "./MoodShareChart";
import { MoodShareLegend } from "./MoodShareLegend";
import type { PedestrianStatsMoodCounters } from "../../../types/pedestrianStats";

interface MoodShareSectionProps {
  totalCount: number;
  moodCounters: PedestrianStatsMoodCounters;
}

export function MoodShareSection({ totalCount, moodCounters }: MoodShareSectionProps) {
  const moodPercentages = useMemo(() => {
    if (totalCount === 0) {
      return MOOD_ORDER.map((mood) => ({ mood, percent: 0 }));
    }

    return MOOD_ORDER.map((mood) => {
      return {
        mood,
        percent: Math.round((moodCount(mood, moodCounters) / totalCount) * 100),
      };
    });
  }, [moodCounters, totalCount]);

  return (
    <div className="flex min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:gap-6">
      <MoodShareChart totalCount={totalCount} moodCounters={moodCounters} />
      <MoodShareLegend moodPercentages={moodPercentages} />
    </div>
  );
}
