import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { safetyQueries } from "@/features/safety/api/safety-queries";
import { ContainmentContestForm } from "@/features/safety/components/review-request-forms";
import {
  DetailRows,
  ReviewStatus,
  SafetyDetailSection,
  SafetyDetailShell,
  SafetyOfflineNotice,
} from "@/features/safety/components/safety-detail-parts";
import {
  CONTEST_STATUS_LABELS,
  formatSafetyDate,
  RESTRICTION_STATE_LABELS,
} from "@/features/safety/lib/safety-language";
import { SafetyDetailLoading } from "@/features/safety/safety-page.loading";
import { PageErrorState } from "@/shared/components/page-error-state";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

export function RestrictionDetailPage() {
  const { containmentId } = useParams({
    from: "/app-shell/safety/restrictions/$containmentId",
  });
  const query = useQuery(safetyQueries.containment(containmentId));
  const isOnline = useNetworkStatus();

  usePageMetadata(
    createTeamForgePageMetadata({
      title: "Safety restriction",
      description: "Review a temporary safety restriction.",
    }),
  );

  if (query.isLoading) return <SafetyDetailLoading />;
  if (query.isError || !query.data) {
    return (
      <PageErrorState
        className="mx-auto mt-12"
        title="Safety restriction could not load"
        description="This restriction is unavailable right now."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const containment = query.data;
  return (
    <SafetyDetailShell
      backSection="restrictions"
      title={containment.title}
      description={containment.message}
      status={RESTRICTION_STATE_LABELS[containment.state]}
    >
      {!isOnline ? <SafetyOfflineNotice /> : null}
      <SafetyDetailSection title="What this means">
        <DetailRows
          rows={[
            {
              label: "Started",
              value: formatSafetyDate(containment.startedAt),
            },
            {
              label: "Ends",
              value: formatSafetyDate(containment.expiresAt),
            },
          ]}
        />
      </SafetyDetailSection>

      {containment.contest ? (
        <SafetyDetailSection title="Restriction review request">
          <ReviewStatus
            label={CONTEST_STATUS_LABELS[containment.contest.status]}
            submittedAt={containment.contest.submittedAt}
            decidedAt={containment.contest.decidedAt}
          />
        </SafetyDetailSection>
      ) : null}

      {!containment.contest && containment.canContest ? (
        <SafetyDetailSection title="Review this restriction">
          <ContainmentContestForm containmentId={containmentId} />
        </SafetyDetailSection>
      ) : null}
    </SafetyDetailShell>
  );
}
