import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  UserRoundCog,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  ADMIN_ADULT_ELIGIBILITY_CORRECTIONS_QUERY_KEY,
  AdminAdultEligibilityCorrectionsApi,
  adminAdultEligibilityCorrectionsQueryOptions,
} from "@/features/admin/api/admin-adult-eligibility-corrections.api";
import type {
  AdminAdultEligibilityCorrection,
  AdminAdultEligibilityCorrectionDecision,
  AdminAdultEligibilityCorrectionRejectionReason,
} from "@/features/admin/schemas/admin-adult-eligibility-correction.schema";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusPill } from "@/shared/components/ui/status-pill";
import {
  getApiErrorMessage,
  getHttpErrorStatus,
} from "@/shared/lib/api-error-message";

const correctionReasonLabels = {
  INCORRECT_DATE_OF_BIRTH: "Date of birth is incorrect",
  INCORRECT_ELIGIBILITY_STATUS: "Eligibility status is incorrect",
  OTHER: "Another eligibility detail is incorrect",
} as const;

const rejectionReasonLabels = {
  CORRECTION_NOT_VERIFIED: "Correction could not be verified",
  DUPLICATE_REQUEST: "Duplicate request",
} as const;

const requestedAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function AdminAdultEligibilityCorrections({
  canManage,
}: {
  canManage: boolean;
}) {
  const correctionsQuery = useQuery({
    ...adminAdultEligibilityCorrectionsQueryOptions(),
    enabled: canManage,
  });

  return (
    <section
      aria-labelledby="adult-eligibility-corrections-heading"
      className="grid gap-4 border-border border-t pt-6"
    >
      <header className="grid gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id="adult-eligibility-corrections-heading"
            className="font-semibold text-ink text-xl"
          >
            Adult eligibility corrections
          </h2>
          {canManage && correctionsQuery.data ? (
            <StatusPill numeric size="xs" tone="amber">
              {correctionsQuery.data.length} open
            </StatusPill>
          ) : null}
        </div>
        <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          Review requests that can change account access. Resolve only after
          verifying the correction, or reject it with a recorded reason.
        </p>
      </header>

      <CorrectionsContent
        canManage={canManage}
        corrections={correctionsQuery.data}
        error={correctionsQuery.error}
        isError={correctionsQuery.isError}
        isFetching={correctionsQuery.isFetching}
        isPending={correctionsQuery.isPending}
        onRetry={() => void correctionsQuery.refetch()}
      />
    </section>
  );
}

