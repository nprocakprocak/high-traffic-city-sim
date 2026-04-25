import { useMemo } from "react";

const PACE_SEGMENT_COLORS = {
  running: "#4a9ed4",
  walking: "#52c28c",
} as const;

interface PaceShareSectionProps {
  runningCount: number;
  walkingCount: number;
}

export function PaceShareSection({ runningCount, walkingCount }: PaceShareSectionProps) {
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
  );
}
