import type { ScenarioDescriptor } from "@/shared/runtime/scenario-runtime-contract";

export const SCENARIO_QUERY_PARAMETER = "__scenario";
export const SCENARIO_PERSONA_QUERY_PARAMETER = "__persona";
export const SCENARIO_OVERLAYS_QUERY_PARAMETER = "__overlays";
export const DEVELOPMENT_TOOLS_QUERY_PARAMETER = "devtools";
export const DEVELOPMENT_TOOLS_SHORT_QUERY_PARAMETER = "dt";

function parseList(value: string | null) {
  return value
    ? [
        ...new Set(
          value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ]
    : [];
}

export function readScenarioDescriptor(
  location: Pick<Location, "hostname" | "search">,
): ScenarioDescriptor | null {
  const search = new URLSearchParams(location.search);
  const id = search.get(SCENARIO_QUERY_PARAMETER)?.trim();

  if (!id) {
    return null;
  }

  assertLoopbackHost(location.hostname);

  return {
    id,
    overlays: parseList(search.get(SCENARIO_OVERLAYS_QUERY_PARAMETER)),
    persona: search.get(SCENARIO_PERSONA_QUERY_PARAMETER)?.trim() || null,
  };
}

export function isDevelopmentToolsRequested(searchValue: string) {
  const search = new URLSearchParams(searchValue);

  return (
    isDevelopmentToolsExplicitlyRequested(searchValue) ||
    Boolean(search.get(SCENARIO_QUERY_PARAMETER)?.trim())
  );
}

export function isDevelopmentToolsExplicitlyRequested(searchValue: string) {
  const search = new URLSearchParams(searchValue);

  return (
    search.has(DEVELOPMENT_TOOLS_SHORT_QUERY_PARAMETER) ||
    search.get(DEVELOPMENT_TOOLS_QUERY_PARAMETER) === "1"
  );
}

function assertLoopbackHost(hostname: string) {
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  ) {
    return;
  }

  throw new Error("Scenario Mode can only run on a loopback host.");
}
