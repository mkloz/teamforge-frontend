import type { Group, Plan, User } from "@/shared/schemas";

export type { PlanStatus, PlanCategory } from "@/shared/schemas/enums";

/**
 * UI-specific projection for stats displayed on the home dashboard.
 */
export interface UserStats {
  trustScore: number;
  groupsJoined: number;
  activitiesDone: number;
  connections: number;
  profileCompleteness: number;
}

/**
 * For the Home feature, we use the core Plan, Group, and User types
 * from the shared schemas to ensure consistency.
 */
export type UpcomingPlan = Plan;
export type UserGroup = Group & {
  hasUnread?: boolean;
  lastActivity?: string;
};

export type RecommendedGroup = Group & {
  matchScore: number;
  distance: string;
  personalizationCue: string;
};
export type GroupInvitation = {
  id: string;
  group: Group;
  invitedBy: User;
  receivedAt: string;
};
