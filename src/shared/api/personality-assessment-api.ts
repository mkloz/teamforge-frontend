import { apiClient } from "@/shared/api/api";
import {
  createPersonalityAssessmentAttemptResponseSchema,
  type PersonalityAssessmentAnswer,
  type PersonalityAssessmentFormVersion,
  type PersonalityAssessmentSource,
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

  static async createAttempt(payload: {
    formVersion: PersonalityAssessmentFormVersion;
    source: PersonalityAssessmentSource;
  }) {
    const value = await apiClient
      .post("users/me/personality-assessment/attempts", { json: payload })
      .json<unknown>();

    return createPersonalityAssessmentAttemptResponseSchema.parse(value);
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

  static async deleteAll() {
    const value = await apiClient
      .delete("users/me/personality-assessment")
      .json<unknown>();

    return personalityAssessmentStateSchema.parse(value);
  }
}
