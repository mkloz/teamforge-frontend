import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { ActivityApi } from "@/features/activity/api/activity.api";
import type { Plan } from "@/features/activity/lib/activity-contract";

const FIELD_OPTIONS = [
  { value: "TITLE", label: "Title" },
  { value: "DESCRIPTION", label: "Description" },
  { value: "DATE_TIME", label: "Date & Time" },
  { value: "LOCATION", label: "Location" },
] as const;

type ProposalField = (typeof FIELD_OPTIONS)[number]["value"];

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getCurrentValue(plan: Plan, field: ProposalField) {
  switch (field) {
    case "TITLE":
      return plan.title;
    case "DESCRIPTION":
      return plan.description ?? "";
    case "DATE_TIME":
      return toDateTimeLocalValue(plan.dateTime);
    case "LOCATION":
      return plan.location ?? "";
  }
}

function normalizeProposedValue(field: ProposalField, value: string) {
  if (field === "DATE_TIME") {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  return value.trim();
}

interface CreatePlanProposalFormProps {
  plan: Plan;
}

export function CreatePlanProposalForm({ plan }: CreatePlanProposalFormProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [field, setField] = useState<ProposalField>("TITLE");
  const [value, setValue] = useState(plan.title);
  const [error, setError] = useState<string | null>(null);

  const currentValue = useMemo(
    () => getCurrentValue(plan, field),
    [field, plan],
  );
  const isDateField = field === "DATE_TIME";

  const createMutation = useMutation({
    mutationKey: ["activity", "proposal", "create", plan.id],
    mutationFn: (payload: { field: ProposalField; proposedValue: string }) =>
      ActivityApi.createPlanProposal(plan.id, payload),
    onSuccess: async () => {
      setError(null);
      setIsOpen(false);
      setField("TITLE");
      setValue(plan.title);
      await queryClient.invalidateQueries({
        queryKey: ["activity-selection", "group", plan.groupId],
      });
    },
    onError: () => {
      setError("We couldn't submit that proposal. Please try again.");
    },
  });

  const handleFieldChange = (nextField: ProposalField) => {
    setField(nextField);
    setValue(getCurrentValue(plan, nextField));
    setError(null);
  };

  const handleSubmit = async () => {
    const proposedValue = normalizeProposedValue(field, value);

    if (
      !proposedValue ||
      proposedValue === normalizeProposedValue(field, currentValue)
    ) {
      setError("Add a new value before sending a proposal.");
      return;
    }

    setError(null);
    await createMutation.mutateAsync({
      field,
      proposedValue,
    });
  };

  if (!isOpen) {
    return (
      <div className="mt-5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="rounded-xl"
        >
          Suggest a Change
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-border/60 bg-card/70 p-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-foreground">New Proposal</p>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Field
        </label>
        <select
          value={field}
          onChange={(event) =>
            handleFieldChange(event.target.value as ProposalField)
          }
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-forge-teal"
        >
          {FIELD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Current
        </label>
        <div className="rounded-xl bg-muted/50 px-3 py-2 text-sm text-foreground/70">
          {currentValue || "Not set"}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Proposed
        </label>
        {isDateField ? (
          <input
            type="datetime-local"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-forge-teal"
          />
        ) : (
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={field === "DESCRIPTION" ? 3 : 2}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-forge-teal"
          />
        )}
      </div>

      {error && (
        <p className="text-[11px] font-medium text-destructive">{error}</p>
      )}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          onClick={() => void handleSubmit()}
          disabled={createMutation.isPending}
          className={cn("rounded-xl", createMutation.isPending && "opacity-80")}
        >
          {createMutation.isPending ? "Sending..." : "Send Proposal"}
        </Button>
      </div>
    </div>
  );
}
