import { FlaskConical, Gauge } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import type { PersonalityAssessmentCapabilities } from "@/shared/schemas/personality-assessment";
import { LengthOptionSelectionIndicator } from "./length-option-selection-indicator";

interface DynamicAssessmentOptionCardProps {
  capability: PersonalityAssessmentCapabilities["dynamic"];
  isSelected: boolean;
  onSelect: () => void;
}

export function DynamicAssessmentOptionCard({
  capability,
  isSelected,
  onSelect,
}: DynamicAssessmentOptionCardProps) {
  const available = ["PUBLIC_BETA", "AVAILABLE"].includes(
    capability.startPolicy,
  );

  return (
    <Button
      type="button"
      variant="ghost"
      disabled={!available}
      onClick={onSelect}
      className={cn(
        "relative h-auto w-full overflow-hidden rounded-xl border-2 bg-card p-4 text-left text-card-foreground shadow-none transition-all duration-300 focus-visible:ring-forge-teal/20 sm:p-4.5",
        isSelected
          ? "border-forge-teal/30 bg-forge-teal/8"
          : "border-forge-teal/10 hover:border-forge-teal/20 dark:border-forge-teal/20",
      )}
      contentClassName="block h-auto w-full"
    >
      <div className="relative z-10 grid grid-cols-1 items-center gap-3.5 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-5">
        <div className="flex items-center gap-3">
          <LengthOptionSelectionIndicator isSelected={isSelected} />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold font-sans text-base text-ink leading-tight">
                Dynamic
              </span>
              <StatusPill tone="teal" size="xs" surface="soft">
                Beta
              </StatusPill>
            </div>
            <span className="font-bold font-sans text-muted-foreground text-xs">
              {capability.minimumQuestions}–{capability.maximumQuestions} items
              · {capability.minimumPages}–{capability.maximumPages} short pages
            </span>
          </div>
        </div>

        <div className="hidden h-10 w-px bg-border/80 sm:block dark:bg-white/8" />

        <div className="flex flex-col gap-1.5 text-muted-foreground text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-ink">
            <Gauge className="size-4 text-forge-teal" aria-hidden="true" />
            Adapts after each page
          </span>
          <span className="flex items-start gap-1.5 leading-snug">
            <FlaskConical
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            Experimental self-insight; not yet used to form groups.
          </span>
        </div>
      </div>
    </Button>
  );
}
