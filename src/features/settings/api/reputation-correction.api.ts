import { apiClient } from "@/shared/api/api";
import {
  reputationDisputeDetailSchema,
  reputationDisputeSchema,
  reputationEvidenceSchema,
} from "../schemas/reputation-correction.schema";

export class ReputationCorrectionApi {
  static async create(inputId: string, reason: string, idempotencyKey: string) {
    const response = await apiClient
      .post("users/me/reputation-disputes", {
        headers: { "Idempotency-Key": idempotencyKey },
        json: { inputId, reason },
      })
      .json<unknown>();

    return reputationDisputeSchema.parse(response);
  }

  static async listEvidence() {
    const response = await apiClient
      .get("users/me/reputation-evidence")
      .json<unknown>();
    return reputationEvidenceSchema.array().parse(response);
  }

  static async listDisputes() {
    const response = await apiClient
      .get("users/me/reputation-disputes")
      .json<unknown>();
    return reputationDisputeDetailSchema.array().parse(response);
  }
}
