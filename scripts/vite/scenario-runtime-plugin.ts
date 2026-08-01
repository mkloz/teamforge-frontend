import path from "node:path";
import type { Plugin } from "vite";

const SCENARIO_RUNTIME_MODULE_ID = "virtual:teamforge-scenario-runtime";
const RESOLVED_NOOP_MODULE_ID = `\0${SCENARIO_RUNTIME_MODULE_ID}:noop`;

const NOOP_RUNTIME_SOURCE = `
const nativeFetch = (...args) => globalThis.fetch(...args);

export const scenarioRuntime = Object.freeze({
  allows: () => true,
  bootstrap: async () => undefined,
  descriptor: () => null,
  fetch: nativeFetch,
  isActive: () => false,
  loadDevelopmentTools: async () => null,
  resolveMediaUrl: () => null,
});
`;

interface ScenarioRuntimePluginOptions {
  includeRuntime: boolean;
}

export function scenarioRuntimePlugin({
  includeRuntime,
}: ScenarioRuntimePluginOptions): Plugin {
  return {
    name: "teamforge-scenario-runtime",
    resolveId(source) {
      if (source !== SCENARIO_RUNTIME_MODULE_ID) {
        return null;
      }

      return includeRuntime
        ? path.resolve(process.cwd(), "src/dev/scenarios/entry.ts")
        : RESOLVED_NOOP_MODULE_ID;
    },
    load(id) {
      return id === RESOLVED_NOOP_MODULE_ID ? NOOP_RUNTIME_SOURCE : null;
    },
  };
}
