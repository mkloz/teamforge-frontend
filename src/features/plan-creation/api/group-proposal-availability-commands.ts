import { GroupProposalAvailabilityApi } from "@/features/plan-creation/api/group-proposal-availability.api";
import type { UpdateGroupProposalAvailability } from "@/features/plan-creation/schemas/group-proposal-availability.schema";

export const GroupProposalAvailabilityCommands = {
  update(payload: UpdateGroupProposalAvailability, idempotencyKey: string) {
    return GroupProposalAvailabilityApi.update(payload, idempotencyKey);
  },

  pause(
    payload: { expectedRevision: number; policyVersion: string },
    idempotencyKey: string,
  ) {
    return GroupProposalAvailabilityApi.pause(payload, idempotencyKey);
  },

  reconfirm(
    payload: { expectedRevision: number; policyVersion: string },
    idempotencyKey: string,
  ) {
    return GroupProposalAvailabilityApi.reconfirm(payload, idempotencyKey);
  },
};
