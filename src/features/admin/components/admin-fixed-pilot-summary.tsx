import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, FileCheck2, FileLock2, RefreshCw } from "lucide-react";
import { type ReactNode, useState } from "react";

import {
  ADMIN_SPONSOR_ARTIFACT_QUERY_KEY,
  AdminApi,
  adminSponsorArtifactQueryOptions,
} from "@/features/admin/api/admin.api";
import type {
  AdminSponsorArtifactMeasure,
  AdminSponsorArtifactStatus,
} from "@/features/admin/schemas/admin-sponsor-artifact.schema";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/ui/status-pill";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const NUMBER_FORMATTER = new Intl.NumberFormat();
const PERCENT_FORMATTER = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const MEASURE_ROWS = [
  ["cohortSize", "Cohort size"],
  ["sponsorDirectRecruitment", "Sponsor-direct recruitment"],
  ["referralRecruitment", "Referral recruitment"],
  ["requestCreation", "Requests created"],
  ["activityActivation", "Requests that led to an activity"],
  ["proposalCoverage", "Requests that received a proposal"],
  ["formedGroups", "Requests that formed a group"],
  ["scheduledPlans", "Scheduled plans"],
  ["completedActivities", "Completed activities"],
  ["continuingGroups", "Continuing groups"],
  ["coarseSafetyWorkload", "Safety workload"],
] as const satisfies ReadonlyArray<
  readonly [
    keyof NonNullable<AdminSponsorArtifactStatus["artifact"]>["measures"],
    string,
  ]
>;

type SponsorArtifactBlocker =
  AdminSponsorArtifactStatus["eligibility"]["blockers"][number];

export function AdminFixedPilotSummary({ canManage }: { canManage: boolean }) {
  const queryClient = useQueryClient();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const artifactQuery = useQuery({
    ...adminSponsorArtifactQueryOptions(),
    enabled: canManage,
  });
  const createMutation = useMutation({
    mutationKey: [...ADMIN_SPONSOR_ARTIFACT_QUERY_KEY, "create"],
    mutationFn: () => AdminApi.createSponsorArtifact(),
    onSuccess: (status) => {
      queryClient.setQueryData(ADMIN_SPONSOR_ARTIFACT_QUERY_KEY, status);
      setConfirmationOpen(false);
    },
  });

  if (!canManage) {
    return <AdminFixedPilotSummaryUnavailable />;
  }

  if (artifactQuery.isPending) {
    return <AdminFixedPilotSummaryLoading />;
  }

  if (artifactQuery.isError) {
    return (
      <AdminFixedPilotSummaryError
        onRetry={() => void artifactQuery.refetch()}
      />
    );
  }

  const status = artifactQuery.data;
  const canCreate =
    status.eligibility.eligible &&
    status.viewer.canGenerate &&
    status.artifact === null;

  return (
    <section
      aria-labelledby="fixed-pilot-summary-heading"
      className="border-border border-t pt-6"
    >
      <FixedSummaryHeading status={status} />

      {status.targetCohort ? (
        <dl className="mt-4 grid gap-x-8 border-border border-t sm:grid-cols-2">
          <SummaryDetail label="Cohort" value={status.targetCohort.code} />
          <SummaryDetail
            label="Members"
            value={NUMBER_FORMATTER.format(status.targetCohort.memberCount)}
          />
          <SummaryDetail label="Cohort window">
            <AdminDateTime value={status.targetCohort.startsAt} />
            <span aria-hidden="true"> – </span>
            <span className="sr-only"> to </span>
            <AdminDateTime value={status.targetCohort.endsAt} />
          </SummaryDetail>
          <SummaryDetail label="Outcome window ends">
            <AdminDateTime value={status.targetCohort.outcomeWindowEndsAt} />
          </SummaryDetail>
        </dl>
      ) : null}

      {status.artifact ? (
        <GeneratedSummary artifact={status.artifact} />
      ) : (
        <SummaryAvailability status={status} />
      )}

      {canCreate ? (
        <div className="mt-5 border-border border-t pt-5">
          <CreateSummaryDialog
            error={createMutation.isError}
            loading={createMutation.isPending}
            onConfirm={() => createMutation.mutate()}
            onOpenChange={(open) => {
              if (createMutation.isPending) {
                return;
              }
              if (open) {
                createMutation.reset();
              }
              setConfirmationOpen(open);
            }}
            open={confirmationOpen}
          />
        </div>
      ) : null}

      <p className="mt-5 text-slate-muted text-xs leading-relaxed">
        Evaluated <AdminDateTime value={status.evaluatedAt} />
      </p>
    </section>
  );
}

