import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { safetyQueries } from "@/features/safety/api/safety-queries";
import {
  InformationResponseForm,
  OutcomeReviewForm,
} from "@/features/safety/components/review-request-forms";
import {
  DetailRows,
  ReviewStatus,
  SafetyDetailSection,
  SafetyDetailShell,
  SafetyOfflineNotice,
} from "@/features/safety/components/safety-detail-parts";
import {
  formatCategory,
  formatSafetyDate,
  OUTCOME_REVIEW_STATUS_LABELS,
  PUBLIC_OUTCOME_LABELS,
  REPORT_STATUS_LABELS,
} from "@/features/safety/lib/safety-language";
import { SafetyDetailLoading } from "@/features/safety/safety-page.loading";
import { PageErrorState } from "@/shared/components/page-error-state";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createFindafewPageMetadata } from "@/shared/lib/findafew-page-metadata";

export function SafetyReportDetailPage() {
  const { reportId } = useParams({
    from: "/app-shell/safety/reports/$reportId",
  });
  const reportQuery = useQuery(safetyQueries.report(reportId));
  const reviewsQuery = useQuery(safetyQueries.outcomeReviews(reportId));
  const isOnline = useNetworkStatus();

  usePageMetadata(
    createFindafewPageMetadata({
      title: "Report details",
      description: "Review the public status of a safety report you sent.",
    }),
  );

  if (reportQuery.isLoading) return <SafetyDetailLoading />;
  if (reportQuery.isError || !reportQuery.data) {
    return (
      <PageErrorState
        className="mx-auto mt-12"
        title="Report details could not load"
        description="This report is unavailable right now."
        onRetry={() => void reportQuery.refetch()}
      />
    );
  }

  const report = reportQuery.data;
  const review = reviewsQuery.data?.[0] ?? null;

  return (
    <SafetyDetailShell
      backSection="reports"
      title={formatCategory(report.category)}
      description={`Reference ${report.referenceCode}`}
      status={REPORT_STATUS_LABELS[report.status]}
    >
      {!isOnline ? <SafetyOfflineNotice /> : null}

      <SafetyDetailSection title="Report status">
        <DetailRows
          rows={[
            { label: "Status", value: REPORT_STATUS_LABELS[report.status] },
            { label: "Sent", value: formatSafetyDate(report.submittedAt) },
            { label: "Resolved", value: formatSafetyDate(report.resolvedAt) },
            {
              label: "Outcome",
              value: report.publicOutcome
                ? PUBLIC_OUTCOME_LABELS[report.publicOutcome]
                : null,
            },
          ]}
        />
        {report.informationRequest ? (
          <div className="grid gap-1 border-accent/45 border-l-2 py-1 pl-4">
            <p className="font-semibold text-ink text-sm">
              More information needed
            </p>
            <p className="text-pretty text-ink text-sm leading-relaxed">
              {report.informationRequest.prompt}
            </p>
            <p className="text-slate-muted text-xs">
              Reply by {formatSafetyDate(report.informationRequest.expiresAt)}
            </p>
            <div className="mt-3">
              <InformationResponseForm
                reportId={reportId}
                requestId={report.informationRequest.id}
              />
            </div>
          </div>
        ) : null}
      </SafetyDetailSection>

      {reviewsQuery.isLoading ? <OutcomeReviewLoading /> : null}

      {reviewsQuery.isError ? (
        <OutcomeReviewError onRetry={() => void reviewsQuery.refetch()} />
      ) : null}

      {reviewsQuery.isSuccess && review ? (
        <SafetyDetailSection title="Outcome review request">
          <ReviewStatus
            label={OUTCOME_REVIEW_STATUS_LABELS[review.status]}
            submittedAt={review.submittedAt}
            decidedAt={review.resolvedAt}
          />
          {review.result ? (
            <DetailRows
              rows={[
                {
                  label: "Result",
                  value:
                    review.result === "CASE_REOPENED"
                      ? "Case reopened"
                      : "Handling confirmed",
                },
              ]}
            />
          ) : null}
        </SafetyDetailSection>
      ) : null}

      {reviewsQuery.isSuccess &&
      !review &&
      report.outcomeReviewEligibility.canRequest ? (
        <SafetyDetailSection title="Review this outcome">
          {report.outcomeReviewEligibility.deadline ? (
            <p className="text-slate-muted text-sm">
              Request by{" "}
              {formatSafetyDate(report.outcomeReviewEligibility.deadline)}.
            </p>
          ) : null}
          <OutcomeReviewForm reportId={reportId} />
        </SafetyDetailSection>
      ) : null}
    </SafetyDetailShell>
  );
}

function OutcomeReviewLoading() {
  return (
    <section
      className="grid gap-4 border-border border-b py-6 last:border-b-0"
      aria-busy="true"
    >
      <output className="sr-only">Loading outcome review status</output>
      <Skeleton className="h-6 w-52" />
      <Skeleton className="h-14 w-full" />
    </section>
  );
}

function OutcomeReviewError({ onRetry }: { onRetry: () => void }) {
  return (
    <SafetyDetailSection title="Outcome review request">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-slate-muted text-sm" role="alert">
          The review status could not load. Refresh it before sending a new
          request.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    </SafetyDetailSection>
  );
}
