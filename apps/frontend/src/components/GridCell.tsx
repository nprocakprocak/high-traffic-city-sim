import { CITY_CELL_SIZE } from "../constants";
import { CellType } from "../types/cell";

interface GridCellProps {
  isLastRow: boolean;
  isLastColumn: boolean;
  type: CellType;
}

const typeColorMap: Record<CellType, string> = {
  road: "bg-slate-500",
  building: "bg-purple-300",
  park: "bg-green-300",
  empty: "",
};

export function GridCell({ isLastRow, isLastColumn, type }: GridCellProps) {
  const bgColor = typeColorMap[type];

  return (
    <div
      style={{
        width: CITY_CELL_SIZE + "px",
        height: CITY_CELL_SIZE + "px",
      }}
      className={`border-t border-l border-gray-300${isLastRow ? " border-b" : ""}${isLastColumn ? " border-r" : ""} ${bgColor}`}
    />
  );
}
