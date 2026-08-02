import type { UseFormReturn } from "react-hook-form";
import type { CandidateAvailabilityState } from "@/features/forge/public/candidate-availability";
import type { useAccountExport } from "@/features/settings/hooks/use-account-export";
import type { useAccountLifecycle } from "@/features/settings/hooks/use-account-lifecycle";
import type { ActivityInviteAvailabilityState } from "@/features/settings/hooks/use-activity-invite-availability";
import type { useAdultEligibilityCorrection } from "@/features/settings/hooks/use-adult-eligibility-correction";
import type { SettingsProfileValues } from "@/features/settings/schemas/settings-profile.schema";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";
import type {
  AdultEligibility,
  AuthSession,
  NotificationPreferences,
  User,
  UserBlockApi,
} from "@/shared/schemas";

type SettingsCurrentUser = User & {
  adultEligibility?: AdultEligibility;
};

export type BooleanSettingsPreferenceKey = Exclude<
  keyof NotificationPreferences,
  | "minCompatibilityScore"
  | "themeAppearance"
  | "themeStyle"
  | "themeColor"
  | "notificationTimeZoneId"
  | "quietHoursStartMinute"
  | "quietHoursEndMinute"
>;

export interface AccountSettingsState {
  adultEligibilityCorrection: ReturnType<typeof useAdultEligibilityCorrection>;
  currentUser: SettingsCurrentUser | undefined;
  form: UseFormReturn<SettingsProfileValues>;
  onSubmit: () => void;
  onAvatarSelect: (file: File) => Promise<unknown>;
  onAvatarDelete: () => Promise<unknown>;
  isOnline: boolean;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  isDeletingAvatar: boolean;
  saveError: string | null;
  avatarError: string | null;
  profileSummary: Array<{ label: string; value: string }>;
}

interface NotificationPreferenceState {
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  savingNotificationPreferenceKeys: ReadonlySet<keyof NotificationPreferences>;
  error: string | null;
  isOnline: boolean;
}

export interface MatchingSettingsState extends NotificationPreferenceState {
  activityInviteAvailability: ActivityInviteAvailabilityState;
  candidateAvailability: CandidateAvailabilityState;
  currentUser: User | undefined;
  onChange: (
    values: Pick<NotificationPreferences, "minCompatibilityScore">,
  ) => Promise<void>;
}

export interface PrivacySettingsState extends NotificationPreferenceState {
  accountExport: ReturnType<typeof useAccountExport>;
  onChange: (
    values: Pick<
      NotificationPreferences,
      | "showAgeOnProfile"
      | "showGenderOnProfile"
      | "showCityOnProfile"
      | "showFriendsListOnProfile"
    >,
  ) => Promise<void>;
}

export interface AppearanceSettingsState extends NotificationPreferenceState {
  onChange: (
    values: Pick<
      NotificationPreferences,
      "themeAppearance" | "themeStyle" | "themeColor"
    >,
  ) => Promise<void>;
}

export interface NotificationSettingsState extends NotificationPreferenceState {
  onChange: (
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) => Promise<void>;
  onScheduleChange: (
    values: Pick<
      NotificationPreferences,
      | "notificationHardMute"
      | "notificationTimeZoneId"
      | "quietHoursStartMinute"
      | "quietHoursEndMinute"
    >,
  ) => Promise<void>;
}

export interface SecuritySettingsState {
  accountLifecycle: ReturnType<typeof useAccountLifecycle>;
  currentUser: User | undefined;
  sessions: AuthSession[];
  isOnline: boolean;
  isLoadingSessions: boolean;
  isSendingPasswordResetLink: boolean;
  isRevokingOtherSessions: boolean;
  revokingSessionId: string | null;
  securityError: string | null;
  sessionsError: string | null;
  onSendPasswordResetLink: () => Promise<unknown>;
  onRevokeSession: (session: AuthSession) => Promise<void>;
  onRevokeOtherSessions: () => Promise<void>;
}

export interface SafetySettingsState {
  blockedUsers: UserBlockApi[];
  isOnline: boolean;
  isLoadingBlockedUsers: boolean;
  blockedUsersError: string | null;
  unblockingUserId: string | null;
  onUnblockUser: (userId: string) => Promise<unknown>;
}

export interface SettingsProfileFormProps {
  activeSection: SettingsSection;
  account: AccountSettingsState;
  appearance: AppearanceSettingsState;
  matching: MatchingSettingsState;
  privacy: PrivacySettingsState;
  security: SecuritySettingsState;
  safety: SafetySettingsState;
  notifications: NotificationSettingsState;
}
