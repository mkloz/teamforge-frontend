import type { CreateInvitePayload } from "@/features/activity/api/activity-api-contracts";
import {
  cancelInvite as sharedCancelInvite,
  createInvite as sharedCreateInvite,
} from "@/shared/api/invite-membership-api";

export async function createActivityInvite(payload: CreateInvitePayload) {
  return sharedCreateInvite(payload);
}

export async function cancelActivityInvite(inviteId: string) {
  return sharedCancelInvite(inviteId);
}
