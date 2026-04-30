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
  activityGroupInvite: "activity.group.invite",
  activityGroupLeave: "activity.group.leave",
  activityGroupRemoveMember: "activity.group.remove-member",
  activityGroupDisband: "activity.group.disband",
  activityBlockUser: "activity.user.block",
  activityUnblockUser: "activity.user.unblock",
  activityGroupRatingSubmit: "activity.group-rating.submit",
  forgeAuto: "forge.auto",
  forgeManual: "forge.manual",
  settingsUpdateProfile: "settings.update-profile",
  settingsUploadAvatar: "settings.upload-avatar",
  settingsNotificationPreferences: "settings.notification-preferences",
  settingsRevokeSession: "settings.revoke-session",
  settingsRevokeOtherSessions: "settings.revoke-other-sessions",
  settingsUnblockUser: "settings.user.unblock",
  settingsDeleteAccount: "settings.account.delete",
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

export const trackedEventNames = {
  routeErrorRecovery: "route_error_recovery",
} as const;

export const routeErrorScopes = {
  root: "root",
  authLogin: "auth.login",
  authRegister: "auth.register",
  authForgotPassword: "auth.forgot-password",
  authResetPassword: "auth.reset-password",
  authActivateAccount: "auth.activate-account",
  onboardingProfile: "onboarding.profile",
  onboardingPersonality: "onboarding.personality",
  onboardingInterests: "onboarding.interests",
  home: "home",
  explore: "explore",
  activity: "activity",
  profile: "profile",
  settings: "settings",
  forge: "forge",
  designSystem: "design-system",
} as const;

export type TrackedMutationName =
  (typeof trackedMutationNames)[keyof typeof trackedMutationNames];
export type TrackedEventName =
  (typeof trackedEventNames)[keyof typeof trackedEventNames];
export type TelemetryErrorScope =
  (typeof telemetryErrorScopes)[keyof typeof telemetryErrorScopes];
export type RouteErrorScope =
  (typeof routeErrorScopes)[keyof typeof routeErrorScopes];
