import { Ban, Bell, BellOff, Loader2 } from "lucide-react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ProfilePanelSettingsProps {
  isMuted: boolean;
  isBlocked: boolean;
  blockActionDisabled?: boolean;
  isBlockActionPending?: boolean;
  isMuteActionDisabled?: boolean;
  isMuteActionPending?: boolean;
  isMobile?: boolean;
  onToggleMute?: () => void;
  onToggleBlock?: () => void;
}

const actionButtonClassName = "h-auto w-full justify-start px-3 py-3 text-left";
const actionLabelClassName = "font-bold text-sm tracking-tight";

export function ProfilePanelSettings({
  isMuted,
  isBlocked,
  blockActionDisabled = false,
  isBlockActionPending = false,
  isMuteActionDisabled = false,
  isMuteActionPending = false,
  isMobile = false,
  onToggleMute,
  onToggleBlock,
}: ProfilePanelSettingsProps) {
  const blockDialogTitle = isBlocked
    ? "Unblock this user?"
    : "Block this user?";
  const blockDialogDescription = isBlocked
    ? "They can contact you again after you unblock them."
    : "TeamForge will limit direct contact and move them into your blocked list.";
  const blockDialogDetails = isBlocked
    ? [
        "They will leave your blocked people list.",
        "You can block them again from this panel.",
      ]
    : [
        "You can unblock them later in Privacy and safety settings.",
        "This does not remove shared group history where other members need context.",
      ];

  return (
    <section
      className={cn("border-border/70 border-t px-5 py-5", isMobile && "pb-6")}
    >
      <h4 className="font-bold text-slate-muted text-xs">Account & safety</h4>
      <div className="mt-3 flex flex-col gap-3">
        <Button
          variant={isMuted ? "accentGhost" : "subtle"}
          className={actionButtonClassName}
          disabled={
            isMuteActionDisabled || isMuteActionPending || !onToggleMute
          }
          title={
            isMuteActionDisabled
              ? "Reconnect before changing chat notifications."
              : undefined
          }
          aria-pressed={isMuted}
          onClick={onToggleMute}
        >
          {isMuteActionPending ? (
            <span className="shrink-0">
              <Loader2 className="size-4 animate-spin" />
            </span>
          ) : isMuted ? (
            <span className="shrink-0">
              <BellOff className="size-4" />
            </span>
          ) : (
            <span className="shrink-0">
              <Bell className="size-4" />
            </span>
          )}
          <span className={actionLabelClassName}>
            {isMuteActionPending
              ? "Updating notifications..."
              : isMuted
                ? "Unmute notifications"
                : "Mute notifications"}
          </span>
        </Button>

        <ActionDialog
          cancelLabel={isBlocked ? "Keep blocked" : "Not now"}
          confirmLabel={isBlocked ? "Unblock user" : "Block user"}
          description={blockDialogDescription}
          details={blockDialogDetails}
          disabled={
            blockActionDisabled || isBlockActionPending || !onToggleBlock
          }
          loading={isBlockActionPending}
          onConfirm={onToggleBlock}
          title={blockDialogTitle}
          tone={isBlocked ? "info" : "danger"}
          trigger={
            <Button
              variant="destructive"
              className={actionButtonClassName}
              disabled={
                blockActionDisabled || isBlockActionPending || !onToggleBlock
              }
            >
              {isBlockActionPending ? (
                <span className="shrink-0">
                  <Loader2 className="size-4 animate-spin" />
                </span>
              ) : (
                <span className="shrink-0">
                  <Ban className="size-4" />
                </span>
              )}
              <span className={actionLabelClassName}>
                {isBlockActionPending
                  ? isBlocked
                    ? "Unblocking..."
                    : "Blocking..."
                  : isBlocked
                    ? "Unblock user"
                    : "Block user"}
              </span>
            </Button>
          }
        />
      </div>
    </section>
  );
}
