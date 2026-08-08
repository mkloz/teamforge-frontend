import {
  MessageCircle,
  Search,
  SendHorizontal,
  UsersRound,
} from "lucide-react";
import { Avatar } from "@/shared/components/common/avatar";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Spinner } from "@/shared/components/ui/spinner";
import type {
  ForwardDialogModel,
  ForwardDialogStateProps,
  ForwardTarget,
} from "./forward-message-dialog.types";

export function ForwardDialogHeader({
  messageCount,
  onQueryChange,
  query,
}: {
  messageCount: number;
  onQueryChange: (query: string) => void;
  query: string;
}) {
  const copy = getForwardDialogHeaderCopy(messageCount);

  return (
    <DialogHeader className="gap-4 px-5 pt-5 pr-14 pb-3 text-left">
      <div>
        <DialogTitle className="font-black text-xl">{copy.title}</DialogTitle>
        <DialogDescription className="mt-1 text-muted-foreground text-sm">
          Choose the conversation for {copy.descriptionSubject}.
        </DialogDescription>
      </div>

      <label className="relative block">
        <span className="sr-only">Search conversations</span>
        <Search
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.currentTarget.value)}
          placeholder="Search chats and groups"
          className="h-11 w-full rounded-lg border border-input-border bg-input pr-3 pl-10 text-ink text-sm outline-none transition-colors placeholder:text-slate-muted hover:border-foreground/35 focus-visible:border-foreground/70 focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </label>
    </DialogHeader>
  );
}

export function ForwardDialogBody({
  forwardDialogModel,
  isOnline,
  onForward,
  pendingTargetId,
  query,
}: {
  forwardDialogModel: ForwardDialogModel;
  isOnline: boolean;
  onForward: (target: ForwardTarget) => Promise<void>;
  pendingTargetId: string | null;
  query: string;
}) {
  const targets = getFilteredForwardTargets(forwardDialogModel.targets, query);

  return (
    <div className="min-h-0 overflow-y-auto px-3 pb-3">
      {forwardDialogModel.state ? (
        <ForwardDialogState {...forwardDialogModel.state} />
      ) : targets.length === 0 ? (
        <ForwardDialogState
          label="No conversations found"
          description="Try another name or group."
          role="status"
        />
      ) : (
        <GroupedMenuList aria-label="Conversations">
          {targets.map((target) => (
            <ForwardTargetButton
              key={target.chatId}
              disabled={!isOnline || pendingTargetId !== null}
              isPending={pendingTargetId === target.chatId}
              onForward={onForward}
              target={target}
            />
          ))}
        </GroupedMenuList>
      )}
    </div>
  );
}

function getFilteredForwardTargets(targets: ForwardTarget[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return targets;
  }

  return targets.filter((target) =>
    target.title.toLocaleLowerCase().includes(normalizedQuery),
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
  const KindIcon = target.kind === "group" ? UsersRound : MessageCircle;

  return (
    <GroupedMenuItem>
      <GroupedMenuAction asChild className="min-h-15 px-3 py-2.5">
        <button
          type="button"
          aria-busy={isPending}
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
            className="size-10"
            fallbackClassName="bg-primary/12 text-foreground"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold text-ink text-sm">
              {target.title}
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-slate-muted text-xs">
              <KindIcon className="size-3.5" aria-hidden="true" />
              {target.kind === "group" ? "Group" : "Direct chat"}
            </span>
          </span>
          {isPending ? (
            <Spinner
              className="size-4 text-foreground"
              aria-label="Forwarding"
            />
          ) : (
            <SendHorizontal
              className="size-4 text-slate-muted transition-colors group-hover:text-foreground"
              aria-hidden="true"
            />
          )}
        </button>
      </GroupedMenuAction>
    </GroupedMenuItem>
  );
}
