import { useEffect, useMemo, useRef, useState } from "react";
import { Pedestrian } from "@high-traffic-city-sim/types";

interface PedestrianStatsPanelProps {
  totalCount: number;
  runningCount: number;
  walkingCount: number;
  moodCounters: {
    happyCount: number;
    sadCount: number;
    angryCount: number;
    excitedCount: number;
    scaredCount: number;
    shockedCount: number;
  };
}

const MOOD_COLORS: Record<Pedestrian["mood"], string> = {
  happy: "#5dbe8f",
  sad: "#4fa8d4",
  angry: "#e09090",
  excited: "#e0b84a",
  scared: "#8f7fd4",
  shocked: "#d484a8",
};

const MOOD_ORDER: Pedestrian["mood"][] = ["happy", "sad", "angry", "excited", "scared", "shocked"];

const PACE_SEGMENT_COLORS = {
  running: "#4a9ed4",
  walking: "#52c28c",
} as const;
const PIE_CENTER = 50;
const PIE_RADIUS = 44;
const PIE_ANIMATION_DURATION_MS = 180;

function moodLabel(mood: Pedestrian["mood"]): string {
  const labels: Record<Pedestrian["mood"], string> = {
    happy: "Happy",
    sad: "Sad",
    angry: "Angry",
    excited: "Excited",
    scared: "Scared",
    shocked: "Shocked",
  };
  return labels[mood];
}

function moodCount(mood: Pedestrian["mood"], moodCounters: PedestrianStatsPanelProps["moodCounters"]): number {
  switch (mood) {
    case "happy":
      return moodCounters.happyCount;
    case "sad":
      return moodCounters.sadCount;
    case "angry":
      return moodCounters.angryCount;
    case "excited":
      return moodCounters.excitedCount;
    case "scared":
      return moodCounters.scaredCount;
    case "shocked":
      return moodCounters.shockedCount;
  }
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describePieSlice(startAngle: number, endAngle: number): string {
  const boundedEndAngle = Math.min(endAngle, startAngle + 359.999);
  const start = polarToCartesian(PIE_CENTER, PIE_CENTER, PIE_RADIUS, startAngle);
  const end = polarToCartesian(PIE_CENTER, PIE_CENTER, PIE_RADIUS, boundedEndAngle);
  const largeArcFlag = boundedEndAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${PIE_CENTER} ${PIE_CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${PIE_RADIUS} ${PIE_RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export function PedestrianStatsPanel({
  totalCount,
  runningCount,
  walkingCount,
  moodCounters,
}: PedestrianStatsPanelProps) {
  const [spawnPerSecond, setSpawnPerSecond] = useState(5);

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

  const pacePercentages = useMemo(() => {
    const paceTotal = runningCount + walkingCount;
    if (paceTotal === 0) {
      return {
        runningPercent: 0,
        walkingPercent: 0,
      };
    }

    const runningPercent = Math.round((runningCount / paceTotal) * 100);

    return {
      runningPercent,
      walkingPercent: 100 - runningPercent,
    };
  }, [runningCount, walkingCount]);

  const paceSegments = useMemo(
    () => [
      {
        id: "running" as const,
        label: "Running",
        percent: pacePercentages.runningPercent,
        color: PACE_SEGMENT_COLORS.running,
      },
      {
        id: "walking" as const,
        label: "Walking",
        percent: pacePercentages.walkingPercent,
        color: PACE_SEGMENT_COLORS.walking,
      },
    ],
    [pacePercentages.runningPercent, pacePercentages.walkingPercent],
  );

  return (
    <div
      className="w-full min-w-0 max-w-full rounded-lg border border-gray-200/90 bg-stone-50/90 p-4"
      aria-label="Statistics and charts"
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 md:items-start md:gap-8">
        <div className="min-w-0 space-y-4" aria-label="Stats and spawn rate">
          <p className="text-sm text-gray-600">
            Total pedestrians:{" "}
            <span className="font-medium text-gray-800 tabular-nums">{totalCount}</span>
          </p>
          <div className="space-y-2">
            <p className="rounded-md border border-violet-200/90 bg-violet-50/85 px-3 py-2 text-sm font-medium text-violet-900/80">
              Slide right to generate more pedestrians
            </p>
            <input
              type="range"
              className="w-full cursor-pointer accent-violet-400"
              min={1}
              max={20}
              step={1}
              value={spawnPerSecond}
              onChange={(e) => setSpawnPerSecond(Number(e.target.value))}
              aria-label="Adjust pedestrian spawn rate (preview, not connected yet)"
              aria-valuemin={1}
              aria-valuemax={20}
              aria-valuenow={spawnPerSecond}
            />
            <p className="text-xs leading-relaxed text-gray-500">
              Pedestrians are updated live over WebSocket.
            </p>
          </div>
        </div>

        <div
          className="min-w-0 space-y-5 border-t border-stone-200/80 pt-5 md:border-t-0 md:pt-0 md:border-l md:pl-8"
          aria-label="Charts"
        >
          <div className="flex min-w-0 flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:gap-6">
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
          </div>

          <div>
            <p className="mb-2 text-xs text-gray-500">Pace: running vs walking (live data)</p>
            <div
              className="flex h-4 w-full overflow-hidden rounded-md border border-stone-200/80 bg-stone-100/80"
              role="img"
              aria-label="Pace: running versus walking, percentage share"
            >
              {paceSegments.map((seg) => (
                <div
                  key={seg.id}
                  className="h-full min-w-0 transition-[flex-basis] duration-300"
                  style={{
                    flexBasis: `${seg.percent}%`,
                    backgroundColor: seg.color,
                  }}
                  title={`${seg.label}: ${seg.percent}%`}
                />
              ))}
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
              {paceSegments.map((seg) => (
                <li key={seg.id} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm border border-stone-200/60"
                    style={{ backgroundColor: seg.color }}
                    aria-hidden
                  />
                  <span>
                    {seg.label} — <span className="tabular-nums">{seg.percent}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
