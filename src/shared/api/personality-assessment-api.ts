import { apiClient } from "@/shared/api/api";
import {
  createPersonalityAssessmentAttemptResponseSchema,
  type DynamicAssessmentSubmission,
  type PersonalityAssessmentAnswer,
  type PersonalityAssessmentFormVersion,
  type PersonalityAssessmentSource,
  personalityAssessmentCapabilitiesSchema,
  personalityAssessmentStateSchema,
  submitPersonalityAssessmentResponseSchema,
} from "@/shared/schemas/personality-assessment";

export class PersonalityAssessmentApi {
  static async getState() {
    const value = await apiClient
      .get("users/me/personality-assessment")
      .json<unknown>();

    return personalityAssessmentStateSchema.parse(value);
  }

  static async getCapabilities() {
    const value = await apiClient
      .get("users/me/personality-assessment/capabilities")
      .json<unknown>();

    return personalityAssessmentCapabilitiesSchema.parse(value);
  }

  static async createAttempt(payload: {
    formVersion: PersonalityAssessmentFormVersion;
    source: PersonalityAssessmentSource;
    baseAssessmentGeneration?: number;
    packageId?: string;
    manifestHash?: string;
    selectionSeed?: string;
  }) {
    const value = await apiClient
      .post("users/me/personality-assessment/attempts", { json: payload })
      .json<unknown>();

    return createPersonalityAssessmentAttemptResponseSchema.parse(value);
  }

  static async submitDynamicAnswers(
    attemptId: string,
    idempotencyKey: string,
    dynamic: DynamicAssessmentSubmission,
  ) {
    const value = await apiClient
      .post(
        `users/me/personality-assessment/attempts/${attemptId}/submissions`,
        {
          headers: { "Idempotency-Key": idempotencyKey },
          json: { dynamic },
        },
      )
      .json<unknown>();

    return submitPersonalityAssessmentResponseSchema.parse(value);
  }

  static async submitAnswers(
    attemptId: string,
    idempotencyKey: string,
    answers: PersonalityAssessmentAnswer[],
  ) {
    const value = await apiClient
      .post(
        `users/me/personality-assessment/attempts/${attemptId}/submissions`,
        {
          headers: { "Idempotency-Key": idempotencyKey },
          json: { answers },
        },
      )
      .json<unknown>();

    return submitPersonalityAssessmentResponseSchema.parse(value);
  }

  static async publish(policyVersion: string) {
    const value = await apiClient
      .post("users/me/personality-assessment/publish", {
        json: {
          acknowledged: true,
          policyVersion,
        },
      })
      .json<unknown>();

    return personalityAssessmentStateSchema.parse(value);
  }

  static async discardDraft() {
    const value = await apiClient
      .delete("users/me/personality-assessment/draft")
      .json<unknown>();

    return personalityAssessmentStateSchema.parse(value);
  }

  static async keepPrivate() {
    const value = await apiClient
      .post("users/me/personality-assessment/keep-private")
      .json<unknown>();

    return personalityAssessmentStateSchema.parse(value);
  }

  static async deleteAll() {
    const value = await apiClient
      .delete("users/me/personality-assessment")
      .json<unknown>();

    return personalityAssessmentStateSchema.parse(value);
  }
}
