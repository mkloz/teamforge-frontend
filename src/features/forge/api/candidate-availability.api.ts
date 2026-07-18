import {
  candidateAvailabilityPolicySchema,
  candidateAvailabilitySchema,
  type UpdateCandidateAvailability,
  updateCandidateAvailabilitySchema,
} from "@/features/forge/schemas/candidate-availability.schema";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";

export class CandidateAvailabilityApi {
  static async get() {
    const response = await apiClient.get("forge/availability").json<unknown>();

    return candidateAvailabilitySchema.parse(response);
  }

  static async update(
    payload: UpdateCandidateAvailability,
    idempotencyKey: string,
  ) {
    const response = await apiClient.put("forge/availability", {
      headers: { "Idempotency-Key": idempotencyKey },
      json: updateCandidateAvailabilitySchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      candidateAvailabilitySchema.parse(value),
    );
  }

  static async pause(
    payload: { expectedRevision: number; policyVersion: string },
    idempotencyKey: string,
  ) {
    const response = await apiClient.post("forge/availability/pause", {
      headers: { "Idempotency-Key": idempotencyKey },
      json: candidateAvailabilityPolicySchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      candidateAvailabilitySchema.parse(value),
    );
  }

  static async reconfirm(
    payload: { expectedRevision: number; policyVersion: string },
    idempotencyKey: string,
  ) {
    const response = await apiClient.post("forge/availability/reconfirm", {
      headers: { "Idempotency-Key": idempotencyKey },
      json: candidateAvailabilityPolicySchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      candidateAvailabilitySchema.parse(value),
    );
  }
}
