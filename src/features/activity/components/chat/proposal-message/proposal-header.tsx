import { ChevronDown, ChevronUp } from "lucide-react";
import { memo } from "react";

import type { PlanProposalStatus } from "@/shared/schemas/enums";
import { cn } from "@/shared/lib/utils";

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
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
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
      className="flex w-full items-center justify-between px-3 py-2 text-left"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-spark-amber/20 text-spark-amber shadow-xs">
          <Icon size={14} />
        </div>
        <div>
          <h4 className="mb-1 text-micro font-black uppercase tracking-widest text-spark-amber/70 leading-none">
            Change Proposal
          </h4>
          <p className="text-xs font-bold text-foreground leading-none">
            {FIELD_LABELS[field]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            STATUS_STYLES[status],
          )}
        >
          {status}
        </span>
        {isExpanded ? (
          <ChevronUp size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </div>
    </button>
  );
});
