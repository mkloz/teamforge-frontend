import { useQuery } from "@tanstack/react-query";
import { Link, useRouteContext } from "@tanstack/react-router";
import {
  ArrowRight,
  Clock3,
  RefreshCw,
  ShieldOff,
  TriangleAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import { operatorQueueHealthQueryOptions } from "@/features/operator/api/operator-queue-health.api";
import {
  formatOperatorDate,
  OPERATOR_QUEUE_COPY,
} from "@/features/operator/lib/operator-language";
import type { OperatorQueueHealth } from "@/features/operator/schemas/operator-queue-health.schemas";
import {
  AdminSummaryMetric,
  AdminSummaryStrip,
} from "@/shared/components/admin/admin-visuals";
import { Button } from "@/shared/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusPill } from "@/shared/components/ui/status-pill";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

const STALE_AFTER_MS = 5 * 60_000;
const CHART_MINIMUM_SAMPLE = 10;
const AGE_CHART_CONFIG = {
  count: { label: "Open cases", color: "var(--chart-3)" },
} satisfies ChartConfig;

const AGE_BAND_LABELS = {
  AGE_LT_24H: "Under 24 hours",
  AGE_24_TO_72H: "24–72 hours",
  AGE_72H_TO_7D: "3–7 days",
  AGE_7D_PLUS: "7 days or more",
} as const;

export function OperatorQueueHealthPage() {
  const { adminSession } = useRouteContext({ from: "/admin" });
  const canView = adminSession.capabilities.viewQueueHealth;
  const query = useQuery(operatorQueueHealthQueryOptions(canView));

  if (!canView) return <QueueHealthRestricted />;
  if (query.isLoading) return <QueueHealthLoading />;
  if (query.isError || !query.data) {
    return <QueueHealthError onRetry={() => void query.refetch()} />;
  }

  const snapshot = query.data;
  const stale = isStale(snapshot.generatedAt);
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] content-start gap-8 px-4 py-6 md:px-8 md:py-10">
      <header className="sm:main-action-grid grid items-end gap-x-5 gap-y-2">
        <div className="grid gap-1">
          <p className="font-semibold text-muted-foreground text-xs">
            Operations
          </p>
          <h1 className="font-extrabold text-3xl text-ink">Queue health</h1>
          <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
            Identify overdue work, missing decision targets, and queues that
            need assignment attention. Queue memberships overlap and totals must
            not be added together.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start sm:justify-self-auto"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw
            className={query.isFetching ? "size-4 animate-spin" : "size-4"}
            aria-hidden="true"
          />
          Refresh snapshot
        </Button>
      </header>

      <SnapshotStatus snapshot={snapshot} stale={stale} />

      <AdminSummaryStrip>
        <AdminSummaryMetric
          label="Open backlog"
          value={snapshot.backlog}
          tone={snapshot.backlog > 0 ? "warning" : "success"}
          detail="Distinct unresolved cases"
        />
        <AdminSummaryMetric
          label="Overdue"
          value={snapshot.overdue}
          tone={snapshot.overdue > 0 ? "danger" : "success"}
          detail={`${snapshot.dueSoon} due in the next 24 hours`}
        />
        <AdminSummaryMetric
          label="Unassigned"
          value={snapshot.unassigned}
          tone={snapshot.unassigned > 0 ? "warning" : "success"}
          detail="No current active assignment"
        />
        <AdminSummaryMetric
          label="Oldest open case"
          value={formatAge(snapshot.oldestCaseAgeSeconds)}
          tone={
            (snapshot.oldestCaseAgeSeconds ?? 0) >= 72 * 60 * 60
              ? "danger"
              : "muted"
          }
          detail={`${snapshot.missingDeadline} without a decision target`}
        />
      </AdminSummaryStrip>

      <QueueHealthActions snapshot={snapshot} />

      {snapshot.backlog === 0 ? <QueueHealthEmpty /> : null}

      <QueueHealthTable rows={snapshot.queues} />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <AgeBandSection snapshot={snapshot} />
        <SeveritySection snapshot={snapshot} />
      </div>
    </div>
  );
}

