import { getScenarioCatalogEntry } from "@/dev/scenarios/catalog/scenario-catalog";
import { scenarioInterestLeavesById } from "@/dev/scenarios/world/scenario-interest-catalog";
import { applyScenarioOverlays } from "@/dev/scenarios/world/scenario-overlays";
import { populateStandardWorld } from "@/dev/scenarios/world/scenario-seed";
import type {
  ScenarioFaultPlan,
  ScenarioWorld,
} from "@/dev/scenarios/world/scenario-world";
import { fullUserResponseSchema } from "@/shared/schemas";

export const SCENARIO_CLOCK = "2026-08-01T09:30:00.000Z";

const defaultSettings = {
  emailAccount: true,
  emailFriendRequests: false,
  emailGroupActivity: false,
  emailGroupInvites: true,
  emailMessages: false,
  minCompatibilityScore: 65,
  notifyAccount: true,
  notifyFriendRequests: true,
  notifyGroupActivity: true,
  notifyGroupInvites: true,
  notifyMessages: true,
  notificationHardMute: false,
  presencePrecision: "APPROXIMATE" as const,
  presenceFriendsVisible: true,
  presenceGroupsVisible: true,
  presencePlanGuestsVisible: false,
  notificationTimeZoneId: "Europe/London",
  quietHoursStartMinute: 1320,
  quietHoursEndMinute: 420,
  planReminderLeadMinutes: 60 as const,
  showAgeOnProfile: true,
  showCityOnProfile: true,
  showFriendsListOnProfile: true,
  showGenderOnProfile: true,
  themeAppearance: "system" as const,
  themeColor: "graphite" as const,
  themeStyle: "classic" as const,
};

function createViewer(role: "ADMIN" | "USER" = "USER") {
  return fullUserResponseSchema.parse({
    adultEligibility: { accessVersion: 1, status: "ELIGIBLE" },
    age: 27,
    authProvider: "EMAIL",
    avatar: null,
    bio: "Product-minded organiser who turns good intentions into plans.",
    city: "London",
    createdAt: "2026-01-10T10:00:00.000Z",
    email: "quinn@findafew.test",
    emailVerified: true,
    gender: "OTHER",
    id: "scenario-user-quinn",
    interests: [],
    name: "Quinn Hart",
    oceanA: 36,
    oceanC: 36,
    oceanE: 56,
    oceanN: 42,
    oceanO: 80,
    onlineStatus: "ONLINE",
    personalitySetupComplete: true,
    personalityType: "ENTP",
    profileComplete: true,
    role,
    searchStatus: "IDLE",
    showFriendsListOnProfile: true,
    signInMethods: { google: false, password: true },
    trustScore: 86,
    updatedAt: SCENARIO_CLOCK,
  });
}

