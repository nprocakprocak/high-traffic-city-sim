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
  getPedestrianId: (index: number) => string | undefined;
  index: number;
  style: CSSProperties;
}

export function VirtualizedPedestrianListRow({
  ariaAttributes,
  getPedestrianId,
  index,
  style,
}: VirtualizedPedestrianListRowProps) {
  const pedestrianId = getPedestrianId(index);
  const pedestrian = usePedestriansStore((state) =>
    pedestrianId ? state.pedestriansById[pedestrianId] : undefined,
  );
  if (!pedestrian) {
    return null;
  }

  return (
    <li {...ariaAttributes} style={style}>
      <PedestrianListRowContent pedestrian={pedestrian} />
    </li>
  );
}
