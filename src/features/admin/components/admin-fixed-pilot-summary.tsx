import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileCheck2, FileLock2, RefreshCw } from "lucide-react";
import { useState } from "react";

import {
  ADMIN_SPONSOR_ARTIFACT_QUERY_KEY,
  AdminApi,
  adminSponsorArtifactQueryOptions,
} from "@/features/admin/api/admin.api";
import type {
  AdminSponsorArtifact,
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
import { CollapsibleSection } from "@/shared/components/ui/collapsible-section";
import { Notice } from "@/shared/components/ui/notice";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/ui/status-pill";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const NUMBER_FORMATTER = new Intl.NumberFormat();
const PERCENT_FORMATTER = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

const MEASURE_ROWS = [
  ["cohortSize", "Members in the cohort"],
  ["sponsorDirectRecruitment", "Joined through sponsor outreach"],
  ["referralRecruitment", "Joined through referrals"],
  ["requestCreation", "Requests created"],
  ["activityActivation", "Requests that led to an activity"],
  ["proposalCoverage", "Requests that received a proposal"],
  ["formedGroups", "Requests that formed a group"],
  ["scheduledPlans", "Plans scheduled"],
  ["completedActivities", "Activities completed"],
  ["continuingGroups", "Groups continuing at day 90"],
  ["coarseSafetyWorkload", "Safety workload"],
] as const satisfies ReadonlyArray<
  readonly [keyof AdminSponsorArtifact["measures"], string]
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
    <section aria-labelledby="fixed-pilot-summary-heading" className="pt-2">
      <FixedSummaryHeading status={status} />

      {status.targetCohort ? <FixedWindowOverview status={status} /> : null}

      {status.artifact ? (
        <GeneratedSummary artifact={status.artifact} />
      ) : status.targetCohort ? null : (
        <SummaryAvailability status={status} />
      )}

      <SummaryHistory artifacts={status.history} />

      {canCreate ? (
        <div className="mt-6">
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
      <div className="grid min-w-0 gap-1">
        <h2
          id="fixed-pilot-summary-heading"
          className="flex items-center gap-2 font-semibold text-base text-ink"
        >
          <FileLock2 className="size-4 shrink-0" aria-hidden="true" />
          Fixed pilot summary
        </h2>
        <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          A fixed internal summary for one cohort and one outcome window. Small
          results are withheld before they reach this view. Creating it does not
          approve or send it.
        </p>
      </div>

      <span
        className={`flex items-center gap-2 font-semibold text-xs ${getToneTextClass(displayState.tone)}`}
      >
        <span
          className={`size-2 rounded-full ${getToneBackgroundClass(displayState.tone)}`}
          aria-hidden="true"
        />
        {displayState.label}
      </span>
    </div>
  );
}

function FixedWindowOverview({
  status,
}: {
  status: AdminSponsorArtifactStatus;
}) {
  const cohort = status.targetCohort;
  if (!cohort) {
    return null;
  }

  const blocker = getPrimaryBlocker(status.eligibility.blockers);
  const message = getBlockerMessage(blocker, status.viewer.canGenerate);
  const evaluatedAt = new Date(status.evaluatedAt).getTime();
  const stages = [
    {
      date: cohort.startsAt,
      label: "Cohort opened",
      reached: evaluatedAt >= new Date(cohort.startsAt).getTime(),
    },
    {
      date: cohort.endsAt,
      label: "Cohort closes",
      reached: evaluatedAt >= new Date(cohort.endsAt).getTime(),
    },
    {
      date: cohort.outcomeWindowEndsAt,
      label: "Summary unlocks",
      reached: evaluatedAt >= new Date(cohort.outcomeWindowEndsAt).getTime(),
    },
  ];
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(cohort.outcomeWindowEndsAt).getTime() - evaluatedAt) /
        (1000 * 60 * 60 * 24),
    ),
  );

  return (
    <div className="mt-5 overflow-hidden rounded-2xl bg-card">
      <div className="grid gap-6 p-5 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:p-6">
        <div>
          <p className="font-semibold text-slate-muted text-xs">
            Summary unlocks
          </p>
          <p className="mt-2 font-semibold text-2xl text-ink tracking-tight">
            {DATE_FORMATTER.format(new Date(cohort.outcomeWindowEndsAt))}
          </p>
          <p className="mt-1 font-semibold text-primary text-sm tabular-nums">
            {daysRemaining === 0
              ? "Ready now"
              : `${NUMBER_FORMATTER.format(daysRemaining)} days remaining`}
          </p>
        </div>

        <div className="min-w-0">
          <div
            aria-label={`${stages.filter((stage) => stage.reached).length} of ${stages.length} summary stages reached`}
            className="grid grid-cols-3 gap-1.5"
            role="img"
          >
            {stages.map((stage) => (
              <span
                key={stage.label}
                className={`h-1.5 rounded-full ${stage.reached ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {stages.map((stage) => (
              <div key={stage.label} className="min-w-0">
                <p
                  className={`font-semibold text-xs ${stage.reached ? "text-primary" : "text-slate-muted"}`}
                >
                  {stage.label}
                </p>
                <p className="mt-1 text-slate-muted text-xs tabular-nums">
                  {DATE_FORMATTER.format(new Date(stage.date))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <dl className="grid gap-0.5 bg-background sm:grid-cols-3 [&>*]:bg-card">
        <WindowFact label="Cohort" value={cohort.code} />
        <WindowFact
          label="Members"
          value={NUMBER_FORMATTER.format(cohort.memberCount)}
        />
        <WindowFact
          label="Measurement period"
          value={`${DATE_FORMATTER.format(new Date(cohort.startsAt))} – ${DATE_FORMATTER.format(new Date(cohort.outcomeWindowEndsAt))}`}
        />
      </dl>

      <div className="mt-0.5 bg-card px-5 py-4 sm:px-6">
        <p className="font-semibold text-ink text-sm">{message.title}</p>
        <p className="mt-1 max-w-2xl text-slate-muted text-sm leading-relaxed">
          {message.description}
        </p>
      </div>
    </div>
  );
}

function WindowFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-5 py-4 sm:px-6">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="wrap-break-word mt-1 font-semibold text-ink text-sm tabular-nums">
        {value}
      </dd>
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
    <div className="mt-5 rounded-xl bg-card px-5 py-4">
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
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-card px-5 py-4">
        <div>
          <p className="font-semibold text-ink text-sm">Current summary</p>
          <p className="mt-1 text-slate-muted text-xs leading-relaxed">
            {getArtifactVersionLabel(artifact.definitionVersion)} · Reference{" "}
            {artifact.referenceCode} · Created{" "}
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

      <ArtifactMeasureList artifact={artifact} className="mt-5" />
    </div>
  );
}

function SummaryHistory({
  artifacts,
}: {
  artifacts: AdminSponsorArtifactStatus["history"];
}) {
  if (artifacts.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-ink text-sm">
        Earlier summaries ({NUMBER_FORMATTER.format(artifacts.length)})
      </h3>
      <div className="mt-3 grid gap-0.5 overflow-hidden rounded-xl bg-background">
        {artifacts.map((artifact) => (
          <CollapsibleSection
            key={artifact.id}
            variant="card"
            className="rounded-none first:rounded-t-xl last:rounded-b-xl"
            summary={
              <>
                {getArtifactVersionLabel(artifact.definitionVersion)}
                <span className="ml-2 font-normal text-slate-muted text-xs leading-relaxed">
                  Reference {artifact.referenceCode} · Created{" "}
                  <AdminDateTime value={artifact.generatedAt} />
                </span>
              </>
            }
          >
            <ArtifactMeasureList artifact={artifact} className="pb-5" />
          </CollapsibleSection>
        ))}
      </div>
    </div>
  );
}

function ArtifactMeasureList({
  artifact,
  className,
}: {
  artifact: AdminSponsorArtifact;
  className?: string;
}) {
  return (
    <div className={className}>
      <h4 className="font-semibold text-ink text-sm">Fixed measures</h4>
      <dl className="mt-3 grid gap-0.5 overflow-hidden rounded-xl bg-background">
        {MEASURE_ROWS.map(([key, label]) => (
          <MeasureRow
            key={key}
            label={label}
            measure={artifact.measures[key]}
          />
        ))}
      </dl>
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
    <div className="flex min-w-0 items-start justify-between gap-4 bg-card px-4 py-3">
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
            window. The record cannot be changed after it is created, and this
            step does not approve or send it.
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

function AdminDateTime({ value }: { value: string }) {
  return (
    <time dateTime={value}>{DATE_TIME_FORMATTER.format(new Date(value))}</time>
  );
}

function AdminFixedPilotSummaryUnavailable() {
  return (
    <section aria-labelledby="fixed-pilot-summary-heading" className="pt-2">
      <FixedSummaryStaticHeading />
      <p className="mt-4 rounded-xl bg-card px-5 py-4 text-slate-muted text-sm leading-relaxed">
        Your admin session cannot view or create fixed pilot summaries.
      </p>
    </section>
  );
}

function AdminFixedPilotSummaryLoading() {
  return (
    <section aria-labelledby="fixed-pilot-summary-heading" className="pt-2">
      <FixedSummaryStaticHeading />
      <div
        className="mt-5 grid gap-3 rounded-xl bg-card p-5"
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
    <section aria-labelledby="fixed-pilot-summary-heading" className="pt-2">
      <FixedSummaryStaticHeading />
      <Notice
        action={
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        }
        className="mt-5"
        role="alert"
        size="lg"
        statusIcon
        tone="danger"
      >
        <p className="text-slate-muted text-sm">
          The fixed pilot summary could not be loaded.
        </p>
      </Notice>
    </section>
  );
}

function FixedSummaryStaticHeading() {
  return (
    <div className="grid gap-1">
      <h2
        id="fixed-pilot-summary-heading"
        className="flex items-center gap-2 font-semibold text-base text-ink"
      >
        <FileLock2 className="size-4 shrink-0" aria-hidden="true" />
        Fixed pilot summary
      </h2>
      <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
        A fixed internal summary for one cohort and one outcome window. Small
        results are withheld before they reach this view. Creating it does not
        approve or send it.
      </p>
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

  return {
    label: "Not collected under this summary version",
    tone: "neutral",
  };
}

function getArtifactVersionLabel(
  definitionVersion: AdminSponsorArtifact["definitionVersion"],
) {
  return {
    "pilot-fixed-window-summary.v1": "Version 1",
    "pilot-fixed-window-summary.v2": "Version 2",
    "pilot-fixed-window-summary.v3": "Version 3",
  }[definitionVersion];
}

function getToneTextClass(tone: StatusPillTone) {
  if (tone === "teal") {
    return "text-primary";
  }
  if (tone === "amber") {
    return "text-accent";
  }
  if (tone === "destructive") {
    return "text-destructive";
  }
  return "text-slate-muted";
}

function getToneBackgroundClass(tone: StatusPillTone) {
  if (tone === "teal") {
    return "bg-primary";
  }
  if (tone === "amber") {
    return "bg-accent";
  }
  if (tone === "destructive") {
    return "bg-destructive";
  }
  return "bg-muted";
}
