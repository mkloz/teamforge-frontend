import { queryOptions } from "@tanstack/react-query";
import { OperatorApi } from "@/features/operator/api/operator.api";
import type {
  ModerationCaseStatus,
  OperatorQueue,
  OperatorWorkerJobStatus,
  OperatorWorkerKind,
} from "@/features/operator/schemas/operator.schemas";

export const OPERATOR_QUERY_KEYS = {
  all: ["admin", "operator", "moderation"] as const,
  session: ["admin", "operator", "moderation", "session"] as const,
  intake: (input: { page: number; limit: number }) =>
    ["admin", "operator", "moderation", "intake", input] as const,
  cases: (input: {
    queue: OperatorQueue;
    status?: ModerationCaseStatus;
    page: number;
    limit: number;
  }) => ["admin", "operator", "moderation", "cases", input] as const,
  case: (caseId: string) =>
    ["admin", "operator", "moderation", "cases", caseId] as const,
  evidence: (caseId: string) =>
    ["admin", "operator", "moderation", "cases", caseId, "evidence"] as const,
  assessments: (caseId: string) =>
    [
      "admin",
      "operator",
      "moderation",
      "cases",
      caseId,
      "assessments",
    ] as const,
  assessmentComparison: (input: {
    caseId: string;
    earlierAssessmentId: string;
    laterAssessmentId: string;
  }) =>
    [
      "admin",
      "operator",
      "moderation",
      "cases",
      input.caseId,
      "assessment-comparison",
      input.earlierAssessmentId,
      input.laterAssessmentId,
    ] as const,
  workers: ["admin", "operator", "moderation", "workers"] as const,
  workerJobs: (input: {
    kind: OperatorWorkerKind;
    status?: OperatorWorkerJobStatus;
    page: number;
    limit: number;
  }) =>
    [
      "admin",
      "operator",
      "moderation",
      "workers",
      input.kind,
      "jobs",
      input,
    ] as const,
};

export const operatorQueries = {
  session: () =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.session,
      queryFn: () => OperatorApi.getSession(),
      staleTime: 30_000,
      retry: false,
    }),
  intake: (input: { page: number; limit: number }) =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.intake(input),
      queryFn: () => OperatorApi.getIntake(input),
      staleTime: 15_000,
      retry: false,
    }),
  cases: (input: {
    queue: OperatorQueue;
    status?: ModerationCaseStatus;
    page: number;
    limit: number;
  }) =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.cases(input),
      queryFn: () => OperatorApi.getCases(input),
      staleTime: 15_000,
      retry: false,
    }),
  case: (caseId: string) =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.case(caseId),
      queryFn: () => OperatorApi.getCase(caseId),
      staleTime: 15_000,
      retry: false,
    }),
  evidence: (caseId: string) =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.evidence(caseId),
      queryFn: () => OperatorApi.getEvidence(caseId),
      staleTime: 15_000,
      retry: false,
    }),
  assessments: (caseId: string) =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.assessments(caseId),
      queryFn: () => OperatorApi.getAssessments(caseId),
      staleTime: 0,
      gcTime: 0,
      retry: false,
    }),
  assessmentComparison: (input: {
    caseId: string;
    earlierAssessmentId: string;
    laterAssessmentId: string;
  }) =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.assessmentComparison(input),
      queryFn: () => OperatorApi.getAssessmentComparison(input),
      staleTime: 0,
      gcTime: 0,
      retry: false,
    }),
  workers: () =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.workers,
      queryFn: () => OperatorApi.getWorkers(),
      staleTime: 10_000,
      refetchInterval: 15_000,
      retry: false,
    }),
  workerJobs: (input: {
    kind: OperatorWorkerKind;
    status?: OperatorWorkerJobStatus;
    page: number;
    limit: number;
  }) =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.workerJobs(input),
      queryFn: () => OperatorApi.getWorkerJobs(input),
      staleTime: 10_000,
      refetchInterval: 15_000,
      retry: false,
    }),
};
