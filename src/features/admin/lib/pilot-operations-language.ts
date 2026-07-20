import type {
  AdminPilotOperationsReadiness,
  AdminPilotOperationsReadinessReasonCode,
} from "@/features/admin/schemas/admin-pilot-operations.schema";

const READINESS_REASON_COPY = {
  COHORT_NOT_CONFIGURED: "No controlled pilot cohort is configured.",
  COHORT_OUTSIDE_ACTIVE_WINDOW:
    "The controlled pilot is outside its active time window.",
  COHORT_CAP_EXCEEDED: "The controlled pilot has exceeded its member cap.",
  COHORT_MINIMUM_SIZE_NOT_MET:
    "The controlled pilot has not reached its required cohort size.",
  GLOBAL_SAFETY_PAUSE_ACTIVE: "The global safety pause is active.",
  CANDIDATE_AVAILABILITY_DISABLED: "Candidate availability is disabled.",
  PROPOSAL_ALLOCATION_DISABLED: "Proposal allocation is disabled.",
  PROPOSAL_MATERIALIZATION_DISABLED: "Group formation is disabled.",
  FIRST_STRANGER_CHAT_DISABLED: "First group conversations are disabled.",
  COVERAGE_DECLARATION_MISSING:
    "No operations coverage window has been declared.",
  COVERAGE_DECLARATION_NOT_ACTIVE:
    "The declared operations coverage window has not started.",
  COVERAGE_DECLARATION_EXPIRED:
    "The declared operations coverage window has ended.",
  COVERAGE_REQUIRED_SCOPE_MISSING:
    "The coverage declaration does not include every required responsibility.",
  COVERAGE_PRIMARY_OPERATOR_UNAVAILABLE:
    "The primary coverage operator is no longer available for duty.",
  COVERAGE_BACKUP_OPERATOR_UNAVAILABLE:
    "The backup coverage operator is no longer available for duty.",
  ACTIVE_MODERATION_CONFIGURATION_MISSING:
    "No active moderation policy configuration is available.",
  EVALUATION_APPROVAL_MISSING_OR_STALE:
    "The active moderation policy does not have a current evaluation approval.",
  MODERATION_ASSISTANCE_WORKER_DISABLED:
    "Automated moderation assistance is disabled.",
  MODERATION_ASSISTANCE_WORKER_PAUSED:
    "Automated moderation assistance is paused.",
  MODERATION_ASSISTANCE_WORKER_UNHEALTHY:
    "Automated moderation assistance is not reporting healthy operation.",
  MODERATION_ASSISTANCE_EXHAUSTED_JOBS_PRESENT:
    "Automated moderation assistance has jobs that exhausted their retries.",
  EVIDENCE_PRESERVATION_WORKER_DISABLED:
    "Evidence preservation processing is disabled.",
  EVIDENCE_PRESERVATION_WORKER_PAUSED:
    "Evidence preservation processing is paused.",
  EVIDENCE_PRESERVATION_WORKER_UNHEALTHY:
    "Evidence preservation processing is not reporting healthy operation.",
  EVIDENCE_PRESERVATION_DEAD_JOBS_PRESENT:
    "Evidence preservation has jobs that cannot be retried automatically.",
  EVIDENCE_PRESERVATION_FAILURES_PRESENT:
    "Some evidence has not been preserved successfully.",
  EVIDENCE_PRESERVATION_ORPHANS_PRESENT:
    "Some evidence is missing a preservation job.",
  EVIDENCE_SCAN_WORKER_DISABLED: "Evidence safety scanning is disabled.",
  EVIDENCE_SCAN_WORKER_PAUSED: "Evidence safety scanning is paused.",
  EVIDENCE_SCAN_WORKER_UNHEALTHY:
    "Evidence safety scanning is not reporting healthy operation.",
  EVIDENCE_SCAN_DEAD_JOBS_PRESENT:
    "Evidence safety scanning has jobs that cannot be retried automatically.",
  OUTBOX_WORKER_DISABLED: "Recorded event delivery is disabled.",
  OUTBOX_WORKER_PAUSED: "Recorded event delivery is paused.",
  OUTBOX_WORKER_UNHEALTHY:
    "Recorded event delivery is not reporting healthy operation.",
  OUTBOX_PENDING_TOO_OLD:
    "At least one recorded event has waited too long for delivery.",
  OUTBOX_DEAD_LETTERS_PRESENT:
    "At least one recorded event could not be delivered automatically.",
  UNASSIGNED_CRITICAL_CASES_PRESENT:
    "At least one critical safety case has no current operator assignment.",
  OVERDUE_URGENT_CASES_PRESENT: "At least one urgent safety case is overdue.",
  EXPIRED_OPEN_APPEALS_PRESENT: "At least one open appeal has expired.",
  EXPIRED_OPEN_OUTCOME_REVIEWS_PRESENT:
    "At least one open outcome review has expired.",
  EXPIRED_OPEN_CONTAINMENT_CONTESTS_PRESENT:
    "At least one open protective containment review has expired.",
} satisfies Record<AdminPilotOperationsReadinessReasonCode, string>;

export const PILOT_OPERATIONS_ACTION_COPY = {
  firstStrangerChat: {
    description: "Open the first conversation for a newly formed group.",
    label: "First group conversation",
  },
  newProposalExposure: {
    description: "Present a newly allocated proposal to pilot members.",
    label: "New proposal exposure",
  },
  proposalMaterialization: {
    description: "Create the group, plan, and first conversation after quorum.",
    label: "Group formation",
  },
} satisfies Record<
  keyof AdminPilotOperationsReadiness["actions"],
  { description: string; label: string }
>;

export const PILOT_OPERATIONS_WORKER_LABELS = {
  DOMAIN_EVENT_OUTBOX: "Recorded event delivery",
  EVIDENCE_PRESERVATION: "Evidence preservation",
  EVIDENCE_SCAN: "Evidence safety scanning",
  MODERATION_ASSISTANCE: "Moderation assistance",
} satisfies Record<
  AdminPilotOperationsReadiness["workers"][number]["kind"],
  string
>;

export function pilotOperationsReasonCopy(
  reason: AdminPilotOperationsReadinessReasonCode,
) {
  return READINESS_REASON_COPY[reason];
}
