import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";
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

export function OperatorIntakePage() {
  const query = useQuery(operatorQueries.intake({ page: 1, limit: 50 }));

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
          <h1 className="font-extrabold text-2xl text-ink">
            Unassigned intake
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
    </div>
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
