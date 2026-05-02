import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import { inviteSchema } from "@/shared/schemas";

import {
  createInvitePayloadSchema,
  type CreateInvitePayload,
} from "@/features/activity/api/activity-api-contracts";

export async function createInvite(payload: CreateInvitePayload) {
  const response = await apiClient.post("invites", {
    json: createInvitePayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) => inviteSchema.parse(value));
}
