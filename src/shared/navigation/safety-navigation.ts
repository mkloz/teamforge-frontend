export type SafetySection = "reports" | "account-actions" | "restrictions";

export function buildSafetyNavigation(section?: SafetySection) {
  return {
    to: "/settings",
    search: { section: "safety" },
    hash: section ? `safety-${section}` : undefined,
  } as const;
}

export function buildSafetyReportNavigation(reportId: string) {
  return { to: "/safety/reports/$reportId", params: { reportId } } as const;
}

export function buildAccountActionNavigation(noticeId: string) {
  return {
    to: "/safety/account-actions/$noticeId",
    params: { noticeId },
  } as const;
}

export function buildSafetyRestrictionNavigation(containmentId: string) {
  return {
    to: "/safety/restrictions/$containmentId",
    params: { containmentId },
  } as const;
}

export function validateSafetySearch(search: Record<string, unknown>): {
  section?: SafetySection;
} {
  const section = search.section;

  return {
    section:
      section === "account-actions" || section === "restrictions"
        ? section
        : undefined,
  };
}
