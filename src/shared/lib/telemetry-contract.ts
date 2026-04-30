export const trackedMutationNames = {
  authLoginEmail: "auth.login.email",
  authRegisterEmail: "auth.register.email",
  authVerifyEmailOtp: "auth.verify-email-otp",
  authResendEmailOtp: "auth.resend-email-otp",
  authGoogle: "auth.google",
  authForgotPassword: "auth.forgot-password",
  authResetPassword: "auth.reset-password",
  authActivateAccount: "auth.activate-account",
  activityMessageSend: "activity.message.send",
  activityMessageEdit: "activity.message.edit",
  forgeAuto: "forge.auto",
  forgeManual: "forge.manual",
  settingsUpdateProfile: "settings.update-profile",
  settingsUploadAvatar: "settings.upload-avatar",
  settingsNotificationPreferences: "settings.notification-preferences",
  settingsRevokeSession: "settings.revoke-session",
  settingsRevokeOtherSessions: "settings.revoke-other-sessions",
  exploreJoinGroup: "explore.join-group",
  exploreAcceptFriendRequest: "explore.accept-friend-request",
  exploreDeclineFriendRequest: "explore.decline-friend-request",
} as const;

export const telemetryErrorScopes = {
  routeError: "route.error",
  queryError: "query.error",
  mutationError: "mutation.error",
  windowError: "window.error",
  windowUnhandledRejection: "window.unhandledrejection",
} as const;

export const routeErrorScopes = {
  root: "root",
  authLogin: "auth.login",
  authRegister: "auth.register",
  authForgotPassword: "auth.forgot-password",
  authResetPassword: "auth.reset-password",
  authActivateAccount: "auth.activate-account",
  activity: "activity",
  forge: "forge",
} as const;

export type TrackedMutationName =
  (typeof trackedMutationNames)[keyof typeof trackedMutationNames];
export type TelemetryErrorScope =
  (typeof telemetryErrorScopes)[keyof typeof telemetryErrorScopes];
export type RouteErrorScope =
  (typeof routeErrorScopes)[keyof typeof routeErrorScopes];