function QueueHealthActions({ snapshot }: { snapshot: OperatorQueueHealth }) {
  if (snapshot.backlog === 0) return null;

  return (
    <section
      className="grid gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
      aria-labelledby="queue-health-actions-heading"
    >
      <div>
        <h2
          id="queue-health-actions-heading"
          className="font-semibold text-ink text-sm"
        >
          Act on attention signals
        </h2>
        <p className="mt-1 text-slate-muted text-xs">
          Intake links cover the exact global unassigned subset. Assigned links
          show work assigned to the current administrator; queue-health totals
          remain global.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {snapshot.overdue > 0 ? (
          <>
            <Button asChild size="sm" variant="destructive">
              <Link
                to="/admin/moderation"
                search={{ queue: "CRITICAL_NOW", sla: "OVERDUE" }}
              >
                Review my overdue work
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/moderation/intake" search={{ sla: "OVERDUE" }}>
                Claim unassigned overdue work
              </Link>
            </Button>
          </>
        ) : null}
        {snapshot.dueSoon > 0 ? (
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/moderation/intake" search={{ sla: "DUE_SOON" }}>
              Claim work due in 24 hours
            </Link>
          </Button>
        ) : null}
        {snapshot.missingDeadline > 0 ? (
          <Button asChild size="sm" variant="outline">
            <Link
              to="/admin/moderation/intake"
              search={{ sla: "MISSING_DEADLINE" }}
            >
              Triage work without a target
            </Link>
          </Button>
        ) : null}
        {snapshot.unassigned > 0 ? (
          <Button asChild size="sm" variant="ghost">
            <Link to="/admin/moderation/intake" search={{}}>
              Open all unassigned work
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function SnapshotStatus({
  snapshot,
  stale,
}: {
  snapshot: OperatorQueueHealth;
  stale: boolean;
}) {
  if (stale || snapshot.dataQuality === "PARTIAL") {
    return (
      <div
        className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent-soft p-4 text-sm"
        role="status"
      >
        <TriangleAlert
          className="mt-0.5 size-5 shrink-0 text-accent"
          aria-hidden="true"
        />
        <div>
          <p className="font-semibold text-ink">
            {snapshot.dataQuality === "PARTIAL"
              ? "Some queue-health signals are unavailable"
              : "This snapshot may be stale"}
          </p>
          <p className="mt-1 text-slate-muted text-xs">
            Generated {formatOperatorDate(snapshot.generatedAt)}. Refresh before
            making a staffing decision.
          </p>
        </div>
      </div>
    );
  }

  return (
    <p className="flex min-w-0 items-start gap-2 text-slate-muted text-xs">
      <Clock3 className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0">
        Current snapshot generated {formatOperatorDate(snapshot.generatedAt)} ·
        Times use the administrator’s {resolvedTimezone()} timezone
      </span>
    </p>
  );
}

function QueueHealthTable({ rows }: { rows: OperatorQueueHealth["queues"] }) {
  return (
    <section
      className="grid gap-3"
      aria-labelledby="queue-health-table-heading"
    >
      <div>
        <h2
          id="queue-health-table-heading"
          className="font-semibold text-ink text-lg"
        >
          Operational queues
        </h2>
        <p className="mt-1 text-slate-muted text-xs">
          Exact current values. Open assigned work or filter unassigned intake
          to act on a queue.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
        <Table>
          <TableCaption className="sr-only">
            Current moderation health by overlapping operational queue
          </TableCaption>
          <TableHeader className="hidden text-slate-muted text-xs xl:table-header-group">
            <TableRow>
              <TableHead className="px-5">Queue</TableHead>
              <TableHead>Backlog</TableHead>
              <TableHead>Overdue</TableHead>
              <TableHead>Due in 24h</TableHead>
              <TableHead>No target</TableHead>
              <TableHead>Unassigned</TableHead>
              <TableHead>Oldest</TableHead>
              <TableHead className="w-56">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.queue}
                className="grid grid-cols-2 gap-4 px-5 py-5 xl:table-row xl:px-0 xl:py-0"
              >
                <TableCell className="col-span-2 grid gap-1 p-0 xl:table-cell xl:px-5 xl:py-3">
                  <span className="font-semibold text-ink text-sm">
                    {OPERATOR_QUEUE_COPY[row.queue].label}
                  </span>
                  <span className="text-slate-muted text-xs xl:hidden">
                    {OPERATOR_QUEUE_COPY[row.queue].description}
                  </span>
                </TableCell>
                <QueueValue label="Backlog" value={row.backlog} />
                <QueueValue label="Overdue" value={row.overdue} danger />
                <QueueValue label="Due in 24h" value={row.dueSoon} />
                <QueueValue label="No target" value={row.missingDeadline} />
                <QueueValue label="Unassigned" value={row.unassigned} />
                <QueueValue
                  label="Oldest"
                  value={formatAge(row.oldestCaseAgeSeconds)}
                />
                <TableCell className="col-span-2 flex flex-wrap gap-2 p-0 xl:table-cell xl:p-2 xl:pr-5">
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/admin/moderation" search={{ queue: row.queue }}>
                      Assigned
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link
                      to="/admin/moderation/intake"
                      search={{ queue: row.queue }}
                    >
                      Unassigned
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function QueueValue({
  danger = false,
  label,
  value,
}: {
  danger?: boolean;
  label: string;
  value: number | string;
}) {
  return (
    <TableCell className="grid gap-1 p-0 text-sm xl:table-cell xl:p-2">
      <span className="text-slate-muted text-xs xl:hidden">{label}</span>
      <span
        className={
          danger && Number(value) > 0 ? "font-semibold text-danger" : "text-ink"
        }
      >
        {value}
      </span>
    </TableCell>
  );
}

function AgeBandSection({ snapshot }: { snapshot: OperatorQueueHealth }) {
  const data = snapshot.ageBands.map((band) => ({
    count: band.count,
    label: AGE_BAND_LABELS[band.code],
  }));
  const nonZeroBands = data.filter((band) => band.count > 0).length;
  const showChart =
    snapshot.backlog >= CHART_MINIMUM_SAMPLE && nonZeroBands > 1;

  return (
    <section
      className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-4"
      aria-labelledby="queue-age-heading"
    >
      <div>
        <h2 id="queue-age-heading" className="font-semibold text-ink text-lg">
          Backlog age
        </h2>
        <p className="mt-1 max-w-2xl text-slate-muted text-xs leading-relaxed">
          Age is measured from case creation to the snapshot time. Bands are
          fixed by {snapshot.bandDefinitionVersion}.
        </p>
      </div>
      {showChart ? (
        <ChartContainer
          config={AGE_CHART_CONFIG}
          className="h-64 w-full rounded-2xl bg-card p-4 shadow-sm"
          aria-label={`Backlog age distribution: ${data.map((item) => `${item.label} ${item.count}`).join(", ")}`}
        >
          <BarChart
            data={data}
            layout="vertical"
            accessibilityLayer
            margin={{ left: 8, right: 28 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" allowDecimals={false} hide />
            <YAxis
              type="category"
              dataKey="label"
              width={100}
              axisLine={false}
              tickLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={5}>
              <LabelList dataKey="count" position="right" />
            </Bar>
          </BarChart>
        </ChartContainer>
      ) : (
        <p className="rounded-xl border border-border border-dashed p-4 text-slate-muted text-sm">
          {snapshot.backlog < CHART_MINIMUM_SAMPLE
            ? `Only ${snapshot.backlog} open ${snapshot.backlog === 1 ? "case" : "cases"}; exact values are clearer than a chart.`
            : "All open cases fall in one age band; exact values are clearer than a chart."}
        </p>
      )}
      <dl className="grouped-surface grid overflow-hidden rounded-xl sm:grid-cols-2">
        {data.map((item) => (
          <div key={item.label} className="grid gap-1 bg-card px-4 py-3">
            <dt className="text-slate-muted text-xs">{item.label}</dt>
            <dd className="font-semibold text-ink text-lg">{item.count}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SeveritySection({ snapshot }: { snapshot: OperatorQueueHealth }) {
  return (
    <section
      className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-4"
      aria-labelledby="queue-severity-heading"
    >
      <div>
        <h2
          id="queue-severity-heading"
          className="font-semibold text-ink text-lg"
        >
          Severity distribution
        </h2>
        <p className="mt-1 text-slate-muted text-xs">
          Exact unresolved-case counts, including cases not yet triaged.
        </p>
      </div>
      <dl className="grouped-surface grid overflow-hidden rounded-xl sm:grid-cols-2 xl:grid-cols-1">
        {snapshot.severityDistribution.map((item) => (
          <div
            key={item.severity}
            className="flex items-center justify-between gap-4 bg-card px-4 py-3"
          >
            <dt className="text-slate-muted text-sm">
              {item.severity === "UNSET" ? "Not triaged" : item.severity}
            </dt>
            <dd className="font-semibold text-ink text-sm">{item.count}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function QueueHealthEmpty() {
  return (
    <div className="grid justify-items-center gap-2 rounded-2xl border border-border border-dashed p-8 text-center">
      <StatusPill tone="teal" surface="soft">
        Queues clear
      </StatusPill>
      <h2 className="font-semibold text-ink">No unresolved moderation cases</h2>
      <p className="max-w-md text-pretty text-slate-muted text-sm">
        The exact queue table remains visible so administrators can verify each
        operational queue independently.
      </p>
    </div>
  );
}

function QueueHealthLoading() {
  return (
    <div
      className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-8 md:py-10"
      aria-busy="true"
    >
      <Skeleton className="h-24" />
      <Skeleton className="h-28" />
      <Skeleton className="h-80" />
    </div>
  );
}

function QueueHealthRestricted() {
  return (
    <div className="mx-auto grid min-h-[60dvh] max-w-xl place-items-center px-4 text-center">
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-8">
        <ShieldOff className="mx-auto size-9" aria-hidden="true" />
        <h1 className="font-bold text-2xl text-ink">
          Queue health is restricted
        </h1>
        <p className="text-pretty text-slate-muted text-sm">
          This owner-only current-state view is not enabled for the current
          environment.
        </p>
      </div>
    </div>
  );
}

function QueueHealthError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="mx-auto grid min-h-[60dvh] max-w-xl place-items-center px-4 text-center"
      role="alert"
    >
      <div className="grid gap-3 rounded-2xl border border-danger/25 bg-card p-8">
        <TriangleAlert
          className="mx-auto size-9 text-danger"
          aria-hidden="true"
        />
        <h1 className="font-bold text-2xl text-ink">
          Queue health could not be loaded
        </h1>
        <p className="text-pretty text-slate-muted text-sm">
          No staffing decision should use an incomplete snapshot. Retry the
          current-state query.
        </p>
        <Button variant="outline" className="mx-auto" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}

function isStale(generatedAt: string) {
  return Date.now() - new Date(generatedAt).getTime() > STALE_AFTER_MS;
}

function resolvedTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function formatAge(seconds: number | null) {
  if (seconds === null) return "—";
  if (seconds < 60 * 60) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 24 * 60 * 60) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86_400)}d ${Math.floor((seconds % 86_400) / 3600)}h`;
}
