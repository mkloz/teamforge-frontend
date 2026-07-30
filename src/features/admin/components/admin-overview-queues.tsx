import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ListChecks, RefreshCw, ShieldAlert } from "lucide-react";
import { operatorQueries } from "@/features/operator/public/operator-queries";
import {
  AdminSummaryMetric,
  AdminSummaryStrip,
} from "@/shared/components/admin/admin-visuals";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { buildAdminNavigation } from "@/shared/navigation/admin-navigation";

const QUEUES = [
  {
    queue: "CRITICAL_NOW",
    label: "Critical now",
    description: "Immediate safety risk or overdue urgent work.",
  },
  {
    queue: "HUMAN_REQUIRED",
    label: "Human required",
    description: "Waiting for a person to make the next decision.",
  },
  {
    queue: "APPEALS",
    label: "Appeals",
    description: "Account actions awaiting an independent review.",
  },
  {
    queue: "CONTAINMENT_REVIEW",
    label: "Containment review",
    description: "Temporary restrictions that need another look.",
  },
  {
    queue: "ROUTINE",
    label: "Routine",
    description: "Standard reports and follow-up work.",
  },
  {
    queue: "CAMPAIGNS_TRENDS",
    label: "Campaigns and trends",
    description: "Linked cases that may reveal a wider pattern.",
  },
] as const;

