import { ChevronDown, ChevronUp } from "lucide-react";
import { memo } from "react";
import { Button } from "@/shared/components/ui/button";
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
    <Button
      type="button"
      variant="ghost"
      className="h-auto w-full justify-between px-3 py-2 text-left"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-spark-amber/20 text-spark-amber shadow-xs">
          <Icon className="size-3.5" />
        </div>
        <div>
          <h4 className="mb-1 font-black text-spark-amber/70 text-xs uppercase leading-none tracking-wider">
            Change Proposal
          </h4>
          <p className="font-bold text-foreground text-xs leading-none">
            {FIELD_LABELS[field]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-1 font-bold text-xs uppercase tracking-wider",
            STATUS_STYLES[status],
          )}
        >
          {status}
        </span>
        {isExpanded ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </div>
    </Button>
  );
});
