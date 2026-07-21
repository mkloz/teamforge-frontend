import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, TriangleAlert } from "lucide-react";
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
import {
  OperatorAccessState,
  OperatorLoading,
  OperatorStepUpNotice,
} from "@/features/operator/components/operator-states";
import { humanizeCode } from "@/features/operator/lib/operator-language";
import { useOperatorSessionStepUp } from "@/features/operator/public/use-operator-session-step-up";
import { Button } from "@/shared/components/ui/button";

export function OperatorCaseDetailPage() {
  const { caseId } = useParams({
    from: "/admin/moderation/cases/$caseId",
  });
  const query = useQuery(operatorQueries.case(caseId));
  const {
    hasCurrentStepUp: commandsEnabled,
    isSigningInAgain,
    rejectCurrentStepUp,
    sessionQuery,
    signInAgain,
    signInAgainError,
  } = useOperatorSessionStepUp();

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
  const handleCommandError = (error: unknown) => {
    if (getOperatorControlErrorKind(error) === "STALE_SESSION") {
      rejectCurrentStepUp();
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-8 md:py-10">
      <Button asChild variant="ghost" className="w-fit px-2">
        <Link to="/admin/moderation" search={{ queue: "CRITICAL_NOW" }}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to queues
        </Link>
      </Button>

      <header className="grid gap-2 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-extrabold text-2xl text-ink">{item.reference}</h1>
          <span className="rounded-full bg-primary/9 px-3 py-1 font-semibold text-primary text-xs">
            {humanizeCode(item.status)}
          </span>
        </div>
        <p className="text-slate-muted text-sm">
          Version {item.version} · updated{" "}
          {new Date(item.updatedAt).toLocaleString("en-GB")}
        </p>
        {item.breakGlassReviewRequired ? (
          <p className="flex items-center gap-2 rounded-xl bg-accent/12 p-3 font-semibold text-amber-900 text-sm dark:text-amber-200">
            <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
            Break-glass access is active and requires review.
          </p>
        ) : null}
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-6 lg:col-start-1 lg:row-start-1">
          <CaseOverview item={item} />
        </div>
        <aside className="grid gap-6 lg:col-start-2 lg:row-start-1">
          {!commandsEnabled ? (
            <OperatorStepUpNotice
              description="Case decisions require a recently verified admin session. Sign out and sign in again to continue; you will return to this case afterward."
              isSigningInAgain={isSigningInAgain}
              onSignInAgain={() => void signInAgain()}
              signInAgainError={signInAgainError}
            />
          ) : null}
          <OperatorCaseActions
            item={item}
            session={sessionQuery.data}
            commandsEnabled={commandsEnabled}
            onCommandError={handleCommandError}
          />
        </aside>
        <div className="grid gap-6 lg:col-start-1 lg:row-start-2">
          <OperatorAssessmentPanel caseId={item.id} />
          <DecisionChronology item={item} />
          <ReportsPanel item={item} />
          <OperatorEvidencePanel
            caseId={item.id}
            commandsEnabled={commandsEnabled}
            mandatoryHumanReasons={item.mandatoryHumanReasons}
            onCommandError={handleCommandError}
            policyLabels={item.policyLabels}
            reportCategories={item.reports.map(({ report }) => report.category)}
          />
        </div>
        <aside className="grid gap-6 lg:col-start-2 lg:row-start-2">
          <EnforcementHistory item={item} />
          <ContainmentHistory item={item} />
          <ReviewsPanel item={item} />
          <AssignmentsPanel item={item} />
        </aside>
      </div>
    </div>
  );
}
