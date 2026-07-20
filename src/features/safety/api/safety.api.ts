import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import {
  containmentContestSchema,
  containmentSchema,
  enforcementNoticeSchema,
  type InformationResponsePayload,
  informationResponsePayloadSchema,
  informationResponseReceiptSchema,
  moderationAppealSchema,
  outcomeReviewRequestSchema,
  paginatedContainmentsSchema,
  paginatedEnforcementNoticesSchema,
  paginatedReportsSchema,
  reportSummarySchema,
  type SafetyRequestPayload,
  safetyRequestPayloadSchema,
} from "@/shared/schemas/safety";

async function parseResponse<T>(
  response: Response,
  parser: (value: unknown) => T,
) {
  return (await parseJsonWithRequestId(response, parser)).data;
}

function paginatedPath(path: string) {
  return `${path}?page=1&limit=50`;
}

export const SafetyApi = {
  async getReports() {
    const response = await apiClient.get(paginatedPath("reports"));
    return parseResponse(response, (value) =>
      paginatedReportsSchema.parse(value),
    );
  },

  async getReport(reportId: string) {
    const response = await apiClient.get(`reports/${reportId}`);
    return parseResponse(response, (value) => reportSummarySchema.parse(value));
  },

  async getOutcomeReviewRequests(reportId: string) {
    const response = await apiClient.get(
      `reports/${reportId}/outcome-review-requests`,
    );
    return parseResponse(response, (value) =>
      outcomeReviewRequestSchema.array().parse(value),
    );
  },

  async createOutcomeReviewRequest(
    reportId: string,
    payload: SafetyRequestPayload,
    idempotencyKey: string,
  ) {
    const response = await apiClient.post(
      `reports/${reportId}/outcome-review-requests`,
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: safetyRequestPayloadSchema.parse(payload),
      },
    );
    return parseResponse(response, (value) =>
      outcomeReviewRequestSchema.parse(value),
    );
  },

  async createInformationResponse(
    reportId: string,
    payload: InformationResponsePayload,
    idempotencyKey: string,
  ) {
    const response = await apiClient.post(
      `reports/${reportId}/information-responses`,
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: informationResponsePayloadSchema.parse(payload),
      },
    );
    return parseResponse(response, (value) =>
      informationResponseReceiptSchema.parse(value),
    );
  },

  async getEnforcementNotices() {
    const response = await apiClient.get(
      paginatedPath("safety/enforcement-notices"),
    );
    return parseResponse(response, (value) =>
      paginatedEnforcementNoticesSchema.parse(value),
    );
  },

  async getEnforcementNotice(noticeId: string) {
    const response = await apiClient.get(
      `safety/enforcement-notices/${noticeId}`,
    );
    return parseResponse(response, (value) =>
      enforcementNoticeSchema.parse(value),
    );
  },

  async createEnforcementAppeal(
    noticeId: string,
    payload: SafetyRequestPayload,
    idempotencyKey: string,
  ) {
    const response = await apiClient.post(
      `safety/enforcement-notices/${noticeId}/appeals`,
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: safetyRequestPayloadSchema.parse(payload),
      },
    );
    return parseResponse(response, (value) =>
      moderationAppealSchema.parse(value),
    );
  },

  async getContainments() {
    const response = await apiClient.get(paginatedPath("safety/containments"));
    return parseResponse(response, (value) =>
      paginatedContainmentsSchema.parse(value),
    );
  },

  async getContainment(containmentId: string) {
    const response = await apiClient.get(
      `safety/containments/${containmentId}`,
    );
    return parseResponse(response, (value) => containmentSchema.parse(value));
  },

  async createContainmentContest(
    containmentId: string,
    payload: SafetyRequestPayload,
    idempotencyKey: string,
  ) {
    const response = await apiClient.post(
      `safety/containments/${containmentId}/contests`,
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: safetyRequestPayloadSchema.parse(payload),
      },
    );
    return parseResponse(response, (value) =>
      containmentContestSchema.parse(value),
    );
  },
};
