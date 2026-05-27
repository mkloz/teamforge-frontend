import { Lightbulb, SendHorizontal, X } from "lucide-react";
import { useState } from "react";
import type { CreateGroupPlanProposalPayload } from "@/features/group-plan-detail/api/group-plan-detail.api";
import { ProposalValueInput } from "@/features/group-plan-detail/components/plan-change-dialog/proposal-value-input";
import { usePlanChangeForm } from "@/features/group-plan-detail/components/plan-change-dialog/use-plan-change-form";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { planProposalFieldOptions } from "@/features/group-plan-detail/lib/group-plan-proposal-formatters";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface PlanChangeDialogProps {
  detail: GroupPlanDetail;
  disabled?: boolean;
  isCreating: boolean;
  onCreate: (payload: CreateGroupPlanProposalPayload) => Promise<unknown>;
}

export function PlanChangeDialog({
  detail,
  disabled = false,
  isCreating,
  onCreate,
}: PlanChangeDialogProps) {
  const [open, setOpen] = useState(false);
  const form = usePlanChangeForm({
    detail,
    onCreate,
    onSubmitted: () => {
      setOpen(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        if (!isOpen) {
          form.resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || !form.plan}>
          <Lightbulb className="size-4" aria-hidden="true" />
          Suggest change
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Suggest a plan change</DialogTitle>
          <DialogDescription>
            Put one clear adjustment in front of the group. Everyone can review
            it before the plan moves.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="plan-change-field">Detail</Label>
            <Select value={form.field} onValueChange={form.handleFieldChange}>
              <SelectTrigger id="plan-change-field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {planProposalFieldOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.plan ? (
            <div className="grid gap-2">
              <Label>Current</Label>
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 font-medium text-muted-foreground text-sm">
                {form.currentValue || "Not set"}
              </div>
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label id="plan-change-value-label">Proposed</Label>
            <ProposalValueInput
              field={form.field}
              value={form.value}
              locationValue={form.locationValue}
              costValue={form.costValue}
              labelId="plan-change-value-label"
              onCostChange={form.setCostValue}
              onLocationChange={form.setLocationValue}
              onValueChange={form.setValue}
            />
          </div>

          {form.error ? (
            <p
              id="plan-change-error"
              aria-live="polite"
              className="font-medium text-destructive text-sm"
            >
              {form.error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
            }}
          >
            <X className="size-4" aria-hidden="true" />
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isCreating}
            disabled={disabled || !form.plan}
            onClick={() => void form.submit()}
          >
            <SendHorizontal className="size-4" aria-hidden="true" />
            Send change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
