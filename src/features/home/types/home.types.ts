export type PersonalityType = "ENTJ" | "ENTL" | "INTJ" | "INTL" | "ESFJ" | "ESFP" | "ISFJ" | "ISFP" | "ESTJ" | "ESTP" | "ISTJ" | "ISTP" | "ENFJ" | "ENFP" | "INFJ" | "INFP";

export type SearchStatus = "IDLE" | "SEARCHING";

export type GroupAccessType = "OPEN" | "BY_INVITATION";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";

export type ActivityCategory = "Sports" | "Tech" | "Arts" | "Social" | "Outdoors" | "Learning";

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
  category: ActivityCategory;
  coverImage: string; // Image URL for card banner
  location: string; // city
  date: string; // ISO date
  memberCount: number;
  memberLimit?: number;
  accessType: GroupAccessType;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string; // Creator's avatar URL
  tags: string[];
  similarity?: number; // cosine similarity score 0-1
}

export interface GroupPreview {
  id: string;
  activityTitle: string;
  activityCategory: ActivityCategory;
  coverImage: string; // Image URL for card banner
  memberCount: number;
  memberAvatars: string[];
  status: "ACTIVE" | "PENDING" | "COMPLETED";
  unreadMessages?: number;
}

export interface Invitation {
  id: string;
  groupId: string;
  activityTitle: string;
  activityCategory: ActivityCategory;
  coverImage: string; // Image URL for card banner
  inviterName: string;
  inviterAvatar: string; // Inviter's avatar URL
  status: InvitationStatus;
  expiresAt: string; // ISO date
  createdAt: string; // ISO date
}

export interface PersonalizedTemplate {
  id: string;
  title: string;
  description: string;
  icon: string; // e.g., "Code", "Zap", "Users"
  backgroundImage: string; // Gradient or image for template card
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
