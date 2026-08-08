import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Clock3 } from "lucide-react";
import { useEffect, useRef } from "react";
import { operatorQueries } from "@/features/operator/api/operator-queries";
import { OperatorCaseFilters } from "@/features/operator/components/operator-case-filters";
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
  hasOperatorFilters,
  type OperatorModerationSearch,
  toOperatorListInput,
} from "@/features/operator/lib/operator-route";
import {
  type OperatorCaseSummary,
  operatorQueueSchema,
} from "@/features/operator/schemas/operator.schemas";
import {
  AdminSummaryMetric,
  AdminSummaryStrip,
} from "@/shared/components/admin/admin-visuals";
import { Button } from "@/shared/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/shared/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

const CASES_PER_PAGE = 50;

export function OperatorWorkspacePage() {
  const search = useSearch({ from: "/admin/moderation" });
  const navigate = useNavigate({ from: "/admin/moderation" });
  const queue =
    operatorQueueSchema.safeParse(search.queue).data ?? "CRITICAL_NOW";
  const page = search.page ?? 1;
  const query = useQuery(
    operatorQueries.cases({
      ...toOperatorListInput(search, CASES_PER_PAGE),
      queue,
    }),
  );
  const queueSummaryQuery = useQuery(operatorQueries.queueSummary());
  const pageHeadingRef = useRef<HTMLHeadingElement>(null);
  const listLocation = JSON.stringify(search);
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
        ...search,
        page: totalPages === 1 ? undefined : totalPages,
      },
    });
  }, [navigate, page, query.data, search, totalPages]);

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

  const summary = query.data.summary;
  const generatedAt = new Date(summary.generatedAt).getTime();

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
          value={summary.highSeverity}
          tone={summary.highSeverity > 0 ? "danger" : "success"}
          detail="P0 or P1 in filtered results"
        />
        <AdminSummaryMetric
          label="Overdue"
          value={summary.overdue}
          tone={summary.overdue > 0 ? "danger" : "success"}
          detail={`${summary.dueSoon} due in 24h · ${summary.missingDeadline} without target`}
        />
        <AdminSummaryMetric
          label="Oldest case"
          value={
            summary.oldestCreatedAt
              ? formatQueueAge(
                  generatedAt - new Date(summary.oldestCreatedAt).getTime(),
                )
              : "—"
          }
          tone={
            summary.oldestCreatedAt &&
            generatedAt - new Date(summary.oldestCreatedAt).getTime() >
              24 * 60 * 60_000
              ? "warning"
              : "muted"
          }
          detail="Full filtered result"
        />
      </AdminSummaryStrip>

      <div className="sticky top-20 z-20 overflow-hidden rounded-2xl bg-card shadow-sm lg:top-4">
        <nav
          aria-label="Review queues"
          className="scrollbar-none grid auto-cols-max grid-flow-col gap-1 overflow-x-auto p-1.5 pr-10 md:pr-1.5"
        >
          {OPERATOR_QUEUES.map((queueId) => {
            const item = OPERATOR_QUEUE_COPY[queueId];
            const count = queueSummaryQuery.data?.counts.find(
              (entry) => entry.queue === queueId,
            )?.count;
            return (
              <Link
                key={queueId}
                to="/admin/moderation"
                search={{ ...search, queue: queueId, page: undefined }}
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
                    queueId === queue ? "text-foreground" : "text-slate-muted",
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

      <OperatorCaseFilters
        search={search}
        onChange={(patch) =>
          void navigate({ search: { ...search, ...patch, page: undefined } })
        }
        onClear={() => void navigate({ search: { queue, sort: search.sort } })}
      />

      <section className="grid min-w-0 content-start gap-4">
        <p className="sr-only" aria-live="polite">
          {query.isFetching ? "Updating case results" : "Case results updated"}
        </p>
        {query.data.data.length ? (
          <div
            className={cn(
              "overflow-hidden rounded-2xl bg-card shadow-sm transition-opacity",
              query.isFetching && "opacity-65",
            )}
          >
            <Table>
              <TableCaption className="sr-only">
                {activeQueue.label} cases, page {page} of {totalPages}
              </TableCaption>
              <TableHeader className="hidden bg-card text-slate-muted text-xs lg:table-header-group">
                <TableRow className="hover:bg-card">
                  <TableHead
                    className="w-[28%] px-5"
                    aria-sort={
                      search.sort === "SEVERITY_DECISION_TARGET"
                        ? "ascending"
                        : "none"
                    }
                  >
                    <button
                      type="button"
                      className="rounded-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() =>
                        void navigate({
                          search: {
                            ...search,
                            page: undefined,
                            sort: "SEVERITY_DECISION_TARGET",
                          },
                        })
                      }
                    >
                      Case and severity
                    </button>
                  </TableHead>
                  <TableHead>Evidence</TableHead>
                  <TableHead>Uncertainty</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead
                    aria-sort={
                      !search.sort || search.sort === "DECISION_TARGET_ASC"
                        ? "ascending"
                        : "none"
                    }
                  >
                    <button
                      type="button"
                      className="rounded-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() =>
                        void navigate({
                          search: {
                            ...search,
                            page: undefined,
                            sort: "DECISION_TARGET_ASC",
                          },
                        })
                      }
                    >
                      Decision target
                    </button>
                  </TableHead>
                  <TableHead className="w-28">
                    <span className="sr-only">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="grouped-surface">
                {query.data.data.map((item) => (
                  <OperatorCaseRow
                    key={item.id}
                    item={item}
                    returnSearch={search}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid min-h-44 place-items-center rounded-xl border border-border border-dashed px-5 py-8 text-center">
            <div className="grid max-w-md justify-items-center gap-2">
              <h2 className="font-semibold text-base text-ink">
                {hasOperatorFilters(search)
                  ? "No cases match these filters"
                  : `${activeQueue.label} is clear`}
              </h2>
              <p className="text-pretty text-slate-muted text-sm leading-relaxed">
                {hasOperatorFilters(search)
                  ? "Adjust or clear the filters to see other assigned cases."
                  : "No cases are waiting in this review path."}
              </p>
            </div>
          </div>
        )}
        <QueuePagination page={page} search={search} totalPages={totalPages} />
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
  search,
  totalPages,
}: {
  page: number;
  search: OperatorModerationSearch;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <Pagination
      aria-label="Case queue pagination"
      className="mx-0 flex-wrap justify-between gap-3 pt-2"
    >
      <p className="font-medium text-slate-muted text-sm" aria-live="polite">
        Page {page} of {totalPages}
      </p>
      <PaginationContent className="gap-2">
        {page > 1 ? (
          <PaginationItem>
            <Button asChild variant="outline" size="sm">
              <Link
                to="/admin/moderation"
                search={{
                  ...search,
                  page: page === 2 ? undefined : page - 1,
                }}
                rel="prev"
              >
                Previous
              </Link>
            </Button>
          </PaginationItem>
        ) : (
          <PaginationItem>
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          </PaginationItem>
        )}
        {page < totalPages ? (
          <PaginationItem>
            <Button asChild variant="outline" size="sm">
              <Link
                to="/admin/moderation"
                search={{ ...search, page: page + 1 }}
                rel="next"
              >
                Next
              </Link>
            </Button>
          </PaginationItem>
        ) : (
          <PaginationItem>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

function OperatorCaseRow({
  item,
  returnSearch,
}: {
  item: OperatorCaseSummary;
  returnSearch: OperatorModerationSearch;
}) {
  const dueAt = item.dueAt ? new Date(item.dueAt) : null;
  const isOverdue = dueAt ? dueAt.getTime() < Date.now() : false;

  return (
    <TableRow className="grid grid-cols-2 gap-x-5 gap-y-4 bg-card px-5 py-5 sm:px-6 lg:table-row lg:px-0 lg:py-0">
      <TableCell className="col-span-2 min-w-0 whitespace-normal p-0 lg:table-cell lg:px-5 lg:py-4">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="truncate font-semibold text-ink">{item.reference}</p>
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
      </TableCell>

      <CaseAttributeCell
        label="Evidence"
        value={humanizeCode(item.evidenceCompleteness)}
      />
      <CaseAttributeCell
        label="Uncertainty"
        value={humanizeCode(item.uncertainty)}
      />

      <TableCell className="grid gap-1 whitespace-normal p-0 lg:table-cell lg:p-2">
        <span className="text-slate-muted text-xs lg:hidden">Reports</span>
        <span className="font-medium text-ink text-sm tabular-nums">
          {item.reportCount} {item.reportCount === 1 ? "report" : "reports"}
        </span>
      </TableCell>

      <TableCell className="grid gap-1 whitespace-normal p-0 lg:table-cell lg:p-2">
        <span className="text-slate-muted text-xs lg:hidden">
          Decision target
        </span>
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs",
            isOverdue ? "font-medium text-danger" : "text-slate-muted",
          )}
        >
          <Clock3 className="size-3.5" aria-hidden="true" />
          {dueAt ? `Due ${formatOperatorDate(item.dueAt)}` : "No due date"}
        </span>
      </TableCell>

      <TableCell className="col-span-2 whitespace-normal p-0 lg:table-cell lg:p-2 lg:pr-5 lg:text-right">
        <Link
          to="/admin/moderation/cases/$caseId"
          params={{ caseId: item.id }}
          search={{ ...returnSearch, source: "assigned" }}
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-foreground text-sm"
        >
          Open case
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </TableCell>
    </TableRow>
  );
}

function CaseAttributeCell({ label, value }: { label: string; value: string }) {
  return (
    <TableCell className="grid gap-1 whitespace-normal p-0 text-sm lg:table-cell lg:p-2">
      <span className="text-slate-muted text-xs lg:hidden">{label}</span>
      <span className="text-ink">{value}</span>
    </TableCell>
  );
}
