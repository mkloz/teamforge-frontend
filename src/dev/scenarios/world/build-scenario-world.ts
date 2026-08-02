import { getScenarioCatalogEntry } from "@/dev/scenarios/catalog/scenario-catalog";
import { applyScenarioOverlays } from "@/dev/scenarios/world/scenario-overlays";
import { populateStandardWorld } from "@/dev/scenarios/world/scenario-seed";
import type {
  ScenarioFaultPlan,
  ScenarioWorld,
} from "@/dev/scenarios/world/scenario-world";
import { fullUserResponseSchema } from "@/shared/schemas";

export const SCENARIO_CLOCK = "2026-08-01T09:30:00.000Z";

const defaultSettings = {
  autoMatchingEnabled: false,
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
  notificationTimeZoneId: "Europe/London",
  quietHoursStartMinute: 1320,
  quietHoursEndMinute: 420,
  showAgeOnProfile: true,
  showCityOnProfile: true,
  showFriendsListOnProfile: true,
  showGenderOnProfile: true,
  themeAppearance: "dark" as const,
  themeColor: "forge" as const,
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
    email: "quinn@teamforge.test",
    emailVerified: true,
    gender: "OTHER",
    id: "scenario-user-quinn",
    interests: [],
    name: "Quinn Hart",
    oceanA: 64,
    oceanC: 86,
    oceanE: 27,
    oceanN: 42,
    oceanO: 80,
    onlineStatus: "ONLINE",
    personalitySetupComplete: true,
    personalityType: "ENTP",
    profileComplete: true,
    role,
    searchStatus: "IDLE",
    showFriendsListOnProfile: true,
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

  const world: ScenarioWorld = {
    account: {
      authenticated: !isSignedOut,
      onboardingComplete: id !== "onboarding-incomplete",
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
    forge: { activeRequestId: null },
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
    onboardingViewer.profileComplete = false;
    onboardingViewer.personalitySetupComplete = false;
  }

  return world;
}

function buildFaults(id: string, overlays: readonly string[]) {
  const values = new Set([id, ...overlays]);
  const faults: ScenarioFaultPlan[] = [];

  if (values.has("network-slow")) {
    faults.push({ delayMs: 2_000 });
  }

  if (values.has("network-offline")) {
    faults.push({ networkError: true });
  }

  for (const status of [403, 404, 409, 422, 429, 500] as const) {
    if (values.has(`network-${status}`)) {
      faults.push({ status });
    }
  }

  return faults;
}
