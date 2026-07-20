import { useQuery } from "@tanstack/react-query";
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

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-8 md:py-10 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <nav aria-label="Review queues" className="grid content-start gap-2">
        {OPERATOR_QUEUES.map((queueId) => {
          const item = OPERATOR_QUEUE_COPY[queueId];
          return (
            <Link
              key={queueId}
              to="/admin/moderation"
              search={{ queue: queueId, page: undefined }}
              className={cn(
                "grid gap-0.5 rounded-xl border px-4 py-3 transition-colors",
                queueId === queue
                  ? "border-primary/35 bg-primary/8 text-ink"
                  : "border-border bg-card text-slate-muted hover:border-primary/20 hover:text-ink",
              )}
            >
              <span className="font-semibold text-sm">{item.label}</span>
              <span className="text-xs leading-relaxed">
                {item.description}
              </span>
            </Link>
          );
        })}
      </nav>

      <section className="grid min-w-0 content-start gap-4">
        <header className="grid gap-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1
              ref={pageHeadingRef}
              tabIndex={-1}
              className="rounded-sm font-extrabold text-2xl text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {activeQueue.label}
              <span className="sr-only">
                , page {page} of {totalPages}
              </span>
            </h1>
            <span className="font-semibold text-slate-muted text-sm">
              {query.data.total} {query.data.total === 1 ? "case" : "cases"}
            </span>
          </div>
          <p className="text-slate-muted text-sm leading-relaxed">
            {activeQueue.description}
          </p>
        </header>

        {query.data.data.length ? (
          <div className="grid gap-3">
            {query.data.data.map((item) => (
              <OperatorCaseCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="grid min-h-48 place-items-center rounded-2xl border border-border bg-card p-6 text-center">
            <div className="grid gap-1">
              <h2 className="font-bold text-ink text-lg">Queue clear</h2>
              <p className="text-slate-muted text-sm">
                There are no assigned cases waiting here.
              </p>
            </div>
          </div>
        )}
        <QueuePagination page={page} queue={queue} totalPages={totalPages} />
      </section>
    </div>
  );
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
      className="flex flex-wrap items-center justify-between gap-3 border-border border-t pt-4"
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
  return (
    <article className="sm:main-action-grid grid gap-4 rounded-2xl border border-border bg-card p-5 sm:items-center">
      <div className="grid min-w-0 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-ink">{item.reference}</h2>
          <span className="rounded-full bg-muted px-2.5 py-1 font-semibold text-slate-muted text-xs">
            {item.severity
              ? SEVERITY_LABELS[item.severity]
              : "Severity pending"}
          </span>
          <span className="rounded-full bg-primary/9 px-2.5 py-1 font-semibold text-primary text-xs">
            {humanizeCode(item.status)}
          </span>
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-3">
          <CaseFact
            label="Evidence"
            value={humanizeCode(item.evidenceCompleteness)}
          />
          <CaseFact
            label="Uncertainty"
            value={humanizeCode(item.uncertainty)}
          />
          <CaseFact label="Reports" value={String(item.reportCount)} />
        </dl>
        {item.mandatoryHumanReasons.length ? (
          <div className="flex flex-wrap gap-1.5">
            {item.mandatoryHumanReasons.map((reason) => (
              <span
                key={reason}
                className="rounded-full bg-accent/12 px-2.5 py-1 font-semibold text-amber-900 text-xs dark:text-amber-200"
              >
                {humanizeCode(reason)}
              </span>
            ))}
          </div>
        ) : null}
        <p className="flex items-center gap-1.5 text-slate-muted text-xs">
          <Clock3 className="size-3.5" aria-hidden="true" />
          Due {formatOperatorDate(item.dueAt)}
        </p>
      </div>
      <Link
        to="/admin/moderation/cases/$caseId"
        params={{ caseId: item.id }}
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary text-sm"
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
