import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { safetyQueries } from "@/features/safety/api/safety-queries";
import { EnforcementAppealForm } from "@/features/safety/components/review-request-forms";
import {
  DetailRows,
  ReviewStatus,
  SafetyDetailSection,
  SafetyDetailShell,
  SafetyOfflineNotice,
} from "@/features/safety/components/safety-detail-parts";
import {
  ACCOUNT_ACTION_STATE_LABELS,
  APPEAL_STATUS_LABELS,
  formatSafetyDate,
} from "@/features/safety/lib/safety-language";
import { SafetyDetailLoading } from "@/features/safety/safety-page.loading";
import { PageErrorState } from "@/shared/components/page-error-state";
import { useNetworkStatus } from "@/shared/hooks/use-network-status";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

export function AccountActionDetailPage() {
  const { noticeId } = useParams({
    from: "/app-shell/safety/account-actions/$noticeId",
  });
  const query = useQuery(safetyQueries.notice(noticeId));
  const isOnline = useNetworkStatus();

  usePageMetadata(
    createTeamForgePageMetadata({
      title: "Account action",
      description: "Review an account action and its appeal status.",
    }),
  );

  if (query.isLoading) return <SafetyDetailLoading />;
  if (query.isError || !query.data) {
    return (
      <PageErrorState
        className="mx-auto mt-12"
        title="Account action could not load"
        description="This notice is unavailable right now."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const notice = query.data;
  return (
    <SafetyDetailShell
      backSection="account-actions"
      title={notice.title}
      description={notice.message}
      status={ACCOUNT_ACTION_STATE_LABELS[notice.state]}
    >
      {!isOnline ? <SafetyOfflineNotice /> : null}
      <SafetyDetailSection title="What this means">
        <DetailRows
          rows={[
            { label: "Starts", value: formatSafetyDate(notice.startsAt) },
            { label: "Ends", value: formatSafetyDate(notice.expiresAt) },
            { label: "Appeal by", value: formatSafetyDate(notice.appealDueAt) },
          ]}
        />
      </SafetyDetailSection>

      {notice.appeal ? (
        <SafetyDetailSection title="Appeal">
          <ReviewStatus
            label={APPEAL_STATUS_LABELS[notice.appeal.status]}
            submittedAt={notice.appeal.submittedAt}
            decidedAt={notice.appeal.decidedAt}
          />
        </SafetyDetailSection>
      ) : null}

      {!notice.appeal && notice.canAppeal ? (
        <SafetyDetailSection title="Appeal this action">
          <EnforcementAppealForm noticeId={noticeId} />
        </SafetyDetailSection>
      ) : null}
    </SafetyDetailShell>
  );
}
