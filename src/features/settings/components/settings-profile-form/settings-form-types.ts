import type { SettingsSection } from "@/features/settings/lib/settings-route";
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

export interface AccountSettingsState {
  currentUser: User | undefined;
  form: UseFormReturn<SettingsProfileValues>;
  onSubmit: () => void;
  onAvatarSelect: (file: File) => Promise<unknown>;
  onAvatarDelete: () => Promise<unknown>;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  isDeletingAvatar: boolean;
  saveMessage: string | null;
  saveError: string | null;
  avatarMessage: string | null;
  avatarError: string | null;
  profileSummary: Array<{ label: string; value: string }>;
}

interface NotificationPreferenceState {
  notificationPreferences: NotificationPreferences | null;
  isLoadingNotificationPreferences: boolean;
  isSavingNotificationPreferences: boolean;
  message: string | null;
  error: string | null;
}

export interface MatchingSettingsState extends NotificationPreferenceState {
  currentUser: User | undefined;
  onChange: (
    values: Pick<
      NotificationPreferences,
      "autoMatchingEnabled" | "minCompatibilityScore"
    >,
  ) => Promise<void>;
}

export interface PrivacySettingsState extends NotificationPreferenceState {
  onChange: (
    values: Pick<
      NotificationPreferences,
      "showAgeOnProfile" | "showGenderOnProfile" | "showCityOnProfile"
    >,
  ) => Promise<void>;
}

export interface NotificationSettingsState extends NotificationPreferenceState {
  onChange: (
    key: BooleanSettingsPreferenceKey,
    value: boolean,
  ) => Promise<void>;
}

export interface SecuritySettingsState {
  currentUser: User | undefined;
  sessions: AuthSession[];
  isLoadingSessions: boolean;
  isSendingPasswordResetLink: boolean;
  isRevokingOtherSessions: boolean;
  isDeletingAccount: boolean;
  revokingSessionId: string | null;
  securityMessage: string | null;
  securityError: string | null;
  sessionsError: string | null;
  deleteAccountError: string | null;
  onSendPasswordResetLink: () => Promise<unknown>;
  onRevokeSession: (session: AuthSession) => Promise<void>;
  onRevokeOtherSessions: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export interface SafetySettingsState {
  blockedUsers: FriendshipApi[];
  isLoadingBlockedUsers: boolean;
  blockedUsersError: string | null;
  unblockingUserId: string | null;
  onUnblockUser: (userId: string) => Promise<unknown>;
}

export interface SettingsProfileFormProps {
  activeSection: SettingsSection;
  account: AccountSettingsState;
  matching: MatchingSettingsState;
  privacy: PrivacySettingsState;
  security: SecuritySettingsState;
  safety: SafetySettingsState;
  notifications: NotificationSettingsState;
}
