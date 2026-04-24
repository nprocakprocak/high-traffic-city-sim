import { useMemo } from "react";
import { PIE_CENTER, PIE_RADIUS } from "./constants";
import { buildMoodPieSlices } from "./helpers/pieGeometry";
import type { PedestrianStatsMoodCounters } from "./types";

const EMPTY_PIE_FILL = "rgb(229 231 235)"; // tailwind gray-200, matches neutral empty state

interface MoodShareChartProps {
  totalCount: number;
  moodCounters: PedestrianStatsMoodCounters;
}

export function MoodShareChart({ totalCount, moodCounters }: MoodShareChartProps) {
  const slices = useMemo(
    () => (totalCount > 0 ? buildMoodPieSlices(totalCount, moodCounters) : []),
    [moodCounters, totalCount],
  );

  return (
    <div className="flex flex-col items-center">
      <div
        className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-white/70 shadow-sm ring-1 ring-stone-200/80"
        role="img"
        aria-label="Mood distribution among pedestrians (live data, percentages in legend)"
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {slices.length === 0 ? (
            <circle cx={PIE_CENTER} cy={PIE_CENTER} r={PIE_RADIUS} fill={EMPTY_PIE_FILL} />
          ) : (
            slices.map(({ mood, d, color }) => (
              <path key={mood} d={d} fill={color} shapeRendering="geometricPrecision" />
            ))
          )}
        </svg>
      </div>
      <p className="mt-2 text-center text-xs text-gray-500">Mood share (live data)</p>
    </div>
  );
}
