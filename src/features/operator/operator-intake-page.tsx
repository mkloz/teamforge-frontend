import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OperatorApi } from "@/features/operator/api/operator.api";
import {
  OPERATOR_QUERY_KEYS,
  operatorQueries,
} from "@/features/operator/api/operator-queries";
import {
  OperatorAccessState,
  OperatorLoading,
} from "@/features/operator/components/operator-states";
import {
  formatOperatorDate,
  humanizeCode,
  SEVERITY_LABELS,
} from "@/features/operator/lib/operator-language";
import type { OperatorCaseSummary } from "@/features/operator/schemas/operator.schemas";
import { Button } from "@/shared/components/ui/button";

const CASES_PER_PAGE = 50;

export function OperatorIntakePage() {
  const search = useSearch({ from: "/admin/moderation/intake" });
  const navigate = useNavigate({ from: "/admin/moderation/intake" });
  const page = search.page ?? 1;
  const query = useQuery(
    operatorQueries.intake({ page, limit: CASES_PER_PAGE }),
  );
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
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 md:px-8 md:py-10">
      <Button asChild variant="ghost" className="w-fit px-2">
        <Link to="/admin/moderation" search={{ queue: "CRITICAL_NOW" }}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to queues
        </Link>
      </Button>
      <header className="grid gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1
            ref={pageHeadingRef}
            tabIndex={-1}
            className="rounded-sm font-extrabold text-2xl text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Unassigned intake
            <span className="sr-only">
              , page {page} of {totalPages}
            </span>
          </h1>
          <span className="font-semibold text-slate-muted text-sm">
            {query.data.total} {query.data.total === 1 ? "case" : "cases"}
          </span>
        </div>
        <p className="text-slate-muted text-sm leading-relaxed">
          Assign a case to yourself before opening its review workspace.
        </p>
      </header>
      {query.data.data.length ? (
        <div className="grid gap-3">
          {query.data.data.map((item) => (
            <IntakeCaseCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="grid min-h-48 place-items-center rounded-2xl border border-border bg-card p-6 text-center">
          <div className="grid gap-1">
            <h2 className="font-bold text-ink text-lg">Intake clear</h2>
            <p className="text-slate-muted text-sm">
              There are no unassigned cases waiting here.
            </p>
          </div>
        </div>
      )}
      <IntakePagination page={page} totalPages={totalPages} />
    </div>
  );
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
      className="flex flex-wrap items-center justify-between gap-3 border-border border-t pt-4"
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

function IntakeCaseCard({ item }: { item: OperatorCaseSummary }) {
  const queryClient = useQueryClient();
  const assignmentPayload = useRef({
    reasonCode: "INTAKE_SELF_ASSIGNMENT",
    expiresAt: new Date(Date.now() + 8 * 60 * 60_000).toISOString(),
  });
  const [assigned, setAssigned] = useState(false);
  const mutation = useMutation({
    mutationKey: ["admin", "operator", "moderation", "self-assign", item.id],
    mutationFn: () =>
      OperatorApi.selfAssign(item.id, assignmentPayload.current),
    onSuccess: () => {
      setAssigned(true);
      void queryClient.invalidateQueries({
        queryKey: OPERATOR_QUERY_KEYS.all,
      });
    },
  });

  return (
    <article className="sm:main-action-grid grid gap-4 rounded-2xl border border-border bg-card p-5 sm:items-center">
      <div className="grid min-w-0 gap-2">
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
        <p className="text-slate-muted text-sm">
          {item.reportCount} {item.reportCount === 1 ? "report" : "reports"} ·
          due {formatOperatorDate(item.dueAt)}
        </p>
      </div>
      {assigned ? (
        <Link
          to="/admin/moderation/cases/$caseId"
          params={{ caseId: item.id }}
          className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary text-sm"
        >
          Open assigned case
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <div className="grid gap-2">
          <Button
            disabled={mutation.isPending}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Assign to me for 8 hours
          </Button>
          {mutation.isError ? (
            <p className="max-w-64 text-destructive text-xs" role="alert">
              Assignment failed. Confirm your owner access and recent step-up.
            </p>
          ) : null}
        </div>
      )}
    </article>
  );
}
