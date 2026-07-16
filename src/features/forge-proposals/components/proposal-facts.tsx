import {
  CalendarClock,
  CircleDollarSign,
  type LucideIcon,
  MapPin,
  UsersRound,
} from "lucide-react";

import type { ForgeProposal } from "@/features/forge-proposals/lib/forge-proposal-contract";
import {
  getProposalCostText,
  getProposalPlaceText,
  getProposalScheduleText,
} from "@/features/forge-proposals/lib/forge-proposal-presentation";
import { IconTile } from "@/shared/components/ui/icon-tile";

interface ProposalFactsProps {
  proposal: ForgeProposal;
}

export function ProposalFacts({ proposal }: ProposalFactsProps) {
  const schedule = getProposalScheduleText(proposal);
  const place = getProposalPlaceText(proposal);

  return (
    <dl className="grid gap-x-8 gap-y-5 border-border/70 border-y py-6 sm:grid-cols-2">
      <ProposalFact
        icon={CalendarClock}
        label="Date and time"
        value={schedule.label}
        detail={schedule.detail}
      />
      <ProposalFact
        icon={MapPin}
        label="Where"
        value={place.label}
        detail={place.detail}
      />
      <ProposalFact
        icon={UsersRound}
        label="Group size"
        value={`Aiming for ${proposal.targetGroupSize}`}
        detail={`The group can form with ${proposal.minimumGroupSize}.`}
      />
      <ProposalFact
        icon={CircleDollarSign}
        label="Cost"
        value={getProposalCostText(proposal)}
        detail={
          proposal.cost === "PAID" && proposal.costAmount !== null
            ? (proposal.costDetails ?? undefined)
            : undefined
        }
      />
    </dl>
  );
}

function ProposalFact({
  detail,
  icon,
  label,
  value,
}: {
  detail?: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <IconTile icon={icon} size="lg" tone="teal" className="rounded-xl" />
      <div className="min-w-0">
        <dt className="font-semibold text-muted-foreground text-xs">{label}</dt>
        <dd className="mt-1 font-semibold text-foreground text-sm">{value}</dd>
        {detail ? (
          <dd className="mt-1 text-muted-foreground text-xs leading-relaxed">
            {detail}
          </dd>
        ) : null}
      </div>
    </div>
  );
}
