import { useForm } from "react-hook-form";
import { SettingsProfileForm } from "@/features/settings/components/settings-profile-form";
import type { SettingsProfileFormProps } from "@/features/settings/components/settings-profile-form/settings-form-types";
import { buildProfileSummary } from "@/features/settings/lib/settings-profile-mappers";
import type { SettingsSection } from "@/features/settings/lib/settings-route";
import type {
  AuthSession,
  FriendshipApi,
  NotificationPreferences,
  User,
} from "@/shared/schemas";
import type { SettingsProfileValues } from "../schemas/settings-profile.schema";
import { SettingsPageContent } from "./settings-page-content";

export const SETTINGS_PAGE_SKELETON_NAME = "settings.page";

const settingsFixtureUser = {
  id: "settings-skeleton-user",
  email: "maya.rivera@example.com",
  name: "Maya Rivera",
  avatar: null,
  bio: "I like plans that leave room for a real conversation.",
  authProvider: "EMAIL",
  googleId: null,
  emailVerified: true,
  createdAt: "2026-01-10T10:00:00.000Z",
  updatedAt: "2026-05-01T10:00:00.000Z",
  age: 24,
  gender: "NON_BINARY",
  city: "Bristol",
  locationLat: null,
  locationLng: null,
  personalityType: "ENFP",
  oceanO: 84,
  oceanC: 62,
  oceanE: 72,
  oceanA: 78,
  oceanN: 34,
  searchStatus: "IDLE",
  onlineStatus: "ONLINE",
  trustScore: 88,
  profileComplete: true,
  interests: [],
} satisfies User;

const settingsFixturePreferences = {
  notifyFriendRequests: true,
  notifyGroupInvites: true,
  notifyGroupActivity: true,
  notifyMessages: true,
  notifyAccount: true,
  emailFriendRequests: false,
  emailGroupInvites: true,
  emailGroupActivity: false,
  emailMessages: false,
  emailAccount: true,
  autoMatchingEnabled: true,
  minCompatibilityScore: 72,
  showAgeOnProfile: true,
  showGenderOnProfile: false,
  showCityOnProfile: true,
} satisfies NotificationPreferences;

const settingsFixtureSessions = [
  {
    id: "session-current",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/147.0",
    ipAddress: "127.0.0.1",
    createdAt: "2026-05-01T09:30:00.000Z",
    expiresAt: "2026-06-01T09:30:00.000Z",
    isCurrent: true,
  },
] satisfies AuthSession[];

const settingsFixtureBlockedUsers = [
  {
    status: "BLOCKED",
    createdAt: "2026-04-20T12:00:00.000Z",
    updatedAt: "2026-04-20T12:00:00.000Z",
    version: 1,
    requesterId: "settings-skeleton-user",
    receiverId: "blocked-user",
    privateChatId: null,
    requester: {
      id: "settings-skeleton-user",
      name: "Maya Rivera",
      avatar: null,
      city: "Bristol",
      personalityType: "ENFP",
      trustScore: 88,
      onlineStatus: "ONLINE",
    },
    receiver: {
      id: "blocked-user",
      name: "Alex Morgan",
      avatar: null,
      city: "Cardiff",
      personalityType: "ISTJ",
      trustScore: 64,
      onlineStatus: "OFFLINE",
    },
    counterpart: {
      id: "blocked-user",
      name: "Alex Morgan",
      avatar: null,
      city: "Cardiff",
      personalityType: "ISTJ",
      trustScore: 64,
      onlineStatus: "OFFLINE",
    },
    privateChat: null,
  },
] satisfies FriendshipApi[];

const noop = () => undefined;
const noopPromise = async () => undefined;

interface SettingsPageSkeletonFixtureProps {
  activeSection?: SettingsSection;
}

export function SettingsPageSkeletonFixture({
  activeSection = "account",
}: SettingsPageSkeletonFixtureProps) {
  const form = useForm<SettingsProfileValues>({
    defaultValues: {
      name: settingsFixtureUser.name,
      age: String(settingsFixtureUser.age),
      gender: settingsFixtureUser.gender ?? "",
      city: settingsFixtureUser.city ?? "",
      locationLat: settingsFixtureUser.locationLat ?? null,
      locationLng: settingsFixtureUser.locationLng ?? null,
      bio: settingsFixtureUser.bio ?? "",
    },
  });

  const formProps: SettingsProfileFormProps = {
    activeSection,
    account: {
      currentUser: settingsFixtureUser,
      form,
      onSubmit: noop,
      onAvatarSelect: noopPromise,
      onAvatarDelete: noopPromise,
      isSaving: false,
      isUploadingAvatar: false,
      isDeletingAvatar: false,
      saveMessage: null,
      saveError: null,
      avatarMessage: null,
      avatarError: null,
      profileSummary: buildProfileSummary(settingsFixtureUser),
    },
    matching: {
      currentUser: settingsFixtureUser,
      notificationPreferences: settingsFixturePreferences,
      isLoadingNotificationPreferences: false,
      isSavingNotificationPreferences: false,
      message: null,
      error: null,
      onChange: noopPromise,
    },
    privacy: {
      notificationPreferences: settingsFixturePreferences,
      isLoadingNotificationPreferences: false,
      isSavingNotificationPreferences: false,
      message: null,
      error: null,
      onChange: noopPromise,
    },
    security: {
      currentUser: settingsFixtureUser,
      sessions: settingsFixtureSessions,
      isLoadingSessions: false,
      isSendingPasswordResetLink: false,
      isRevokingOtherSessions: false,
      isDeletingAccount: false,
      revokingSessionId: null,
      securityMessage: null,
      securityError: null,
      sessionsError: null,
      deleteAccountError: null,
      onSendPasswordResetLink: noopPromise,
      onRevokeSession: noopPromise,
      onRevokeOtherSessions: noopPromise,
      onDeleteAccount: noopPromise,
    },
    safety: {
      blockedUsers: settingsFixtureBlockedUsers,
      isLoadingBlockedUsers: false,
      blockedUsersError: null,
      unblockingUserId: null,
      onUnblockUser: noopPromise,
    },
    notifications: {
      notificationPreferences: settingsFixturePreferences,
      isLoadingNotificationPreferences: false,
      isSavingNotificationPreferences: false,
      message: null,
      error: null,
      onChange: noopPromise,
    },
  };

  return (
    <SettingsPageContent
      activeSection={activeSection}
      isMobileDetailOpen
      isSigningOut={false}
      onMobileBack={noop}
      onSectionSelect={noop}
      onSignOut={noop}
    >
      <SettingsProfileForm {...formProps} />
    </SettingsPageContent>
  );
}
