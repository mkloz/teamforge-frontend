export const APP_QUERY_KEYS = {
  auth: {
    currentUser: ["auth", "current-user"] as const,
  },
  activity: {
    groups: ["activity", "groups"] as const,
    chats: ["activity", "chats"] as const,
    friendships: ["activity", "friendships"] as const,
    pendingInvitations: ["activity", "pending-invitations"] as const,
    pendingInvitationsByGroup: (groupId: string) =>
      ["activity", "pending-invitations", groupId] as const,
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
    plans: ["activity", "plans"] as const,
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
    feed: ["explore-feed"] as const,
    feedWithFilters: (searchQuery: string, filters: unknown) =>
      ["explore-feed", searchQuery, filters] as const,
    groups: ["explore-groups"] as const,
    groupsWithFilters: (searchQuery: string, filters: unknown) =>
      ["explore-groups", searchQuery, filters] as const,
  },
  groupPlanDetail: {
    all: ["group-plan-detail"] as const,
    byId: (groupId: string) => ["group-plan-detail", groupId] as const,
    inviteSuggestions: (groupId: string, planId: string) =>
      ["group-plan-detail", groupId, "invite-suggestions", planId] as const,
    commitmentReadiness: (planId: string) =>
      ["group-plan-detail", "commitment-readiness", planId] as const,
    seatRecovery: (planId: string) =>
      ["group-plan-detail", "seat-recovery", planId] as const,
    externalInvites: (planId: string) =>
      ["group-plan-detail", "external-invites", planId] as const,
    planGuests: (planId: string) =>
      ["group-plan-detail", "plan-guests", planId] as const,
    guestMembershipProposals: (groupId: string) =>
      ["group-plan-detail", groupId, "guest-membership-proposals"] as const,
    ownershipTransfer: (groupId: string) =>
      ["group-plan-detail", groupId, "ownership-transfer"] as const,
  },
  planGuest: {
    access: (planId: string) => ["plan-guest", planId, "access"] as const,
    membershipProposal: (planId: string) =>
      ["plan-guest", planId, "membership-proposal"] as const,
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
    accountData: ["settings", "account-data"] as const,
    accountLifecycle: (userId: string) =>
      ["settings", "account-data", userId, "lifecycle"] as const,
    adultEligibilityCorrection: (userId: string) =>
      [
        "settings",
        "account-data",
        userId,
        "adult-eligibility-correction",
      ] as const,
    accountExport: (userId: string) =>
      ["settings", "account-data", userId, "export"] as const,
    activityInviteAvailability: [
      "settings",
      "activity-invite-availability",
    ] as const,
    notificationPreferences: ["settings", "notification-preferences"] as const,
    sessions: ["settings", "sessions"] as const,
    blockedUsers: ["settings", "blocked-users"] as const,
  },
  forge: {
    candidateAvailability: ["forge", "candidate-availability"] as const,
    currentAutoRequest: ["forge", "auto-request", "current"] as const,
    currentProposal: ["forge-proposals", "current"] as const,
    friends: ["forge", "friends"] as const,
    proposalOpenings: ["forge-proposal-openings"] as const,
    proposalOpeningById: (openingId: string) =>
      ["forge-proposal-openings", openingId] as const,
    recentActivities: ["forge", "recent-activities"] as const,
  },
  onboarding: {
    interestTree: ["onboarding", "interests", "tree"] as const,
  },
  profile: {
    viewerProfiles: ["profile", "viewer"] as const,
    byId: (userId: string) => ["profile", "viewer", userId] as const,
    friendshipWith: (userId: string) =>
      ["profile", "friendship", userId] as const,
    friendRequests: ["profile", "friend-requests"] as const,
    outgoingFriendRequests: ["profile", "outgoing-friend-requests"] as const,
    friends: ["profile", "friends"] as const,
  },
} as const;
