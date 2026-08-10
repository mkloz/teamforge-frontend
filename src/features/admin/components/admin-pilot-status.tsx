import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  type LucideIcon,
  RefreshCw,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { adminPilotStatusQueryOptions } from "@/features/admin/api/admin.api";
import type { AdminPilotStatus as AdminPilotStatusData } from "@/features/admin/schemas/admin-pilot-status.schema";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
});

interface StatusRow {
  description: string;
  label: string;
  state: string;
  tone: "amber" | "destructive" | "neutral" | "teal";
}

const GATE_STAGES = [
  { label: "Safety", start: 0, end: 3 },
  { label: "Intake", start: 3, end: 5 },
  { label: "Formation", start: 5, end: 7 },
  { label: "Experience", start: 7, end: 10 },
] as const;

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
        description="Server-owned switches that control which beta paths are open."
        icon={SlidersHorizontal}
        id="pilot-gates"
        rows={buildGateRows(status)}
        title="Rollout controls"
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
        description="The cohort currently included in the controlled beta."
        icon={UsersRound}
        id="pilot-cohort-heading"
        title="Beta cohort"
      />

      {cohort ? (
        <CohortVisual status={status} />
      ) : (
        <div className="mt-4 rounded-xl border border-border border-dashed px-5 py-6">
          <p className="font-semibold text-ink text-sm">No active cohort</p>
          <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
            Gate and readiness rows still show the server's current status.
          </p>
        </div>
      )}
    </section>
  );
}

function CohortVisual({ status }: { status: AdminPilotStatusData }) {
  const cohort = status.activeCohort;
  if (!cohort) return null;

  const startTime = new Date(cohort.startsAt).getTime();
  const pilotEndTime = new Date(cohort.endsAt).getTime();
  const outcomeEndTime = new Date(cohort.outcomeWindowEndsAt).getTime();
  const evaluatedTime = new Date(status.evaluatedAt).getTime();
  const pilotWindow = Math.max(1, pilotEndTime - startTime);
  const outcomeWindow = Math.max(1, outcomeEndTime - pilotEndTime);
  const currentProgress =
    evaluatedTime <= pilotEndTime
      ? Math.min(
          50,
          Math.max(0, ((evaluatedTime - startTime) / pilotWindow) * 50),
        )
      : Math.min(
          100,
          50 + ((evaluatedTime - pilotEndTime) / outcomeWindow) * 50,
        );
  const capacityProgress =
    cohort.memberCap > 0
      ? Math.min(100, (cohort.memberCount / cohort.memberCap) * 100)
      : 0;

  return (
    <div className="mt-4 grid gap-7 rounded-2xl bg-card p-5 sm:p-6">
      <div className="main-action-grid grid items-end gap-4">
        <div className="grid gap-1">
          <p className="text-slate-muted text-xs">Active cohort</p>
          <p className="font-semibold text-ink text-xl">{cohort.code}</p>
        </div>
        <p className="font-semibold text-ink text-sm tabular-nums">
          {cohort.memberCount} of {cohort.memberCap} members
        </p>
      </div>

      <div className="grid gap-2">
        <div className="h-2 overflow-hidden rounded-full bg-muted/80">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${capacityProgress}%` }}
          />
        </div>
        <p className="text-slate-muted text-xs">
          {cohort.memberCount >= cohort.memberCap
            ? "Cohort is at capacity"
            : `${cohort.memberCap - cohort.memberCount} places remain`}
        </p>
      </div>

      <div className="grid gap-3">
        <div className="relative h-3">
          <div className="absolute top-1 right-0 left-0 h-px bg-border" />
          <span className="absolute top-0 left-0 size-2.5 rounded-full border-2 border-card bg-slate-muted" />
          <span
            className="absolute top-0 size-2.5 -translate-x-1/2 rounded-full border-2 border-card bg-slate-muted"
            style={{ left: "50%" }}
          />
          <span className="absolute top-0 right-0 size-2.5 rounded-full border-2 border-card bg-slate-muted" />
          <span
            className="absolute -top-0.5 size-3.5 -translate-x-1/2 rounded-full border-card border-thick bg-primary"
            style={{ left: `${currentProgress}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <CohortMilestone
            align="start"
            label="Started"
            value={cohort.startsAt}
          />
          <CohortMilestone
            align="center"
            label="Beta ends"
            value={cohort.endsAt}
          />
          <CohortMilestone
            align="end"
            label="Outcome closes"
            value={cohort.outcomeWindowEndsAt}
          />
        </div>
      </div>
    </div>
  );
}

