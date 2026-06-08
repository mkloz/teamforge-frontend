import { OfflineNotice } from "@/shared/components/ui/offline-notice";

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
    <OfflineNotice withIcon={false} size="md" className="px-3">
      {message}
    </OfflineNotice>
  );
}
