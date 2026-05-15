import { Check } from "lucide-react";

import { StatusFacts } from "./status-facts";
import type { InvitesSentSummary, StatusFactItem } from "./types";

interface InvitesSentHeroProps {
  facts: StatusFactItem[];
  summary: InvitesSentSummary;
}

export function InvitesSentHero({ facts, summary }: InvitesSentHeroProps) {
  const statusMessage = summary.isManual
    ? "The group has been formed and invitations are on their way."
    : "The group has been formed. You can start coordinating from the hub.";

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-stretch gap-4">
        <div className="flex w-12 shrink-0 items-center justify-center rounded-lg bg-forge-teal text-primary-foreground shadow-forge-teal/20 shadow-sm">
          <Check size={22} strokeWidth={2.6} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <p className="font-bold text-forge-teal text-xs uppercase tracking-wide">
            {summary.isManual ? "Invitations sent" : "Group is live"}
          </p>
          <p className="max-w-xl text-muted-foreground text-sm leading-snug">
            {statusMessage}
          </p>
        </div>
      </div>

      <h2 className="max-w-3xl text-balance font-black text-3xl text-foreground leading-tight tracking-tight sm:text-4xl">
        {summary.displayGroupName} is ready.
      </h2>

      <StatusFacts facts={facts} />
    </section>
  );
}
