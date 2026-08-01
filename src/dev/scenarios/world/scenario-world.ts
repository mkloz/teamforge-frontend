import type {
  ActivityAccess,
  ActivityVisibility,
  CostType,
  CurrentUser,
  FriendshipApi,
  GroupStatus,
  Invite,
  LocationMode,
  Notification,
  NotificationPreferences,
  PlanCategory,
  PlanScheduleMode,
  PlanStatus,
} from "@/shared/schemas";
import type {
  Containment,
  EnforcementNotice,
  ReportSummary,
} from "@/shared/schemas/safety";

export interface ScenarioInterestEntity {
  id: string;
  name: string;
  slug: string;
}

export interface ScenarioActivityEntity {
  access: ActivityAccess;
  city: string | null;
  id: string;
  interestIds: string[];
  title: string;
  visibility: ActivityVisibility;
}

export interface ScenarioGroupEntity {
  access: ActivityAccess;
  activityId: string;
  avatar: string | null;
  createdAt: string;
  description: string;
  id: string;
  maxMembers: number;
  memberIds: string[];
  name: string;
  pendingInvitationIds: string[];
  planIds: string[];
  status: GroupStatus;
  updatedAt: string;
  visibility: ActivityVisibility;
}

export interface ScenarioPlanEntity {
  category: PlanCategory;
  cost: CostType;
  costAmount: number | null;
  costDetails: string | null;
  coverImage: string | null;
  dateTime: string | null;
  description: string;
  groupId: string;
  id: string;
  location: string | null;
  locationLat: number | null;
  locationLng: number | null;
  locationMode: LocationMode;
  revision: number;
  scheduleMode: PlanScheduleMode;
  status: PlanStatus;
  title: string;
}

export interface ScenarioFaultPlan {
  delayMs?: number;
  method?: string;
  networkError?: boolean;
  pathname?: string;
  status?: number;
}

export interface ScenarioWorld {
  account: {
    authenticated: boolean;
    onboardingComplete: boolean;
  };
  admin: {
    recentVerification: boolean;
  };
  clock: string;
  entities: {
    activities: Record<string, ScenarioActivityEntity>;
    chats: Record<string, Record<string, unknown>>;
    friendships: Record<string, FriendshipApi>;
    groups: Record<string, ScenarioGroupEntity>;
    interests: Record<string, ScenarioInterestEntity>;
    invitations: Record<string, Invite>;
    messages: Record<string, Record<string, unknown>>;
    notifications: Record<string, Notification>;
    plans: Record<string, ScenarioPlanEntity>;
    reports: Record<string, ReportSummary>;
    users: Record<string, CurrentUser>;
  };
  faults: ScenarioFaultPlan[];
  forge: {
    activeRequestId: string | null;
  };
  settings: NotificationPreferences;
  safety: {
    containments: Record<string, Containment>;
    enforcementNotices: Record<string, EnforcementNotice>;
  };
  traits: string[];
  viewerId: string | null;
}
