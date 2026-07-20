import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  RefreshCw,
  type ShieldCheck,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { adminPilotStatusQueryOptions } from "@/features/admin/api/admin.api";
import type { AdminPilotStatus as AdminPilotStatusData } from "@/features/admin/schemas/admin-pilot-status.schema";
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

interface StatusRow {
  description: string;
  label: string;
  state: string;
  tone: StatusPillTone;
}

export function AdminPilotStatus() {
  const pilotStatusQuery = useQuery(adminPilotStatusQueryOptions());

  if (pilotStatusQuery.isPending) {
    return <AdminPilotStatusLoading />;
  }

  if (pilotStatusQuery.isError) {
    return (
      <AdminPilotStatusError onRetry={() => void pilotStatusQuery.refetch()} />
    );
  }

  return <AdminPilotStatusContent status={pilotStatusQuery.data} />;
}

function AdminPilotStatusContent({ status }: { status: AdminPilotStatusData }) {
  return (
    <div className="grid gap-8">
      <CohortSection status={status} />
      <StatusSection
        description="Server-owned switches that control which pilot paths are open."
        icon={SlidersHorizontal}
        id="pilot-gates"
        rows={buildGateRows(status)}
        title="Pilot gates"
      />
      <p className="text-slate-muted text-xs leading-relaxed">
        Evaluated <AdminDateTime value={status.evaluatedAt} />
      </p>
    </div>
  );
}

function CohortSection({ status }: { status: AdminPilotStatusData }) {
  const cohort = status.activeCohort;

  return (
    <section aria-labelledby="pilot-cohort-heading">
      <AdminStatusSectionHeading
        description="The cohort currently covered by the controlled pilot."
        icon={UsersRound}
        id="pilot-cohort-heading"
        title="Pilot cohort"
      />

      {cohort ? (
        <dl className="mt-4 grid gap-x-8 border-border border-t sm:grid-cols-2">
          <CohortDetail label="Cohort" value={cohort.code} />
          <CohortDetail
            label="Members"
            value={`${cohort.memberCount} of ${cohort.memberCap}`}
          />
          <CohortDetail label="Pilot window">
            <AdminDateTime value={cohort.startsAt} />
            <span aria-hidden="true"> – </span>
            <span className="sr-only"> to </span>
            <AdminDateTime value={cohort.endsAt} />
          </CohortDetail>
          <CohortDetail label="Outcome window ends">
            <AdminDateTime value={cohort.outcomeWindowEndsAt} />
          </CohortDetail>
        </dl>
      ) : (
        <div className="mt-4 border-border border-t py-5">
          <StatusPill size="sm" surface="soft" tone="neutral">
            No active cohort
          </StatusPill>
          <p className="mt-2 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
            No controlled-pilot cohort is configured. The gate and readiness
            rows below still show the server's current status.
          </p>
        </div>
      )}
    </section>
  );
}

function CohortDetail({
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

function StatusSection({
  description,
  icon,
  id,
  rows,
  title,
}: {
  description: string;
  icon: typeof ShieldCheck;
  id: string;
  rows: StatusRow[];
  title: string;
}) {
  return (
    <section aria-labelledby={id} className="border-border border-t pt-6">
      <AdminStatusSectionHeading
        description={description}
        icon={icon}
        id={id}
        title={title}
      />
      <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex min-w-0 items-start justify-between gap-4 border-border border-b py-3"
          >
            <dt className="min-w-0">
              <span className="block font-semibold text-ink text-sm">
                {row.label}
              </span>
              <span className="mt-0.5 block text-pretty text-slate-muted text-xs leading-relaxed">
                {row.description}
              </span>
            </dt>
            <dd className="shrink-0">
              <StatusPill size="xs" surface="soft" tone={row.tone}>
                {row.state}
              </StatusPill>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function AdminStatusSectionHeading({
  description,
  icon: Icon,
  id,
  title,
}: {
  description: string;
  icon: typeof ShieldCheck;
  id: string;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 id={id} className="font-semibold text-base text-ink">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function AdminPilotStatusLoading() {
  return (
    <div className="grid gap-8" role="status" aria-label="Loading pilot status">
      {["cohort", "gates"].map((section) => (
        <section
          key={section}
          className="border-border border-t pt-6 first:border-t-0 first:pt-0"
        >
          <div className="flex items-start gap-3">
            <Skeleton shape="circle" className="size-9 shrink-0" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </div>
          <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
            {[0, 1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-4 border-border border-b py-3"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton shape="pill" className="h-5 w-16" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function AdminPilotStatusError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      aria-labelledby="pilot-status-error-heading"
      className="border-border border-t py-8"
    >
      <AlertTriangle className="size-8 text-accent" aria-hidden="true" />
      <h2
        id="pilot-status-error-heading"
        className="mt-3 font-semibold text-ink text-lg"
      >
        Pilot status is unavailable
      </h2>
      <p className="mt-1 max-w-xl text-pretty text-slate-muted text-sm leading-relaxed">
        TeamForge could not load the current cohort or gates. No status is shown
        until the server can be checked again.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={onRetry}
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </section>
  );
}

function AdminDateTime({ value }: { value: string }) {
  return (
    <time dateTime={value}>{DATE_TIME_FORMATTER.format(new Date(value))}</time>
  );
}

function buildGateRows(status: AdminPilotStatusData): StatusRow[] {
  const { gates } = status;

  return [
    gateRow({
      description:
        "Stops new proposal exposure and group formation when enabled.",
      enabled: gates.globalSafetyPause,
      enabledState: "Paused",
      label: "Global safety pause",
      reversedTone: true,
    }),
    gateRow({
      description: "Assess reports with the configured workflow.",
      enabled: gates.aiTriage,
      label: "Automated report assessment",
    }),
    gateRow({
      description:
        "Apply pre-approved, reversible automatic safeguards without creating a human sanction.",
      enabled: gates.deterministicModerationAutomation,
      label: "Automatic safeguards",
    }),
    gateRow({
      description: "Accept new automatic group requests.",
      enabled: gates.autoRequestIntake,
      label: "Request intake",
    }),
    gateRow({
      description: "Let eligible members appear as available candidates.",
      enabled: gates.candidateAvailability,
      label: "Candidate availability",
    }),
    gateRow({
      description:
        "Select members, save the proposal, and make it available for review.",
      enabled: gates.proposalAllocation,
      label: "Proposal allocation",
    }),
    gateRow({
      description:
        "Create the group, plan, and first chat after the proposal reaches accepted quorum.",
      enabled: gates.proposalMaterialization,
      label: "Group formation",
    }),
    gateRow({
      description: "Open the first group conversation after formation.",
      enabled: gates.firstGroupChat,
      label: "First group chat",
    }),
    gateRow({
      description: "Allow groups whose plans take place online.",
      enabled: gates.onlineGroups,
      label: "Online groups",
    }),
    gateRow({
      description:
        "Allow attachments and non-text messages in the first system-managed group chat.",
      enabled: gates.strangerMedia,
      label: "First group chat media",
    }),
  ];
}

function gateRow({
  description,
  enabled,
  enabledState = "Enabled",
  label,
  reversedTone = false,
}: {
  description: string;
  enabled: boolean;
  enabledState?: string;
  label: string;
  reversedTone?: boolean;
}): StatusRow {
  return {
    description,
    label,
    state: enabled ? enabledState : reversedTone ? "Not paused" : "Disabled",
    tone: enabled
      ? reversedTone
        ? "destructive"
        : "teal"
      : reversedTone
        ? "teal"
        : "neutral",
  };
}
