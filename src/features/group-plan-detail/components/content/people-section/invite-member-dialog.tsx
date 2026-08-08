import { RefreshCcw, Send, UserPlus, Users } from "lucide-react";
import { type ReactNode, useState } from "react";
import type { GroupInviteSuggestionsState } from "@/features/group-plan-detail/hooks/use-group-invite-suggestions";
import type { GroupInviteSuggestion } from "@/features/group-plan-detail/schemas/group-invite-suggestion.schema";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  GroupedMenuAction,
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { Notice } from "@/shared/components/ui/notice";

export function InviteMemberDialog({
  invitations,
  trigger,
}: {
  invitations: GroupInviteSuggestionsState;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-2xl border-border/50 bg-popover p-0">
        <DialogHeader className="px-5 pt-5 pr-14 pb-3 text-left sm:px-6 sm:pt-6 sm:pr-16">
          <span className="flex items-center gap-2 font-semibold text-muted-foreground text-xs">
            <Users className="size-4 text-foreground" aria-hidden="true" />
            Open member places
          </span>
          <DialogTitle className="mt-2 font-black text-xl">
            Invite someone
          </DialogTitle>
          <DialogDescription>
            Choose a person whose interests fit this plan. Their place stays
            reserved while the invitation is pending.
          </DialogDescription>
        </DialogHeader>
        <InviteDialogContent
          invitations={invitations}
          onInvited={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function InviteDialogContent({
  invitations,
  onInvited,
}: {
  invitations: GroupInviteSuggestionsState;
  onInvited: () => void;
}) {
  if (invitations.isLoading) {
    return <InviteDialogLoading />;
  }

  if (invitations.error && invitations.items.length === 0) {
    return (
      <div className="grid gap-4 px-5 pt-2 pb-5 sm:px-6 sm:pb-6">
        <Notice tone="warning" size="md" role="alert">
          {invitations.error}
        </Notice>
        <Button
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={invitations.onRetry}
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
          Refresh suggestions
        </Button>
      </div>
    );
  }

  if (invitations.items.length === 0) {
    return (
      <div className="mx-5 mb-5 flex min-h-40 flex-col items-center justify-center rounded-xl border border-border/50 border-dashed px-6 py-8 text-center sm:mx-6 sm:mb-6">
        <UserPlus
          className="size-7 text-muted-foreground/60"
          aria-hidden="true"
        />
        <p className="mt-3 font-semibold text-ink text-sm">
          No eligible people are available right now.
        </p>
        <p className="mt-1 max-w-72 text-muted-foreground text-xs leading-relaxed">
          An open place will remain visible in the group, so you can try again
          later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid min-h-0 gap-3 px-5 pt-2 pb-5 sm:px-6 sm:pb-6">
      {invitations.error ? (
        <Notice tone="warning" size="md" role="alert">
          {invitations.error}
        </Notice>
      ) : null}
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-muted-foreground text-xs">
          <span className="font-semibold text-ink">
            {invitations.items.length}
          </span>{" "}
          {invitations.items.length === 1 ? "suggestion" : "suggestions"} for
          this plan
        </p>
        <Button
          aria-label="Refresh invitation suggestions"
          disabled={invitations.isRefreshing}
          loading={invitations.isRefreshing}
          onClick={invitations.onRetry}
          size="icon-xs"
          title="Refresh suggestions"
          variant="ghost"
        >
          <RefreshCcw className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
      <GroupedMenuList className="max-h-80 overflow-y-auto pr-0.5">
        {invitations.items.map((suggestion) => (
          <GroupedMenuItem key={suggestion.suggestionId}>
            <InviteSuggestionRow
              suggestion={suggestion}
              disabled={invitations.isInviting || !invitations.isOnline}
              pending={
                invitations.pendingSuggestionId === suggestion.suggestionId
              }
              onInvite={async () => {
                if (await invitations.onInvite(suggestion.suggestionId)) {
                  onInvited();
                }
              }}
            />
          </GroupedMenuItem>
        ))}
      </GroupedMenuList>
      <p className="px-1 text-muted-foreground text-xs leading-relaxed">
        You can cancel a pending invitation from its ghost member place.
      </p>
    </div>
  );
}

function InviteSuggestionRow({
  disabled,
  onInvite,
  pending,
  suggestion,
}: {
  disabled: boolean;
  onInvite: () => Promise<void>;
  pending: boolean;
  suggestion: GroupInviteSuggestion;
}) {
  return (
    <GroupedMenuAction className="min-h-16 px-3 py-2.5">
      <Avatar
        src={suggestion.avatar}
        media={suggestion.avatarMedia ?? null}
        name={suggestion.name}
        className="size-10 ring-1 ring-border/40"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink text-sm">
          {suggestion.name}
        </p>
        <p className="mt-0.5 truncate text-muted-foreground text-xs">
          {suggestion.reason.label}
        </p>
      </div>
      <Button
        size="xs"
        disabled={disabled}
        loading={pending}
        onClick={() => void onInvite()}
      >
        <Send className="size-3.5" aria-hidden="true" />
        Invite
      </Button>
    </GroupedMenuAction>
  );
}

function InviteDialogLoading() {
  return (
    <div
      className="grouped-surface grid px-5 pt-2 pb-5 sm:px-6 sm:pb-6"
      role="status"
    >
      {["first", "second", "third"].map((item) => (
        <div
          key={item}
          className="flex min-h-16 items-center gap-3 bg-card px-3 py-2.5 first:rounded-t-2xl last:rounded-b-2xl"
        >
          <div className="size-10 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
          <div className="grid flex-1 gap-2">
            <div className="h-3 w-32 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-44 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading invitation suggestions</span>
    </div>
  );
}
