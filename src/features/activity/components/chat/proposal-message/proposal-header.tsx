import { ChevronDown, ChevronUp } from "lucide-react";
import { memo } from "react";
import { FIELD_ICONS, FIELD_LABELS } from "./constants";

interface ProposalHeaderProps {
  field: keyof typeof FIELD_ICONS;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ProposalHeader = memo(
  ({ field, isExpanded, onToggle }: ProposalHeaderProps) => (
    <div
      className="px-3 py-2 flex items-center justify-between cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-spark-amber/20 flex items-center justify-center text-spark-amber shadow-xs">
          {FIELD_ICONS[field]}
        </div>
        <div>
          <h4 className="text-micro font-black uppercase tracking-widest text-spark-amber/70 leading-none mb-1">
            Change Proposal
          </h4>
          <p className="text-xs font-bold text-ink leading-none">
            {FIELD_LABELS[field]}
          </p>
        </div>
      </div>
      {isExpanded ? (
        <ChevronUp size={16} className="text-slate-muted" />
      ) : (
        <ChevronDown size={16} className="text-slate-muted" />
      )}
    </div>
  ),
);
