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
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-forge-teal text-primary-foreground shadow-forge-teal/20 shadow-sm">
          <Check size={22} strokeWidth={2.6} />
        </div>
        <h2 className="max-w-3xl text-balance font-black text-3xl text-foreground leading-tight tracking-tight sm:text-4xl">
          {summary.isManual
            ? "Invitations sent"
            : `${summary.displayGroupName} is ready.`}
        </h2>
      </div>

      <StatusFacts facts={facts} />
    </section>
  );
}
