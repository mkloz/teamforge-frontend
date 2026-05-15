import { EmptySettingsBlockedUsersVisual } from "@/assets/empty-state/empty-settings-blocked-users";

interface BlockedUsersErrorStateProps {
  message: string;
}

export function BlockedUsersErrorState({
  message,
}: BlockedUsersErrorStateProps) {
  return <p className="py-4 text-destructive text-sm">{message}</p>;
}

export function BlockedUsersEmptyState() {
  return (
    <div className="flex flex-col items-start gap-3 py-5 sm:flex-row sm:items-center sm:gap-4">
      <EmptySettingsBlockedUsersVisual className="h-12 w-auto shrink-0 text-foreground" />
      <div>
        <p className="font-semibold text-ink text-sm">No blocked users</p>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          People you block from direct chats will appear here.
        </p>
      </div>
    </div>
  );
}
