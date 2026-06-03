import { ChevronDown, ChevronUp } from "lucide-react";
import { memo } from "react";
import { PROPOSAL_STATUS_LABELS } from "@/features/activity/lib/proposal-language";
import { IconTile } from "@/shared/components/ui/icon-tile";
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
  PENDING: "text-spark-amber",
  APPROVED: "text-forge-teal",
  REJECTED: "text-slate-muted",
  WITHDRAWN: "text-slate-muted",
  CANCELLED: "text-slate-muted",
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
      aria-expanded={isExpanded}
      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${
        FIELD_LABELS[field]
      } proposal`}
      className="group/header flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/18"
      onClick={onToggle}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <IconTile
          icon={Icon}
          size="sm"
          shape="square"
          tone="amber"
          className="bg-spark-amber/14"
        />
        <div className="min-w-0 flex-1">
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
            "font-bold text-micro leading-none transition-colors",
            STATUS_STYLES[status],
          )}
        >
          {PROPOSAL_STATUS_LABELS[status]}
        </span>
        {isExpanded ? (
          <ChevronUp className="size-3.5 text-muted-foreground transition-colors group-hover/header:text-foreground" />
        ) : (
          <ChevronDown className="size-3.5 text-muted-foreground transition-colors group-hover/header:text-foreground" />
        )}
      </div>
    </button>
  );
});
