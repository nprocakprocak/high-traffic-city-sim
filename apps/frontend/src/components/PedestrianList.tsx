import { Pedestrian } from "@high-traffic-city-sim/types";

interface PedestrianListProps {
  pedestrians: Pedestrian[];
}

export function PedestrianList({ pedestrians }: PedestrianListProps) {
  if (pedestrians.length === 0) return null;

  return (
    <div className="mt-6">
      <details className="mt-6">
        <summary className="cursor-pointer font-bold hover:text-blue-600">
          Show all pedestrians ({pedestrians.length})
        </summary>
        <pre className="bg-gray-100 p-3 rounded mt-2 max-h-80 overflow-auto text-xs border border-gray-300">
          {JSON.stringify(pedestrians.map(({ name }) => ({ name })).slice(-20), null, 2)}
        </pre>
      </details>
    </div>
  );
}
