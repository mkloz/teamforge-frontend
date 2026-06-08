import type { ForgeParticipant } from "@/features/forge/lib/forge-contract";
import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";

export function createForgePlanTemplate(
  overrides: Partial<ForgePlanTemplate> = {},
): ForgePlanTemplate {
  return {
    selectedActivity: "Coffee and planning",
    planName: "Coffee planning table",
    planDescription: "Bring one idea and leave with a plan.",
    planLocation: "London",
    planLocationLat: 51.5072,
    planLocationLng: -0.1276,
    locationType: "IN_PERSON",
    planCost: "FREE",
    planCostAmount: "",
    planCostDetails: "",
    forgeMode: "AUTO",
    fixedSize: 5,
    visibility: "FRIENDS_ONLY",
    groupName: "Coffee Circle",
    groupDescription: "A focused table for practical ideas.",
    coverImage: "cover.jpg",
    avatarImage: "avatar.jpg",
    ...overrides,
  };
}

export function createForgeParticipant(
  overrides: Partial<ForgeParticipant> = {},
): ForgeParticipant {
  return {
    userId: "user-1",
    groupId: "group-1",
    role: "MEMBER",
    joinedAt: "2026-01-01T00:00:00.000Z",
    leftAt: null,
    compatibilityScore: 82,
    sortOrder: 0,
    user: {
      id: "user-1",
      name: "Test User",
      avatar: "",
      trustScore: 80,
    },
    ...overrides,
  };
}
