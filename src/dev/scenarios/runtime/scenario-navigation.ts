import {
  DEVELOPMENT_TOOLS_SHORT_QUERY_PARAMETER,
  SCENARIO_OVERLAYS_QUERY_PARAMETER,
  SCENARIO_PERSONA_QUERY_PARAMETER,
  SCENARIO_QUERY_PARAMETER,
} from "@/dev/scenarios/runtime/scenario-selection";
import type { ScenarioDescriptor } from "@/shared/runtime/scenario-runtime-contract";

type HistoryMethod = History["pushState"];

interface ScenarioNavigationEnvironment {
  descriptor: ScenarioDescriptor | null;
  preserveDevelopmentTools: boolean;
  history: History;
  location: Pick<Location, "href" | "origin">;
}

/**
 * TanStack Router deliberately serializes only validated search parameters.
 * Scenario activation lives outside product route contracts, so preserve it at
 * the history boundary instead of teaching every route about development data.
 */
export function installScenarioNavigationPersistence({
  descriptor,
  preserveDevelopmentTools,
  history,
  location,
}: ScenarioNavigationEnvironment) {
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);
  const activation = getDevelopmentActivation(
    descriptor,
    preserveDevelopmentTools,
  );

  history.pushState = createScenarioHistoryMethod(
    originalPushState,
    activation,
    location,
  );
  history.replaceState = createScenarioHistoryMethod(
    originalReplaceState,
    activation,
    location,
  );

  return () => {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  };
}

function createScenarioHistoryMethod(
  method: HistoryMethod,
  activation: ReadonlyMap<string, string>,
  location: Pick<Location, "href" | "origin">,
): HistoryMethod {
  return (data, unused, url) =>
    method(data, unused, preserveScenarioActivation(url, activation, location));
}

function preserveScenarioActivation(
  url: string | URL | null | undefined,
  activation: ReadonlyMap<string, string>,
  location: Pick<Location, "href" | "origin">,
) {
  if (url === null || url === undefined) {
    return url;
  }

  const nextUrl = new URL(String(url), location.href);

  if (nextUrl.origin !== location.origin) {
    return url;
  }

  // An explicit activation belongs to a deliberate scenario switch and wins
  // over the currently active descriptor.
  if (!nextUrl.searchParams.has(SCENARIO_QUERY_PARAMETER)) {
    for (const [name, value] of activation) {
      nextUrl.searchParams.set(name, value);
    }
  }

  return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
}

function getDevelopmentActivation(
  descriptor: ScenarioDescriptor | null,
  preserveDevelopmentTools: boolean,
) {
  const activation = new Map<string, string>();

  if (preserveDevelopmentTools) {
    activation.set(DEVELOPMENT_TOOLS_SHORT_QUERY_PARAMETER, "1");
  }

  if (!descriptor) {
    return activation;
  }

  activation.set(SCENARIO_QUERY_PARAMETER, descriptor.id);

  if (descriptor.persona) {
    activation.set(SCENARIO_PERSONA_QUERY_PARAMETER, descriptor.persona);
  }

  if (descriptor.overlays.length > 0) {
    activation.set(
      SCENARIO_OVERLAYS_QUERY_PARAMETER,
      [...descriptor.overlays].sort().join(","),
    );
  }

  return activation;
}
