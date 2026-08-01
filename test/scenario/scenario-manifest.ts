import {
  type ScenarioCatalogEntry,
  scenarioCatalog,
} from "../../src/dev/scenarios/catalog/scenario-catalog";

export type ScenarioAuditProfile = "full" | "smoke";

export type ScenarioAuditRecipe = "notifications-drawer";

const smokeScenarioIds = new Set([
  "standard",
  "empty",
  "home-dense",
  "activity-standard",
  "notifications-dense",
  "explore-standard",
  "forge-standard",
  "group-member",
  "profile-owner",
  "settings-standard",
  "safety-active",
  "admin-standard",
  "admin-worker-degraded",
]);

const recipeByScenarioId: Readonly<Record<string, ScenarioAuditRecipe>> = {
  "notifications-dense": "notifications-drawer",
  "notifications-empty": "notifications-drawer",
  "notifications-long-copy": "notifications-drawer",
  "notifications-standard": "notifications-drawer",
};

export function getScenarioAuditEntries(profile: ScenarioAuditProfile) {
  return scenarioCatalog.filter(
    (entry) => profile === "full" || smokeScenarioIds.has(entry.id),
  );
}

export function getScenarioAuditUrl(entry: ScenarioCatalogEntry) {
  const url = new URL(entry.route, "http://scenario.local");
  url.searchParams.set("__scenario", entry.id);
  if (entry.overlays?.length) {
    url.searchParams.set("__overlays", [...entry.overlays].sort().join(","));
  }
  if (entry.persona) {
    url.searchParams.set("__persona", entry.persona);
  }
  return `${url.pathname}${url.search}`;
}

export function getScenarioAuditRecipe(id: string) {
  return recipeByScenarioId[id] ?? null;
}