function CohortMilestone({
  align,
  label,
  value,
}: {
  align: "center" | "end" | "start";
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        align === "center" && "justify-items-center text-center",
        align === "end" && "justify-items-end text-right",
      )}
    >
      <div className="grid gap-0.5">
        <p className="font-semibold text-ink text-xs">{label}</p>
        <p className="text-slate-muted text-xs">
          <AdminDate value={value} />
        </p>
      </div>
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
  icon: LucideIcon;
  id: string;
  rows: StatusRow[];
  title: string;
}) {
  return (
    <section aria-labelledby={id} className="pt-2">
      <AdminStatusSectionHeading
        description={description}
        icon={icon}
        id={id}
        title={title}
      />
      <div className="grouped-surface mt-4 grid overflow-hidden rounded-2xl md:grid-cols-2 xl:grid-cols-4">
        {GATE_STAGES.map((stage) => {
          const stageRows = rows.slice(stage.start, stage.end);
          const enabledCount = stageRows.filter(
            (row) => row.tone === "teal",
          ).length;

          return (
            <section
              key={stage.label}
              className="grid content-start gap-4 bg-card p-5 sm:p-6"
            >
              <div className="grid gap-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-ink text-sm">
                    {stage.label}
                  </h3>
                  <p className="text-slate-muted text-xs">
                    {enabledCount}/{stageRows.length} open
                  </p>
                </div>
                <span
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${stageRows.length}, minmax(0, 1fr))`,
                  }}
                  aria-hidden="true"
                >
                  {stageRows.map((row) => (
                    <span
                      key={row.label}
                      className={cn(
                        "h-1.5 rounded-full",
                        row.tone === "teal"
                          ? "bg-primary"
                          : row.tone === "destructive"
                            ? "bg-danger"
                            : row.tone === "amber"
                              ? "bg-accent"
                              : "bg-muted",
                      )}
                    />
                  ))}
                </span>
              </div>

              <dl className="grid gap-4">
                {stageRows.map((row) => (
                  <div key={row.label} className="grid gap-0.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="font-semibold text-ink text-sm">
                        {row.label}
                      </dt>
                      <dd
                        className={cn(
                          "shrink-0 font-medium text-xs",
                          row.tone === "teal"
                            ? "text-foreground"
                            : row.tone === "destructive"
                              ? "text-danger"
                              : row.tone === "amber"
                                ? "text-accent"
                                : "text-slate-muted",
                        )}
                      >
                        {row.state}
                      </dd>
                    </div>
                    <p className="text-pretty text-slate-muted text-xs leading-relaxed">
                      {row.description}
                    </p>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>
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
  icon: LucideIcon;
  id: string;
  title: string;
}) {
  return (
    <div className="grid gap-1">
      <h2
        id={id}
        className="flex items-center gap-2 font-semibold text-base text-ink"
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {title}
      </h2>
      <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function AdminPilotStatusLoading() {
  return (
    <div className="grid gap-8" role="status" aria-label="Loading pilot status">
      {["cohort", "gates"].map((section) => (
        <section key={section} className="pt-2 first:pt-0">
          <div className="flex items-start gap-3">
            <Skeleton shape="circle" className="size-9 shrink-0" />
            <div className="grid flex-1 gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </div>
          <div className="grouped-surface mt-4 grid overflow-hidden rounded-xl sm:grid-cols-2">
            {[0, 1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-4 bg-card px-4 py-3"
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
    <section aria-labelledby="pilot-status-error-heading" className="py-8">
      <AlertTriangle className="size-8" aria-hidden="true" />
      <h2
        id="pilot-status-error-heading"
        className="mt-3 font-semibold text-ink text-lg"
      >
        Pilot status is unavailable
      </h2>
      <p className="mt-1 max-w-xl text-pretty text-slate-muted text-sm leading-relaxed">
        Findafew could not load the current cohort or gates. No status is shown
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

function AdminDate({ value }: { value: string }) {
  return <time dateTime={value}>{DATE_FORMATTER.format(new Date(value))}</time>;
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