function FixedSummaryHeading({
  status,
}: {
  status: AdminSponsorArtifactStatus;
}) {
  const displayState = getDisplayState(status);

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
          <FileLock2 className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2
            id="fixed-pilot-summary-heading"
            className="font-semibold text-base text-ink"
          >
            Fixed pilot summary
          </h2>
          <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
            A fixed internal summary that hides small counts. It covers one
            cohort and one outcome window. Creating it does not approve or send
            it.
          </p>
        </div>
      </div>

      <StatusPill size="sm" surface="soft" tone={displayState.tone}>
        {displayState.label}
      </StatusPill>
    </div>
  );
}

function SummaryAvailability({
  status,
}: {
  status: AdminSponsorArtifactStatus;
}) {
  const blocker = getPrimaryBlocker(status.eligibility.blockers);
  const message = getBlockerMessage(blocker, status.viewer.canGenerate);

  return (
    <div className="mt-4 border-border border-t py-5">
      <p className="font-semibold text-ink text-sm">{message.title}</p>
      <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
        {message.description}
      </p>
    </div>
  );
}

function GeneratedSummary({
  artifact,
}: {
  artifact: NonNullable<AdminSponsorArtifactStatus["artifact"]>;
}) {
  const hasIncompleteSource = Object.values(artifact.measures).some(
    (measure) => measure.state === "SOURCE_INCOMPLETE",
  );

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-border border-y py-4">
        <div>
          <p className="font-semibold text-ink text-sm">Created summary</p>
          <p className="mt-1 text-slate-muted text-xs leading-relaxed">
            Reference {artifact.referenceCode} · Created{" "}
            <AdminDateTime value={artifact.generatedAt} />
          </p>
        </div>
        {hasIncompleteSource ? (
          <StatusPill size="xs" surface="soft" tone="amber">
            Source incomplete
          </StatusPill>
        ) : (
          <StatusPill size="xs" surface="soft" tone="teal">
            Cannot be changed
          </StatusPill>
        )}
      </div>

      <div className="mt-5">
        <h3 className="font-semibold text-ink text-sm">Fixed measures</h3>
        <p className="mt-1 max-w-2xl text-slate-muted text-xs leading-relaxed">
          The server supplies every value and decides which small counts stay
          hidden. Hidden values are not available in this view.
        </p>
        <dl className="mt-3 border-border border-t">
          {MEASURE_ROWS.map(([key, label]) => (
            <MeasureRow
              key={key}
              label={label}
              measure={artifact.measures[key]}
            />
          ))}
        </dl>
      </div>
    </div>
  );
}

function MeasureRow({
  label,
  measure,
}: {
  label: string;
  measure: AdminSponsorArtifactMeasure;
}) {
  const display = getMeasureDisplay(measure);

  return (
    <div className="flex min-w-0 items-start justify-between gap-4 border-border border-b py-3">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="min-w-0 text-right font-semibold text-ink text-sm tabular-nums">
        {display.value ? (
          display.value
        ) : (
          <StatusPill size="xs" surface="soft" tone={display.tone}>
            {display.label}
          </StatusPill>
        )}
      </dd>
    </div>
  );
}

function CreateSummaryDialog({
  error,
  loading,
  onConfirm,
  onOpenChange,
  open,
}: {
  error: boolean;
  loading: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button type="button">
          <FileCheck2 className="size-4" aria-hidden="true" />
          Create fixed summary
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create this fixed summary?</AlertDialogTitle>
          <AlertDialogDescription>
            This creates one fixed internal record for the cohort and outcome
            window. Small counts stay hidden. The record cannot be changed after
            it is created, and this step does not approve or send it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            The fixed summary was not created. Refresh the current status before
            trying again.
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            type="button"
            disabled={loading}
            loading={loading}
            onClick={onConfirm}
          >
            Create fixed summary
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SummaryDetail({
  children,
  label,
  value,
}: {
  children?: ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 border-border border-b py-3">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="min-w-0 text-right font-semibold text-ink text-sm tabular-nums">
        {children ?? value}
      </dd>
    </div>
  );
}

function AdminDateTime({ value }: { value: string }) {
  return (
    <time dateTime={value}>{DATE_TIME_FORMATTER.format(new Date(value))}</time>
  );
}

function AdminFixedPilotSummaryUnavailable() {
  return (
    <section
      aria-labelledby="fixed-pilot-summary-heading"
      className="border-border border-t pt-6"
    >
      <FixedSummaryStaticHeading />
      <p className="mt-4 border-border border-t py-5 text-slate-muted text-sm leading-relaxed">
        Your admin session cannot view or create fixed pilot summaries.
      </p>
    </section>
  );
}

function AdminFixedPilotSummaryLoading() {
  return (
    <section
      aria-labelledby="fixed-pilot-summary-heading"
      className="border-border border-t pt-6"
    >
      <FixedSummaryStaticHeading />
      <div
        className="mt-5 grid gap-3 border-border border-t pt-5"
        aria-hidden="true"
      >
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-4 w-4/5 max-w-lg" />
      </div>
      <span className="sr-only">Loading fixed pilot summary</span>
    </section>
  );
}

function AdminFixedPilotSummaryError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      aria-labelledby="fixed-pilot-summary-heading"
      className="border-border border-t pt-6"
    >
      <FixedSummaryStaticHeading />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-border border-y py-4">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <p className="text-slate-muted text-sm" role="alert">
            The fixed pilot summary could not be loaded.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    </section>
  );
}

