import { RefreshCcw, Send } from "lucide-react";
import { Section } from "@/features/group-plan-detail/components/section";
import { useGroupInviteSuggestions } from "@/features/group-plan-detail/hooks/use-group-invite-suggestions";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import type { GroupInviteSuggestion } from "@/features/group-plan-detail/schemas/group-invite-suggestion.schema";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";

export function InviteSuggestionsSection({
  detail,
}: {
  detail: GroupPlanDetail;
}) {
  const suggestions = useGroupInviteSuggestions(detail);

  if (!suggestions.isEligible) {
    return null;
  }

  return (
    <Section
      heading="People who may be interested"
      headingId="invite-suggestions-heading"
      trailing={
        suggestions.isRefreshing ? (
          <span className="text-muted-foreground text-xs" role="status">
            Refreshing
          </span>
        ) : null
      }
    >
      <InviteSuggestionsContent suggestions={suggestions} />
    </Section>
  );
}

function InviteSuggestionsContent({
  suggestions,
}: {
  suggestions: ReturnType<typeof useGroupInviteSuggestions>;
}) {
  if (!suggestions.isOnline && suggestions.items.length === 0) {
    return (
      <Notice tone="neutral" size="md" role="status">
        Reconnect to see who is open to an activity invitation.
      </Notice>
    );
  }

  if (suggestions.isLoading) {
    return <InviteSuggestionsLoading />;
  }

  if (suggestions.error && suggestions.items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3" role="alert">
        <p className="text-muted-foreground text-sm">{suggestions.error}</p>
        <Button variant="outline" size="sm" onClick={suggestions.onRetry}>
          <RefreshCcw className="size-4" aria-hidden="true" />
          Refresh suggestions
        </Button>
      </div>
    );
  }

  if (suggestions.items.length === 0) {
    return (
      <div className="flex min-h-24 items-center justify-center text-center">
        <p className="max-w-md text-muted-foreground text-sm">
          No one is available to suggest right now. The list can change as
          people update their interests and invitation settings.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {suggestions.error ? (
        <Notice tone="warning" size="md" role="alert">
          {suggestions.error}
        </Notice>
      ) : null}

      {!suggestions.isOnline ? (
        <Notice tone="neutral" size="md" role="status">
          This is the last list TeamForge loaded. Reconnect before sending an
          invitation.
        </Notice>
      ) : null}

      <ul className="divide-y divide-border/70 border-border/70 border-y">
        {suggestions.items.map((suggestion) => (
          <InviteSuggestionRow
            key={suggestion.suggestionId}
            suggestion={suggestion}
            disabled={suggestions.isInviting || !suggestions.isOnline}
            isPending={
              suggestions.pendingSuggestionId === suggestion.suggestionId
            }
            onInvite={suggestions.onInvite}
          />
        ))}
      </ul>
    </div>
  );
}

function InviteSuggestionRow({
  disabled,
  isPending,
  onInvite,
  suggestion,
}: {
  disabled: boolean;
  isPending: boolean;
  onInvite: (suggestionId: string) => Promise<void>;
  suggestion: GroupInviteSuggestion;
}) {
  return (
    <li className="flex min-h-16 items-center gap-3 py-3">
      <Avatar
        src={suggestion.avatar}
        media={suggestion.avatarMedia ?? null}
        name={suggestion.name}
        imageSize={64}
        className="size-10 ring-1 ring-border/40"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-foreground text-sm">
          {suggestion.name}
        </p>
        <p className="mt-1 truncate text-muted-foreground text-xs">
          {suggestion.reason.label}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        loading={isPending}
        onClick={() => void onInvite(suggestion.suggestionId)}
      >
        <Send className="size-4" aria-hidden="true" />
        Invite
      </Button>
    </li>
  );
}

function InviteSuggestionsLoading() {
  return (
    <div className="grid gap-3" role="status">
      {["first", "second", "third"].map((item) => (
        <div key={item} className="flex items-center gap-3 py-2">
          <div className="size-10 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
          <div className="grid flex-1 gap-2">
            <div className="h-3 w-32 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-48 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
          </div>
          <div className="h-8 w-20 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        </div>
      ))}
      <span className="sr-only">Loading invitation suggestions</span>
    </div>
  );
}
