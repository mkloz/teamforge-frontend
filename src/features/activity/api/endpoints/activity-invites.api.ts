import {
  type CreateInvitePayload,
  createInvitePayloadSchema,
} from "@/features/activity/api/activity-api-contracts";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import { inviteSchema } from "@/shared/schemas";

export async function createInvite(payload: CreateInvitePayload) {
  const response = await apiClient.post("invites", {
    json: createInvitePayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) => inviteSchema.parse(value));
}
