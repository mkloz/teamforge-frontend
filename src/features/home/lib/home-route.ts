export const homePanelValues = ["invitations", "friends"] as const;
export const homeInvitationViewValues = ["received", "sent"] as const;

export type HomePanel = (typeof homePanelValues)[number];
export type HomeInvitationView = (typeof homeInvitationViewValues)[number];

export interface HomeRouteSearch {
  panel?: HomePanel;
  invite?: string;
  notifications?: boolean;
  request?: string;
  view?: HomeInvitationView;
}

function parseOptionalSearchString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function isHomePanel(value: unknown): value is HomePanel {
  return (
    typeof value === "string" &&
    homePanelValues.some((panel) => panel === value)
  );
}

function isHomeInvitationView(value: unknown): value is HomeInvitationView {
  return (
    typeof value === "string" &&
    homeInvitationViewValues.some((view) => view === value)
  );
}

function parseTrueSearchFlag(value: unknown) {
  return value === true || value === "true" ? true : undefined;
}

export function validateHomeRouteSearch(
  search: Record<string, unknown>,
): HomeRouteSearch {
  return {
    panel: isHomePanel(search.panel) ? search.panel : undefined,
    invite: parseOptionalSearchString(search.invite),
    notifications: parseTrueSearchFlag(search.notifications),
    request: parseOptionalSearchString(search.request),
    view: isHomeInvitationView(search.view) ? search.view : undefined,
  };
}

export function buildHomeNavigation(search?: HomeRouteSearch) {
  return {
    to: "/home",
    search,
  } as const;
}
