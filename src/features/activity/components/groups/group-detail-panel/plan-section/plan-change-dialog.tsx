import { domMax, LazyMotion } from "framer-motion";
import { Type, X } from "lucide-react";
import type { ReactElement } from "react";
import type { Plan } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { PlanFieldItem } from "./plan-change-field-row";
import { isPlanLocationMode } from "./plan-change-location-value";
import {
  getCurrentProposalValue,
  PLAN_PROPOSAL_FIELD_OPTIONS,
} from "./plan-proposal-fields";
import { usePlanProposalForm } from "./use-plan-proposal-form";

interface PlanChangeDialogProps {
  className?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  plan: Plan;
  trigger?: ReactElement | null;
}

export function PlanChangeDialog({
  className,
  onOpenChange,
  open,
  plan,
  trigger,
}: PlanChangeDialogProps) {
  const form = usePlanProposalForm(plan, { onOpenChange, open });

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      form.openForm();
      return;
    }
    form.closeForm();
  }

  function handleLocationModeChange(locationMode: string) {
    if (!isPlanLocationMode(locationMode)) {
      return;
    }

    form.setLocationValue((current) => ({
      ...current,
      location: locationMode === "TBD" ? "" : current.location,
      locationLat: null,
      locationLng: null,
      locationMode,
    }));
  }

  return (
    <LazyMotion features={domMax}>
      <Dialog open={form.isOpen} onOpenChange={handleOpenChange}>
        {trigger !== null ? (
          <DialogTrigger asChild>
            {trigger ?? (
              <Button
                variant="primary"
                size="xs"
                className={className}
                contentClassName="gap-1.5"
              >
                <Type className="size-3.5" aria-hidden="true" />
                <span className="truncate">Suggest</span>
              </Button>
            )}
          </DialogTrigger>
        ) : null}

        <DialogContent className="max-h-[90svh] overflow-y-auto rounded-3xl bg-popover p-0 sm:max-w-sm [&>button]:hidden">
          <PlanChangeDialogHeader onClose={form.closeForm} />

          <ul aria-label="Plan fields" className="border-border/50 border-t">
            {PLAN_PROPOSAL_FIELD_OPTIONS.map((option, index) => (
              <PlanFieldItem
                key={option.value}
                currentValue={getCurrentProposalValue(plan, option.value)}
                form={form}
                isLast={index === PLAN_PROPOSAL_FIELD_OPTIONS.length - 1}
                option={option}
                onLocationModeChange={handleLocationModeChange}
              />
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </LazyMotion>
  );
}

function PlanChangeDialogHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-start justify-between px-5 pt-6 pb-4">
      <div>
        <h2 className="font-semibold text-base text-ink">
          What would you change?
        </h2>
        <p className="mt-0.5 max-w-[24ch] text-slate-muted text-xs leading-relaxed">
          Tap a detail. Your idea goes to a group vote.
        </p>
      </div>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-slate-muted transition-colors hover:bg-muted hover:text-ink"
      >
        <X className="size-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
