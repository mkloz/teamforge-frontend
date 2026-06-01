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

interface OfflineSettingsNoticeProps {
  message: string;
}

export function OfflineSettingsNotice({ message }: OfflineSettingsNoticeProps) {
  return (
    <div
      role="status"
      className="rounded-xl border border-spark-amber/25 bg-spark-amber/8 px-3 py-3 font-medium text-sm text-spark-amber"
    >
      {message}
    </div>
  );
}
