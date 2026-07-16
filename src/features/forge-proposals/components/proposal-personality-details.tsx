import { ChevronDown } from "lucide-react";

import type { ForgeProposalSeat } from "@/features/forge-proposals/lib/forge-proposal-contract";
import { proposalTraitLabels } from "@/features/forge-proposals/lib/forge-proposal-presentation";
import { cn } from "@/shared/lib/utils";

interface ProposalPersonalityDetailsProps {
  seat: ForgeProposalSeat;
}

const traitSegments = [1, 2, 3, 4, 5] as const;

export function ProposalPersonalityDetails({
  seat,
}: ProposalPersonalityDetailsProps) {
  return (
    <details className="group/personality mt-4">
      <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-lg font-semibold text-muted-foreground text-xs outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        Public personality details
        <ChevronDown
          className="size-3.5 transition-transform group-open/personality:rotate-180"
          aria-hidden="true"
          strokeWidth={2}
        />
      </summary>

      <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {proposalTraitLabels.map(([key, label]) => {
          const value = seat.profile.ocean[key];

          return (
            <div key={key}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <dt className="font-medium text-muted-foreground">{label}</dt>
                <dd className="font-semibold text-foreground tabular-nums">
                  {value}%
                </dd>
              </div>
              <div
                className="mt-1.5 grid grid-cols-5 gap-1"
                role="progressbar"
                aria-label={`${label}: ${value} percent`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value}
              >
                {traitSegments.map((segment) => (
                  <span
                    key={segment}
                    aria-hidden="true"
                    className={cn(
                      "h-1.5 rounded-full",
                      value > (segment - 1) * 20 ? "bg-primary" : "bg-muted",
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </dl>
    </details>
  );
}
