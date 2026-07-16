import { EmptySettingsBlockedUsersVisual } from "@/features/settings/assets/empty-settings-blocked-users";

interface BlockedUsersErrorStateProps {
  message: string;
}

export function BlockedUsersErrorState({
  message,
}: BlockedUsersErrorStateProps) {
  return (
    <div className="flex min-h-32 items-center justify-center py-4 text-center">
      <p className="text-destructive text-sm">{message}</p>
    </div>
  );
}

export function BlockedUsersEmptyState() {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 py-5 text-center sm:flex-row sm:gap-4 sm:text-left">
      <EmptySettingsBlockedUsersVisual className="h-12 w-auto shrink-0 text-foreground" />
      <div>
        <p className="font-semibold text-ink text-sm">No blocked users</p>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          People you block will appear here.
        </p>
      </div>
    </div>
  );
}
