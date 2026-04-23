import { useMemo, useState } from "react";
import { Pedestrian } from "@high-traffic-city-sim/types";

interface PedestrianStatsPanelProps {
  totalPedestrians: number;
  runningPercent: number;
  walkingPercent: number;
}

const MOOD_COLORS: Record<Pedestrian["mood"], string> = {
  happy: "#5dbe8f",
  sad: "#4fa8d4",
  angry: "#e09090",
  excited: "#e0b84a",
  scared: "#8f7fd4",
  shocked: "#d484a8",
};

const MOCK_MOOD_PERCENTS: { mood: Pedestrian["mood"]; percent: number }[] = [
  { mood: "happy", percent: 28 },
  { mood: "sad", percent: 12 },
  { mood: "angry", percent: 15 },
  { mood: "excited", percent: 20 },
  { mood: "scared", percent: 10 },
  { mood: "shocked", percent: 15 },
];

const PACE_SEGMENT_COLORS = {
  running: "#4a9ed4",
  walking: "#52c28c",
} as const;

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

export function PedestrianStatsPanel({
  totalPedestrians,
  runningPercent,
  walkingPercent,
}: PedestrianStatsPanelProps) {
  const [spawnPerSecond, setSpawnPerSecond] = useState(5);

  const pieBackground = useMemo(() => {
    let start = 0;
    const stops: string[] = [];
    for (const { mood, percent } of MOCK_MOOD_PERCENTS) {
      const end = start + percent;
      stops.push(`${MOOD_COLORS[mood]} ${start}% ${end}%`);
      start = end;
    }
    return `conic-gradient(${stops.join(", ")})`;
  }, []);

  const paceSegments = useMemo(
    () => [
      { id: "running" as const, label: "Running", percent: runningPercent, color: PACE_SEGMENT_COLORS.running },
      { id: "walking" as const, label: "Walking", percent: walkingPercent, color: PACE_SEGMENT_COLORS.walking },
    ],
    [runningPercent, walkingPercent],
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
            <span className="font-medium text-gray-800 tabular-nums">{totalPedestrians}</span>
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
                className="h-36 w-36 shrink-0 rounded-full border border-white/80 shadow-sm ring-1 ring-stone-200/80"
                style={{ background: pieBackground }}
                role="img"
                aria-label="Mood distribution among pedestrians (mocked data, percentages in legend)"
              />
              <p className="mt-2 text-center text-xs text-gray-500">Mood share (mock data)</p>
            </div>

            <ul className="w-full min-w-0 max-w-full flex-1 space-y-2">
              {MOCK_MOOD_PERCENTS.map(({ mood, percent }) => (
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
