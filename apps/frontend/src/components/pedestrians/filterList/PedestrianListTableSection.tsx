import { useCallback } from "react";
import { List } from "react-window";
import { LIST_HEIGHT, OVERSCAN_COUNT, ROW_GRID, ROW_HEIGHT } from "./constants";
import { VirtualizedPedestrianListRow } from "./VirtualizedPedestrianListRow";
import type { PedestrianRowListProps } from "./types";
import { PedestrianSort, PedestrianSortColumn } from "../../../types/pedestrianSort";

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

function sortColumnAriaSuffix(selectedSort: PedestrianSort, column: PedestrianSortColumn) {
  if (selectedSort.column !== column) {
    return "not sorted";
  }
  if (selectedSort.direction === "none") {
    return "not sorted";
  }
  if (selectedSort.direction === "asc") {
    return "ascending";
  }
  return "descending";
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
      className="flex min-w-0 cursor-pointer items-center gap-1 text-left text-slate-800 transition-colors motion-reduce:transition-none hover:text-violet-400"
      onClick={() => onSortColumnSelect(column)}
      aria-label={`Sort by ${label}, ${sortColumnAriaSuffix(selectedSort, column)}`}
    >
      <span className="truncate font-medium">{label}</span>
      <span
        className={`text-[11px] ${isActive ? "text-violet-800" : "text-stone-500"}`}
        aria-hidden
      >
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
      className="flex w-full min-w-0 flex-col rounded-lg border border-stone-300 bg-white/80 shadow-sm"
      aria-label="Pedestrians list"
    >
      <div
        className={`${ROW_GRID} shrink-0 rounded-t-lg border-b border-stone-300 bg-stone-100 py-1.5 text-xs text-slate-800`}
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
        <ul className="list-none rounded-b-lg pb-1" aria-label="Pedestrians list items">
          <li className="px-3 py-4 text-sm text-slate-600">
            No pedestrians. Waiting for live updates.
          </li>
        </ul>
      ) : (
        <List<PedestrianRowListProps, "ul">
          aria-label="Pedestrians list items"
          className="list-none rounded-b-lg pb-1"
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
