import type {
  UpdateAdultEligibilityDto,
  UpdateNotificationPreferencesDto,
  UpdateSettingsProfileDto,
} from "@/features/settings/api/settings.api";
import { SettingsApi } from "@/features/settings/api/settings.api";
import type { UpdateCandidateAvailability } from "@/features/settings/schemas/candidate-availability.schema";
import { authApi } from "@/shared/api/api";
import { clearCurrentUserCache } from "@/shared/api/current-user-query";

export const SettingsCommands = {
  updateCandidateAvailability(
    payload: UpdateCandidateAvailability,
    idempotencyKey: string,
  ) {
    return SettingsApi.updateCandidateAvailability(payload, idempotencyKey);
  },

  pauseCandidateAvailability(
    payload: { expectedRevision: number; policyVersion: string },
    idempotencyKey: string,
  ) {
    return SettingsApi.pauseCandidateAvailability(payload, idempotencyKey);
  },

  reconfirmCandidateAvailability(
    payload: { expectedRevision: number; policyVersion: string },
    idempotencyKey: string,
  ) {
    return SettingsApi.reconfirmCandidateAvailability(payload, idempotencyKey);
  },

  updateProfile(payload: UpdateSettingsProfileDto) {
    return SettingsApi.updateProfile(payload);
  },

  updateAdultEligibility(payload: UpdateAdultEligibilityDto) {
    return SettingsApi.updateAdultEligibility(payload);
  },

  uploadAvatar(file: File) {
    return SettingsApi.uploadAvatar(file);
  },

  deleteAvatar() {
    return SettingsApi.deleteAvatar();
  },

  sendResetPasswordLink(email: string) {
    return SettingsApi.sendResetPasswordLink(email);
  },

  updateNotificationPreferences(payload: UpdateNotificationPreferencesDto) {
    return SettingsApi.updateNotificationPreferences(payload);
  },

  unblockUser(userId: string) {
    return SettingsApi.unblockUser(userId);
  },

  revokeSession(sessionId: string) {
    return SettingsApi.revokeSession(sessionId);
  },

  revokeOtherSessions() {
    return SettingsApi.revokeOtherSessions();
  },

  deleteAccount() {
    return SettingsApi.deleteAccount();
  },

  clearAuthState() {
    clearCurrentUserCache();
    authApi.clearSession();
  },
};
