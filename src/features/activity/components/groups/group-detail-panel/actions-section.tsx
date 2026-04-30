import { BellOff, Flag, LogOut, ShieldAlert } from "lucide-react";

import type {
  GroupStatus,
  MemberRole,
} from "@/features/activity/lib/activity-contract";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ActionsSectionProps {
  currentUserRole: MemberRole;
  groupStatus: GroupStatus;
  isDisbanding?: boolean;
  isLeaving?: boolean;
  onDisbandGroup: () => Promise<void> | void;
  onLeaveGroup: () => Promise<void> | void;
}

export function ActionsSection({
  currentUserRole,
  groupStatus,
  isDisbanding = false,
  isLeaving = false,
  onDisbandGroup,
  onLeaveGroup,
}: ActionsSectionProps) {
  const isCompleted =
    groupStatus === "COMPLETED" || groupStatus === "DISBANDED";
  const canDisband = currentUserRole === "ADMIN" && !isCompleted;

  return (
    <section className="space-y-2">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-foreground">
        Actions
      </h3>

      {!isCompleted && (
        <ActionButton
          icon={<BellOff size={16} />}
          label="Mute Notifications"
          onClick={() => {
            // Kept as a visible future affordance until notification preferences land.
          }}
        />
      )}

      <div className="my-2.5 border-t border-border" />

      {!isCompleted && (
        <ConfirmActionButton
          confirmActionLabel={isLeaving ? "Leaving..." : "Leave Group"}
          confirmDescription="You’ll leave this group and lose access to its chat and planning workspace."
          confirmTitle="Leave this group?"
          disabled={isLeaving || isDisbanding}
          icon={<LogOut size={16} />}
          label={isLeaving ? "Leaving..." : "Leave Group"}
          onConfirm={onLeaveGroup}
          variant="destructive"
        />
      )}

      {canDisband && (
        <ConfirmActionButton
          confirmActionLabel={isDisbanding ? "Disbanding..." : "Disband Group"}
          confirmDescription="This will close the group for everyone, cancel unfinished plans, and remove access to the shared workspace."
          confirmTitle="Disband this group?"
          disabled={isDisbanding || isLeaving}
          icon={<ShieldAlert size={16} />}
          label={isDisbanding ? "Disbanding..." : "Disband Group"}
          onConfirm={onDisbandGroup}
          variant="destructive"
        />
      )}

      <ActionButton
        icon={<Flag size={16} />}
        label="Report Group"
        onClick={() => {
          // TODO: wire report flow when moderation endpoints exist.
        }}
        variant="muted"
      />
    </section>
  );
}

interface ActionButtonProps {
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "muted";
}

function ActionButton({
  disabled = false,
  icon,
  label,
  onClick,
  variant = "default",
}: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-auto w-full justify-start gap-4 rounded-xl border border-transparent px-3 py-2.5 shadow-none transition-all duration-200 group",
        variant === "default" && "text-ink hover:bg-muted/80",
        variant === "destructive" &&
          "text-red-500 hover:border-red-500/20 hover:bg-red-500/10",
        variant === "muted" && "text-slate-muted hover:bg-muted hover:text-ink",
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-lg p-2 transition-colors",
          variant === "default" &&
            "bg-muted group-hover:bg-ink group-hover:text-white",
          variant === "destructive" &&
            "bg-red-500/10 group-hover:bg-red-500 group-hover:text-white",
          variant === "muted" &&
            "bg-muted/50 group-hover:bg-ink group-hover:text-white",
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </Button>
  );
}

interface ConfirmActionButtonProps extends Omit<ActionButtonProps, "onClick"> {
  confirmActionLabel: string;
  confirmDescription: string;
  confirmTitle: string;
  onConfirm: () => Promise<void> | void;
}

function ConfirmActionButton({
  confirmActionLabel,
  confirmDescription,
  confirmTitle,
  disabled = false,
  icon,
  label,
  onConfirm,
  variant = "default",
}: ConfirmActionButtonProps) {
  if (disabled) {
    return (
      <ActionButton
        disabled
        icon={icon}
        label={label}
        onClick={() => {}}
        variant={variant}
      />
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="w-full">
          <ActionButton
            icon={icon}
            label={label}
            onClick={() => {}}
            variant={variant}
          />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              void onConfirm();
            }}
          >
            {confirmActionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
