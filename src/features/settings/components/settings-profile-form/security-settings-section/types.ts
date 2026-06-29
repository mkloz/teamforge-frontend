import type { SecuritySettingsState } from "../settings-form-types";

export type SecuritySettingsStatus = Pick<
  SecuritySettingsState,
  | "isOnline"
  | "isLoadingSessions"
  | "isSendingPasswordResetLink"
  | "isRevokingOtherSessions"
  | "isDeletingAccount"
>;

export type SecuritySettingsErrors = Pick<
  SecuritySettingsState,
  "securityError" | "sessionsError" | "deleteAccountError"
>;

export type SecuritySettingsSectionProps = Pick<
  SecuritySettingsState,
  | "currentUser"
  | "sessions"
  | "revokingSessionId"
  | "onSendPasswordResetLink"
  | "onRevokeSession"
  | "onRevokeOtherSessions"
  | "onDeleteAccount"
> & {
  status: SecuritySettingsStatus;
  errors: SecuritySettingsErrors;
};
