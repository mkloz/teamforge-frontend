import { Ban, Bell, BellOff, Flag, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import {
  blockReportedUser,
  ReportDialog,
} from "@/features/reporting/public/reporting";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button, type ButtonV2Props } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ProfilePanelSettingsProps {
  context: "direct-chat" | "group-member";
  content: ProfilePanelSettingsContent;
  mode: "desktop" | "mobile";
  reportTarget: { id: string; name: string };
  safety: ProfilePanelSettingsSafety;
  showMuteAction: boolean;
}

interface ProfilePanelSettingsContent {
  isMuted: boolean;
  isBlocked: boolean;
}

interface ProfilePanelSettingsSafety {
  blockActionDisabled: boolean;
  isMuteActionDisabled: boolean;
  blockActionPending: boolean;
  muteActionPending: boolean;
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
  context,
  content,
  mode,
  reportTarget,
  safety,
  showMuteAction,
}: ProfilePanelSettingsProps) {
  const isMobile = mode === "mobile";
  const muteAction = getMuteActionState({
    isDisabled: safety.isMuteActionDisabled,
    isMuted: content.isMuted,
    isPending: safety.muteActionPending,
    onToggle: safety.onToggleMute,
  });
  const blockAction = getBlockActionState({
    isBlocked: content.isBlocked,
    isDisabled: safety.blockActionDisabled,
    isPending: safety.blockActionPending,
    onToggle: safety.onToggleBlock,
  });
  const blockDialog = getBlockDialogState(content.isBlocked, context);

  return (
    <section
      className={cn("border-border/70 border-t px-5 py-5", isMobile && "pb-6")}
    >
      <h4 className="font-bold text-slate-muted text-xs">Account & safety</h4>
      <div className="mt-3 flex flex-col gap-3">
        {showMuteAction ? (
          <SettingsActionButton
            variant={muteAction.variant}
            disabled={muteAction.disabled}
            title={muteAction.title}
            ariaPressed={content.isMuted}
            onClick={safety.onToggleMute}
            label={muteAction.label}
          >
            {muteAction.icon}
          </SettingsActionButton>
        ) : null}

        <ReportDialog
          canRequestBlock={!content.isBlocked}
          onBlock={() => blockReportedUser(reportTarget.id)}
          targets={[
            {
              id: reportTarget.id,
              label: `${reportTarget.name}'s profile`,
              type: "PROFILE",
            },
          ]}
          trigger={
            <SettingsActionButton
              variant="subtle"
              disabled={false}
              label="Report user"
            >
              <Flag className="size-4" aria-hidden="true" />
            </SettingsActionButton>
          }
        />

        <ActionDialog
          cancelLabel={blockDialog.cancelLabel}
          confirmLabel={blockDialog.confirmLabel}
          description={blockDialog.description}
          details={blockDialog.details}
          disabled={blockAction.disabled}
          loading={safety.blockActionPending}
          onConfirm={safety.onToggleBlock}
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

function getBlockDialogState(
  isBlocked: boolean,
  context: ProfilePanelSettingsProps["context"],
) {
  return isBlocked
    ? {
        cancelLabel: "Keep blocked",
        confirmLabel: "Unblock user",
        description:
          "Unblocking permits future contact only where your privacy and group settings allow it.",
        details: [
          "They will leave your blocked people list.",
          "This does not restore previous connections, chats, or groups.",
        ],
        title: "Unblock this user?",
        tone: "info" as const,
      }
    : {
        cancelLabel: "Not now",
        confirmLabel: "Block user",
        description:
          context === "group-member"
            ? "Blocking this person adds them to your blocked list and may close your access to this group so you can leave safely."
            : "Blocking closes this direct chat, removes your connection, and adds them to your blocked list.",
        details: [
          "Blocking can also change which shared groups you can access.",
          "You can unblock them later in Safety settings, but this will not restore the connection, chat, or group access.",
        ],
        title: "Block this user?",
        tone: "danger" as const,
      };
}
