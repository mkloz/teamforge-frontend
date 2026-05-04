interface PreferenceStatusMessageProps {
  message: string | null;
  error: string | null;
}

export function PreferenceStatusMessage({
  message,
  error,
}: PreferenceStatusMessageProps) {
  if (!message && !error) {
    return null;
  }

  return (
    <p className={`text-sm ${error ? "text-destructive" : "text-forge-teal"}`}>
      {error ?? message}
    </p>
  );
}
