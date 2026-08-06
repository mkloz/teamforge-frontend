import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { OperatorApi } from "@/features/operator/api/operator.api";
import type { OperatorCaseListInput } from "@/features/operator/lib/operator-route";
import type {
  OperatorQueue,
  OperatorWorkerJobStatus,
  OperatorWorkerKind,
} from "@/features/operator/schemas/operator.schemas";

export const OPERATOR_QUERY_KEYS = {
  all: ["admin", "operator", "moderation"] as const,
  session: ["admin", "operator", "moderation", "session"] as const,
  intake: (input: OperatorCaseListInput) =>
    ["admin", "operator", "moderation", "intake", input] as const,
  cases: (input: OperatorCaseListInput & { queue: OperatorQueue }) =>
    ["admin", "operator", "moderation", "cases", input] as const,
  queueSummary: ["admin", "operator", "moderation", "queue-summary"] as const,
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
  control: ["admin", "operator", "moderation", "control"] as const,
  configurationDraftTemplate: [
    "admin",
    "operator",
    "moderation",
    "control",
    "configuration-draft-template",
  ] as const,
  configurationVersions: [
    "admin",
    "operator",
    "moderation",
    "control",
    "configurations",
  ] as const,
  configurationState: [
    "admin",
    "operator",
    "moderation",
    "control",
    "configurations",
    "state",
  ] as const,
  configurationDetail: (configurationId: string) =>
    [
      "admin",
      "operator",
      "moderation",
      "control",
      "configurations",
      configurationId,
    ] as const,
  evaluationApproval: (configurationId: string) =>
    [
      "admin",
      "operator",
      "moderation",
      "control",
      "configurations",
      configurationId,
      "evaluation-approval",
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
  intake: (input: OperatorCaseListInput) =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.intake(input),
      queryFn: () => OperatorApi.getIntake(input),
      staleTime: 15_000,
      retry: false,
      placeholderData: keepPreviousData,
    }),
  cases: (input: OperatorCaseListInput & { queue: OperatorQueue }) =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.cases(input),
      queryFn: () => OperatorApi.getCases(input),
      staleTime: 15_000,
      retry: false,
      placeholderData: keepPreviousData,
    }),
  queueSummary: () =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.queueSummary,
      queryFn: () => OperatorApi.getQueueSummary(),
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
  configurationDraftTemplate: () =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.configurationDraftTemplate,
      queryFn: () => OperatorApi.getConfigurationDraftTemplate(),
      staleTime: 0,
      retry: false,
    }),
  configurationVersions: () =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.configurationVersions,
      queryFn: () => OperatorApi.listConfigurations(),
      staleTime: 0,
      retry: false,
    }),
  configurationState: () =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.configurationState,
      queryFn: () => OperatorApi.getConfigurationState(),
      staleTime: 0,
      retry: false,
    }),
  configurationDetail: (configurationId: string) =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.configurationDetail(configurationId),
      queryFn: () => OperatorApi.getConfiguration(configurationId),
      staleTime: 0,
      retry: false,
    }),
  evaluationApproval: (configurationId: string) =>
    queryOptions({
      queryKey: OPERATOR_QUERY_KEYS.evaluationApproval(configurationId),
      queryFn: () => OperatorApi.getEvaluationApproval(configurationId),
      staleTime: 0,
      retry: false,
    }),
};
