import { Pedestrian } from "@high-traffic-city-sim/types";
import { PedestrianIcon } from "./PedestrianIcon";

interface PedestriansLayerProps {
  pedestrians: Pedestrian[];
  onPedestrianStop: (id: string) => void;
}

export function PedestriansLayer({ pedestrians, onPedestrianStop }: PedestriansLayerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {pedestrians.map((pedestrian) => (
        <PedestrianIcon key={pedestrian.id} pedestrian={pedestrian} onFinish={onPedestrianStop} />
      ))}
    </div>
  );
}
