import { NotificationsDrawerShell } from "./notifications-drawer-shell";
import { NotificationsDrawerSkeleton } from "./notifications-drawer-skeleton";

interface NotificationsDrawerLoadingProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDrawerLoading({
  open,
  onClose,
}: NotificationsDrawerLoadingProps) {
  return (
    <NotificationsDrawerShell open={open} onClose={onClose}>
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <NotificationsDrawerSkeleton />
      </div>
    </NotificationsDrawerShell>
  );
}
