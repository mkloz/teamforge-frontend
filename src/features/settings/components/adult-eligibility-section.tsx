import {
  CalendarCheck,
  CircleAlert,
  CircleHelp,
  type LucideIcon,
  ShieldCheck,
} from "lucide-react";
import type { FormEvent } from "react";

import { useCompatibilityInputLock } from "@/features/forge-proposals/public/proposal-review";
import { AdultEligibilityCorrectionControls } from "@/features/settings/components/adult-eligibility-correction-controls";
import type { useAdultEligibilityCorrection } from "@/features/settings/hooks/use-adult-eligibility-correction";
import { useAdultEligibilityForm } from "@/features/settings/hooks/use-adult-eligibility-form";
import { DateOfBirthField } from "@/shared/components/profile/date-of-birth-field";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { Notice, type NoticeProps } from "@/shared/components/ui/notice";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import type { AdultEligibility } from "@/shared/schemas";

interface AdultEligibilitySectionProps {
  adultEligibility?: AdultEligibility;
  correctionState: ReturnType<typeof useAdultEligibilityCorrection>;
}

type EligibilityStatus = AdultEligibility["status"];

interface EligibilityStatusContent {
  actionLabel: string;
  description: string;
  icon: LucideIcon;
  label: string;
  tone: NonNullable<NoticeProps["tone"]>;
}

const ELIGIBILITY_STATUS_CONTENT: Record<
  EligibilityStatus,
  EligibilityStatusContent
> = {
  ELIGIBLE: {
    actionLabel: "Check eligibility",
    description:
      "Your age eligibility is confirmed. You don't need to submit anything else.",
    icon: ShieldCheck,
    label: "Confirmed",
    tone: "success",
  },
  NOT_ELIGIBLE: {
    actionLabel: "Check eligibility",
    description:
      "This check does not meet TeamForge's current age requirements. If the date was wrong, request a review below.",
    icon: CircleAlert,
    label: "Not eligible",
    tone: "warning",
  },
  REVIEW_REQUIRED: {
    actionLabel: "Check eligibility",
    description:
      "Your age eligibility needs review. Check the request status below.",
    icon: CircleAlert,
    label: "Review needed",
    tone: "warning",
  },
  UNKNOWN: {
    actionLabel: "Check eligibility",
    description:
      "Submit your date of birth so TeamForge can check whether you meet its age requirements.",
    icon: CircleHelp,
    label: "Date needed",
    tone: "info",
  },
};

export function AdultEligibilitySection({
  adultEligibility,
  correctionState,
}: AdultEligibilitySectionProps) {
  const { eligibility, form, isOnline, isSubmitting, onSubmit, submitError } =
    useAdultEligibilityForm({ adultEligibility });
  const status = eligibility?.status ?? "UNKNOWN";
  const statusContent = ELIGIBILITY_STATUS_CONTENT[status];
  const StatusIcon = statusContent.icon;
  const canSubmit = status === "UNKNOWN";
  const compatibilityInputLock = useCompatibilityInputLock({
    enabled: canSubmit,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (compatibilityInputLock.isBlocked) {
      event.preventDefault();
      return;
    }

    void onSubmit(event);
  }

  return (
    <section className="border-border border-t pt-7">
      <div className="mb-5 max-w-2xl">
        <h3 className="font-semibold text-ink text-lg">Age eligibility</h3>
      </div>

      <div className="flex max-w-2xl flex-col gap-5">
        <Notice
          tone={statusContent.tone}
          size="md"
          icon={<StatusIcon className="size-5" aria-hidden="true" />}
        >
          <p>
            <span className="font-semibold">{statusContent.label}.</span>{" "}
            {statusContent.description}
          </p>
        </Notice>

        {canSubmit ? (
          <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {compatibilityInputLock.isBlocked ? (
                <Notice
                  role={
                    compatibilityInputLock.status === "error"
                      ? "alert"
                      : "status"
                  }
                  tone={
                    compatibilityInputLock.status === "error"
                      ? "warning"
                      : "neutral"
                  }
                  action={
                    compatibilityInputLock.status === "error" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => void compatibilityInputLock.retry()}
                      >
                        Try again
                      </Button>
                    ) : null
                  }
                >
                  {compatibilityInputLock.message}
                </Notice>
              ) : null}

              <DateOfBirthField
                control={form.control}
                disabled={isSubmitting || compatibilityInputLock.isBlocked}
                name="dateOfBirth"
              />

              {submitError ? (
                <Notice role="alert" tone="danger" size="md">
                  {submitError}
                </Notice>
              ) : null}

              {!isOnline ? (
                <OfflineNotice withIcon={false} size="md">
                  You are offline. Reconnect before checking your age
                  eligibility.
                </OfflineNotice>
              ) : null}

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  size="compact"
                  loading={isSubmitting}
                  disabled={!isOnline || compatibilityInputLock.isBlocked}
                >
                  <CalendarCheck className="size-4" aria-hidden="true" />
                  {isOnline ? statusContent.actionLabel : "Reconnect to check"}
                </Button>
              </div>
            </form>
          </Form>
        ) : null}

        {!canSubmit ? (
          <AdultEligibilityCorrectionControls state={correctionState} />
        ) : null}
      </div>
    </section>
  );
}
