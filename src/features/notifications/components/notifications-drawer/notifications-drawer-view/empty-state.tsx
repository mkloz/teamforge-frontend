import { EmptyNotificationsVisual } from "@/features/notifications/assets/empty-notifications";

export function NotificationsEmptyState() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-14 text-center sm:py-16">
      <EmptyNotificationsVisual className="h-30 w-auto text-foreground" />
      <div className="mt-6 max-w-68">
        <p className="font-bold text-base text-ink leading-tight">
          Nothing needs your attention
        </p>
        <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
          We'll keep this quiet until there's something useful to check.
        </p>
      </div>
    </div>
  );
}
