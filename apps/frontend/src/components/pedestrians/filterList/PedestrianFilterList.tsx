import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePedestriansStore } from "../../../stores/pedestriansStore";
import { isRunning, isThirsty } from "./helpers/rowDisplay";
import { PedestrianFilterChipsSection } from "./PedestrianFilterChipsSection";
import { PedestrianListTableSection } from "./PedestrianListTableSection";

export function PedestrianFilterList() {
  const {
    pedestrianIds,
    pedestriansById,
    totalCount,
    paceCounters,
    moodCounters,
    thirstCounters,
    selectedFilters,
    setSelectedFilters,
  } = usePedestriansStore(
    useShallow((state) => ({
      pedestrianIds: state.pedestrianIds,
      pedestriansById: state.pedestriansById,
      totalCount: state.stats.totalCount,
      paceCounters: state.stats.pace,
      moodCounters: state.stats.mood,
      thirstCounters: state.stats.thirst,
      selectedFilters: state.selectedFilters,
      setSelectedFilters: state.setSelectedFilters,
    })),
  );

  const filteredPedestrianIds = useMemo(() => {
    if (
      selectedFilters.mood === "all" &&
      selectedFilters.pace === "all" &&
      selectedFilters.thirst === "all"
    ) {
      return pedestrianIds;
    }

    return pedestrianIds.filter((id) => {
      const pedestrian = pedestriansById[id];
      if (!pedestrian) {
        return false;
      }

      const moodMatches =
        selectedFilters.mood === "all" || pedestrian.mood === selectedFilters.mood;
      const paceMatches =
        selectedFilters.pace === "all" ||
        (selectedFilters.pace === "running"
          ? isRunning(pedestrian.velocity)
          : !isRunning(pedestrian.velocity));
      const thirstMatches =
        selectedFilters.thirst === "all" ||
        (selectedFilters.thirst === "thirsty"
          ? isThirsty(pedestrian.thirst)
          : !isThirsty(pedestrian.thirst));

      return moodMatches && paceMatches && thirstMatches;
    });
  }, [pedestrianIds, pedestriansById, selectedFilters]);

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
