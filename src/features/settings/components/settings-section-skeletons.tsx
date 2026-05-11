import { BlockedUserRow } from "@/features/settings/components/blocked-users-section/blocked-user-row";
import { PreferenceRowList } from "@/features/settings/components/settings-profile-form/preference-section-parts/preference-row-list";
import { SessionRow } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import { NOTIFICATION_PREFERENCE_ITEMS } from "@/features/settings/components/settings-profile-form/settings-preference-items";
import { GeneratedSkeleton } from "@/shared/components/loading/generated-skeleton";
import type {
  AuthSession,
  FriendshipApi,
  NotificationPreferences,
} from "@/shared/schemas";

export const SETTINGS_ACTIVE_SESSIONS_SKELETON_NAME =
  "settings.active-sessions";
export const SETTINGS_BLOCKED_USERS_SKELETON_NAME = "settings.blocked-users";
export const SETTINGS_PREFERENCES_SKELETON_NAME = "settings.preferences";

const settingsPreferenceFixture = {
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

const settingsSessionFixtures = [
  {
    id: "settings-session-current",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/147.0",
    ipAddress: "127.0.0.1",
    createdAt: "2026-05-01T09:30:00.000Z",
    expiresAt: "2026-06-01T09:30:00.000Z",
    isCurrent: true,
  },
  {
    id: "settings-session-mobile",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
    ipAddress: "10.0.0.24",
    createdAt: "2026-04-28T18:20:00.000Z",
    expiresAt: "2026-05-28T18:20:00.000Z",
    isCurrent: false,
  },
] satisfies AuthSession[];

const settingsBlockedUserFixtures = [
  {
    status: "BLOCKED",
    createdAt: "2026-04-20T12:00:00.000Z",
    updatedAt: "2026-04-20T12:00:00.000Z",
    version: 1,
    requesterId: "settings-skeleton-user",
    receiverId: "blocked-alex",
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
      id: "blocked-alex",
      name: "Alex Morgan",
      avatar: null,
      city: "Cardiff",
      personalityType: "ISTJ",
      trustScore: 64,
      onlineStatus: "OFFLINE",
    },
    counterpart: {
      id: "blocked-alex",
      name: "Alex Morgan",
      avatar: null,
      city: "Cardiff",
      personalityType: "ISTJ",
      trustScore: 64,
      onlineStatus: "OFFLINE",
    },
    privateChat: null,
  },
  {
    status: "BLOCKED",
    createdAt: "2026-04-14T12:00:00.000Z",
    updatedAt: "2026-04-14T12:00:00.000Z",
    version: 1,
    requesterId: "settings-skeleton-user",
    receiverId: "blocked-jordan",
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
      id: "blocked-jordan",
      name: "Jordan Lee",
      avatar: null,
      city: "Bath",
      personalityType: "INTP",
      trustScore: 71,
      onlineStatus: "OFFLINE",
    },
    counterpart: {
      id: "blocked-jordan",
      name: "Jordan Lee",
      avatar: null,
      city: "Bath",
      personalityType: "INTP",
      trustScore: 71,
      onlineStatus: "OFFLINE",
    },
    privateChat: null,
  },
] satisfies FriendshipApi[];

const noopPromise = async () => undefined;

export function SettingsActiveSessionsSkeleton() {
  const fixture = <SettingsActiveSessionsSkeletonFixture />;

  return (
    <GeneratedSkeleton
      name={SETTINGS_ACTIVE_SESSIONS_SKELETON_NAME}
      loading
      fixture={fixture}
    >
      {fixture}
    </GeneratedSkeleton>
  );
}

export function SettingsPreferencesSkeleton() {
  const fixture = <SettingsPreferencesSkeletonFixture />;

  return (
    <GeneratedSkeleton
      name={SETTINGS_PREFERENCES_SKELETON_NAME}
      loading
      fixture={fixture}
    >
      {fixture}
    </GeneratedSkeleton>
  );
}

export function SettingsBlockedUsersSkeleton() {
  const fixture = <SettingsBlockedUsersSkeletonFixture />;

  return (
    <GeneratedSkeleton
      name={SETTINGS_BLOCKED_USERS_SKELETON_NAME}
      loading
      fixture={fixture}
    >
      {fixture}
    </GeneratedSkeleton>
  );
}

export function SettingsActiveSessionsSkeletonFixture() {
  return (
    <>
      {settingsSessionFixtures.map((session) => (
        <SessionRow
          key={session.id}
          session={session}
          isRevoking={false}
          onRevoke={noopPromise}
        />
      ))}
    </>
  );
}

export function SettingsPreferencesSkeletonFixture() {
  return (
    <PreferenceRowList
      items={NOTIFICATION_PREFERENCE_ITEMS}
      notificationPreferences={settingsPreferenceFixture}
      disabled
      onChange={noopPromise}
    />
  );
}

export function SettingsBlockedUsersSkeletonFixture() {
  return (
    <>
      {settingsBlockedUserFixtures.map((friendship) => (
        <BlockedUserRow
          key={`${friendship.requesterId}-${friendship.receiverId}`}
          friendship={friendship}
          isUnblocking={false}
          onUnblockUser={noopPromise}
        />
      ))}
    </>
  );
}
