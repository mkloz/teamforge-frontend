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
  archivedAt?: string | null;
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
  revision?: number;
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
  materialRevision: number;
  revision: number;
  scheduleMode: PlanScheduleMode;
  status: PlanStatus;
  title: string;
  commitments?: Record<
    string,
    {
      acknowledgedMaterialRevision: number;
      response: "CANNOT_ATTEND" | "GOING" | "UNSURE";
      rowVersion: number;
      updatedAt: string;
    }
  >;
}

export interface ScenarioFaultPlan {
  delayMs?: number;
  hold?: boolean;
  method?: string;
  networkError?: boolean;
  pathname?: string;
  remainingMatches?: number;
  searchParams?: Readonly<Record<string, string>>;
  status?: number;
}

export interface ScenarioExternalInviteState {
  claimCount: number;
  createdAt: string;
  expiresAt: string;
  id: string;
  planId: string;
  status: "ACTIVE" | "EXHAUSTED" | "EXPIRED" | "REVOKED";
  useCap: number;
}

export interface ScenarioGuestMembershipProposalState {
  approvalCount: number;
  expiresAt: string;
  groupId: string;
  guest: {
    avatar: string | null;
    id: string;
    name: string;
    planId: string;
    userId: string;
  };
  guestAcceptedAt: string | null;
  id: string;
  proposerId: string;
  rejectionCount: number;
  requiredApprovals: number;
  resolvedAt: string | null;
  status:
    | "PENDING_GUEST"
    | "PENDING_VOTE"
    | "ACCEPTED"
    | "DECLINED"
    | "REJECTED"
    | "EXPIRED"
    | "CANCELLED";
  viewerVote: "APPROVE" | "REJECT" | null;
}

export interface ScenarioOwnershipTransferState {
  createdAt: string;
  expiresAt: string;
  groupId: string;
  id: string;
  initiatorId: string;
  recipientId: string;
  respondedAt: string | null;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "CANCELLED";
}

export interface ScenarioSeatOfferState {
  candidateId: string;
  consequenceVersion: string;
  expiresAt: string | null;
  id: string;
  materialRevision: number;
  planId: string;
  status:
    | "WAITING"
    | "OFFERED"
    | "ACCEPTED"
    | "DECLINED"
    | "EXPIRED"
    | "CANCELLED";
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
  planCreation: {
    activeRequestId: string | null;
  };
  onboarding: {
    intentStepComplete: boolean;
  };
  participation: {
    externalInvites: Record<string, ScenarioExternalInviteState[]>;
    guestMembershipProposals: Record<
      string,
      ScenarioGuestMembershipProposalState[]
    >;
    ownershipTransfers: Record<string, ScenarioOwnershipTransferState | null>;
    seatOffers: Record<string, ScenarioSeatOfferState | null>;
    withdrawnGuestPlanIds: string[];
  };
  settings: NotificationPreferences;
  safety: {
    containments: Record<string, Containment>;
    enforcementNotices: Record<string, EnforcementNotice>;
  };
  traits: string[];
  viewerId: string | null;
}
