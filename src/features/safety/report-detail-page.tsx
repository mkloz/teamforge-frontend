import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { safetyQueries } from "@/features/safety/api/safety-queries";
import {
  InformationResponseForm,
  OutcomeReviewForm,
} from "@/features/safety/components/review-request-forms";
import {
  DetailRows,
  ReviewStatus,
  SafetyDetailCard,
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
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

export function SafetyReportDetailPage() {
  const { reportId } = useParams({
    from: "/app-shell/safety/reports/$reportId",
  });
  const reportQuery = useQuery(safetyQueries.report(reportId));
  const reviewsQuery = useQuery(safetyQueries.outcomeReviews(reportId));
  const isOnline = useNetworkStatus();

  usePageMetadata(
    createTeamForgePageMetadata({
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
      title={formatCategory(report.category)}
      description={`Reference ${report.referenceCode}`}
      status={REPORT_STATUS_LABELS[report.status]}
    >
      {!isOnline ? <SafetyOfflineNotice /> : null}

      <SafetyDetailCard title="Report status">
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
          <div className="grid gap-1 rounded-xl bg-accent/8 p-4">
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
      </SafetyDetailCard>

      {review ? (
        <SafetyDetailCard title="Outcome review request">
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
        </SafetyDetailCard>
      ) : null}

      {!review && report.outcomeReviewEligibility.canRequest ? (
        <SafetyDetailCard title="Review this outcome">
          {report.outcomeReviewEligibility.deadline ? (
            <p className="text-slate-muted text-sm">
              Request by{" "}
              {formatSafetyDate(report.outcomeReviewEligibility.deadline)}.
            </p>
          ) : null}
          <OutcomeReviewForm reportId={reportId} />
        </SafetyDetailCard>
      ) : null}
    </SafetyDetailShell>
  );
}
