import { useCallback } from "react";
import { List } from "react-window";
import { LIST_HEIGHT, OVERSCAN_COUNT, ROW_GRID, ROW_HEIGHT } from "./constants";
import { VirtualizedPedestrianListRow } from "./VirtualizedPedestrianListRow";
import type { PedestrianRowListProps, PedestrianSort, PedestrianSortColumn } from "./types";

interface PedestrianListTableSectionProps {
  pedestrianIds: string[];
  selectedSort: PedestrianSort;
  onSortColumnSelect: (column: PedestrianSortColumn) => void;
}

interface SortHeaderButtonProps {
  label: string;
  column: PedestrianSortColumn;
  selectedSort: PedestrianSort;
  onSortColumnSelect: (column: PedestrianSortColumn) => void;
}

function SortHeaderButton({
  label,
  column,
  selectedSort,
  onSortColumnSelect,
}: SortHeaderButtonProps) {
  const isActive = selectedSort.column === column && selectedSort.direction !== "none";
  const sortEmoji = !isActive ? "↔️" : selectedSort.direction === "asc" ? "⬆️" : "⬇️";
  return (
    <button
      type="button"
      className="flex min-w-0 cursor-pointer items-center gap-1 text-left transition-colors hover:text-violet-700"
      onClick={() => onSortColumnSelect(column)}
      aria-label={`Sort by ${label}`}
    >
      <span className="truncate">{label}</span>
      <span className={`text-[11px] ${isActive ? "text-violet-700" : "text-stone-400"}`}>
        {sortEmoji}
      </span>
    </button>
  );
}

export function PedestrianListTableSection({
  pedestrianIds,
  selectedSort,
  onSortColumnSelect,
}: PedestrianListTableSectionProps) {
  const getPedestrianId = useCallback((index: number) => pedestrianIds[index], [pedestrianIds]);

  return (
    <div
      className="flex w-full min-w-0 flex-col rounded-md border border-stone-200/80 bg-white/80 shadow-sm"
      aria-label="Pedestrians list"
    >
      <div
        className={`${ROW_GRID} shrink-0 rounded-t-md border-b border-stone-200/90 bg-stone-50/80 py-1 text-xs font-medium text-stone-500`}
      >
        <div className="h-7 w-7 shrink-0" aria-hidden />
        <SortHeaderButton
          label="Name"
          column="name"
          selectedSort={selectedSort}
          onSortColumnSelect={onSortColumnSelect}
        />
        <SortHeaderButton
          label="Mood"
          column="mood"
          selectedSort={selectedSort}
          onSortColumnSelect={onSortColumnSelect}
        />
        <SortHeaderButton
          label="Pace"
          column="pace"
          selectedSort={selectedSort}
          onSortColumnSelect={onSortColumnSelect}
        />
        <SortHeaderButton
          label="Thirst"
          column="thirst"
          selectedSort={selectedSort}
          onSortColumnSelect={onSortColumnSelect}
        />
      </div>
      {pedestrianIds.length === 0 ? (
        <ul className="list-none rounded-b-md pb-1" aria-label="Pedestrians list items">
          <li className="px-3 py-4 text-sm text-stone-500">
            No pedestrians. Waiting for live updates.
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
          rowProps={{ getPedestrianId }}
          style={{ height: LIST_HEIGHT, width: "100%" }}
          tagName="ul"
        />
      )}
    </div>
  );
}
