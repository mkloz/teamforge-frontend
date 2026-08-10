import { ClipboardCheck } from "lucide-react";
import {
  GroupConvergenceVisualEyebrow,
  GroupConvergenceVisualPanel,
} from "./plan-creation-orb-panel";

export function TrustCard() {
  return (
    <GroupConvergenceVisualPanel className="w-37.5 animate-plan-creation-card-float-c motion-reduce:animate-none">
      <GroupConvergenceVisualEyebrow className="mb-2.5">
        Review state
      </GroupConvergenceVisualEyebrow>
      <div className="flex items-center gap-2.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-brand-teal/75 bg-primary-soft">
          <ClipboardCheck
            aria-hidden="true"
            className="size-5 text-foreground"
            strokeWidth={2}
          />
        </div>
        <div>
          <p className="font-sans text-text-dark-muted text-xs leading-snug">
            Group to review
          </p>
          <p className="font-sans font-semibold text-slate-muted text-xs leading-snug">
            Plan details ready
          </p>
        </div>
      </div>
    </GroupConvergenceVisualPanel>
  );
}
