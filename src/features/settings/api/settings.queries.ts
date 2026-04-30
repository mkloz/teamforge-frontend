import {
  SettingsApi,
  type UpdateNotificationPreferencesDto,
  type UpdateSettingsProfileDto,
} from "./settings.api";

export class SettingsQueries {
  static updateProfile(payload: UpdateSettingsProfileDto) {
    return SettingsApi.updateProfile(payload);
  }

  static uploadAvatar(file: File) {
    return SettingsApi.uploadAvatar(file);
  }

  static getNotificationPreferences() {
    return SettingsApi.getNotificationPreferences();
  }

  static updateNotificationPreferences(
    payload: UpdateNotificationPreferencesDto,
  ) {
    return SettingsApi.updateNotificationPreferences(payload);
  }

  static getSessions() {
    return SettingsApi.getSessions();
  }

  static revokeSession(sessionId: string) {
    return SettingsApi.revokeSession(sessionId);
  }

  static revokeOtherSessions() {
    return SettingsApi.revokeOtherSessions();
  }
}
