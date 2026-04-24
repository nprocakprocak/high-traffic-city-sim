import type { CSSProperties } from "react";
import { usePedestriansStore } from "../../../stores/pedestriansStore";
import { PedestrianListRowContent } from "./PedestrianListRowContent";

type ListItemAria = {
  "aria-posinset": number;
  "aria-setsize": number;
  role: "listitem";
};

interface VirtualizedPedestrianListRowProps {
  ariaAttributes: ListItemAria;
  index: number;
  pedestrianIds: string[];
  style: CSSProperties;
}

export function VirtualizedPedestrianListRow({
  ariaAttributes,
  index,
  pedestrianIds,
  style,
}: VirtualizedPedestrianListRowProps) {
  const pedestrianId = pedestrianIds[index];
  const pedestrian = usePedestriansStore((state) => state.pedestriansById[pedestrianId]);
  if (!pedestrian) {
    return null;
  }

  return (
    <li {...ariaAttributes} style={style}>
      <PedestrianListRowContent pedestrian={pedestrian} />
    </li>
  );
}
