import { SettingsApi, type UpdateSettingsProfileDto } from "./settings.api";

export class SettingsQueries {
  static updateProfile(payload: UpdateSettingsProfileDto) {
    return SettingsApi.updateProfile(payload);
  }

  static uploadAvatar(file: File) {
    return SettingsApi.uploadAvatar(file);
  }
}
