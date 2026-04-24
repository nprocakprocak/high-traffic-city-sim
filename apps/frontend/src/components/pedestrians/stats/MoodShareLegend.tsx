import type { Pedestrian } from "@high-traffic-city-sim/types";
import { MOOD_COLORS } from "./constants";
import { moodLabel } from "./helpers/moodChart";

export interface MoodShareLegendItem {
  mood: Pedestrian["mood"];
  percent: number;
}

interface MoodShareLegendProps {
  moodPercentages: MoodShareLegendItem[];
}

export function MoodShareLegend({ moodPercentages }: MoodShareLegendProps) {
  return (
    <ul className="w-full min-w-0 max-w-full flex-1 space-y-2">
      {moodPercentages.map(({ mood, percent }) => (
        <li key={mood} className="flex items-center justify-between gap-2 text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-sm border border-stone-200/60"
              style={{ backgroundColor: MOOD_COLORS[mood] }}
              aria-hidden
            />
            <span className="truncate text-gray-600">{moodLabel(mood)}</span>
          </div>
          <span className="shrink-0 text-gray-700 tabular-nums">{percent}%</span>
        </li>
      ))}
    </ul>
  );
}
