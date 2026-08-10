import {
  groupProposalAvailabilityPolicySchema,
  groupProposalAvailabilitySchema,
  type UpdateGroupProposalAvailability,
  updateGroupProposalAvailabilitySchema,
} from "@/features/plan-creation/schemas/group-proposal-availability.schema";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";

export class GroupProposalAvailabilityApi {
  static async get() {
    const response = await apiClient
      .get("group-formation/availability")
      .json<unknown>();

    return groupProposalAvailabilitySchema.parse(response);
  }

  static async update(
    payload: UpdateGroupProposalAvailability,
    idempotencyKey: string,
  ) {
    const response = await apiClient.put("group-formation/availability", {
      headers: { "Idempotency-Key": idempotencyKey },
      json: updateGroupProposalAvailabilitySchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      groupProposalAvailabilitySchema.parse(value),
    );
  }

  static async pause(
    payload: { expectedRevision: number; policyVersion: string },
    idempotencyKey: string,
  ) {
    const response = await apiClient.post(
      "group-formation/availability/pause",
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: groupProposalAvailabilityPolicySchema.parse(payload),
      },
    );

    return parseJsonWithRequestId(response, (value) =>
      groupProposalAvailabilitySchema.parse(value),
    );
  }

  static async reconfirm(
    payload: { expectedRevision: number; policyVersion: string },
    idempotencyKey: string,
  ) {
    const response = await apiClient.post(
      "group-formation/availability/reconfirm",
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: groupProposalAvailabilityPolicySchema.parse(payload),
      },
    );

    return parseJsonWithRequestId(response, (value) =>
      groupProposalAvailabilitySchema.parse(value),
    );
  }
}
