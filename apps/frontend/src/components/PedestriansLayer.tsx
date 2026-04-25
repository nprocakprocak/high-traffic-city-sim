import { memo } from "react";
import { PedestrianIcon } from "./PedestrianIcon";
import { usePedestriansStore } from "../stores/pedestriansStore";

interface PedestriansLayerProps {
  onPedestrianStop: (id: string) => void;
}

interface PedestrianIconFromStoreProps {
  id: string;
  onPedestrianStop: (id: string) => void;
}

const PedestrianIconFromStore = memo(function PedestrianIconFromStore({
  id,
  onPedestrianStop,
}: PedestrianIconFromStoreProps) {
  const pedestrian = usePedestriansStore((state) => state.pedestriansById[id]);
  if (!pedestrian) {
    return null;
  }

  return <PedestrianIcon pedestrian={pedestrian} onFinish={onPedestrianStop} />;
});

export function PedestriansLayer({ onPedestrianStop }: PedestriansLayerProps) {
  const mapPedestrianIds = usePedestriansStore((s) => s.mapDisplayedPedestrianIds);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {mapPedestrianIds.map((id) => (
        <PedestrianIconFromStore key={id} id={id} onPedestrianStop={onPedestrianStop} />
      ))}
    </div>
  );
}
