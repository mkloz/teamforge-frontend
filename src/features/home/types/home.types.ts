export type PersonalityType = "ENTJ" | "ENTL" | "INTJ" | "INTL" | "ESFJ" | "ESFP" | "ISFJ" | "ISFP" | "ESTJ" | "ESTP" | "ISTJ" | "ISTP" | "ENFJ" | "ENFP" | "INFJ" | "INFP";

export type SearchStatus = "IDLE" | "SEARCHING";

export type GroupAccessType = "OPEN" | "BY_INVITATION";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  personalityType: PersonalityType;
  trustScore: number; // 0-1
  searchStatus: SearchStatus;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  category: string; // e.g., "Sports", "Tech", "Arts"
  location: string; // city
  date: string; // ISO date
  memberCount: number;
  memberLimit?: number;
  accessType: GroupAccessType;
  creatorId: string;
  creatorName: string;
  tags: string[];
  similarity?: number; // cosine similarity score 0-1
}

export interface GroupPreview {
  id: string;
  activityTitle: string;
  activityCategory: string;
  memberCount: number;
  memberAvatars: string[];
  status: "ACTIVE" | "PENDING" | "COMPLETED";
  unreadMessages?: number;
}

export interface Invitation {
  id: string;
  groupId: string;
  activityTitle: string;
  activityCategory: string;
  inviterName: string;
  status: InvitationStatus;
  expiresAt: string; // ISO date
  createdAt: string; // ISO date
}

export interface PersonalizedTemplate {
  id: string;
  title: string;
  description: string;
  icon: string; // e.g., "Code", "Zap", "Users"
  interests: string[];
  suggestedTags: string[];
}

export interface HomeFeedData {
  user: UserProfile;
  activities: Activity[];
  groups: GroupPreview[];
  invitations: Invitation[];
  templates: PersonalizedTemplate[];
  forgeLimits: {
    used: number;
    limit: number;
    resetsAt: string; // ISO datetime
  };
}
