interface PreferenceStatusMessageProps {
  error: string | null;
}

export function PreferenceStatusMessage({
  error,
}: PreferenceStatusMessageProps) {
  if (!error) {
    return null;
  }

  return <p className="text-destructive text-sm">{error}</p>;
}