export function AdminOverviewQueues() {
  const queueQueries = useQueries({
    queries: QUEUES.map(({ queue }) =>
      operatorQueries.cases({ queue, page: 1, limit: 1 }),
    ),
  });

  const queueData = QUEUES.map((definition, index) => ({
    definition,
    query: queueQueries[index],
    total: queueQueries[index]?.data?.total,
  }));
  const criticalQueue = queueData[0];
  const remainingQueues = queueData.slice(1);
  const loadedTotals = queueData.flatMap(({ total }) =>
    total === undefined ? [] : [total],
  );
  const totalCases = loadedTotals.reduce((sum, total) => sum + total, 0);
  const maxRemainingTotal = Math.max(
    1,
    ...remainingQueues.map(({ total }) => total ?? 0),
  );
  const isPending = queueQueries.some((query) => query.isPending);
  const isError = queueQueries.some((query) => query.isError);
  const isFetching = queueQueries.some((query) => query.isFetching);
  const allQueuesClear =
    !isPending &&
    !isError &&
    loadedTotals.length === QUEUES.length &&
    totalCases === 0;

  function retryQueues() {
    for (const query of queueQueries) {
      if (query.isError) {
        void query.refetch();
      }
    }
  }

  return (
    <section
      aria-labelledby="admin-review-workload-heading"
      className="grid gap-4"
    >
      <header className="main-action-grid grid items-start gap-x-4 gap-y-1.5">
        <h2
          id="admin-review-workload-heading"
          className="flex items-center gap-2.5 font-semibold text-ink text-xl"
        >
          <ListChecks className="size-5 shrink-0" aria-hidden="true" />
          <span>Review workload</span>
        </h2>

        <QueueOverviewTotal
          isError={isError}
          isFetching={isFetching}
          isPending={isPending}
          onRetry={retryQueues}
          total={totalCases}
        />

        <p className="col-span-2 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          A live view of moderation work waiting for a decision.
        </p>
      </header>

      <AdminSummaryStrip>
        <AdminSummaryMetric
          label="Waiting review"
          value={isPending ? "—" : totalCases}
          tone={totalCases > 0 ? "warning" : "success"}
          detail={totalCases > 0 ? "Across all queues" : "Queues are clear"}
        />
        <AdminSummaryMetric
          label="Critical now"
          value={criticalQueue?.total ?? "—"}
          tone={(criticalQueue?.total ?? 0) > 0 ? "danger" : "success"}
          detail="Immediate priority"
        />
        <AdminSummaryMetric
          label="Human required"
          value={queueData[1]?.total ?? "—"}
          tone={(queueData[1]?.total ?? 0) > 0 ? "warning" : "success"}
          detail="Awaiting a decision"
        />
        <AdminSummaryMetric
          label="Appeals"
          value={queueData[2]?.total ?? "—"}
          tone={(queueData[2]?.total ?? 0) > 0 ? "warning" : "success"}
          detail="Independent review"
        />
      </AdminSummaryStrip>

      <div className="overflow-hidden rounded-2xl bg-card">
        <div className="grid lg:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.38fr)]">
          <article className="flex min-h-52 flex-col justify-between gap-8 p-5 sm:p-6 lg:p-7">
            <div className="grid gap-5">
              <div className="flex items-center gap-2 text-slate-muted text-sm">
                <ShieldAlert className="size-4" aria-hidden="true" />
                First priority
              </div>

              <div className="grid gap-2">
                {criticalQueue?.total === undefined ? (
                  <Skeleton className="h-14 w-24" />
                ) : (
                  <p className="font-semibold text-5xl text-ink tracking-tight">
                    {criticalQueue.total}
                  </p>
                )}
                <h3 className="font-semibold text-ink text-lg">
                  {allQueuesClear ? "No urgent decisions" : "Critical now"}
                </h3>
                <p className="max-w-sm text-pretty text-slate-muted text-sm leading-relaxed">
                  {allQueuesClear
                    ? "Every moderation queue is currently clear. The distribution remains visible for quick verification."
                    : criticalQueue?.definition.description}
                </p>
              </div>
            </div>

            <Link
              {...buildAdminNavigation("moderation")}
              search={{ queue: "CRITICAL_NOW" }}
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl font-semibold text-primary text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              Review critical queue
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </article>

          <div className="bg-card p-5 sm:p-6 lg:p-7">
            <div className="grid gap-6">
              <div className="grid gap-1">
                <h3 className="font-semibold text-base text-ink">
                  Remaining queues
                </h3>
                <p className="text-slate-muted text-sm">
                  Relative volume across every other review path.
                </p>
              </div>

              <div className="grid gap-4">
                {remainingQueues.map(({ definition, query, total }) => (
                  <QueueLoadRow
                    key={definition.queue}
                    isError={query?.isError ?? false}
                    isPending={query?.isPending ?? true}
                    label={definition.label}
                    maxTotal={maxRemainingTotal}
                    queue={definition.queue}
                    total={total}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QueueLoadRow({
  isError,
  isPending,
  label,
  maxTotal,
  queue,
  total,
}: {
  isError: boolean;
  isPending: boolean;
  label: string;
  maxTotal: number;
  queue: (typeof QUEUES)[number]["queue"];
  total: number | undefined;
}) {
  const barWidth =
    total === undefined || total === 0
      ? 0
      : Math.max(6, (total / maxTotal) * 100);

  return (
    <Link
      {...buildAdminNavigation("moderation")}
      search={{ queue }}
      className="group grid min-h-11 grid-cols-[minmax(0,9.5rem)_minmax(4rem,1fr)_auto] items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 sm:grid-cols-[minmax(0,12rem)_minmax(5rem,1fr)_auto]"
    >
      <span className="truncate font-medium text-ink text-sm group-hover:text-primary">
        {label}
      </span>

      {isPending ? (
        <Skeleton className="h-1.5 w-full rounded-full" />
      ) : (
        <span
          className="h-1.5 overflow-hidden rounded-full bg-muted/80"
          aria-hidden="true"
        >
          <span
            className="block h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${barWidth}%` }}
          />
        </span>
      )}

      <span className="flex min-w-12 items-center justify-end gap-1.5 font-semibold text-sm">
        {isError ? (
          <span className="text-slate-muted">—</span>
        ) : total === undefined ? (
          <Skeleton className="h-4 w-7" />
        ) : total === 0 ? (
          <span className="font-medium text-slate-muted text-xs">Clear</span>
        ) : (
          <span className="text-ink">{total}</span>
        )}
        <ArrowRight
          className="size-3.5 text-slate-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

function QueueOverviewTotal({
  isError,
  isFetching,
  isPending,
  onRetry,
  total,
}: {
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
  onRetry: () => void;
  total: number;
}) {
  if (isPending) {
    return (
      <span role="status" aria-label="Loading review workload">
        <Skeleton className="h-5 w-24" />
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium text-slate-muted text-sm">
        {total} open {total === 1 ? "case" : "cases"}
      </span>
      {isError ? (
        <Button
          type="button"
          variant="link"
          size="xs"
          loading={isFetching}
          onClick={onRetry}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Retry missing
        </Button>
      ) : null}
    </div>
  );
}
