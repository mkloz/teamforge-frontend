import {
  candidateAvailabilityPolicySchema,
  candidateAvailabilitySchema,
  type UpdateCandidateAvailability,
  updateCandidateAvailabilitySchema,
} from "@/features/settings/schemas/candidate-availability.schema";
import {
  apiClient,
  getResponseRequestId,
  parseJsonWithRequestId,
} from "@/shared/api/api";
import {
  IMAGE_UPLOAD_ACCEPTED_EXTENSIONS,
  IMAGE_UPLOAD_ACCEPTED_TYPES,
  IMAGE_UPLOAD_MAX_SIZE_BYTES,
} from "@/shared/api/api-constraints";
import { sendResetPasswordLink as sharedSendResetPasswordLink } from "@/shared/api/auth-session-commands";
import { patchCurrentUser } from "@/shared/api/current-user-commands";
import {
  assertAcceptedFile,
  buildFileUploadBody,
} from "@/shared/api/file-upload";
import {
  getBlockedUsers as sharedGetBlockedUsers,
  unblockUser as sharedUnblockUser,
} from "@/shared/api/friendship-membership-api";
import type { NotificationPreferences } from "@/shared/schemas";
import {
  adultEligibilitySchema,
  authSessionListSchema,
  fullUserResponseSchema,
  notificationPreferencesSchema,
} from "@/shared/schemas";

const DEFAULT_LIMIT = "100";

export interface UpdateSettingsProfileDto {
  name: string;
  bio: string | null;
  age: number | null;
  gender: import("@/shared/schemas").Gender | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
}

export type UpdateNotificationPreferencesDto = NotificationPreferences;

export interface UpdateAdultEligibilityDto {
  dateOfBirth: string;
}

export class SettingsApi {
  static async getCandidateAvailability() {
    const response = await apiClient.get("forge/availability").json<unknown>();

    return candidateAvailabilitySchema.parse(response);
  }

  static async updateCandidateAvailability(
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

  static async pauseCandidateAvailability(
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

  static async reconfirmCandidateAvailability(
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

  static async updateProfile(payload: UpdateSettingsProfileDto) {
    return patchCurrentUser(payload);
  }

  static async updateAdultEligibility(payload: UpdateAdultEligibilityDto) {
    const response = await apiClient.put("users/me/adult-eligibility", {
      json: payload,
    });

    return parseJsonWithRequestId(response, (value) =>
      adultEligibilitySchema.parse(value),
    );
  }

  static async uploadAvatar(file: File) {
    assertAcceptedFile(file, {
      acceptedExtensions: IMAGE_UPLOAD_ACCEPTED_EXTENSIONS,
      acceptedTypes: IMAGE_UPLOAD_ACCEPTED_TYPES,
      maxSizeBytes: IMAGE_UPLOAD_MAX_SIZE_BYTES,
      sizeLabel: "30 MB",
    });

    const response = await apiClient.patch("users/me/avatar", {
      body: buildFileUploadBody(file, "avatar"),
    });

    return parseJsonWithRequestId(response, (value) =>
      fullUserResponseSchema.parse(value),
    );
  }

  static async deleteAvatar() {
    const response = await apiClient.delete("users/me/avatar");

    return parseJsonWithRequestId(response, (value) =>
      fullUserResponseSchema.parse(value),
    );
  }

  static async sendResetPasswordLink(email: string) {
    return sharedSendResetPasswordLink(email);
  }

  static async getNotificationPreferences() {
    const response = await apiClient.get("settings/me").json<unknown>();

    return notificationPreferencesSchema.parse(response);
  }

  static async updateNotificationPreferences(
    payload: UpdateNotificationPreferencesDto,
  ) {
    const response = await apiClient.patch("settings/me", {
      json: payload,
    });

    return parseJsonWithRequestId(response, (value) =>
      notificationPreferencesSchema.parse(value),
    );
  }

  static async getSessions() {
    const response = await apiClient.get("auth/sessions").json<unknown>();

    return authSessionListSchema.parse(response).items;
  }

  static async getBlockedUsers() {
    return sharedGetBlockedUsers(DEFAULT_LIMIT);
  }

  static async unblockUser(userId: string) {
    return sharedUnblockUser(userId);
  }

  static async revokeSession(sessionId: string) {
    const response = await apiClient.post(`auth/sessions/${sessionId}/revoke`);

    return {
      requestId: getResponseRequestId(response),
    };
  }

  static async revokeOtherSessions() {
    const response = await apiClient.post("auth/sessions/revoke-others");

    return {
      requestId: getResponseRequestId(response),
    };
  }

  static async deleteAccount() {
    const response = await apiClient.delete("users/me");

    return {
      requestId: getResponseRequestId(response),
    };
  }
}
