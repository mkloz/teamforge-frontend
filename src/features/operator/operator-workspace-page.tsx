import { useQueries, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Clock3 } from "lucide-react";
import { useEffect, useRef } from "react";
import { operatorQueries } from "@/features/operator/api/operator-queries";
import {
  OperatorAccessState,
  OperatorLoading,
} from "@/features/operator/components/operator-states";
import {
  formatOperatorDate,
  humanizeCode,
  OPERATOR_QUEUE_COPY,
  OPERATOR_QUEUES,
  SEVERITY_LABELS,
} from "@/features/operator/lib/operator-language";
import {
  type OperatorCaseSummary,
  type OperatorQueue,
  operatorQueueSchema,
} from "@/features/operator/schemas/operator.schemas";
import {
  AdminSummaryMetric,
  AdminSummaryStrip,
} from "@/shared/components/admin/admin-visuals";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const CASES_PER_PAGE = 50;

export function OperatorWorkspacePage() {
  const search = useSearch({ from: "/admin/moderation" });
  const navigate = useNavigate({ from: "/admin/moderation" });
  const queue =
    operatorQueueSchema.safeParse(search.queue).data ?? "CRITICAL_NOW";
  const page = search.page ?? 1;
  const query = useQuery(
    operatorQueries.cases({ queue, page, limit: CASES_PER_PAGE }),
  );
  const queueCountQueries = useQueries({
    queries: OPERATOR_QUEUES.map((queueId) =>
      operatorQueries.cases({ queue: queueId, page: 1, limit: 1 }),
    ),
  });
  const pageHeadingRef = useRef<HTMLHeadingElement>(null);
  const listLocation = `${queue}:${page}`;
  const previousListLocationRef = useRef(listLocation);
  const activeQueue = OPERATOR_QUEUE_COPY[queue];
  const totalPages = query.data
    ? Math.max(1, Math.ceil(query.data.total / query.data.limit))
    : 1;

  useEffect(() => {
    if (!query.data || page <= totalPages) return;

    void navigate({
      replace: true,
      search: {
        queue,
        page: totalPages === 1 ? undefined : totalPages,
      },
    });
  }, [navigate, page, query.data, queue, totalPages]);

  useEffect(() => {
    if (
      !query.data ||
      query.isFetching ||
      page > totalPages ||
      previousListLocationRef.current === listLocation
    ) {
      return;
    }

    previousListLocationRef.current = listLocation;
    pageHeadingRef.current?.focus({ preventScroll: true });
  }, [listLocation, page, query.data, query.isFetching, totalPages]);

  if (query.isLoading) return <OperatorLoading />;
  if (query.isError || !query.data) {
    return (
      <OperatorAccessState
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const now = Date.now();
  const overdueCases = query.data.data.filter(
    (item) => item.dueAt && new Date(item.dueAt).getTime() < now,
  ).length;
  const highSeverityCases = query.data.data.filter(
    (item) => item.severity === "P0" || item.severity === "P1",
  ).length;
  const oldestCreatedAt = query.data.data.reduce<string | null>(
    (oldest, item) =>
      !oldest || new Date(item.createdAt) < new Date(oldest)
        ? item.createdAt
        : oldest,
    null,
  );

  return (
    <div className="mx-auto grid w-full max-w-7xl content-start gap-10 px-4 py-6 md:px-8 md:py-10">
      <header className="main-action-grid grid items-start gap-x-4 gap-y-1.5">
        <h1
          ref={pageHeadingRef}
          tabIndex={-1}
          className="rounded-sm font-extrabold text-3xl text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {activeQueue.label}
          <span className="sr-only">
            , page {page} of {totalPages}
          </span>
        </h1>
        <span className="font-semibold text-slate-muted text-sm">
          {query.data.total} {query.data.total === 1 ? "case" : "cases"}
        </span>
        <p className="col-span-2 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          {activeQueue.description}.
        </p>
      </header>

      <AdminSummaryStrip>
        <AdminSummaryMetric
          label="In this queue"
          value={query.data.total}
          tone={query.data.total > 0 ? "warning" : "success"}
          detail={activeQueue.label}
        />
        <AdminSummaryMetric
          label="High severity"
          value={highSeverityCases}
          tone={highSeverityCases > 0 ? "danger" : "success"}
          detail="P0 or P1 on this page"
        />
        <AdminSummaryMetric
          label="Overdue"
          value={overdueCases}
          tone={overdueCases > 0 ? "danger" : "success"}
          detail="Past the decision target"
        />
        <AdminSummaryMetric
          label="Oldest visible"
          value={
            oldestCreatedAt
              ? formatQueueAge(now - new Date(oldestCreatedAt).getTime())
              : "—"
          }
          tone={
            oldestCreatedAt &&
            now - new Date(oldestCreatedAt).getTime() > 24 * 60 * 60_000
              ? "warning"
              : "muted"
          }
          detail="Current page"
        />
      </AdminSummaryStrip>

      <div className="sticky top-20 z-20 overflow-hidden rounded-2xl bg-card shadow-sm lg:top-4">
        <nav
          aria-label="Review queues"
          className="scrollbar-none grid auto-cols-max grid-flow-col gap-1 overflow-x-auto p-1.5 pr-10 md:pr-1.5"
        >
          {OPERATOR_QUEUES.map((queueId, index) => {
            const item = OPERATOR_QUEUE_COPY[queueId];
            const count = queueCountQueries[index]?.data?.total;
            return (
              <Link
                key={queueId}
                to="/admin/moderation"
                search={{ queue: queueId, page: undefined }}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-xl px-4 font-semibold text-sm transition-colors",
                  queueId === queue
                    ? "bg-primary/10 text-ink"
                    : "text-slate-muted hover:bg-muted/50 hover:text-ink",
                )}
              >
                <span>{item.label}</span>
                <span
                  className={cn(
                    "ml-2 font-semibold text-xs tabular-nums",
                    queueId === queue ? "text-primary" : "text-slate-muted",
                  )}
                >
                  {count ?? "—"}
                </span>
              </Link>
            );
          })}
        </nav>
        <span
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-card to-transparent md:hidden"
          aria-hidden="true"
        />
      </div>

      <section className="grid min-w-0 content-start gap-4">
        {query.data.data.length ? (
          <div className="grouped-surface grid overflow-hidden rounded-2xl [&>*]:bg-card">
            {query.data.data.map((item) => (
              <OperatorCaseCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-44 place-items-center rounded-xl border border-border border-dashed px-5 py-8 text-center">
            <div className="grid max-w-md justify-items-center gap-2">
              <h2 className="font-semibold text-base text-ink">
                {activeQueue.label} is clear
              </h2>
              <p className="text-pretty text-slate-muted text-sm leading-relaxed">
                No cases are waiting in this review path.
              </p>
            </div>
          </div>
        )}
        <QueuePagination page={page} queue={queue} totalPages={totalPages} />
      </section>
    </div>
  );
}

function formatQueueAge(milliseconds: number) {
  const hours = Math.max(0, Math.floor(milliseconds / 3_600_000));
  if (hours < 1) return "<1h";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function QueuePagination({
  page,
  queue,
  totalPages,
}: {
  page: number;
  queue: OperatorQueue;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Case queue pagination"
      className="flex flex-wrap items-center justify-between gap-3 pt-2"
    >
      <p className="font-medium text-slate-muted text-sm" aria-live="polite">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link
              to="/admin/moderation"
              search={{
                queue,
                page: page === 2 ? undefined : page - 1,
              }}
              rel="prev"
            >
              Previous
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        )}
        {page < totalPages ? (
          <Button asChild variant="outline" size="sm">
            <Link
              to="/admin/moderation"
              search={{ queue, page: page + 1 }}
              rel="next"
            >
              Next
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </nav>
  );
}

function OperatorCaseCard({ item }: { item: OperatorCaseSummary }) {
  const dueAt = item.dueAt ? new Date(item.dueAt) : null;
  const isOverdue = dueAt ? dueAt.getTime() < Date.now() : false;

  return (
    <article className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(14rem,1fr)_minmax(15rem,0.9fr)_minmax(11rem,0.65fr)_auto] lg:items-center">
      <div className="grid min-w-0 gap-1.5">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <h2 className="truncate font-semibold text-ink">{item.reference}</h2>
          <span
            className={cn(
              "font-semibold text-xs",
              item.severity === "P0" || item.severity === "P1"
                ? "text-danger"
                : item.severity === "P2"
                  ? "text-accent"
                  : "text-slate-muted",
            )}
          >
            {item.severity
              ? SEVERITY_LABELS[item.severity]
              : "Severity pending"}
          </span>
        </div>
        {item.mandatoryHumanReasons.length ? (
          <p className="truncate font-medium text-accent text-xs">
            {item.mandatoryHumanReasons.map(humanizeCode).join(" · ")}
          </p>
        ) : (
          <p className="text-slate-muted text-xs">
            {humanizeCode(item.status)}
          </p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <CaseFact
          label="Evidence"
          value={humanizeCode(item.evidenceCompleteness)}
        />
        <CaseFact label="Uncertainty" value={humanizeCode(item.uncertainty)} />
      </dl>

      <div className="grid gap-1.5">
        <p className="font-medium text-ink text-sm">
          {item.reportCount} {item.reportCount === 1 ? "report" : "reports"}
        </p>
        <p
          className={cn(
            "flex items-center gap-1.5 text-xs",
            isOverdue ? "font-medium text-danger" : "text-slate-muted",
          )}
        >
          <Clock3 className="size-3.5" aria-hidden="true" />
          {dueAt ? `Due ${formatOperatorDate(item.dueAt)}` : "No due date"}
        </p>
      </div>

      <Link
        to="/admin/moderation/cases/$caseId"
        params={{ caseId: item.id }}
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary text-sm lg:justify-self-end"
      >
        Open case
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

function CaseFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
