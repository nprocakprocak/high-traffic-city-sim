interface ErrorDisplayProps {
  error: string | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 border border-gray-300 rounded-lg">
      <p className="text-red-600">Error: {error}</p>
    </div>
  );
}
