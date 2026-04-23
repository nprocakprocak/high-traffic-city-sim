import type { Pedestrian } from "@high-traffic-city-sim/types";
import { MOCK_PEDESTRIAN_LIST_ROWS, type MockListPedestrian } from "../data/mockPedestrianListRows";
import { MOOD_EMOJI_MAP } from "../constants";

const MOOD_LABEL: Record<Pedestrian["mood"], string> = {
  happy: "Happy",
  sad: "Sad",
  angry: "Angry",
  excited: "Excited",
  scared: "Scared",
  shocked: "Shocked",
};

const MOOD_ORDER: MockListPedestrian["mood"][] = [
  "happy",
  "sad",
  "angry",
  "excited",
  "scared",
  "shocked",
];

const RUN_VELOCITY_MIN = 2.4;
const THIRSTY_THIRST = 50;

const moodChips: { id: "all" | MockListPedestrian["mood"]; label: string }[] = [
  { id: "all", label: "All (643)" },
  ...MOOD_ORDER.map((m, index) => ({ id: m, label: `${MOOD_LABEL[m]} (${[182, 76, 94, 128, 63, 100][index]})` })),
];

const velocityChips: { id: "all" | "running" | "walking"; label: string }[] = [
  { id: "all", label: "All (643)" },
  { id: "running", label: "Running (206)" },
  { id: "walking", label: "Walking (437)" },
];

const thirstChips: { id: "all" | "thirsty" | "notThirsty"; label: string }[] = [
  { id: "all", label: "All (643)" },
  { id: "thirsty", label: "Thirsty (274)" },
  { id: "notThirsty", label: "Not thirsty (369)" },
];

const ROW_GRID =
  "grid grid-cols-[2.25rem_minmax(0,8.5rem)_minmax(0,6.25rem)_minmax(0,5.25rem)_minmax(0,6.5rem)] items-center gap-2 px-2.5";

function isRunning(velocity: number): boolean {
  return velocity >= RUN_VELOCITY_MIN;
}

function isThirsty(thirst: number): boolean {
  return thirst > THIRSTY_THIRST;
}

function paceLabel(velocity: number): "Running" | "Walking" {
  return isRunning(velocity) ? "Running" : "Walking";
}

function PedestrianRowItem({ p }: { p: MockListPedestrian }) {
  const thirsty = isThirsty(p.thirst);
  return (
    <li className={`${ROW_GRID} border-b border-stone-200/60 py-1 text-sm last:border-0`}>
      <span
        className="flex h-7 w-7 select-none items-center justify-center rounded-md border border-stone-200/80 bg-stone-50/90 text-sm leading-none"
        aria-hidden
      >
        {MOOD_EMOJI_MAP[p.mood]}
      </span>
      <span className="min-w-0 truncate text-left text-gray-800">{p.name}</span>
      <span className="min-w-0 truncate text-left text-gray-600">{MOOD_LABEL[p.mood]}</span>
      <span className="min-w-0 text-left text-gray-600">{paceLabel(p.velocity)}</span>
      <span className="min-w-0 text-left text-gray-600">{thirsty ? "Thirsty" : "Not thirsty"}</span>
    </li>
  );
}

function FilterChips({
  ariaLabel,
  chips,
  selectedId,
}: {
  ariaLabel: string;
  chips: { id: string; label: string }[];
  selectedId: string;
}) {
  return (
    <div className="flex min-h-0 flex-wrap gap-1.5" role="group" aria-label={ariaLabel}>
      {chips.map((chip) => {
        const selected = chip.id === selectedId;
        return (
          <button
            key={chip.id}
            type="button"
            aria-pressed={selected}
            className={`shrink-0 rounded-md border px-2.5 py-1 text-sm font-medium shadow-sm transition ${
              selected
                ? "border-violet-300/90 bg-violet-100/85 text-violet-900"
                : "border-stone-200/90 bg-stone-50/70 text-stone-700 hover:border-violet-200/90 hover:bg-violet-50/80"
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

function ListBlock({
  filterChips,
  listAria,
  groupAria,
}: {
  filterChips: { id: string; label: string }[];
  listAria: string;
  groupAria: string;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="shrink-0">
        <FilterChips ariaLabel={groupAria} chips={filterChips} selectedId="all" />
      </div>
      <div
        className="flex w-full min-w-0 flex-col rounded-md border border-stone-200/80 bg-white/80 shadow-sm"
        aria-label={listAria}
      >
        <div
          className={`${ROW_GRID} shrink-0 rounded-t-md border-b border-stone-200/90 bg-stone-50/80 py-1 text-xs font-medium text-stone-500`}
        >
          <div className="h-7 w-7 shrink-0" aria-hidden />
          <span className="min-w-0 text-left">Name</span>
          <span className="min-w-0 text-left">Mood</span>
          <span className="min-w-0 text-left">Pace</span>
          <span className="min-w-0 text-left">Thirst</span>
        </div>
        <ul className="h-40 list-none space-y-0 overflow-y-auto rounded-b-md pb-1">
          {MOCK_PEDESTRIAN_LIST_ROWS.map((p) => (
            <PedestrianRowItem key={p.id} p={p} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function MockPedestrianFilterLists() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <ListBlock
        groupAria="Mood filter (layout only, not active)"
        filterChips={moodChips}
        listAria="Mock pedestrians, mood list"
      />
      <ListBlock
        groupAria="Pace filter (layout only, not active)"
        filterChips={velocityChips}
        listAria="Mock pedestrians, pace list"
      />
      <ListBlock
        groupAria="Thirst filter (layout only, not active)"
        filterChips={thirstChips}
        listAria="Mock pedestrians, thirst list"
      />
    </div>
  );
}
