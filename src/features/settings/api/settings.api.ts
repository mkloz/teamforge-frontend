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
import {
  assertAcceptedFile,
  buildFileUploadBody,
} from "@/shared/api/file-upload";
import type { NotificationPreferences } from "@/shared/schemas";
import {
  authSessionListSchema,
  createPaginatedSchema,
  friendshipApiSchema,
  fullUserResponseSchema,
  notificationPreferencesSchema,
} from "@/shared/schemas";

const DEFAULT_LIMIT = "100";
const paginatedFriendshipsSchema = createPaginatedSchema(friendshipApiSchema);

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

export class SettingsApi {
  static async updateProfile(payload: UpdateSettingsProfileDto) {
    const response = await apiClient.patch("users/me", {
      json: payload,
    });

    return parseJsonWithRequestId(response, (value) =>
      fullUserResponseSchema.parse(value),
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
    const response = await apiClient.post("auth/send-reset-password-link", {
      json: { email },
      context: {
        auth: "none",
        retryOnUnauthorized: false,
      },
    });

    return {
      data: null,
      requestId: getResponseRequestId(response),
    };
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
    const response = await apiClient
      .get("friends/blocked", {
        searchParams: {
          limit: DEFAULT_LIMIT,
        },
      })
      .json<unknown>();

    return paginatedFriendshipsSchema.parse(response).items;
  }

  static async unblockUser(userId: string) {
    const response = await apiClient.delete(`friends/${userId}/block`);

    return parseJsonWithRequestId(response, (value) =>
      friendshipApiSchema.parse(value),
    );
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
