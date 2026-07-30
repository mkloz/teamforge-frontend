import { SendHorizontal, X } from "lucide-react";
import { useState } from "react";
import type { CreateGroupPlanProposalPayload } from "@/features/group-plan-detail/api/group-plan-detail.api";
import { PlanChangeFieldRow } from "@/features/group-plan-detail/components/plan-change-dialog/plan-change-field-row";
import { usePlanChangeForm } from "@/features/group-plan-detail/components/plan-change-dialog/use-plan-change-form";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  isPlanProposalField,
  planProposalFieldOptions,
} from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import { Accordion } from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
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

  function handleFieldOpenChange(field: string) {
    if (!field) {
      setExpanded(null);
      return;
    }

    if (isPlanProposalField(field)) {
      form.handleFieldChange(field);
      setExpanded(field);
    }
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

      <DialogContent
        overlayClassName="z-[110]"
        className="z-120 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-border/70 bg-popover p-0 sm:max-w-lg [&>button]:hidden"
      >
        <header className="flex items-start justify-between border-border/55 border-b px-5 py-5">
          <div className="min-w-0 pr-4">
            <DialogTitle className="font-semibold text-ink text-lg">
              Suggest a plan change
            </DialogTitle>
            <DialogDescription className="mt-1 text-slate-muted text-sm leading-relaxed">
              Choose one detail. The group votes before it changes.
            </DialogDescription>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => handleOpenChange(false)}
            className="-mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-slate-muted transition-colors hover:bg-black/8 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" strokeWidth={2.25} />
          </button>
        </header>

        <div className="min-h-0 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex min-w-0 items-center gap-2 border-border/45 border-b pb-4 text-sm">
            <span className="shrink-0 text-muted-foreground">Current plan</span>
            <span aria-hidden="true" className="text-border">
              —
            </span>
            <span className="truncate font-semibold text-foreground">
              {form.plan?.title}
            </span>
          </div>

          <Accordion
            type="single"
            collapsible
            value={expanded ?? ""}
            onValueChange={handleFieldOpenChange}
            aria-label="Plan fields"
            className="flex flex-col gap-2"
          >
            {planProposalFieldOptions.map((option) => (
              <PlanChangeFieldRow
                key={option.value}
                form={form}
                option={option}
              />
            ))}
          </Accordion>
        </div>

        <footer className="border-border/55 border-t bg-popover px-5 py-4">
          <p className="mb-3 text-muted-foreground text-xs">
            {isOnline
              ? expanded
                ? "Only this detail will be sent for a vote."
                : "Choose the detail you want to change."
              : "Reconnect before sending a change."}
          </p>
          <div className="flex justify-end">
            <Button
              variant="primary"
              loading={isCreating}
              disabled={
                !expanded || disabled || !form.plan || !isOnline || isCreating
              }
              onClick={() => void form.submit()}
              className="w-full sm:w-auto"
            >
              <SendHorizontal className="size-4" aria-hidden="true" />
              Send for vote
            </Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
