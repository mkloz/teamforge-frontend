import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import {
  activityKindValues,
  activityPanelValues,
} from "@/shared/navigation/activity-navigation";

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
