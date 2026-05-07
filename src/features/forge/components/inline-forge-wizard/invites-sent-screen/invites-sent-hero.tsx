import { Check } from "lucide-react";

import { StatusFacts } from "./status-facts";
import type { InvitesSentSummary, StatusFactItem } from "./types";

interface InvitesSentHeroProps {
  facts: StatusFactItem[];
  summary: InvitesSentSummary;
}

export function InvitesSentHero({ facts, summary }: InvitesSentHeroProps) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-forge-teal text-primary-foreground shadow-sm shadow-forge-teal/20">
          <Check size={22} strokeWidth={2.6} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold tracking-wide text-forge-teal uppercase">
            {summary.isManual ? "Invitations sent" : "Group is live"}
          </p>
          <h2 className="mt-1 text-3xl leading-tight font-black tracking-tight text-foreground sm:text-4xl">
            {summary.displayGroupName} is ready.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {summary.isManual
              ? "The group has been formed and invitations are on their way."
              : "The group has been formed. You can start coordinating from the hub."}
          </p>
        </div>
      </div>

      <StatusFacts facts={facts} />
    </section>
  );
}
