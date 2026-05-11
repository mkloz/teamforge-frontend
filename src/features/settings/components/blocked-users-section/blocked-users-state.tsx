import { Loader2 } from "lucide-react";

import { EmptySettingsBlockedUsersVisual } from "@/assets/empty-state/empty-settings-blocked-users";

interface BlockedUsersLoadingStateProps {
  message: string;
}

export function BlockedUsersLoadingState({
  message,
}: BlockedUsersLoadingStateProps) {
  return (
    <div className="flex items-center gap-2 py-4 text-slate-muted text-sm">
      <Loader2 size={16} className="animate-spin" />
      {message}
    </div>
  );
}

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
      <EmptySettingsBlockedUsersVisual className="w-16 shrink-0 text-foreground sm:w-20" />
      <div>
        <p className="font-semibold text-ink text-sm">No blocked users</p>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          People you block from direct chats will appear here.
        </p>
      </div>
    </div>
  );
}
