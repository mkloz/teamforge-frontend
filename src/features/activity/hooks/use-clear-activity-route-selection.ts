import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import {
  activityKindValues,
  activityPanelValues,
} from "@/features/activity/lib/activity-route";

export function useClearActivityRouteSelection() {
  const [, setRouteState] = useQueryStates(
    {
      kind: parseAsStringLiteral(activityKindValues),
      id: parseAsString,
      panel: parseAsStringLiteral(activityPanelValues),
      plan: parseAsString,
      proposal: parseAsString,
      message: parseAsString,
    },
    {
      history: "replace",
    },
  );

  return () =>
    setRouteState({
      id: null,
      kind: null,
      message: null,
      panel: null,
      plan: null,
      proposal: null,
    });
}
