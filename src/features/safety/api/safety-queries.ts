import { queryOptions } from "@tanstack/react-query";
import { SafetyApi } from "@/features/safety/api/safety.api";

export const SAFETY_QUERY_KEYS = {
  all: ["safety"] as const,
  reports: ["safety", "reports"] as const,
  report: (reportId: string) => ["safety", "reports", reportId] as const,
  outcomeReviews: (reportId: string) =>
    ["safety", "reports", reportId, "outcome-reviews"] as const,
  notices: ["safety", "enforcement-notices"] as const,
  notice: (noticeId: string) =>
    ["safety", "enforcement-notices", noticeId] as const,
  containments: ["safety", "containments"] as const,
  containment: (containmentId: string) =>
    ["safety", "containments", containmentId] as const,
};

const SAFETY_STALE_TIME_MS = 30_000;

export const safetyQueries = {
  reports: () =>
    queryOptions({
      queryKey: SAFETY_QUERY_KEYS.reports,
      queryFn: () => SafetyApi.getReports(),
      staleTime: SAFETY_STALE_TIME_MS,
    }),
  report: (reportId: string) =>
    queryOptions({
      queryKey: SAFETY_QUERY_KEYS.report(reportId),
      queryFn: () => SafetyApi.getReport(reportId),
      staleTime: SAFETY_STALE_TIME_MS,
    }),
  outcomeReviews: (reportId: string) =>
    queryOptions({
      queryKey: SAFETY_QUERY_KEYS.outcomeReviews(reportId),
      queryFn: () => SafetyApi.getOutcomeReviewRequests(reportId),
      staleTime: SAFETY_STALE_TIME_MS,
    }),
  notices: () =>
    queryOptions({
      queryKey: SAFETY_QUERY_KEYS.notices,
      queryFn: () => SafetyApi.getEnforcementNotices(),
      staleTime: SAFETY_STALE_TIME_MS,
    }),
  notice: (noticeId: string) =>
    queryOptions({
      queryKey: SAFETY_QUERY_KEYS.notice(noticeId),
      queryFn: () => SafetyApi.getEnforcementNotice(noticeId),
      staleTime: SAFETY_STALE_TIME_MS,
    }),
  containments: () =>
    queryOptions({
      queryKey: SAFETY_QUERY_KEYS.containments,
      queryFn: () => SafetyApi.getContainments(),
      staleTime: SAFETY_STALE_TIME_MS,
    }),
  containment: (containmentId: string) =>
    queryOptions({
      queryKey: SAFETY_QUERY_KEYS.containment(containmentId),
      queryFn: () => SafetyApi.getContainment(containmentId),
      staleTime: SAFETY_STALE_TIME_MS,
    }),
};
