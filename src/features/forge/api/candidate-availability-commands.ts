import { CandidateAvailabilityApi } from "@/features/forge/api/candidate-availability.api";
import type { UpdateCandidateAvailability } from "@/features/forge/schemas/candidate-availability.schema";

export const CandidateAvailabilityCommands = {
  update(payload: UpdateCandidateAvailability, idempotencyKey: string) {
    return CandidateAvailabilityApi.update(payload, idempotencyKey);
  },

  pause(
    payload: { expectedRevision: number; policyVersion: string },
    idempotencyKey: string,
  ) {
    return CandidateAvailabilityApi.pause(payload, idempotencyKey);
  },

  reconfirm(
    payload: { expectedRevision: number; policyVersion: string },
    idempotencyKey: string,
  ) {
    return CandidateAvailabilityApi.reconfirm(payload, idempotencyKey);
  },
};
