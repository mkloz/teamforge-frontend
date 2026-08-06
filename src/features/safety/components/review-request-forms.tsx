import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { SafetyApi } from "@/features/safety/api/safety.api";
import { SAFETY_QUERY_KEYS } from "@/features/safety/api/safety-queries";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Textarea } from "@/shared/components/ui/textarea";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import {
  type InformationResponsePayload,
  informationResponsePayloadSchema,
  type SafetyRequestPayload,
  safetyRequestPayloadSchema,
} from "@/shared/schemas/safety";

interface RequestFormCopy {
  description: string;
  fieldLabel: string;
  heading: string;
  submitLabel: string;
  successBody: string;
  successHeading: string;
}

interface RequestFormProps {
  copy: RequestFormCopy;
  mutationKey: readonly string[];
  onSubmit: (
    payload: SafetyRequestPayload,
    idempotencyKey: string,
  ) => Promise<unknown>;
  queryKeys: readonly (readonly unknown[])[];
}

function usePayloadIdempotencyKey() {
  const submissionRef = useRef<{ fingerprint: string; key: string } | null>(
    null,
  );

  return (payload: unknown) => {
    const fingerprint = JSON.stringify(payload);
    if (submissionRef.current?.fingerprint !== fingerprint) {
      submissionRef.current = { fingerprint, key: crypto.randomUUID() };
    }
    return submissionRef.current.key;
  };
}

function SafetyRequestForm({
  copy,
  mutationKey,
  onSubmit,
  queryKeys,
}: RequestFormProps) {
  const isOnline = useNetworkStatus();
  const queryClient = useQueryClient();
  const getIdempotencyKey = usePayloadIdempotencyKey();
  const form = useForm<SafetyRequestPayload>({
    resolver: zodResolver(safetyRequestPayloadSchema),
    defaultValues: { reason: "" },
  });
  const mutation = useMutation({
    mutationKey,
    mutationFn: (payload: SafetyRequestPayload) => {
      const canonicalPayload = safetyRequestPayloadSchema.parse(payload);
      return onSubmit(canonicalPayload, getIdempotencyKey(canonicalPayload));
    },
    onSuccess: async () => {
      await Promise.all(
        queryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
    meta: { errorToast: false },
  });

  if (mutation.isSuccess) {
    return (
      <div className="grid gap-2 rounded-xl bg-primary/8 p-4" role="status">
        <p className="font-semibold text-ink">{copy.successHeading}</p>
        <p className="text-slate-muted text-sm leading-relaxed">
          {copy.successBody}
        </p>
      </div>
    );
  }

  const errorMessage = mutation.isError
    ? getApiErrorMessage(
        mutation.error,
        "We couldn’t send this request. Try again.",
        {
          conflictMessage: "A review request has already been sent.",
          forbiddenMessage: "This item can no longer be reviewed.",
        },
      )
    : null;
  const reasonId = `${mutationKey.join("-")}-reason`;
  const reasonErrorId = `${reasonId}-error`;

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <div className="grid gap-1">
        <h3 className="font-bold text-ink text-lg">{copy.heading}</h3>
        <p className="text-pretty text-slate-muted text-sm leading-relaxed">
          {copy.description}
        </p>
      </div>

      <Field
        className="gap-2"
        data-invalid={Boolean(form.formState.errors.reason)}
      >
        <FieldLabel
          htmlFor={reasonId}
          className="font-semibold text-ink text-sm"
        >
          {copy.fieldLabel}
        </FieldLabel>
        <Textarea
          id={reasonId}
          {...form.register("reason")}
          rows={5}
          maxLength={2000}
          aria-invalid={Boolean(form.formState.errors.reason)}
          aria-describedby={
            form.formState.errors.reason ? reasonErrorId : undefined
          }
        />
        {form.formState.errors.reason ? (
          <FieldError id={reasonErrorId}>
            {form.formState.errors.reason.message}
          </FieldError>
        ) : null}
      </Field>

      {!isOnline ? (
        <p className="text-accent text-sm" role="status">
          Reconnect before sending this request.
        </p>
      ) : null}
      {errorMessage ? (
        <p className="text-destructive text-sm" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        className="w-full sm:w-fit"
        disabled={!isOnline || mutation.isPending}
        loading={mutation.isPending}
      >
        {copy.submitLabel}
      </Button>
    </form>
  );
}

export function OutcomeReviewForm({ reportId }: { reportId: string }) {
  return (
    <SafetyRequestForm
      copy={{
        heading: "Ask us to review this outcome again",
        description:
          "Tell us what you think we got wrong or what information we missed.",
        fieldLabel: "Why should we review this outcome again?",
        submitLabel: "Send request",
        successHeading: "Request received",
        successBody:
          "We’ll review the report outcome again. You can check its status here.",
      }}
      mutationKey={["safety", "outcome-review", reportId]}
      queryKeys={[
        SAFETY_QUERY_KEYS.report(reportId),
        SAFETY_QUERY_KEYS.outcomeReviews(reportId),
        SAFETY_QUERY_KEYS.reports,
      ]}
      onSubmit={(payload, key) =>
        SafetyApi.createOutcomeReviewRequest(reportId, payload, key)
      }
    />
  );
}

export function InformationResponseForm({
  reportId,
  requestId,
}: {
  reportId: string;
  requestId: string;
}) {
  const isOnline = useNetworkStatus();
  const queryClient = useQueryClient();
  const getIdempotencyKey = usePayloadIdempotencyKey();
  const form = useForm<InformationResponsePayload>({
    resolver: zodResolver(informationResponsePayloadSchema),
    defaultValues: { requestId, response: "" },
  });
  const mutation = useMutation({
    mutationKey: ["safety", "information-response", reportId, requestId],
    mutationFn: (payload: InformationResponsePayload) => {
      const canonicalPayload = informationResponsePayloadSchema.parse(payload);
      return SafetyApi.createInformationResponse(
        reportId,
        canonicalPayload,
        getIdempotencyKey(canonicalPayload),
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: SAFETY_QUERY_KEYS.report(reportId),
        }),
        queryClient.invalidateQueries({
          queryKey: SAFETY_QUERY_KEYS.reports,
        }),
      ]);
    },
    meta: { errorToast: false },
  });

  if (mutation.isSuccess) {
    return (
      <div className="grid gap-1 rounded-xl bg-primary/8 p-4" role="status">
        <p className="font-semibold text-ink">Information sent</p>
        <p className="text-slate-muted text-sm">
          We’ll continue reviewing your report.
        </p>
      </div>
    );
  }

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      <Field
        className="gap-2"
        data-invalid={Boolean(form.formState.errors.response)}
      >
        <FieldLabel
          htmlFor="report-information-response"
          className="font-semibold text-ink text-sm"
        >
          Your response
        </FieldLabel>
        <Textarea
          id="report-information-response"
          {...form.register("response")}
          rows={5}
          maxLength={2000}
          aria-invalid={Boolean(form.formState.errors.response)}
          aria-describedby={
            form.formState.errors.response
              ? "report-information-response-error"
              : undefined
          }
        />
        {form.formState.errors.response ? (
          <FieldError id="report-information-response-error">
            {form.formState.errors.response.message}
          </FieldError>
        ) : null}
      </Field>
      {!isOnline ? (
        <p className="text-accent text-sm">
          Reconnect before sending information.
        </p>
      ) : null}
      {mutation.isError ? (
        <p className="text-destructive text-sm" role="alert">
          We couldn’t send this information. Try again.
        </p>
      ) : null}
      <Button
        type="submit"
        className="w-full sm:w-fit"
        disabled={!isOnline || mutation.isPending}
        loading={mutation.isPending}
      >
        Send information
      </Button>
    </form>
  );
}