export function buildScenarioWorld({
  id,
  overlays,
  persona,
}: {
  id: string;
  overlays: readonly string[];
  persona: string | null;
}): ScenarioWorld {
  const catalogEntry = getScenarioCatalogEntry(id);
  const effectivePersona = persona ?? catalogEntry?.persona ?? null;
  const effectiveOverlays = [...(catalogEntry?.overlays ?? []), ...overlays];
  const isSignedOut = id === "signed-out" || effectivePersona === "signed-out";
  const viewer = createViewer(
    id.startsWith("admin-") || effectivePersona === "admin" ? "ADMIN" : "USER",
  );
  const faults = buildFaults(id, effectiveOverlays);
  const hasPartialOnboarding =
    id === "onboarding-incomplete" ||
    id === "onboarding-intent-prompt" ||
    id === "onboarding-personality" ||
    id === "onboarding-interests" ||
    id === "onboarding-introductory" ||
    id === "onboarding-practice" ||
    id.startsWith("onboarding-intent-");

  const world: ScenarioWorld = {
    account: {
      authenticated: !isSignedOut,
      onboardingComplete: !hasPartialOnboarding,
    },
    admin: {
      recentVerification: id !== "admin-stale-verification",
    },
    clock: SCENARIO_CLOCK,
    entities: {
      activities: {},
      chats: {},
      friendships: {},
      groups: {},
      interests: {},
      invitations: {},
      messages: {},
      notifications: {},
      plans: {},
      reports: {},
      users: isSignedOut ? {} : { [viewer.id]: viewer },
    },
    faults,
    planCreation: { activeRequestId: null },
    onboarding: {
      intentStepComplete:
        id !== "onboarding-incomplete" && id !== "onboarding-intent-prompt",
    },
    participation: {
      externalInvites: {},
      guestMembershipProposals: {},
      ownershipTransfers: {},
      seatOffers: {},
      withdrawnGuestPlanIds: [],
    },
    settings: defaultSettings,
    safety: { containments: {}, enforcementNotices: {} },
    traits: [...new Set(effectiveOverlays)],
    viewerId: isSignedOut ? null : viewer.id,
  };

  if (!isSignedOut && id !== "empty") {
    populateStandardWorld(world);
  }

  applyScenarioOverlays(world, effectiveOverlays);

  if (id === "onboarding-incomplete" && world.viewerId) {
    const onboardingViewer = world.entities.users[world.viewerId];
    onboardingViewer.age = null;
    onboardingViewer.city = null;
    onboardingViewer.gender = null;
    onboardingViewer.interests = [];
    onboardingViewer.oceanA = null;
    onboardingViewer.oceanC = null;
    onboardingViewer.oceanE = null;
    onboardingViewer.oceanN = null;
    onboardingViewer.oceanO = null;
    onboardingViewer.personalityType = null;
    onboardingViewer.profileComplete = false;
    onboardingViewer.personalitySetupComplete = false;
  }

  if (id === "onboarding-intent-prompt" && world.viewerId) {
    const onboardingViewer = world.entities.users[world.viewerId];
    onboardingViewer.oceanA = null;
    onboardingViewer.oceanC = null;
    onboardingViewer.oceanE = null;
    onboardingViewer.oceanN = null;
    onboardingViewer.oceanO = null;
    onboardingViewer.personalityType = null;
    onboardingViewer.personalitySetupComplete = false;
  }

  if (
    (id === "onboarding-personality" || id === "onboarding-interests") &&
    world.viewerId
  ) {
    const onboardingViewer = world.entities.users[world.viewerId];
    onboardingViewer.interests = [];
    onboardingViewer.oceanA = null;
    onboardingViewer.oceanC = null;
    onboardingViewer.oceanE = null;
    onboardingViewer.oceanN = null;
    onboardingViewer.oceanO = null;
    onboardingViewer.personalityType = null;
    onboardingViewer.personalitySetupComplete = false;
  }

  if (
    (id === "onboarding-introductory" ||
      id === "onboarding-practice" ||
      id.startsWith("onboarding-intent-")) &&
    world.viewerId
  ) {
    const onboardingViewer = world.entities.users[world.viewerId];
    const previewInterestIds = new Set([
      "basketball",
      "reading",
      "career_growth",
      "local_community",
      "food_markets",
      "board_games",
    ]);
    onboardingViewer.interests = [
      scenarioInterestLeavesById.basketball,
      scenarioInterestLeavesById.reading,
      ...Object.values(scenarioInterestLeavesById).filter(
        (interest) => !previewInterestIds.has(interest.id),
      ),
    ].slice(0, 10);
    if (onboardingViewer.interests.length !== 10) {
      throw new Error("Introductory scenario requires ten seeded interests");
    }
    onboardingViewer.oceanA = null;
    onboardingViewer.oceanC = null;
    onboardingViewer.oceanE = null;
    onboardingViewer.oceanN = null;
    onboardingViewer.oceanO = null;
    onboardingViewer.personalityType = null;
    onboardingViewer.personalitySetupComplete = false;
  }

  return world;
}

function buildFaults(id: string, overlays: readonly string[]) {
  const values = new Set([id, ...overlays]);
  const faults: ScenarioFaultPlan[] = [...buildLifecycleFaults(id)];

  if (values.has("network-slow")) {
    faults.push({ delayMs: 2_000 });
  }

  if (values.has("network-offline")) {
    faults.push({ networkError: true });
  }

  for (const status of [403, 404, 409, 410, 422, 429, 500] as const) {
    if (values.has(`network-${status}`)) {
      faults.push({ status });
    }
  }

  return faults;
}

function buildLifecycleFaults(id: string): ScenarioFaultPlan[] {
  switch (id) {
    case "auth-activation-loading":
      return [
        {
          hold: true,
          method: "POST",
          pathname: "auth/activate/scenario-activation-token",
        },
      ];
    case "home-loading":
      return [holdGet("groups/home-summary")];
    case "activity-loading":
      return [holdGet("groups/activity-feed")];
    case "explore-loading":
      return [holdGet("explore/feed")];
    case "explore-pagination-loading":
      return [
        {
          ...holdGet("explore/feed"),
          searchParams: { page: "2" },
        },
      ];
    case "home-recommendations-error":
      return [{ method: "GET", pathname: "explore/feed", status: 403 }];
    case "home-recommendations-recovery":
      return [
        {
          method: "GET",
          pathname: "explore/feed",
          status: 403,
        },
      ];
    case "explore-join-pending":
      return [
        {
          hold: true,
          method: "POST",
          pathname: "explore/groups/scenario-group-basketball/join",
        },
      ];
    case "explore-join-rollback":
      return [
        {
          method: "POST",
          pathname: "explore/groups/scenario-group-basketball/join",
          status: 409,
        },
      ];
    case "group-loading":
      return [holdGet("groups/scenario-group-basketball/detail")];
    case "profile-loading":
      return [holdGet("users/scenario-user-ava")];
    case "settings-loading":
      return [holdGet("settings/me")];
    default:
      return [];
  }
}

function holdGet(pathname: string): ScenarioFaultPlan {
  return { hold: true, method: "GET", pathname };
}
