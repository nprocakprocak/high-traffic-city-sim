import { useEffect, useMemo, useRef, useState } from "react";
import { describePieSlice } from "./helpers/pieGeometry";
import { MOOD_COLORS, MOOD_ORDER, PIE_ANIMATION_DURATION_MS } from "./constants";
import { moodCount } from "./helpers/moodChart";
import type { PedestrianStatsMoodCounters } from "./types";

interface MoodShareChartProps {
  totalCount: number;
  moodCounters: PedestrianStatsMoodCounters;
}

export function MoodShareChart({ totalCount, moodCounters }: MoodShareChartProps) {
  const moodRatios = useMemo(() => {
    if (totalCount === 0) {
      return MOOD_ORDER.map(() => 0);
    }
    return MOOD_ORDER.map((mood) => moodCount(mood, moodCounters) / totalCount);
  }, [moodCounters, totalCount]);

  const [animatedMoodRatios, setAnimatedMoodRatios] = useState(moodRatios);
  const animatedMoodRatiosRef = useRef(animatedMoodRatios);

  useEffect(() => {
    animatedMoodRatiosRef.current = animatedMoodRatios;
  }, [animatedMoodRatios]);

  useEffect(() => {
    const startValues = animatedMoodRatiosRef.current;
    const targetValues = moodRatios;
    const startTime = performance.now();

    let rafId = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / PIE_ANIMATION_DURATION_MS, 1);
      const eased = 1 - (1 - progress) * (1 - progress);

      const nextValues = targetValues.map((target, index) => {
        const start = startValues[index] ?? 0;
        return start + (target - start) * eased;
      });

      setAnimatedMoodRatios(nextValues);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [moodRatios]);

  const moodPieSlices = useMemo(() => {
    let cumulativeRatio = 0;

    return MOOD_ORDER.map((mood, index) => {
      const ratio = Math.max(0, animatedMoodRatios[index] ?? 0);
      const startAngle = cumulativeRatio * 360;
      const endAngle = (cumulativeRatio + ratio) * 360;
      cumulativeRatio += ratio;

      return {
        mood,
        ratio,
        pathD: describePieSlice(startAngle, endAngle),
      };
    });
  }, [animatedMoodRatios]);

  return (
    <div className="flex flex-col items-center">
      <div
        className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/70 shadow-sm ring-1 ring-stone-200/80"
        role="img"
        aria-label="Mood distribution among pedestrians (live data, percentages in legend)"
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          {moodPieSlices.map((slice) =>
            slice.ratio > 0 ? (
              <path key={slice.mood} d={slice.pathD} fill={MOOD_COLORS[slice.mood]} />
            ) : null,
          )}
        </svg>
      </div>
      <p className="mt-2 text-center text-xs text-gray-500">Mood share (live data)</p>
    </div>
  );
}
