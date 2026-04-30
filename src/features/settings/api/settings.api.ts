import {
  apiClient,
  getResponseRequestId,
  parseJsonWithRequestId,
} from "@/shared/api/api";
import {
  authSessionListSchema,
  fullUserResponseSchema,
  notificationPreferencesSchema,
} from "@/shared/schemas";
import type { NotificationPreferences } from "@/shared/schemas";

export interface UpdateSettingsProfileDto {
  name: string;
  bio: string | null;
  age: number | null;
  gender: import("@/shared/schemas").Gender | null;
  city: string | null;
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
    const body = new FormData();
    body.set("avatar", file);

    const response = await apiClient.patch("users/me/avatar", {
      body,
    });

    return parseJsonWithRequestId(response, (value) =>
      fullUserResponseSchema.parse(value),
    );
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
}
