import { Ban, Bell, BellOff, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button, type ButtonV2Props } from "@/shared/components/ui/button";
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

type ActionButtonVariant = "accentGhost" | "destructive" | "subtle";

interface SettingsActionButtonProps
  extends Omit<
    ButtonV2Props,
    | "children"
    | "className"
    | "contentClassName"
    | "disabled"
    | "loading"
    | "variant"
  > {
  ariaPressed?: boolean;
  children: ReactNode;
  disabled: boolean;
  label: string;
  variant: ActionButtonVariant;
}

interface MuteActionState {
  disabled: boolean;
  icon: ReactNode;
  label: string;
  title?: string;
  variant: ActionButtonVariant;
}

interface BlockActionState {
  disabled: boolean;
  icon: ReactNode;
  label: string;
}

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
  const muteAction = getMuteActionState({
    isDisabled: isMuteActionDisabled,
    isMuted,
    isPending: isMuteActionPending,
    onToggle: onToggleMute,
  });
  const blockAction = getBlockActionState({
    isBlocked,
    isDisabled: blockActionDisabled,
    isPending: isBlockActionPending,
    onToggle: onToggleBlock,
  });
  const blockDialog = getBlockDialogState(isBlocked);

  return (
    <section
      className={cn("border-border/70 border-t px-5 py-5", isMobile && "pb-6")}
    >
      <h4 className="font-bold text-slate-muted text-xs">Account & safety</h4>
      <div className="mt-3 flex flex-col gap-3">
        <SettingsActionButton
          variant={muteAction.variant}
          disabled={muteAction.disabled}
          title={muteAction.title}
          ariaPressed={isMuted}
          onClick={onToggleMute}
          label={muteAction.label}
        >
          {muteAction.icon}
        </SettingsActionButton>

        <ActionDialog
          cancelLabel={blockDialog.cancelLabel}
          confirmLabel={blockDialog.confirmLabel}
          description={blockDialog.description}
          details={blockDialog.details}
          disabled={blockAction.disabled}
          loading={isBlockActionPending}
          onConfirm={onToggleBlock}
          title={blockDialog.title}
          tone={blockDialog.tone}
          trigger={
            <SettingsActionButton
              variant="destructive"
              disabled={blockAction.disabled}
              label={blockAction.label}
            >
              {blockAction.icon}
            </SettingsActionButton>
          }
        />
      </div>
    </section>
  );
}

function SettingsActionButton({
  ariaPressed,
  children,
  disabled,
  label,
  title,
  variant,
  ...buttonProps
}: SettingsActionButtonProps) {
  return (
    <Button
      {...buttonProps}
      variant={variant}
      className={actionButtonClassName}
      disabled={disabled}
      title={title}
      aria-pressed={ariaPressed}
    >
      {children}
      <span className={actionLabelClassName}>{label}</span>
    </Button>
  );
}

function getMuteActionState({
  isDisabled,
  isMuted,
  isPending,
  onToggle,
}: {
  isDisabled: boolean;
  isMuted: boolean;
  isPending: boolean;
  onToggle?: () => void;
}): MuteActionState {
  return {
    disabled: isDisabled || isPending || !onToggle,
    icon: (
      <ActionIcon
        icon={
          isMuted ? <BellOff className="size-4" /> : <Bell className="size-4" />
        }
        isPending={isPending}
      />
    ),
    label: getMuteActionLabel(isMuted, isPending),
    title: isDisabled
      ? "Reconnect before changing chat notifications."
      : undefined,
    variant: isMuted ? "accentGhost" : "subtle",
  };
}

function getBlockActionState({
  isBlocked,
  isDisabled,
  isPending,
  onToggle,
}: {
  isBlocked: boolean;
  isDisabled: boolean;
  isPending: boolean;
  onToggle?: () => void;
}): BlockActionState {
  return {
    disabled: isDisabled || isPending || !onToggle,
    icon: (
      <ActionIcon icon={<Ban className="size-4" />} isPending={isPending} />
    ),
    label: getBlockActionLabel(isBlocked, isPending),
  };
}

function ActionIcon({
  icon,
  isPending,
}: {
  icon: ReactNode;
  isPending: boolean;
}) {
  return (
    <span className="shrink-0">
      {isPending ? <Loader2 className="size-4 animate-spin" /> : icon}
    </span>
  );
}

function getMuteActionLabel(isMuted: boolean, isPending: boolean) {
  if (isPending) {
    return "Updating notifications...";
  }

  return isMuted ? "Unmute notifications" : "Mute notifications";
}

function getBlockActionLabel(isBlocked: boolean, isPending: boolean) {
  if (isPending) {
    return isBlocked ? "Unblocking..." : "Blocking...";
  }

  return isBlocked ? "Unblock user" : "Block user";
}

function getBlockDialogState(isBlocked: boolean) {
  return isBlocked
    ? {
        cancelLabel: "Keep blocked",
        confirmLabel: "Unblock user",
        description: "They can contact you again after you unblock them.",
        details: [
          "They will leave your blocked people list.",
          "You can block them again from this panel.",
        ],
        title: "Unblock this user?",
        tone: "info" as const,
      }
    : {
        cancelLabel: "Not now",
        confirmLabel: "Block user",
        description:
          "TeamForge will limit direct contact and move them into your blocked list.",
        details: [
          "You can unblock them later in Privacy and safety settings.",
          "This does not remove shared group history where other members need context.",
        ],
        title: "Block this user?",
        tone: "danger" as const,
      };
}
