import { Avatar } from "@/shared/components/common/avatar";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import type {
  ForwardDialogModel,
  ForwardDialogStateProps,
  ForwardTarget,
} from "./forward-message-dialog.types";

export function ForwardDialogHeader({
  messageCount,
}: {
  messageCount: number;
}) {
  const copy = getForwardDialogHeaderCopy(messageCount);

  return (
    <DialogHeader className="border-border/55 border-b px-4 py-3 pr-11 text-left">
      <DialogTitle className="font-bold text-base">{copy.title}</DialogTitle>
      <DialogDescription className="text-muted-foreground text-xs">
        Pick where {copy.descriptionSubject} should go.
      </DialogDescription>
    </DialogHeader>
  );
}

export function ForwardDialogBody({
  forwardDialogModel,
  isOnline,
  onForward,
  pendingTargetId,
}: {
  forwardDialogModel: ForwardDialogModel;
  isOnline: boolean;
  onForward: (target: ForwardTarget) => Promise<void>;
  pendingTargetId: string | null;
}) {
  return (
    <div className="min-h-0 overflow-y-auto p-1.5">
      {forwardDialogModel.state ? (
        <ForwardDialogState {...forwardDialogModel.state} />
      ) : (
        forwardDialogModel.targets.map((target) => (
          <ForwardTargetButton
            key={target.chatId}
            disabled={!isOnline || pendingTargetId !== null}
            isPending={pendingTargetId === target.chatId}
            onForward={onForward}
            target={target}
          />
        ))
      )}
    </div>
  );
}

function getForwardDialogHeaderCopy(messageCount: number) {
  const isForwardingMultipleMessages = messageCount > 1;

  return {
    descriptionSubject: isForwardingMultipleMessages
      ? "these messages"
      : "this message",
    title: isForwardingMultipleMessages
      ? "Forward messages"
      : "Forward message",
  };
}

function ForwardDialogState({
  description,
  label,
  role,
}: ForwardDialogStateProps) {
  return (
    <div
      role={role}
      className="flex min-h-40 flex-col items-center justify-center gap-1 px-4 py-6 text-center"
    >
      <p className="font-bold text-ink text-sm">{label}</p>
      <p className="max-w-64 text-muted-foreground text-xs leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function ForwardTargetButton({
  disabled,
  isPending,
  onForward,
  target,
}: {
  disabled: boolean;
  isPending: boolean;
  onForward: (target: ForwardTarget) => Promise<void>;
  target: ForwardTarget;
}) {
  return (
    <button
      type="button"
      aria-busy={isPending}
      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition hover:bg-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onClick={() => {
        void onForward(target);
      }}
    >
      <Avatar
        src={target.avatar}
        media={target.avatarMedia ?? null}
        name={target.title}
        alt=""
        imageSize={48}
        className="size-9"
        fallbackClassName="bg-primary/12 text-primary"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-sm">{target.title}</span>
        <span className="block text-muted-foreground text-xs">
          {target.kind === "group" ? "Group" : "Direct chat"}
        </span>
      </span>
      {isPending && (
        <span aria-live="polite" className="text-muted-foreground text-xs">
          Forwarding...
        </span>
      )}
    </button>
  );
}
