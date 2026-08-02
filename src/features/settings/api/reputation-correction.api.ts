import { apiClient } from "@/shared/api/api";
import { reputationDisputeSchema } from "../schemas/reputation-correction.schema";

export class ReputationCorrectionApi {
  static async create(reason: string, idempotencyKey: string) {
    const response = await apiClient
      .post("users/me/reputation-disputes", {
        headers: { "Idempotency-Key": idempotencyKey },
        json: { reason },
      })
      .json<unknown>();

    return reputationDisputeSchema.parse(response);
  }
}
