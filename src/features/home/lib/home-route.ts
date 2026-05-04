export const homePanelValues = ["invitations", "friends"] as const;
export const homeInvitationViewValues = ["received", "sent"] as const;

export type HomePanel = (typeof homePanelValues)[number];
export type HomeInvitationView = (typeof homeInvitationViewValues)[number];

export interface HomeRouteSearch {
  panel?: HomePanel;
  invite?: string;
  request?: string;
  view?: HomeInvitationView;
}

export function buildHomeNavigation(search?: HomeRouteSearch) {
  return {
    to: "/home",
    search,
  } as const;
}
