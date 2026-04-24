import { useEffect, useMemo, useRef, useState } from "react";
import { describePieSlice } from "./helpers/pieGeometry";
import { MOOD_COLORS, MOOD_ORDER, PIE_ANIMATION_DURATION_MS } from "./constants";
import { moodCount } from "./helpers/moodChart";
import type { PedestrianStatsMoodCounters } from "./types";

function computeMoodRatios(
  totalCount: number,
  moodCounters: PedestrianStatsMoodCounters,
): number[] {
  if (totalCount === 0) {
    return MOOD_ORDER.map(() => 0);
  }
  return MOOD_ORDER.map((mood) => moodCount(mood, moodCounters) / totalCount);
}

function normalizeRatios(ratios: number[]): number[] {
  const sum = ratios.reduce((a, b) => a + b, 0);
  if (sum <= 0) {
    return ratios;
  }
  return ratios.map((r) => r / sum);
}

interface MoodShareChartProps {
  totalCount: number;
  moodCounters: PedestrianStatsMoodCounters;
}

function moodDataSignature(moodCounters: PedestrianStatsMoodCounters, totalCount: number) {
  return [
    totalCount,
    moodCounters.happyCount,
    moodCounters.sadCount,
    moodCounters.angryCount,
    moodCounters.excitedCount,
    moodCounters.scaredCount,
    moodCounters.shockedCount,
  ].join(",");
}

export function MoodShareChart({ totalCount, moodCounters }: MoodShareChartProps) {
  const { moodRatios, dataSignature } = useMemo(() => {
    const nextRatios = computeMoodRatios(totalCount, moodCounters);
    return {
      moodRatios: nextRatios,
      dataSignature: moodDataSignature(moodCounters, totalCount),
    };
  }, [moodCounters, totalCount]);

  const [animatedMoodRatios, setAnimatedMoodRatios] = useState(moodRatios);
  const animatedMoodRatiosRef = useRef(animatedMoodRatios);
  const dataSignatureRef = useRef(dataSignature);
  const moodRatiosRef = useRef(moodRatios);

  useEffect(() => {
    animatedMoodRatiosRef.current = animatedMoodRatios;
  }, [animatedMoodRatios]);

  useEffect(() => {
    dataSignatureRef.current = dataSignature;
  }, [dataSignature]);

  useEffect(() => {
    moodRatiosRef.current = moodRatios;
  }, [moodRatios]);

  useEffect(() => {
    const startValues = animatedMoodRatiosRef.current;
    const targetValues = moodRatiosRef.current;
    const runSignature = dataSignature;
    const startTime = performance.now();

    let rafId = 0;
    const tick = (now: number) => {
      if (dataSignatureRef.current !== runSignature) {
        return;
      }

      const progress = Math.min((now - startTime) / PIE_ANIMATION_DURATION_MS, 1);
      const eased = 1 - (1 - progress) * (1 - progress);

      if (progress >= 1) {
        setAnimatedMoodRatios(targetValues);
        return;
      }

      const nextValues = normalizeRatios(
        targetValues.map((target, index) => {
          const start = startValues[index] ?? 0;
          return start + (target - start) * eased;
        }),
      );
      setAnimatedMoodRatios(nextValues);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [dataSignature]);

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