function CorrectionsContent({
  canManage,
  corrections,
  error,
  isError,
  isFetching,
  isPending,
  onRetry,
}: {
  canManage: boolean;
  corrections: AdminAdultEligibilityCorrection[] | undefined;
  error: Error | null;
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
  onRetry: () => void;
}) {
  if (!canManage) {
    return (
      <Notice
        icon={<UserRoundCog className="size-4" aria-hidden="true" />}
        size="sm"
        tone="neutral"
      >
        <p>
          Your admin role does not include permission to manage account rights.
        </p>
      </Notice>
    );
  }

  if (isPending) {
    return <CorrectionsSkeleton />;
  }

  if (isError) {
    return (
      <Notice
        action={
          <Button
            type="button"
            variant="link"
            size="xs"
            loading={isFetching}
            onClick={onRetry}
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Try again
          </Button>
        }
        icon={<TriangleAlert className="size-4" aria-hidden="true" />}
        role="alert"
        size="sm"
        tone="danger"
      >
        <p>
          {getApiErrorMessage(
            error,
            "Adult eligibility corrections could not be loaded.",
            {
              forbiddenMessage:
                "Your account-rights permission could not be confirmed.",
            },
          )}
        </p>
      </Notice>
    );
  }

  if (!corrections?.length) {
    return (
      <div className="grid min-h-28 place-items-center border-border border-y px-4 py-8 text-center">
        <div className="grid max-w-md gap-1">
          <p className="font-semibold text-ink text-sm">
            No corrections need review
          </p>
          <p className="text-pretty text-slate-muted text-xs leading-relaxed">
            New requests will appear here when an adult eligibility correction
            needs an admin decision.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border border-border border-y">
      {corrections.map((correction) => (
        <li key={correction.id}>
          <CorrectionRow correction={correction} />
        </li>
      ))}
    </ul>
  );
}

function CorrectionsSkeleton() {
  return (
    <div
      aria-label="Loading adult eligibility corrections"
      className="divide-y divide-border border-border border-y"
      role="status"
    >
      {["first", "second"].map((key) => (
        <div className="grid gap-3 py-4 sm:grid-cols-[1fr_auto]" key={key}>
          <div className="grid gap-2">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
      ))}
    </div>
  );
}

function CorrectionRow({
  correction,
}: {
  correction: AdminAdultEligibilityCorrection;
}) {
  const queryClient = useQueryClient();
  const [resolveOpen, setResolveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] =
    useState<AdminAdultEligibilityCorrectionRejectionReason>(
      "CORRECTION_NOT_VERIFIED",
    );
  const commandRef = useRef<{
    fingerprint: string;
    idempotencyKey: string;
  } | null>(null);

  const decisionMutation = useMutation({
    mutationKey: [
      ...ADMIN_ADULT_ELIGIBILITY_CORRECTIONS_QUERY_KEY,
      correction.id,
      "decision",
    ],
    mutationFn: (decision: AdminAdultEligibilityCorrectionDecision) => {
      const fingerprint = [
        correction.id,
        decision.expectedRevision,
        decision.decision,
        decision.reasonCode,
      ].join(":");

      if (commandRef.current?.fingerprint !== fingerprint) {
        commandRef.current = {
          fingerprint,
          idempotencyKey: globalThis.crypto.randomUUID(),
        };
      }

      return AdminAdultEligibilityCorrectionsApi.decide(
        correction.id,
        decision,
        commandRef.current.idempotencyKey,
      );
    },
    onError: (error) => {
      if ([404, 409].includes(getHttpErrorStatus(error) ?? 0)) {
        void queryClient.invalidateQueries({
          queryKey: ADMIN_ADULT_ELIGIBILITY_CORRECTIONS_QUERY_KEY,
        });
      }
    },
    onSuccess: () => {
      commandRef.current = null;
      setResolveOpen(false);
      setRejectOpen(false);
      queryClient.setQueryData<AdminAdultEligibilityCorrection[]>(
        ADMIN_ADULT_ELIGIBILITY_CORRECTIONS_QUERY_KEY,
        (current) => current?.filter((item) => item.id !== correction.id),
      );
      void queryClient.invalidateQueries({
        queryKey: ADMIN_ADULT_ELIGIBILITY_CORRECTIONS_QUERY_KEY,
      });
    },
  });

  function submitResolve() {
    decisionMutation.mutate({
      decision: "RESOLVE",
      expectedRevision: correction.revision,
      reasonCode: "CORRECTION_VERIFIED",
    });
  }

  function submitReject() {
    decisionMutation.mutate({
      decision: "REJECT",
      expectedRevision: correction.revision,
      reasonCode: rejectionReason,
    });
  }

  const decisionError = decisionMutation.isError
    ? getDecisionErrorMessage(decisionMutation.error)
    : null;
  const resolving =
    decisionMutation.isPending &&
    decisionMutation.variables?.decision === "RESOLVE";
  const rejecting =
    decisionMutation.isPending &&
    decisionMutation.variables?.decision === "REJECT";

  return (
    <article className="lg:main-action-grid grid gap-4 py-5 lg:items-center">
      <div className="grid min-w-0 gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <CalendarClock className="size-4" aria-hidden="true" />
          </span>
          <div className="grid min-w-0 gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-base text-ink">
                {correctionReasonLabels[correction.reasonCode]}
              </h3>
              <StatusPill size="xs" tone="amber">
                Open
              </StatusPill>
            </div>
            <p className="break-all text-slate-muted text-xs">
              User {correction.userId}
            </p>
          </div>
        </div>

        <dl className="grid gap-x-6 gap-y-2 pl-12 text-xs sm:grid-cols-2 xl:grid-cols-4">
          <CorrectionFact
            label="Requested"
            value={requestedAtFormatter.format(new Date(correction.createdAt))}
          />
          <CorrectionFact
            label="Revision"
            value={String(correction.revision)}
          />
          <CorrectionFact
            label="Authority version"
            value={`${correction.priorAuthorityVersion} → ${correction.openedAuthorityVersion}`}
          />
          <CorrectionFact
            label="Access version"
            value={`${correction.priorAccessVersion} → ${correction.openedAccessVersion}`}
          />
        </dl>
      </div>

      <div className="flex flex-wrap gap-2 pl-12 lg:justify-end lg:pl-0">
        <AlertDialog
          open={resolveOpen}
          onOpenChange={(open) => {
            if (!open && decisionMutation.isPending) {
              return;
            }
            setResolveOpen(open);
            if (open) decisionMutation.reset();
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              size="sm"
              disabled={decisionMutation.isPending}
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Resolve
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resolve this correction?</AlertDialogTitle>
              <AlertDialogDescription>
                Confirm only after verifying the requested correction. This
                updates the account's eligibility authority and access state.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <DecisionSummary
              correction={correction}
              reason="Correction verified"
            />
            {decisionError &&
            decisionMutation.variables?.decision === "RESOLVE" ? (
              <p className="text-destructive text-sm" role="alert">
                {decisionError}
              </p>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={decisionMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="button"
                loading={resolving}
                disabled={decisionMutation.isPending}
                onClick={submitResolve}
              >
                Resolve correction
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={rejectOpen}
          onOpenChange={(open) => {
            if (!open && decisionMutation.isPending) {
              return;
            }
            setRejectOpen(open);
            if (open) decisionMutation.reset();
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={decisionMutation.isPending}
            >
              <XCircle className="size-4" aria-hidden="true" />
              Reject
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject this correction?</AlertDialogTitle>
              <AlertDialogDescription>
                Rejecting restores the prior eligibility authority and access
                state. Choose the reason that will be recorded with the
                decision.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-2">
              <label
                className="font-semibold text-ink text-sm"
                htmlFor={`correction-rejection-reason-${correction.id}`}
              >
                Rejection reason
              </label>
              <Select
                value={rejectionReason}
                onValueChange={(value) => {
                  if (
                    value === "CORRECTION_NOT_VERIFIED" ||
                    value === "DUPLICATE_REQUEST"
                  ) {
                    setRejectionReason(value);
                  }
                }}
                disabled={decisionMutation.isPending}
              >
                <SelectTrigger
                  id={`correction-rejection-reason-${correction.id}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(rejectionReasonLabels).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <DecisionSummary
              correction={correction}
              reason={rejectionReasonLabels[rejectionReason]}
            />
            {decisionError &&
            decisionMutation.variables?.decision === "REJECT" ? (
              <p className="text-destructive text-sm" role="alert">
                {decisionError}
              </p>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={decisionMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                loading={rejecting}
                disabled={decisionMutation.isPending}
                onClick={submitReject}
              >
                Reject correction
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}

function CorrectionFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="font-semibold text-slate-muted">{label}</dt>
      <dd className="wrap-break-word text-ink">{value}</dd>
    </div>
  );
}

function DecisionSummary({
  correction,
  reason,
}: {
  correction: AdminAdultEligibilityCorrection;
  reason: string;
}) {
  return (
    <dl className="grid gap-2 border-border border-y py-3 text-sm">
      <CorrectionFact label="User" value={correction.userId} />
      <CorrectionFact label="Recorded reason" value={reason} />
      <CorrectionFact
        label="Expected revision"
        value={String(correction.revision)}
      />
    </dl>
  );
}

function getDecisionErrorMessage(error: unknown) {
  const status = getHttpErrorStatus(error);

  if (status === 409) {
    return "This request changed while you were reviewing it. The queue is being refreshed.";
  }

  if (status === 404) {
    return "This request is no longer open. The queue is being refreshed.";
  }

  if (status === 403) {
    return "Your account-rights permission could not be confirmed. Refresh your admin session before trying again.";
  }

  return getApiErrorMessage(
    error,
    "The correction decision was not recorded. Try again with the same decision.",
  );
}
