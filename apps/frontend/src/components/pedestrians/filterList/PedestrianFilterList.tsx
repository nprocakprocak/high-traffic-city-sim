import { PedestrianFilterChipsSection } from "./PedestrianFilterChipsSection";
import { PedestrianListTableSection } from "./PedestrianListTableSection";
import type { PedestrianFilterListProps } from "./types";

export function PedestrianFilterList({
  pedestrians,
  totalCount,
  paceCounters,
  moodCounters,
  thirstCounters,
}: PedestrianFilterListProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <PedestrianFilterChipsSection
        totalCount={totalCount}
        paceCounters={paceCounters}
        moodCounters={moodCounters}
        thirstCounters={thirstCounters}
      />
      <PedestrianListTableSection pedestrians={pedestrians} />
    </div>
  );
}

export type { PedestrianFilterListProps } from "./types";
