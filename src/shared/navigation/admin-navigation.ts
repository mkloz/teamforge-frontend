export const adminNavigationTargets = {
  overview: { to: "/admin" },
  moderation: { to: "/admin/moderation" },
  operations: { to: "/admin/moderation/operations" },
  settings: { to: "/admin/moderation/settings" },
} as const;

export type AdminNavigationTarget = keyof typeof adminNavigationTargets;

export function buildAdminNavigation(
  target: AdminNavigationTarget = "overview",
) {
  return adminNavigationTargets[target];
}

export function buildAdminCaseNavigation(caseId: string) {
  return {
    to: "/admin/moderation/cases/$caseId",
    params: { caseId },
  } as const;
}
