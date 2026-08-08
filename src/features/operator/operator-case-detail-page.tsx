import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getOperatorControlErrorKind } from "@/features/operator/api/operator-control-errors";
import { operatorQueries } from "@/features/operator/api/operator-queries";
import { OperatorCaseActions } from "@/features/operator/components/operator-action-forms";
import { OperatorAssessmentPanel } from "@/features/operator/components/operator-assessment-panel";
import {
  AssignmentsPanel,
  CaseOverview,
  ContainmentHistory,
  DecisionChronology,
  EnforcementHistory,
  ReportsPanel,
  ReviewsPanel,
} from "@/features/operator/components/operator-case-panels";
import { OperatorEvidencePanel } from "@/features/operator/components/operator-evidence-panel";
import { OperatorReauthenticationDialog } from "@/features/operator/components/operator-reauthentication-dialog";
import {
  OperatorAccessState,
  OperatorLoading,
} from "@/features/operator/components/operator-states";
import { humanizeCode } from "@/features/operator/lib/operator-language";
import { useOperatorSessionStepUp } from "@/features/operator/public/use-operator-session-step-up";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";

export function OperatorCaseDetailPage() {
  const { caseId } = useParams({
    from: "/admin/moderation/cases/$caseId",
  });
  const search = useSearch({ from: "/admin/moderation/cases/$caseId" });
  const query = useQuery(operatorQueries.case(caseId));
  const { reauthenticationDialogProps, rejectCurrentStepUp, sessionQuery } =
    useOperatorSessionStepUp();

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
        resource="case"
      />
    );
  }

  const item = query.data;
  const { source, queue, ...listSearch } = search;
  const handleCommandError = (error: unknown) => {
    if (getOperatorControlErrorKind(error) === "STALE_SESSION") {
      rejectCurrentStepUp();
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-6 md:px-8 md:py-10">
      <Button asChild variant="ghost" className="w-fit px-2">
        {source === "intake" ? (
          <Link to="/admin/moderation/intake" search={listSearch}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to intake
          </Link>
        ) : (
          <Link to="/admin/moderation" search={{ ...listSearch, queue }}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to queue
          </Link>
        )}
      </Button>

      <header className="grid gap-4 pb-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-muted-foreground text-xs">
              Moderation case
            </p>
            <h1 className="mt-1 font-extrabold text-3xl text-ink tracking-tight">
              {item.reference}
            </h1>
          </div>
          <span className="flex items-center gap-2 font-semibold text-foreground text-xs">
            <span
              className="size-2 rounded-full bg-primary"
              aria-hidden="true"
            />
            {humanizeCode(item.status)}
          </span>
        </div>
        <p className="text-slate-muted text-sm">
          Version {item.version} · updated{" "}
          {new Date(item.updatedAt).toLocaleString("en-GB")}
        </p>
        {item.breakGlassReviewRequired ? (
          <Notice size="sm" statusIcon tone="warning">
            <p>Break-glass access is active and requires review.</p>
          </Notice>
        ) : null}
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="grid gap-8">
          <CaseOverview item={item} />
          <OperatorAssessmentPanel caseId={item.id} />
          <DecisionChronology item={item} />
          <ReportsPanel item={item} />
          <OperatorEvidencePanel
            caseId={item.id}
            commandsEnabled
            mandatoryHumanReasons={item.mandatoryHumanReasons}
            onCommandError={handleCommandError}
            policyLabels={item.policyLabels}
            reportCategories={item.reports.map(({ report }) => report.category)}
          />
        </main>
        <aside className="grid gap-8 lg:sticky lg:top-6">
          <OperatorCaseActions
            item={item}
            session={sessionQuery.data}
            commandsEnabled
            onCommandError={handleCommandError}
          />
          <EnforcementHistory item={item} />
          <ContainmentHistory item={item} />
          <ReviewsPanel item={item} />
          <AssignmentsPanel item={item} />
        </aside>
      </div>
      <OperatorReauthenticationDialog {...reauthenticationDialogProps} />
    </div>
  );
}
