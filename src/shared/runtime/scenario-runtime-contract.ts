import type { ComponentType } from "react";

export const scenarioExternalEffects = [
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
] as const;

export type ScenarioExternalEffect = (typeof scenarioExternalEffects)[number];

export interface ScenarioDescriptor {
  id: string;
  overlays: readonly string[];
  persona: string | null;
}

export interface ScenarioRuntimeFacade {
  allows(effect: ScenarioExternalEffect): boolean;
  bootstrap(): Promise<void>;
  descriptor(): ScenarioDescriptor | null;
  fetch: typeof globalThis.fetch;
  isActive(): boolean;
  loadDevelopmentTools(): Promise<ComponentType | null>;
  resolveMediaUrl(path: string): string | null;
}
