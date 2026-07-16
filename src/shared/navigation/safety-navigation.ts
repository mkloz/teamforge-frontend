export type SafetySection = "reports" | "account-actions" | "restrictions";

export function buildSafetyNavigation(section?: SafetySection) {
  return {
    to: "/safety",
    search: {
      section: section && section !== "reports" ? section : undefined,
    },
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

export function validateSafetySearch(search: Record<string, unknown>) {
  const section = search.section;

  return {
    section:
      section === "account-actions" || section === "restrictions"
        ? section
        : undefined,
  };
}
