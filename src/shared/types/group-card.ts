import type {
  ActivityAccess,
  GroupStatus,
  LocationMode,
  PlanCategory,
  PlanStatus,
  CostType,
} from "@/shared/schemas/enums";

export interface GroupCardPlan {
  id: string;
  title: string;
  category: PlanCategory;
  status: PlanStatus | null;
  dateTime: string | null;
  locationMode: LocationMode;
  location: string | null;
  cost: CostType;
  coverImage: string | null;
}

export interface GroupCardData {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  status: GroupStatus;
  maxMembers: number;
  activeMembersCount: number;
  access: ActivityAccess;
  activityTitle: string;
  activityCity: string | null;
  plan: GroupCardPlan | null;
  memberAvatars: Array<string | null>;
  matchScore: number;
  distanceLabel: string;
  isFull: boolean;
}
