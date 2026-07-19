import {
  activityInviteAvailabilityCommandSchema,
  activityInviteAvailabilitySchema,
  type UpdateActivityInviteAvailability,
  updateActivityInviteAvailabilitySchema,
} from "@/features/settings/schemas/activity-invite-availability.schema";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";

type ActivityInviteAvailabilityCommand = {
  expectedRevision: number;
  policyVersion: "activity-invite-availability-v1";
};

export class ActivityInviteAvailabilityApi {
  static async get() {
    const response = await apiClient
      .get("activity-invite-availability")
      .json<unknown>();

    return activityInviteAvailabilitySchema.parse(response);
  }

  static async update(
    payload: UpdateActivityInviteAvailability,
    idempotencyKey: string,
  ) {
    const response = await apiClient.put("activity-invite-availability", {
      headers: { "Idempotency-Key": idempotencyKey },
      json: updateActivityInviteAvailabilitySchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      activityInviteAvailabilitySchema.parse(value),
    );
  }

  static async pause(
    payload: ActivityInviteAvailabilityCommand,
    idempotencyKey: string,
  ) {
    return ActivityInviteAvailabilityApi.runCommand(
      "pause",
      payload,
      idempotencyKey,
    );
  }

  static async reconfirm(
    payload: ActivityInviteAvailabilityCommand,
    idempotencyKey: string,
  ) {
    return ActivityInviteAvailabilityApi.runCommand(
      "reconfirm",
      payload,
      idempotencyKey,
    );
  }

  private static async runCommand(
    action: "pause" | "reconfirm",
    payload: ActivityInviteAvailabilityCommand,
    idempotencyKey: string,
  ) {
    const response = await apiClient.post(
      `activity-invite-availability/${action}`,
      {
        headers: { "Idempotency-Key": idempotencyKey },
        json: activityInviteAvailabilityCommandSchema.parse(payload),
      },
    );

    return parseJsonWithRequestId(response, (value) =>
      activityInviteAvailabilitySchema.parse(value),
    );
  }
}
