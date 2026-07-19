import type { SecuritySettingsState } from "../settings-form-types";

export type SecuritySettingsStatus = Pick<
  SecuritySettingsState,
  | "isOnline"
  | "isLoadingSessions"
  | "isSendingPasswordResetLink"
  | "isRevokingOtherSessions"
>;

export type SecuritySettingsErrors = Pick<
  SecuritySettingsState,
  "securityError" | "sessionsError"
>;

export type SecuritySettingsSectionProps = Pick<
  SecuritySettingsState,
  | "currentUser"
  | "sessions"
  | "revokingSessionId"
  | "onSendPasswordResetLink"
  | "onRevokeSession"
  | "onRevokeOtherSessions"
  | "accountLifecycle"
> & {
  status: SecuritySettingsStatus;
  errors: SecuritySettingsErrors;
};
