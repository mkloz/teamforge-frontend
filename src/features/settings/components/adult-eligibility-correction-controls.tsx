import { CalendarClock, RotateCcw, X } from "lucide-react";
import type { FormEvent } from "react";

import type { useAdultEligibilityCorrection } from "@/features/settings/hooks/use-adult-eligibility-correction";
import { getCorrectionStatusCopy } from "@/features/settings/lib/account-data-copy";
import { DateOfBirthField } from "@/shared/components/profile/date-of-birth-field";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { Notice } from "@/shared/components/ui/notice";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { StatusPill } from "@/shared/components/ui/status-pill";

interface AdultEligibilityCorrectionControlsProps {
  state: ReturnType<typeof useAdultEligibilityCorrection>;
}

const CORRECTION_STATUS_LABELS = {
  OPEN: "Review in progress",
  RESOLVED: "Correction completed",
  REJECTED: "No change made",
  CANCELLED: "Request cancelled",
} as const;

export function AdultEligibilityCorrectionControls({
  state,
}: AdultEligibilityCorrectionControlsProps) {
  const correction = state.correction;
  const canRequest =
    !state.isLoading &&
    !state.hasLoadError &&
    (!correction || correction.canRequestAnother);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    void state.submitCorrection(event);
  }

  return (
    <div className="border-border border-t pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-ink text-sm">
            Correct the date used for your check
          </h4>
          <p className="mt-1 text-slate-muted text-sm leading-relaxed">
            {state.isLoading
              ? "Checking your latest correction request…"
              : getCorrectionStatusCopy(correction)}
          </p>
        </div>

        {correction ? (
          <StatusPill
            tone={correction.status === "OPEN" ? "amber" : "neutral"}
            size="sm"
          >
            {CORRECTION_STATUS_LABELS[correction.status]}
          </StatusPill>
        ) : null}
      </div>

      {state.error ? (
        <Notice
          className="mt-4"
          role="alert"
          tone="danger"
          size="md"
          action={
            state.hasLoadError ? (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => void state.refetch()}
              >
                Try again
              </Button>
            ) : null
          }
        >
          {state.error}
        </Notice>
      ) : null}

      {!state.isOnline ? (
        <OfflineNotice className="mt-4" withIcon={false} size="md">
          Reconnect before changing your correction request.
        </OfflineNotice>
      ) : null}

      {canRequest ? (
        <Form {...state.form}>
          <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
            <DateOfBirthField
              control={state.form.control}
              disabled={!state.isOnline || state.isRequesting}
              name="dateOfBirth"
            />
            <div>
              <Button
                type="submit"
                variant="outline"
                size="compact"
                loading={state.isRequesting}
                disabled={!state.isOnline || state.isRequesting}
              >
                {correction ? (
                  <RotateCcw className="size-4" aria-hidden="true" />
                ) : (
                  <CalendarClock className="size-4" aria-hidden="true" />
                )}
                {correction ? "Request another review" : "Request a review"}
              </Button>
            </div>
          </form>
        </Form>
      ) : null}

      {correction?.canCancel ? (
        <div className="mt-4">
          <Button
            type="button"
            variant="ghost"
            size="compact"
            loading={state.isCancelling}
            disabled={!state.isOnline || state.isCancelling}
            onClick={() => void state.cancelCorrection()}
          >
            <X className="size-4" aria-hidden="true" />
            Cancel request
          </Button>
        </div>
      ) : null}
    </div>
  );
}
