import { List } from "react-window";
import { LIST_HEIGHT, OVERSCAN_COUNT, ROW_GRID, ROW_HEIGHT } from "./constants";
import { VirtualizedPedestrianListRow } from "./VirtualizedPedestrianListRow";
import type { PedestrianRowListProps } from "./types";

interface PedestrianListTableSectionProps {
  pedestrianIds: string[];
}

export function PedestrianListTableSection({ pedestrianIds }: PedestrianListTableSectionProps) {
  return (
    <div
      className="flex w-full min-w-0 flex-col rounded-md border border-stone-200/80 bg-white/80 shadow-sm"
      aria-label="Pedestrians list"
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
      {pedestrianIds.length === 0 ? (
        <ul className="list-none rounded-b-md pb-1" aria-label="Pedestrians list items">
          <li className="px-3 py-4 text-sm text-stone-500">
            No pedestrians yet. Waiting for live updates.
          </li>
        </ul>
      ) : (
        <List<PedestrianRowListProps, "ul">
          aria-label="Pedestrians list items"
          className="list-none rounded-b-md pb-1"
          overscanCount={OVERSCAN_COUNT}
          rowComponent={VirtualizedPedestrianListRow}
          rowCount={pedestrianIds.length}
          rowHeight={ROW_HEIGHT}
          rowProps={{ pedestrianIds }}
          style={{ height: LIST_HEIGHT, width: "100%" }}
          tagName="ul"
        />
      )}
    </div>
  );
}
