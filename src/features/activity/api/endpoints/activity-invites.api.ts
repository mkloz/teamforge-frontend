import type { CreateInvitePayload } from "@/features/activity/api/activity-api-contracts";
import { createInvite as sharedCreateInvite } from "@/shared/api/invite-membership-api";

export async function createInvite(payload: CreateInvitePayload) {
  return sharedCreateInvite(payload);
}
