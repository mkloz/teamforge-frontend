export type PlanStatus = "confirmed" | "pending" | "planning";
export type ActivityCategory =
  | "Outdoors"
  | "Tech"
  | "Arts"
  | "Food"
  | "Sports"
  | "Music"
  | "Social"
  | "Wellness";

export interface UpcomingPlan {
  id: string;
  title: string;
  date: string;
  groupName: string;
  status: PlanStatus;
  memberAvatarSeeds: string[];
  category: ActivityCategory;
}

export interface UserGroup {
  id: string;
  name: string;
  avatarSeed: string;
  memberCount: number;
  lastActivity: string;
  hasUnread: boolean;
}

export interface RecommendedGroup {
  id: string;
  name: string;
  activityType: string;
  imageUrl: string;
  compatibility: number;
  memberCount: number;
  memberAvatarSeeds: string[];
  access: "Open" | "By Request";
  personalizationCue: string;
}

export interface UserStats {
  trustScore: number;
  groupsJoined: number;
  activitiesDone: number;
  connections: number;
  profileCompleteness: number;
}

export interface GroupInvitation {
  id: string;
  groupName: string;
  avatarSeed: string;
  invitedBy: string;
  inviterAvatarSeed: string;
  memberCount: number;
  activityType: string;
  receivedAt: string;
}