function FixedSummaryStaticHeading() {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
        <FileLock2 className="size-4" aria-hidden="true" />
      </span>
      <div>
        <h2
          id="fixed-pilot-summary-heading"
          className="font-semibold text-base text-ink"
        >
          Fixed pilot summary
        </h2>
        <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          A fixed internal summary that hides small counts. It covers one cohort
          and one outcome window. Creating it does not approve or send it.
        </p>
      </div>
    </div>
  );
}

function getDisplayState(status: AdminSponsorArtifactStatus): {
  label: string;
  tone: StatusPillTone;
} {
  if (status.artifact) {
    return { label: "Created", tone: "teal" };
  }

  const blocker = getPrimaryBlocker(status.eligibility.blockers);
  const states: Record<
    Exclude<SponsorArtifactBlocker, "ARTIFACT_ALREADY_EXISTS">,
    { label: string; tone: StatusPillTone }
  > = {
    NO_CONFIGURED_COHORT: { label: "No cohort", tone: "neutral" },
    OUTCOME_WINDOW_OPEN: { label: "Window open", tone: "amber" },
    DENOMINATOR_BELOW_MINIMUM: { label: "Cohort too small", tone: "amber" },
  };

  if (blocker === "ARTIFACT_ALREADY_EXISTS") {
    return { label: "Created", tone: "teal" };
  }

  return blocker ? states[blocker] : { label: "Ready", tone: "teal" };
}

function getPrimaryBlocker(
  blockers: AdminSponsorArtifactStatus["eligibility"]["blockers"],
) {
  const priority: SponsorArtifactBlocker[] = [
    "NO_CONFIGURED_COHORT",
    "OUTCOME_WINDOW_OPEN",
    "DENOMINATOR_BELOW_MINIMUM",
    "ARTIFACT_ALREADY_EXISTS",
  ];
  return priority.find((blocker) => blockers.includes(blocker));
}

function getBlockerMessage(
  blocker: SponsorArtifactBlocker | undefined,
  canGenerate: boolean,
) {
  if (!blocker && canGenerate) {
    return {
      title: "Ready to create",
      description:
        "The outcome window is closed and the cohort meets the privacy minimum.",
    };
  }

  if (!blocker) {
    return {
      title: "Creation is unavailable",
      description:
        "Your current admin session cannot create this fixed summary.",
    };
  }

  return {
    NO_CONFIGURED_COHORT: {
      title: "No cohort configured",
      description:
        "Configure the controlled pilot cohort before creating a fixed summary.",
    },
    OUTCOME_WINDOW_OPEN: {
      title: "Outcome window still open",
      description:
        "The summary stays unavailable until the fixed outcome window closes.",
    },
    DENOMINATOR_BELOW_MINIMUM: {
      title: "Cohort below the privacy minimum",
      description:
        "The fixed summary cannot be created because the cohort is too small for safe aggregate reporting.",
    },
    ARTIFACT_ALREADY_EXISTS: {
      title: "Summary already created",
      description:
        "The fixed summary already exists. Reload to retrieve the current record.",
    },
  }[blocker];
}

function getMeasureDisplay(measure: AdminSponsorArtifactMeasure): {
  label?: string;
  tone?: StatusPillTone;
  value?: string;
} {
  if (measure.state === "VALUE") {
    if (measure.value.kind === "COUNT") {
      return { value: NUMBER_FORMATTER.format(measure.value.count) };
    }

    return {
      value: `${PERCENT_FORMATTER.format(measure.value.ratePercent)}% (${NUMBER_FORMATTER.format(measure.value.numerator)} of ${NUMBER_FORMATTER.format(measure.value.denominator)})`,
    };
  }

  if (measure.state === "SUPPRESSED") {
    return {
      label:
        measure.reason === "DENOMINATOR_TOO_SMALL"
          ? "Below privacy minimum"
          : "Withheld by privacy rule",
      tone: "amber",
    };
  }

  if (measure.state === "SOURCE_INCOMPLETE") {
    return { label: "Source incomplete", tone: "amber" };
  }

  return { label: "Not collected", tone: "neutral" };
}
