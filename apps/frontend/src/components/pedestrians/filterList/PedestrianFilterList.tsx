import { useShallow } from "zustand/react/shallow";
import { usePedestriansStore } from "../../../stores/pedestriansStore";
import { PedestrianFilterChipsSection } from "./PedestrianFilterChipsSection";
import { PedestrianListTableSection } from "./PedestrianListTableSection";

export function PedestrianFilterList() {
  const { pedestrianIds, totalCount, paceCounters, moodCounters, thirstCounters } =
    usePedestriansStore(
      useShallow((state) => ({
        pedestrianIds: state.pedestrianIds,
        totalCount: state.stats.totalCount,
        paceCounters: state.stats.pace,
        moodCounters: state.stats.mood,
        thirstCounters: state.stats.thirst,
      })),
    );

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <PedestrianFilterChipsSection
        totalCount={totalCount}
        paceCounters={paceCounters}
        moodCounters={moodCounters}
        thirstCounters={thirstCounters}
      />
      <PedestrianListTableSection pedestrianIds={pedestrianIds} />
    </div>
  );
}
