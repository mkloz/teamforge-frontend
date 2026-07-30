import { Check } from "lucide-react";

import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import { StatusFacts } from "./status-facts";
import type { InvitesSentSummary, StatusFactItem } from "./types";

interface InvitesSentHeroProps {
  facts: StatusFactItem[];
  summary: InvitesSentSummary;
}

export function InvitesSentHero({ facts, summary }: InvitesSentHeroProps) {
  const hasPendingInvitations = summary.isManual && summary.inviteCount > 0;

  return (
    <section>
      {hasPendingInvitations || !summary.isManual ? (
        <StatusPill icon={Check} tone="teal" size="sm" className="w-fit">
          {hasPendingInvitations ? "Invitations sent" : "Group ready"}
        </StatusPill>
      ) : null}

      <h1
        className={cn(
          "max-w-2xl text-balance font-black text-2xl text-foreground leading-[1.08] tracking-tight sm:text-4xl",
          (hasPendingInvitations || !summary.isManual) && "mt-3 sm:mt-4",
        )}
      >
        {hasPendingInvitations
          ? "Your invitations are on their way."
          : summary.isManual
            ? "Your group is ready."
            : "Your group has a place to begin."}
      </h1>
      <p className="mt-2.5 max-w-xl text-muted-foreground text-sm leading-relaxed sm:mt-3 sm:text-base">
        {getHeroDescription(summary)}
      </p>

      <div className="mt-5 sm:mt-6">
        <StatusFacts facts={facts} />
      </div>
    </section>
  );
}

function getHeroDescription(summary: InvitesSentSummary) {
  if (summary.isManual && summary.inviteCount > 0) {
    return `${summary.inviteCount} ${
      summary.inviteCount === 1 ? "friend has" : "friends have"
    } been invited to ${summary.displayGroupName}. Replies and chat will appear in the workspace.`;
  }

  if (summary.isManual) {
    return `${summary.displayGroupName} has been created. Open the workspace when you are ready to invite people and continue planning ${summary.planName}.`;
  }

  return `${summary.displayGroupName} is ready. Open the workspace to meet the members and continue planning ${summary.planName}.`;
}