export function EnforcementAppealForm({ noticeId }: { noticeId: string }) {
  return (
    <SafetyRequestForm
      copy={{
        heading: "Ask us to review this account action",
        description:
          "Tell us what you think we got wrong or what information we missed.",
        fieldLabel: "Why should we review this action?",
        submitLabel: "Submit appeal",
        successHeading: "Appeal received",
        successBody: "We’ll review the account action and update this page.",
      }}
      mutationKey={["safety", "enforcement-appeal", noticeId]}
      queryKeys={[
        SAFETY_QUERY_KEYS.notice(noticeId),
        SAFETY_QUERY_KEYS.notices,
      ]}
      onSubmit={(payload, key) =>
        SafetyApi.createEnforcementAppeal(noticeId, payload, key)
      }
    />
  );
}

export function ContainmentContestForm({
  containmentId,
}: {
  containmentId: string;
}) {
  return (
    <SafetyRequestForm
      copy={{
        heading: "Ask us to review this restriction",
        description:
          "Tell us why this temporary restriction should be changed or removed.",
        fieldLabel: "Why should we review this restriction?",
        submitLabel: "Send request",
        successHeading: "Review request received",
        successBody: "We’ll review the restriction and update this page.",
      }}
      mutationKey={["safety", "containment-contest", containmentId]}
      queryKeys={[
        SAFETY_QUERY_KEYS.containment(containmentId),
        SAFETY_QUERY_KEYS.containments,
      ]}
      onSubmit={(payload, key) =>
        SafetyApi.createContainmentContest(containmentId, payload, key)
      }
    />
  );
}
