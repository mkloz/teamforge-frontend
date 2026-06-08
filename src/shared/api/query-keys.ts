export const APP_QUERY_KEYS = {
  auth: {
    currentUser: ["auth", "current-user"] as const,
  },
  activity: {
    groups: ["activity", "groups"] as const,
    chats: ["activity", "chats"] as const,
    friendships: ["activity", "friendships"] as const,
    savedMessages: ["activity", "saved-messages"] as const,
    groupSelection: ["activity-selection", "group"] as const,
    groupSelectionById: (groupId: string) =>
      ["activity-selection", "group", groupId] as const,
    directSelection: ["activity-selection", "dm"] as const,
    directSelectionByChatId: (chatId: string) =>
      ["activity-selection", "dm", chatId] as const,
    groupRatings: (groupId: string) =>
      ["activity", "ratings", "group", groupId] as const,
    groupReviewState: (groupId: string) =>
      ["activity", "ratings", "group", groupId, "review-state"] as const,
    planProposals: (planId: string) =>
      ["activity", "plans", planId, "proposals"] as const,
    linkPreview: (url: string) => ["activity", "link-preview", url] as const,
    messages: (chatId: string) => ["activity-messages", chatId] as const,
    messageSearch: (chatId: string, query: string) =>
      ["activity-message-search", chatId, query] as const,
    conversationMessages: (chatId: string) =>
      ["activity-messages", chatId] as const,
  },
  explore: {
    groups: ["explore-groups"] as const,
    groupsWithFilters: (searchQuery: string, filters: unknown) =>
      ["explore-groups", searchQuery, filters] as const,
  },
  groupPlanDetail: {
    all: ["group-plan-detail"] as const,
    byId: (groupId: string) => ["group-plan-detail", groupId] as const,
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
    unreadList: ["notifications", "unread"] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
  webPush: {
    publicKey: ["web-push", "public-key"] as const,
    subscriptions: ["web-push", "subscriptions"] as const,
  },
  settings: {
    notificationPreferences: ["settings", "notification-preferences"] as const,
    sessions: ["settings", "sessions"] as const,
    blockedUsers: ["settings", "blocked-users"] as const,
  },
  forge: {
    friends: ["forge", "friends"] as const,
    recentActivities: ["forge", "recent-activities"] as const,
  },
  onboarding: {
    interestTree: ["onboarding", "interests", "tree"] as const,
  },
  profile: {
    byId: (userId: string) => ["profile", userId] as const,
    friendshipWith: (userId: string) =>
      ["profile", "friendship", userId] as const,
    friendRequests: ["profile", "friend-requests"] as const,
    outgoingFriendRequests: ["profile", "outgoing-friend-requests"] as const,
    friends: ["profile", "friends"] as const,
  },
} as const;
