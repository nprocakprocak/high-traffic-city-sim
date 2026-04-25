import { useShallow } from "zustand/react/shallow";
import { usePedestriansStore } from "../../../stores/pedestriansStore";
import { PedestrianFilterChipsSection } from "./PedestrianFilterChipsSection";
import { PedestrianListTableSection } from "./PedestrianListTableSection";

export function PedestrianFilterList() {
  const {
    filteredPedestrianIds,
    totalCount,
    paceCounters,
    moodCounters,
    thirstCounters,
    selectedFilters,
    setSelectedFilters,
  } = usePedestriansStore(
    useShallow((state) => ({
      filteredPedestrianIds: state.filteredPedestrianIds,
      totalCount: state.stats.totalCount,
      paceCounters: state.stats.pace,
      moodCounters: state.stats.mood,
      thirstCounters: state.stats.thirst,
      selectedFilters: state.selectedFilters,
      setSelectedFilters: state.setSelectedFilters,
    })),
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <PedestrianFilterChipsSection
        totalCount={totalCount}
        paceCounters={paceCounters}
        moodCounters={moodCounters}
        thirstCounters={thirstCounters}
        selectedFilters={selectedFilters}
        onSelectMood={(mood) => setSelectedFilters({ ...selectedFilters, mood })}
        onSelectPace={(pace) => setSelectedFilters({ ...selectedFilters, pace })}
        onSelectThirst={(thirst) => setSelectedFilters({ ...selectedFilters, thirst })}
      />
      <PedestrianListTableSection pedestrianIds={filteredPedestrianIds} />
    </div>
  );
}
