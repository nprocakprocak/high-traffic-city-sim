interface ErrorDisplayProps {
  error: string | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="mb-6 rounded-lg border border-gray-300 p-4" role="alert" aria-live="assertive">
      <p className="text-red-600">Error: {error}</p>
    </div>
  );
}
