import type { Pedestrian } from "@high-traffic-city-sim/types";
import { FilterChips } from "./FilterChips";
import { MOOD_LABEL, MOOD_ORDER } from "./constants";
import { getMoodCount } from "./helpers/moodCount";
import type { PedestrianFilterListProps, PedestrianFilterSelection } from "./types";

type PedestrianFilterChipsSectionProps = Pick<
  PedestrianFilterListProps,
  "totalCount" | "paceCounters" | "moodCounters" | "thirstCounters"
> & {
  selectedFilters: PedestrianFilterSelection;
  onSelectMood: (mood: PedestrianFilterSelection["mood"]) => void;
  onSelectPace: (pace: PedestrianFilterSelection["pace"]) => void;
  onSelectThirst: (thirst: PedestrianFilterSelection["thirst"]) => void;
};

export function PedestrianFilterChipsSection({
  totalCount,
  paceCounters,
  moodCounters,
  thirstCounters,
  selectedFilters,
  onSelectMood,
  onSelectPace,
  onSelectThirst,
}: PedestrianFilterChipsSectionProps) {
  const moodChips: { id: "all" | Pedestrian["mood"]; label: string }[] = [
    { id: "all", label: `All (${totalCount})` },
    ...MOOD_ORDER.map((mood) => ({
      id: mood,
      label: `${MOOD_LABEL[mood]} (${getMoodCount(mood, moodCounters)})`,
    })),
  ];
  const paceChips: { id: "all" | "running" | "walking"; label: string }[] = [
    { id: "all", label: `All (${totalCount})` },
    { id: "running", label: `Running (${paceCounters.runningCount})` },
    { id: "walking", label: `Walking (${paceCounters.walkingCount})` },
  ];
  const thirstChips: { id: "all" | "thirsty" | "notThirsty"; label: string }[] = [
    { id: "all", label: `All (${totalCount})` },
    { id: "thirsty", label: `Thirsty (${thirstCounters.thirstyCount})` },
    { id: "notThirsty", label: `Not thirsty (${thirstCounters.notThirstyCount})` },
  ];

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 rounded-md border border-stone-200/80 bg-white/70 p-2 shadow-sm">
      <FilterChips
        chips={moodChips}
        selectedId={selectedFilters.mood}
        onSelect={(id) => onSelectMood(id as PedestrianFilterSelection["mood"])}
      />
      <FilterChips
        chips={paceChips}
        selectedId={selectedFilters.pace}
        onSelect={(id) => onSelectPace(id as PedestrianFilterSelection["pace"])}
      />
      <FilterChips
        chips={thirstChips}
        selectedId={selectedFilters.thirst}
        onSelect={(id) => onSelectThirst(id as PedestrianFilterSelection["thirst"])}
      />
    </div>
  );
}
