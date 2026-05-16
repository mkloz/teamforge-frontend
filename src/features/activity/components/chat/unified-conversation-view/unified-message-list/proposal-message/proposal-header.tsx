import { ChevronDown, ChevronUp } from "lucide-react";
import { memo } from "react";
import { PROPOSAL_STATUS_LABELS } from "@/features/activity/lib/proposal-language";
import { cn } from "@/shared/lib/utils";
import type { PlanProposalStatus } from "@/shared/schemas/enums";
import { FIELD_ICON_COMPONENTS, FIELD_LABELS } from "./proposal-constants";

interface ProposalHeaderProps {
  field: keyof typeof FIELD_ICON_COMPONENTS;
  isExpanded: boolean;
  onToggle: () => void;
  status: PlanProposalStatus;
}

const STATUS_STYLES: Record<PlanProposalStatus, string> = {
  PENDING: "bg-spark-amber/12 text-spark-amber border-spark-amber/20",
  APPROVED: "bg-forge-teal/10 text-forge-teal border-forge-teal/20",
  REJECTED: "bg-slate-muted/10 text-slate-muted border-slate-muted/20",
  WITHDRAWN: "bg-muted text-muted-foreground border-border",
};

export const ProposalHeader = memo(function ProposalHeader({
  field,
  isExpanded,
  onToggle,
  status,
}: ProposalHeaderProps) {
  const Icon = FIELD_ICON_COMPONENTS[field];

  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-forge-teal/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/18"
      onClick={onToggle}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-spark-amber/14 text-spark-amber">
          <Icon className="size-3.5" />
        </div>
        <div className="min-w-0">
          <h4 className="mb-0.5 truncate font-bold text-micro text-spark-amber/80 leading-none">
            Plan change
          </h4>
          <p className="truncate font-bold text-foreground text-xs leading-none">
            {FIELD_LABELS[field]}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 font-bold text-micro",
            STATUS_STYLES[status],
          )}
        >
          {PROPOSAL_STATUS_LABELS[status]}
        </span>
        {isExpanded ? (
          <ChevronUp className="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-3.5 text-muted-foreground" />
        )}
      </div>
    </button>
  );
});
