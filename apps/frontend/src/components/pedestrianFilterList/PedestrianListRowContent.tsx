import type { Pedestrian } from "@high-traffic-city-sim/types";
import { MOOD_EMOJI_MAP } from "../../constants";
import { MOOD_LABEL, ROW_GRID } from "./constants";
import { isThirsty, paceLabel } from "./helpers/rowDisplay";

interface PedestrianListRowContentProps {
  pedestrian: Pedestrian;
}

export function PedestrianListRowContent({ pedestrian }: PedestrianListRowContentProps) {
  return (
    <div className={`${ROW_GRID} border-b border-stone-200/60 py-1 text-sm last:border-0`}>
      <span
        className="flex h-7 w-7 select-none items-center justify-center rounded-md border border-stone-200/80 bg-stone-50/90 text-sm leading-none"
        aria-hidden
      >
        {MOOD_EMOJI_MAP[pedestrian.mood]}
      </span>
      <span className="min-w-0 truncate text-left text-gray-800">{pedestrian.name}</span>
      <span className="min-w-0 truncate text-left text-gray-600">
        {MOOD_LABEL[pedestrian.mood]}
      </span>
      <span className="min-w-0 text-left text-gray-600">{paceLabel(pedestrian.velocity)}</span>
      <span className="min-w-0 text-left text-gray-600">
        {isThirsty(pedestrian.thirst) ? "Thirsty" : "Not thirsty"}
      </span>
    </div>
  );
}
