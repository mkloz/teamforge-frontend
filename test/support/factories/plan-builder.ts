import type { FormationCandidate } from "@/features/plan-creation/lib/plan-creation-contract";
import type { PlanTemplate } from "@/features/plan-creation/lib/plan-template";

export function createPlanTemplate(
  overrides: Partial<PlanTemplate> = {},
): PlanTemplate {
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
    groupFormationMode: "AUTO",
    fixedSize: 5,
    visibility: "FRIENDS_ONLY",
    groupName: "Coffee Circle",
    groupDescription: "A focused table for practical ideas.",
    coverImage: "cover.jpg",
    avatarImage: "avatar.jpg",
    ...overrides,
  };
}

export function createFormationCandidate(
  overrides: Partial<FormationCandidate> = {},
): FormationCandidate {
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
