import { prepareScenarioProductState } from "@/dev/scenarios/runtime/prepare-scenario-product-state";
import { ScenarioController } from "@/dev/scenarios/runtime/scenario-controller";
import { handleScenarioRequest } from "@/dev/scenarios/runtime/scenario-handler";
import { resolveScenarioMediaUrl } from "@/dev/scenarios/runtime/scenario-media";
import { installScenarioNavigationPersistence } from "@/dev/scenarios/runtime/scenario-navigation";
import {
  isDevelopmentToolsExplicitlyRequested,
  isDevelopmentToolsRequested,
  readScenarioDescriptor,
} from "@/dev/scenarios/runtime/scenario-selection";
import { setScenarioController } from "@/dev/scenarios/runtime/scenario-state";
import { authSession } from "@/shared/api/auth-session";
import type {
  ScenarioExternalEffect,
  ScenarioRuntimeFacade,
} from "@/shared/runtime/scenario-runtime-contract";

const SCENARIO_RUNTIME_SENTINEL = "__TEAMFORGE_SCENARIO_RUNTIME__";
const SCENARIO_RELEASE_FAULTS_EVENT = "teamforge:scenario-release-faults";
const blockedEffects = new Set<ScenarioExternalEffect>([
  "audio",
  "clipboard",
  "geolocation",
  "giphy",
  "google-auth",
  "maps",
  "media",
  "pwa",
  "push",
  "realtime",
  "route-preload",
  "share",
  "telemetry",
  "upload",
]);

let descriptor = readScenarioDescriptor(window.location);
let controller = descriptor ? new ScenarioController(descriptor) : null;
let restoreScenarioNavigation: (() => void) | null = null;
setScenarioController(controller);

window.addEventListener(SCENARIO_RELEASE_FAULTS_EVENT, (event) => {
  const detail =
    event instanceof CustomEvent && isScenarioRequestMatcher(event.detail)
      ? event.detail
      : {};
  controller?.releaseFaults(detail);
});

const scenarioFetch: typeof globalThis.fetch = (...args) => {
  if (!descriptor) {
    return globalThis.fetch(...args);
  }

  const request = new Request(...args);

  return controller
    ? handleScenarioRequest(controller, request)
    : globalThis.fetch(request);
};

export const scenarioRuntime: ScenarioRuntimeFacade = Object.freeze({
  allows(effect: ScenarioExternalEffect) {
    return !descriptor || !blockedEffects.has(effect);
  },
  async bootstrap() {
    restoreScenarioNavigation?.();
    restoreScenarioNavigation = null;
    descriptor = readScenarioDescriptor(window.location);
    controller = descriptor ? new ScenarioController(descriptor) : null;
    setScenarioController(controller);
    prepareScenarioProductState(controller, window.location.search);
    const developmentToolsEnabled = isDevelopmentToolsRequested(
      window.location.search,
    );
    const preserveDevelopmentTools = isDevelopmentToolsExplicitlyRequested(
      window.location.search,
    );

    if (descriptor || developmentToolsEnabled) {
      restoreScenarioNavigation = installScenarioNavigationPersistence({
        descriptor,
        preserveDevelopmentTools,
        history: window.history,
        location: window.location,
      });
    }

    if (descriptor) {
      if (controller?.world.account.authenticated) {
        authSession.setTokens({
          accessToken: "scenario-access-token",
          refreshToken: "scenario-refresh-token",
        });
      } else {
        authSession.clear();
      }

      document.documentElement.dataset.scenarioMode = "active";
      Object.defineProperty(window, SCENARIO_RUNTIME_SENTINEL, {
        configurable: true,
        value: descriptor.id,
      });
    } else {
      document.documentElement.removeAttribute("data-scenario-mode");
      Reflect.deleteProperty(window, SCENARIO_RUNTIME_SENTINEL);
    }
  },
  descriptor() {
    return descriptor;
  },
  fetch: scenarioFetch,
  isActive() {
    return descriptor !== null;
  },
  async loadDevelopmentTools() {
    if (!isDevelopmentToolsRequested(window.location.search)) {
      return null;
    }

    const { DevTools } = await import("@/dev/tools/dev-tools");

    return DevTools;
  },
  resolveMediaUrl(path: string) {
    return descriptor ? resolveScenarioMediaUrl(path) : null;
  },
});

function isScenarioRequestMatcher(
  value: unknown,
): value is { method?: string; pathname?: string } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const matcher = value as { method?: unknown; pathname?: unknown };
  return (
    (matcher.method === undefined || typeof matcher.method === "string") &&
    (matcher.pathname === undefined || typeof matcher.pathname === "string")
  );
}
