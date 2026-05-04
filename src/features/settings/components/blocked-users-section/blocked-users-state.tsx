import { Loader2, ShieldOff } from "lucide-react";

interface BlockedUsersLoadingStateProps {
  message: string;
}

export function BlockedUsersLoadingState({
  message,
}: BlockedUsersLoadingStateProps) {
  return (
    <div className="flex items-center gap-2 py-4 text-sm text-slate-muted">
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
  return <p className="py-4 text-sm text-destructive">{message}</p>;
}

export function BlockedUsersEmptyState() {
  return (
    <div className="flex items-start gap-3 py-5">
      <div className="rounded-full bg-forge-teal/8 p-2 text-forge-teal">
        <ShieldOff size={16} />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">No blocked users</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-muted">
          People you block from direct chats will appear here.
        </p>
      </div>
    </div>
  );
}
