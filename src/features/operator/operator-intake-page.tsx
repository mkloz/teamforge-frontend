import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Clock3 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OperatorApi } from "@/features/operator/api/operator.api";
import { getOperatorControlErrorKind } from "@/features/operator/api/operator-control-errors";
import {
  OPERATOR_QUERY_KEYS,
  operatorQueries,
} from "@/features/operator/api/operator-queries";
import { OperatorCaseFilters } from "@/features/operator/components/operator-case-filters";
import { OperatorReauthenticationDialog } from "@/features/operator/components/operator-reauthentication-dialog";
import {
  OperatorAccessState,
  OperatorLoading,
} from "@/features/operator/components/operator-states";
import {
  formatOperatorDate,
  humanizeCode,
  SEVERITY_LABELS,
} from "@/features/operator/lib/operator-language";
import {
  hasOperatorIntakeFilters,
  type OperatorListSearch,
  toOperatorListInput,
} from "@/features/operator/lib/operator-route";
import { useOperatorSessionStepUp } from "@/features/operator/public/use-operator-session-step-up";
import type { OperatorCaseSummary } from "@/features/operator/schemas/operator.schemas";
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
const SELF_ASSIGNMENT_DURATION_MS = 8 * 60 * 60_000;

export function OperatorIntakePage() {
  const search = useSearch({ from: "/admin/moderation/intake" });
  const navigate = useNavigate({ from: "/admin/moderation/intake" });
  const page = search.page ?? 1;
  const query = useQuery(
    operatorQueries.intake(toOperatorListInput(search, CASES_PER_PAGE)),
  );
  const { reauthenticationDialogProps, rejectCurrentStepUp, sessionQuery } =
    useOperatorSessionStepUp();
  const pageHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousPageRef = useRef(page);
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
      previousPageRef.current === page
    ) {
      return;
    }

    previousPageRef.current = page;
    pageHeadingRef.current?.focus({ preventScroll: true });
  }, [page, query.data, query.isFetching, totalPages]);

  if (query.isLoading || sessionQuery.isLoading) return <OperatorLoading />;
  if (sessionQuery.isError || !sessionQuery.data) {
    return (
      <OperatorAccessState
        error={sessionQuery.error}
        onRetry={() => void sessionQuery.refetch()}
      />
    );
  }
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
  const oldestWaiting = summary.oldestCreatedAt
    ? Math.max(0, generatedAt - new Date(summary.oldestCreatedAt).getTime())
    : 0;

  return (
    <div className="mx-auto grid w-full max-w-7xl content-start gap-10 px-4 py-6 md:px-8 md:py-10">
      <header className="main-action-grid grid items-end gap-x-6 gap-y-2">
        <h1
          ref={pageHeadingRef}
          tabIndex={-1}
          className="rounded-sm font-extrabold text-3xl text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Unassigned intake
          <span className="sr-only">
            , page {page} of {totalPages}
          </span>
        </h1>
        <span className="text-slate-muted text-xs sm:justify-self-end">
          Page {page} of {totalPages}
        </span>
        <p className="col-span-2 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          See queue pressure and aging before claiming the next case.
        </p>
      </header>

      <AdminSummaryStrip>
        <AdminSummaryMetric
          label="Unassigned"
          value={query.data.total}
          tone={query.data.total > 0 ? "warning" : "success"}
          detail="Waiting for an operator"
        />
        <AdminSummaryMetric
          label="High severity"
          value={summary.highSeverity}
          tone={summary.highSeverity > 0 ? "danger" : "success"}
          detail="P0 or P1 in filtered results"
        />
        <AdminSummaryMetric
          label="Oldest waiting"
          value={formatWaitingAge(oldestWaiting)}
          tone={oldestWaiting > 24 * 60 * 60_000 ? "danger" : "muted"}
          detail="Full filtered result"
        />
        <AdminSummaryMetric
          label="Overdue"
          value={summary.overdue}
          tone={summary.overdue > 0 ? "danger" : "success"}
          detail={`${summary.dueSoon} due in 24h · ${summary.missingDeadline} without target`}
        />
      </AdminSummaryStrip>

      <OperatorCaseFilters
        search={search}
        showQueue
        onChange={(patch) =>
          void navigate({ search: { ...search, ...patch, page: undefined } })
        }
        onClear={() => void navigate({ search: { sort: search.sort } })}
      />

      <p className="sr-only" aria-live="polite">
        {query.isFetching
          ? "Updating intake results"
          : "Intake results updated"}
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
              Unassigned intake cases, page {page} of {totalPages}
            </TableCaption>
            <TableHeader className="hidden bg-card text-slate-muted text-xs lg:table-header-group">
              <TableRow className="hover:bg-card">
                <TableHead
                  className="w-[25%] px-5"
                  aria-sort={
                    !search.sort || search.sort === "SEVERITY_DECISION_TARGET"
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
                    search.sort === "OLDEST_RECEIVED" ? "ascending" : "none"
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
                          sort: "OLDEST_RECEIVED",
                        },
                      })
                    }
                  >
                    Waiting
                  </button>
                </TableHead>
                <TableHead className="w-56">
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="grouped-surface">
              {query.data.data.map((item) => (
                <IntakeCaseRow
                  key={item.id}
                  item={item}
                  returnSearch={search}
                  commandsEnabled
                  onCommandError={(error) => {
                    if (
                      getOperatorControlErrorKind(error) === "STALE_SESSION"
                    ) {
                      rejectCurrentStepUp();
                    }
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid min-h-44 place-items-center rounded-xl border border-border border-dashed px-5 py-8 text-center">
          <div className="grid max-w-md justify-items-center gap-2">
            <h2 className="font-semibold text-base text-ink">
              {hasOperatorIntakeFilters(search)
                ? "No intake cases match these filters"
                : "Intake is clear"}
            </h2>
            <p className="text-pretty text-slate-muted text-sm leading-relaxed">
              {hasOperatorIntakeFilters(search)
                ? "Adjust or clear the filters to see other unassigned cases."
                : "Every received case has been routed to an operator."}
            </p>
          </div>
        </div>
      )}
      <IntakePagination page={page} search={search} totalPages={totalPages} />
      <OperatorReauthenticationDialog {...reauthenticationDialogProps} />
    </div>
  );
}

function formatWaitingAge(milliseconds: number) {
  if (milliseconds <= 0) return "—";
  const hours = Math.floor(milliseconds / 3_600_000);
  if (hours < 1) return "<1h";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function IntakePagination({
  page,
  search,
  totalPages,
}: {
  page: number;
  search: OperatorListSearch;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <Pagination
      aria-label="Intake pagination"
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
                to="/admin/moderation/intake"
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
                to="/admin/moderation/intake"
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

function IntakeCaseRow({
  commandsEnabled,
  item,
  onCommandError,
  returnSearch,
}: {
  commandsEnabled: boolean;
  item: OperatorCaseSummary;
  onCommandError: (error: unknown) => void;
  returnSearch: OperatorListSearch;
}) {
  const queryClient = useQueryClient();
  const [assigned, setAssigned] = useState(false);
  const mutation = useMutation({
    mutationKey: ["admin", "operator", "moderation", "self-assign", item.id],
    mutationFn: () =>
      OperatorApi.selfAssign(item.id, {
        reasonCode: "INTAKE_SELF_ASSIGNMENT",
        expiresAt: new Date(
          Date.now() + SELF_ASSIGNMENT_DURATION_MS,
        ).toISOString(),
      }),
    onSuccess: () => {
      setAssigned(true);
      void queryClient.invalidateQueries({
        queryKey: OPERATOR_QUERY_KEYS.all,
      });
    },
    onError: onCommandError,
  });
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
        <p className="truncate text-slate-muted text-xs">
          {item.mandatoryHumanReasons.length
            ? item.mandatoryHumanReasons.map(humanizeCode).join(" · ")
            : humanizeCode(item.status)}
        </p>
      </TableCell>

      <IntakeAttributeCell
        label="Evidence"
        value={humanizeCode(item.evidenceCompleteness)}
      />
      <IntakeAttributeCell
        label="Uncertainty"
        value={humanizeCode(item.uncertainty)}
      />
      <IntakeAttributeCell
        label="Reports"
        value={`${item.reportCount} ${item.reportCount === 1 ? "report" : "reports"}`}
        tabular
      />

      <TableCell className="grid gap-1 whitespace-normal p-0 lg:table-cell lg:p-2">
        <span className="text-slate-muted text-xs lg:hidden">Waiting</span>
        <span className="font-medium text-ink text-sm">
          Received {formatOperatorDate(item.createdAt)}
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

      <TableCell className="col-span-2 grid gap-2 whitespace-normal p-0 lg:table-cell lg:p-2 lg:pr-5 lg:text-right">
        {assigned ? (
          <Link
            to="/admin/moderation/cases/$caseId"
            params={{ caseId: item.id }}
            search={{
              ...returnSearch,
              queue: "CRITICAL_NOW",
              source: "intake",
            }}
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-foreground text-sm"
          >
            Open assigned case
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <div className="grid gap-2 lg:justify-items-end">
            <Button
              disabled={!commandsEnabled || mutation.isPending}
              loading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Assign to me for 8 hours
            </Button>
            {mutation.isError ? (
              <p className="max-w-64 text-destructive text-xs" role="alert">
                Assignment failed. Check your owner access, then verify and
                retry.
              </p>
            ) : null}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

function IntakeAttributeCell({
  label,
  tabular = false,
  value,
}: {
  label: string;
  tabular?: boolean;
  value: string;
}) {
  return (
    <TableCell className="grid gap-1 whitespace-normal p-0 text-sm lg:table-cell lg:p-2">
      <span className="text-slate-muted text-xs lg:hidden">{label}</span>
      <span className={cn("text-ink", tabular && "tabular-nums")}>{value}</span>
    </TableCell>
  );
}
