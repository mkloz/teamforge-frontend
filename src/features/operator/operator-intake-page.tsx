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
import { useOperatorSessionStepUp } from "@/features/operator/public/use-operator-session-step-up";
import type { OperatorCaseSummary } from "@/features/operator/schemas/operator.schemas";
import {
  AdminSegmentedBar,
  AdminSummaryMetric,
  AdminSummaryStrip,
} from "@/shared/components/admin/admin-visuals";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const CASES_PER_PAGE = 50;
const SELF_ASSIGNMENT_DURATION_MS = 8 * 60 * 60_000;

export function OperatorIntakePage() {
  const search = useSearch({ from: "/admin/moderation/intake" });
  const navigate = useNavigate({ from: "/admin/moderation/intake" });
  const page = search.page ?? 1;
  const query = useQuery(
    operatorQueries.intake({ page, limit: CASES_PER_PAGE }),
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
      search: { page: totalPages === 1 ? undefined : totalPages },
    });
  }, [navigate, page, query.data, totalPages]);

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

  const now = Date.now();
  const waitingAges = query.data.data
    .map((item) => Math.max(0, now - new Date(item.createdAt).getTime()))
    .sort((a, b) => a - b);
  const oldestWaiting = waitingAges.at(-1) ?? 0;
  const medianWaiting =
    waitingAges.length === 0
      ? 0
      : (waitingAges[Math.floor(waitingAges.length / 2)] ?? 0);
  const highSeverity = query.data.data.filter(
    (item) => item.severity === "P0" || item.severity === "P1",
  ).length;
  const overdue = query.data.data.filter(
    (item) => item.dueAt && new Date(item.dueAt).getTime() < now,
  ).length;

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
          value={highSeverity}
          tone={highSeverity > 0 ? "danger" : "success"}
          detail="P0 or P1 on this page"
        />
        <AdminSummaryMetric
          label="Oldest waiting"
          value={formatWaitingAge(oldestWaiting)}
          tone={oldestWaiting > 24 * 60 * 60_000 ? "danger" : "muted"}
          detail="Current page"
        />
        <AdminSummaryMetric
          label="Median wait"
          value={formatWaitingAge(medianWaiting)}
          tone={medianWaiting > 8 * 60 * 60_000 ? "warning" : "muted"}
          detail="Current page"
        />
      </AdminSummaryStrip>

      {query.data.data.length ? (
        <div className="grid gap-3 rounded-2xl bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="font-semibold text-base text-ink">Queue aging</h2>
              <p className="mt-1 text-slate-muted text-sm">
                Urgency across the cases currently visible.
              </p>
            </div>
            <span className="font-semibold text-slate-muted text-xs">
              {overdue} overdue
            </span>
          </div>
          <AdminSegmentedBar
            label="Intake urgency"
            segments={[
              { label: "Overdue", value: overdue, tone: "danger" },
              {
                label: "High severity",
                value: Math.max(0, highSeverity - overdue),
                tone: "warning",
              },
              {
                label: "Routine",
                value: Math.max(
                  0,
                  query.data.data.length - Math.max(overdue, highSeverity),
                ),
                tone: "muted",
              },
            ]}
          />
        </div>
      ) : null}

      {query.data.data.length ? (
        <div className="grouped-surface grid overflow-hidden rounded-2xl [&>*]:bg-card">
          {query.data.data.map((item) => (
            <IntakeCaseCard
              key={item.id}
              item={item}
              commandsEnabled
              onCommandError={(error) => {
                if (getOperatorControlErrorKind(error) === "STALE_SESSION") {
                  rejectCurrentStepUp();
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="grid min-h-44 place-items-center rounded-xl border border-border border-dashed px-5 py-8 text-center">
          <div className="grid max-w-md justify-items-center gap-2">
            <h2 className="font-semibold text-base text-ink">
              Intake is clear
            </h2>
            <p className="text-pretty text-slate-muted text-sm leading-relaxed">
              Every received case has been routed to an operator.
            </p>
          </div>
        </div>
      )}
      <IntakePagination page={page} totalPages={totalPages} />
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
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Intake pagination"
      className="flex flex-wrap items-center justify-between gap-3 pt-2"
    >
      <p className="font-medium text-slate-muted text-sm" aria-live="polite">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link
              to="/admin/moderation/intake"
              search={{ page: page === 2 ? undefined : page - 1 }}
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
              to="/admin/moderation/intake"
              search={{ page: page + 1 }}
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

function IntakeCaseCard({
  commandsEnabled,
  item,
  onCommandError,
}: {
  commandsEnabled: boolean;
  item: OperatorCaseSummary;
  onCommandError: (error: unknown) => void;
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
    <article className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(14rem,1fr)_minmax(20rem,1.25fr)_minmax(12rem,0.7fr)_auto] lg:items-center">
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
        <p className="truncate text-slate-muted text-xs">
          {item.mandatoryHumanReasons.length
            ? item.mandatoryHumanReasons.map(humanizeCode).join(" · ")
            : humanizeCode(item.status)}
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm">
        <IntakeFact
          label="Evidence"
          value={humanizeCode(item.evidenceCompleteness)}
        />
        <IntakeFact
          label="Uncertainty"
          value={humanizeCode(item.uncertainty)}
        />
        <IntakeFact label="Reports" value={String(item.reportCount)} />
      </dl>

      <div className="grid gap-1.5">
        <p className="font-medium text-ink text-sm">
          Received {formatOperatorDate(item.createdAt)}
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

      {assigned ? (
        <Link
          to="/admin/moderation/cases/$caseId"
          params={{ caseId: item.id }}
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary text-sm lg:justify-self-end"
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
              Assignment failed. Check your owner access, then verify and retry.
            </p>
          ) : null}
        </div>
      )}
    </article>
  );
}

function IntakeFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
