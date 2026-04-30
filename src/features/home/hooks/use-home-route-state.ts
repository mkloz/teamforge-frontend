import { useCallback } from "react";
import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import {
  homeInvitationViewValues,
  homePanelValues,
} from "@/shared/lib/home-route";

export function useHomeRouteState() {
  const [routeState, setRouteState] = useQueryStates(
    {
      panel: parseAsStringLiteral(homePanelValues),
      invite: parseAsString,
      view: parseAsStringLiteral(homeInvitationViewValues),
    },
    {
      history: "replace",
    },
  );

  const clearInvitationFocus = useCallback(() => {
    void setRouteState(
      {
        panel: null,
        invite: null,
        view: null,
      },
      { history: "replace" },
    );
  }, [setRouteState]);

  return {
    focusedPanel: routeState.panel ?? null,
    focusedInviteId: routeState.invite ?? null,
    invitationView: routeState.view ?? "received",
    clearInvitationFocus,
  };
}
