interface PedestrianStatsProps {
  totalPedestrians: number;
}

export function PedestrianStats({ totalPedestrians }: PedestrianStatsProps) {
  return (
    <div className="mb-6">
      <p className="mb-4 text-lg">Total pedestrians: <strong className="font-bold">{totalPedestrians}</strong></p>
    </div>
  );
}