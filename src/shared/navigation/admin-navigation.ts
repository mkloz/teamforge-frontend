export const adminNavigationTargets = {
  overview: { to: "/admin" },
  audit: { to: "/admin/audit" },
  moderation: { to: "/admin/moderation" },
  intake: { to: "/admin/moderation/intake" },
  workers: { to: "/admin/moderation/workers" },
  operations: { to: "/admin/moderation/operations" },
  queueHealth: { to: "/admin/moderation/operations/queue-health" },
  settings: { to: "/admin/moderation/settings" },
} as const;

export type AdminNavigationTarget = keyof typeof adminNavigationTargets;

export function buildAdminNavigation(
  target: AdminNavigationTarget = "overview",
) {
  return adminNavigationTargets[target];
}
