import { MessageSquare, UsersRound } from "lucide-react";

import type { NextActionItem } from "./types";

interface NextActionsProps {
  inviteCount: number;
  isManual: boolean;
}

export function NextActions({ inviteCount, isManual }: NextActionsProps) {
  const hasPendingInvitations = isManual && inviteCount > 0;
  const actions = getNextActions({ hasPendingInvitations, isManual });

  return (
    <section aria-labelledby="while-you-wait-heading">
      <h2
        id="while-you-wait-heading"
        className="font-black text-foreground text-sm"
      >
        {hasPendingInvitations
          ? "While you wait"
          : isManual
            ? "Next steps"
            : "Start here"}
      </h2>

      <div className="mt-2.5 grid border-border/40 border-y sm:grid-cols-2 sm:divide-x sm:divide-border/35">
        {actions.map((action) => (
          <NextAction key={action.title} {...action} />
        ))}
      </div>
    </section>
  );
}

function getNextActions({
  hasPendingInvitations,
  isManual,
}: {
  hasPendingInvitations: boolean;
  isManual: boolean;
}): NextActionItem[] {
  return [
    {
      icon: UsersRound,
      text: getMembersActionText({ hasPendingInvitations, isManual }),
      title: hasPendingInvitations
        ? "Track replies"
        : isManual
          ? "Invite members"
          : "Review members",
    },
    {
      icon: MessageSquare,
      text: "Settle timing, links, and the remaining details together.",
      title: "Open the conversation",
    },
  ];
}

function getMembersActionText({
  hasPendingInvitations,
  isManual,
}: {
  hasPendingInvitations: boolean;
  isManual: boolean;
}) {
  if (hasPendingInvitations) {
    return "Accepted friends appear in Members as they respond.";
  }

  if (isManual) {
    return "Choose any open member slot when you are ready to invite someone.";
  }

  return "See who joined and review the group roster.";
}

function NextAction({ icon: Icon, text, title }: NextActionItem) {
  return (
    <div className="flex min-w-0 gap-3 py-3.5 sm:px-4 sm:py-4 first:sm:pl-0">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-foreground"
        strokeWidth={2}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <h3 className="font-bold text-foreground text-sm leading-tight">
          {title}
        </h3>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}
