import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import {
  homeInvitationViewValues,
  homePanelValues,
} from "@/features/home/lib/home-route";

export function useHomeRouteState() {
  const [routeState, setRouteState] = useQueryStates(
    {
      panel: parseAsStringLiteral(homePanelValues),
      invite: parseAsString,
      request: parseAsString,
      view: parseAsStringLiteral(homeInvitationViewValues),
    },
    {
      history: "replace",
    },
  );

  function clearInvitationFocus() {
    void setRouteState(
      {
        panel: null,
        invite: null,
        request: null,
        view: null,
      },
      { history: "replace" },
    );
  }

  function clearFriendRequestFocus() {
    void setRouteState(
      {
        panel: null,
        request: null,
      },
      { history: "replace" },
    );
  }

  return {
    focusedPanel: routeState.panel ?? null,
    focusedInviteId: routeState.invite ?? null,
    focusedRequestId: routeState.request ?? null,
    invitationView: routeState.view ?? "received",
    clearFriendRequestFocus,
    clearInvitationFocus,
  };
}
