import type { Pedestrian } from "@high-traffic-city-sim/types";
import type { CSSProperties } from "react";
import { PedestrianListRowContent } from "./PedestrianListRowContent";

type ListItemAria = {
  "aria-posinset": number;
  "aria-setsize": number;
  role: "listitem";
};

interface VirtualizedPedestrianListRowProps {
  ariaAttributes: ListItemAria;
  index: number;
  pedestrians: Pedestrian[];
  style: CSSProperties;
}

export function VirtualizedPedestrianListRow({
  ariaAttributes,
  index,
  pedestrians,
  style,
}: VirtualizedPedestrianListRowProps) {
  const pedestrian = pedestrians[index];
  return (
    <li {...ariaAttributes} style={style}>
      <PedestrianListRowContent pedestrian={pedestrian} />
    </li>
  );
}
