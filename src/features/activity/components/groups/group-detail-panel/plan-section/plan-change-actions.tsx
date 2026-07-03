import { SendHorizontal } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { PlanProposalForm } from "./plan-change-dialog-types";

export function PlanChangeActions({ form }: { form: PlanProposalForm }) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      {!form.isOnline ? (
        <output className="mr-auto min-w-0 text-slate-muted text-xs">
          Reconnect before sending.
        </output>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={form.closeForm}
        className="text-slate-muted"
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        disabled={!form.isOnline}
        loading={form.isCreating}
        onClick={() => void form.handleSubmit()}
        title={
          form.isOnline
            ? undefined
            : "Reconnect before suggesting plan changes."
        }
      >
        <SendHorizontal className="size-3.5" aria-hidden="true" />
        Send to group
      </Button>
    </div>
  );
}
