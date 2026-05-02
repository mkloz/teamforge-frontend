export const APP_QUERY_KEYS = {
  auth: {
    currentUser: ["auth", "current-user"] as const,
  },
  activity: {
    groups: ["activity", "groups"] as const,
    chats: ["activity", "chats"] as const,
    friendships: ["activity", "friendships"] as const,
    groupSelection: ["activity-selection", "group"] as const,
    groupSelectionById: (groupId: string) =>
      ["activity-selection", "group", groupId] as const,
    directSelection: ["activity-selection", "dm"] as const,
    directSelectionByChatId: (chatId: string) =>
      ["activity-selection", "dm", chatId] as const,
    groupRatings: (groupId: string) =>
      ["activity", "ratings", "group", groupId] as const,
    linkPreview: (url: string) => ["activity", "link-preview", url] as const,
    messages: (chatId: string) => ["activity-messages", chatId] as const,
    conversationMessages: (chatId: string) =>
      ["activity-messages", chatId] as const,
  },
  explore: {
    groups: ["explore-groups"] as const,
    groupsWithFilters: (searchQuery: string, filters: unknown) =>
      ["explore-groups", searchQuery, filters] as const,
    friendRequests: ["explore", "friend-requests"] as const,
  },
  home: {
    all: ["home"] as const,
    groups: ["home", "groups"] as const,
    invitations: ["home", "invitations"] as const,
    sentInvitations: ["home", "sent-invitations"] as const,
    recommendations: ["home", "recommendations"] as const,
    plans: ["home", "plans"] as const,
    stats: ["home", "stats"] as const,
  },
  notifications: {
    list: ["notifications"] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
  settings: {
    notificationPreferences: ["settings", "notification-preferences"] as const,
    sessions: ["settings", "sessions"] as const,
    blockedUsers: ["settings", "blocked-users"] as const,
  },
  forge: {
    friends: ["forge", "friends"] as const,
  },
  onboarding: {
    interestTree: ["onboarding", "interests", "tree"] as const,
  },
  profile: {
    byId: (userId: string) => ["profile", userId] as const,
  },
} as const;
