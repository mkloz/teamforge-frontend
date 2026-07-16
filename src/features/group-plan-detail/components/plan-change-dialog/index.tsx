import { domAnimation, LazyMotion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import type { CreateGroupPlanProposalPayload } from "@/features/group-plan-detail/api/group-plan-detail.api";
import { PlanChangeFieldRow } from "@/features/group-plan-detail/components/plan-change-dialog/plan-change-field-row";
import { usePlanChangeForm } from "@/features/group-plan-detail/components/plan-change-dialog/use-plan-change-form";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { planProposalFieldOptions } from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import type { PlanProposalField } from "@/shared/schemas/enums";

// ── Props ─────────────────────────────────────────────────────────────────────

interface PlanChangeDialogProps {
  detail: GroupPlanDetail;
  disabled?: boolean;
  initialField?: PlanProposalField;
  initialOpen?: boolean;
  isCreating: boolean;
  isOnline?: boolean;
  onCreate: (payload: CreateGroupPlanProposalPayload) => Promise<unknown>;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  triggerLabel?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PlanChangeDialog({
  detail,
  disabled = false,
  initialField,
  initialOpen = false,
  isCreating,
  isOnline = true,
  onCreate,
  onOpenChange,
  open,
  triggerLabel = "What would you change?",
}: PlanChangeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(initialOpen);
  const [expanded, setExpanded] = useState<PlanProposalField | null>(
    initialField ?? null,
  );
  const isControlled = open !== undefined;
  const dialogOpen = open ?? internalOpen;

  const form = usePlanChangeForm({
    detail,
    initialField,
    onCreate,
    onSubmitted: () => handleOpenChange(false),
  });

  function collapseField() {
    setExpanded(null);
  }

  function toggleField(field: PlanProposalField) {
    if (expanded === field) {
      setExpanded(null);
      return;
    }
    form.handleFieldChange(field);
    setExpanded(field);
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(isOpen);
    }
    if (!isOpen) {
      form.resetForm();
      setExpanded(initialField ?? null);
    }
    onOpenChange?.(isOpen);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || !form.plan}
          title={isOnline ? undefined : "Reconnect before suggesting changes."}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90svh] overflow-y-auto rounded-3xl bg-canvas p-0 sm:max-w-sm [&>button]:hidden">
        <LazyMotion features={domAnimation}>
          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex items-start justify-between px-5 pt-6 pb-4">
            <div>
              <h2 className="font-semibold text-base text-ink">
                What would you change?
              </h2>
              <p className="mt-0.5 max-w-[22ch] text-slate-muted text-xs leading-relaxed">
                Tap a detail. Your idea goes to a group vote.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => handleOpenChange(false)}
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-slate-muted transition-colors hover:bg-black/8 hover:text-ink"
            >
              <X className="size-3.5" strokeWidth={2.5} />
            </button>
          </div>

          {/* ── Accordion field list ───────────────────────────────── */}
          <ul aria-label="Plan fields" className="border-border/50 border-t">
            {planProposalFieldOptions.map((option, index) => (
              <PlanChangeFieldRow
                key={option.value}
                form={form}
                option={option}
                renderState={{
                  creating: isCreating,
                  disabled,
                  last: index === planProposalFieldOptions.length - 1,
                  online: isOnline,
                  open: expanded === option.value,
                }}
                onCollapse={collapseField}
                onToggle={() => toggleField(option.value)}
              />
            ))}
          </ul>
        </LazyMotion>
      </DialogContent>
    </Dialog>
  );
}
