import type { SettingsSection } from "@/shared/lib/settings-route";
import type {
  AuthSession,
  FriendshipApi,
  NotificationPreferences,
  User,
} from "@/shared/schemas";
import type { SettingsProfileValues } from "@/features/settings/schemas/settings-profile.schema";
import type { UseFormReturn } from "react-hook-form";

export type BooleanSettingsPreferenceKey = Exclude<
  keyof NotificationPreferences,
  "minCompatibilityScore"
>;

export interface SettingsProfileFormProps {
  activeSection: SettingsSection;
  currentUser: User | undefined;
  form: UseFormReturn<SettingsProfileValues>;
  onSubmit: () => void;
  onAvatarSelect: (file: File) => Promise<unknown>;
  onSendPasswordResetLink: () => Promise<unknown>;
  onRevokeSession: (session: AuthSession) => Promise<void>;
  onRevokeOtherSessions: () => Promise<void>;
  onUnblockUser: (userId: string) => Promise<unknown>;
  onNotificationPreferenceChange: (
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) => Promise<void>;
  onMatchingPreferenceChange: (
    values: Pick<
      NotificationPreferences,
      "autoMatchingEnabled" | "minCompatibilityScore"
    >,
  ) => Promise<void>;
  onPrivacyPreferenceChange: (
    values: Pick<
      NotificationPreferences,
      "showAgeOnProfile" | "showGenderOnProfile" | "showCityOnProfile"
    >,
  ) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  isSendingPasswordResetLink: boolean;
  isRevokingOtherSessions: boolean;
  isLoadingSessions: boolean;
  isLoadingBlockedUsers: boolean;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  isDeletingAccount: boolean;
  revokingSessionId: string | null;
  saveMessage: string | null;
  saveError: string | null;
  avatarMessage: string | null;
  avatarError: string | null;
  securityMessage: string | null;
  securityError: string | null;
  notificationPreferencesMessage: string | null;
  notificationPreferencesError: string | null;
  deleteAccountError: string | null;
  sessionsError: string | null;
  blockedUsersError: string | null;
  profileSummary: Array<{ label: string; value: string }>;
  sessions: AuthSession[];
  blockedUsers: FriendshipApi[];
  unblockingUserId: string | null;
  notificationPreferences: NotificationPreferences | null;
}
