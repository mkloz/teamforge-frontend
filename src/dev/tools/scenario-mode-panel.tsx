import {
  type Activity,
  ArrowLeftRight,
  Check,
  CircleAlert,
  Copy,
  DatabaseZap,
  FlaskConical,
  ImageOff,
  Power,
  RotateCcw,
  ShieldAlert,
  TextCursorInput,
  UserRound,
  Wifi,
  X,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import {
  getScenarioCatalogEntry,
  type ScenarioFeature,
  scenarioCatalog,
} from "@/dev/scenarios/catalog/scenario-catalog";
import {
  DEVELOPMENT_TOOLS_SHORT_QUERY_PARAMETER,
  SCENARIO_OVERLAYS_QUERY_PARAMETER,
  SCENARIO_PERSONA_QUERY_PARAMETER,
  SCENARIO_QUERY_PARAMETER,
} from "@/dev/scenarios/runtime/scenario-selection";
import { getScenarioController } from "@/dev/scenarios/runtime/scenario-state";
import { DevToolIconButton } from "@/dev/tools/dev-tool-icon-button";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const commonOverlays = [
  { icon: DatabaseZap, id: "dense", label: "Dense" },
  { icon: TextCursorInput, id: "long-copy", label: "Long copy" },
  { icon: ImageOff, id: "missing-media", label: "No media" },
  { icon: ShieldAlert, id: "restricted", label: "Restricted" },
] as const;

const networkOverlays = [
  ["", "Normal"],
  ["network-slow", "Slow"],
  ["network-offline", "Offline"],
  ["network-403", "403"],
  ["network-409", "409"],
  ["network-422", "422"],
  ["network-429", "429"],
  ["network-500", "500"],
] as const;

const forgeSteps = [
  ["1", "Activity"],
  ["2", "Template"],
  ["3", "Plan"],
  ["4", "Group"],
  ["5", "Result"],
  ["6", "Details"],
  ["7", "Invite"],
] as const;

const emptyRequestSnapshot = [] as const;

function emptySubscribe() {
  return () => undefined;
}

interface ScenarioModePanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScenarioModePanel({
  isOpen,
  onOpenChange,
}: ScenarioModePanelProps) {
  const controller = getScenarioController();
  const [didCopy, setDidCopy] = useState(false);
  const [draftScenarioId, setDraftScenarioId] = useState(
    controller?.descriptor.id ?? "",
  );
  const [draftPersona, setDraftPersona] = useState(
    controller?.descriptor.persona ?? "default",
  );
  const [draftOverlays, setDraftOverlays] = useState<string[]>(() => [
    ...(controller?.descriptor.overlays ?? []),
  ]);
  const [draftForgeStep, setDraftForgeStep] = useState(() =>
    getForgeStepForScenario(controller?.descriptor.id ?? ""),
  );
  const requestRecords = useSyncExternalStore(
    controller ? (listener) => controller.subscribe(listener) : emptySubscribe,
    () => controller?.getRequestSnapshot() ?? emptyRequestSnapshot,
  );

  const requestCount = requestRecords.length;
  const catalogEntry = controller
    ? getScenarioCatalogEntry(controller.descriptor.id)
    : null;
  const draftCatalogEntry = getScenarioCatalogEntry(draftScenarioId);
  const baseOverlays = new Set(draftCatalogEntry?.overlays ?? []);
  const unmatchedCount = requestRecords.filter(
    (request) => request.status === 501,
  ).length;
  const networkErrorCount = requestRecords.filter(
    (request) => request.status === 0,
  ).length;
  const unmatchedRequests = [
    ...new Map(
      requestRecords
        .filter((request) => request.status === 501)
        .map((request) => [`${request.method}:${request.pathname}`, request]),
    ).values(),
  ].slice(-6);
  const selectedOverlays = new Set<string>([...baseOverlays, ...draftOverlays]);
  const selectedNetworkOverlay =
    [...selectedOverlays].find((overlay) => overlay.startsWith("network-")) ??
    "";
  const baseNetworkOverlay = [...baseOverlays].find((overlay) =>
    overlay.startsWith("network-"),
  );
  const hasPendingChanges = hasScenarioDraftChanged({
    controller,
    draftForgeStep,
    draftOverlays,
    draftPersona,
    draftScenarioId,
  });

  return (
    <section
      className="relative text-sm"
      data-scenario-id={controller?.descriptor.id}
      data-scenario-network-error-count={networkErrorCount}
      data-scenario-request-count={requestCount}
      data-scenario-request-statuses={requestRecords
        .map((request) => request.status)
        .join(",")}
      data-scenario-unmatched-count={unmatchedCount}
    >
      {isOpen ? (
        <div className="fade-in slide-in-from-top-2 fixed top-16 right-2 left-2 max-h-[calc(100dvh-5rem)] animate-in overflow-y-auto rounded-2xl border border-border/75 bg-card/98 p-4 shadow-2xl backdrop-blur-xl duration-200 motion-reduce:animate-none sm:left-auto sm:w-96 md:top-3 md:right-14 md:max-h-[calc(100dvh-1.5rem)]">
          <header className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                <FlaskConical aria-hidden="true" className="size-4" />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="font-black text-foreground">Scenario Mode</p>
                <p className="mt-0.5 text-muted-foreground text-xs leading-snug">
                  {controller
                    ? (catalogEntry?.title ?? controller.descriptor.id)
                    : "Choose a synthetic world without using the backend."}
                </p>
              </div>
            </div>
            <Button
              aria-label="Close Scenario Mode controls"
              onClick={() => onOpenChange(false)}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" />
            </Button>
          </header>

          {controller ? (
            <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
              <ScenarioMetric
                icon={ArrowLeftRight}
                label="Requests"
                value={String(requestCount)}
              />
              <ScenarioMetric
                icon={CircleAlert}
                label="Unmatched"
                tone={unmatchedCount > 0 ? "danger" : "default"}
                value={String(unmatchedCount)}
              />
              <ScenarioMetric
                icon={UserRound}
                label="Persona"
                value={formatPersona(
                  controller.descriptor.persona ??
                    catalogEntry?.persona ??
                    "member",
                )}
              />
            </div>
          ) : null}

          <div className="mt-5 grid gap-1.5">
            <p className="font-bold text-xs">Scenario</p>
            <Select
              onValueChange={(id) => {
                setDraftScenarioId(id);
                setDraftOverlays([]);
                setDraftPersona("default");
                setDraftForgeStep(getForgeStepForScenario(id));
              }}
              value={draftScenarioId || undefined}
            >
              <SelectTrigger
                aria-label="Scenario"
                className="h-10 bg-background"
              >
                <SelectValue placeholder="Choose a scenario" />
              </SelectTrigger>
              <SelectContent className="z-10001 max-h-80">
                {getFeatureGroups().map(([feature, scenarios]) => (
                  <SelectGroup key={feature}>
                    <SelectLabel>{formatFeature(feature)}</SelectLabel>
                    {scenarios.map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {draftCatalogEntry?.feature === "Forge" ? (
            <div className="mt-4 grid gap-1.5">
              <p className="font-bold text-xs">Open Forge at</p>
              <Select onValueChange={setDraftForgeStep} value={draftForgeStep}>
                <SelectTrigger
                  aria-label="Forge step"
                  className="h-10 bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-10001">
                  {forgeSteps.map(([step, label]) => (
                    <SelectItem key={step} value={step}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="px-0.5 text-muted-foreground text-xs">
                Opens that stage with coherent sample data.
              </p>
            </div>
          ) : null}

          {draftScenarioId ? (
            <>
              <fieldset className="mt-5 grid gap-2">
                <legend className="mb-2 font-bold text-xs">
                  State overlays
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {commonOverlays.map(({ icon: Icon, id, label }) => (
                    <Button
                      aria-pressed={selectedOverlays.has(id)}
                      disabled={baseOverlays.has(id)}
                      key={id}
                      onClick={() =>
                        setDraftOverlays((current) =>
                          toggleDraftOverlay(current, id),
                        )
                      }
                      size="xs"
                      title={
                        baseOverlays.has(id)
                          ? "Included by the selected scenario"
                          : undefined
                      }
                      type="button"
                      variant={
                        selectedOverlays.has(id) ? "primary" : "secondary"
                      }
                    >
                      {selectedOverlays.has(id) ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <Icon aria-hidden="true" />
                      )}
                      {label}
                    </Button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <p className="font-bold text-xs">Persona</p>
                  <Select onValueChange={setDraftPersona} value={draftPersona}>
                    <SelectTrigger aria-label="Persona" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-10001">
                      <SelectItem value="default">
                        {draftCatalogEntry?.persona
                          ? `Default · ${formatPersona(draftCatalogEntry.persona)}`
                          : "Scenario default"}
                      </SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="signed-out">Signed out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <p className="font-bold text-xs">Network</p>
                  <Select
                    disabled={Boolean(baseNetworkOverlay)}
                    onValueChange={(value) =>
                      setDraftOverlays((current) =>
                        setDraftNetworkOverlay(
                          current,
                          value === "normal" ? "" : value,
                        ),
                      )
                    }
                    value={
                      baseNetworkOverlay || selectedNetworkOverlay || "normal"
                    }
                  >
                    <SelectTrigger
                      aria-label="Network"
                      size="sm"
                      title={
                        baseNetworkOverlay
                          ? "Included by the selected scenario"
                          : undefined
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-10001">
                      {networkOverlays.map(([id, label]) => (
                        <SelectItem key={id || "normal"} value={id || "normal"}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {controller ? (
                <div className="mt-5 flex min-h-10 items-center gap-2 rounded-xl bg-background/75 px-3 py-2.5">
                  <Wifi
                    aria-hidden="true"
                    className={
                      unmatchedRequests.length > 0
                        ? "size-4 shrink-0 text-destructive"
                        : "size-4 shrink-0 text-muted-foreground"
                    }
                  />
                  {unmatchedRequests.length > 0 ? (
                    <div className="grid gap-1">
                      <p className="font-bold text-destructive text-xs">
                        Unmatched requests
                      </p>
                      {unmatchedRequests.map((request) => (
                        <p
                          className="truncate text-muted-foreground text-xs"
                          key={`${request.method}:${request.pathname}`}
                        >
                          {request.method} {request.pathname}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="truncate text-muted-foreground text-xs">
                      {requestRecords.at(-1)?.pathname ?? "No requests yet"}
                    </p>
                  )}
                </div>
              ) : null}

              <div className="mt-4 flex items-center gap-2">
                <Button
                  className="min-w-0 flex-1"
                  disabled={!hasPendingChanges}
                  onClick={() =>
                    applyScenarioDraft({
                      forgeStep: draftForgeStep,
                      id: draftScenarioId,
                      overlays: draftOverlays,
                      persona: draftPersona,
                    })
                  }
                  size="sm"
                  type="button"
                  variant="primary"
                >
                  <Check aria-hidden="true" />
                  Apply
                </Button>
                {controller ? (
                  <>
                    <Button
                      aria-label="Exit Scenario Mode"
                      onClick={() => exitScenarioMode()}
                      size="icon-sm"
                      title="Exit Scenario Mode"
                      type="button"
                      variant="ghost"
                    >
                      <Power aria-hidden="true" />
                    </Button>
                    <Button
                      aria-label="Reset synthetic world"
                      onClick={() => controller.reset()}
                      size="icon-sm"
                      title="Reset synthetic world"
                      type="button"
                      variant="secondary"
                    >
                      <RotateCcw aria-hidden="true" />
                    </Button>
                  </>
                ) : null}
                <Button
                  aria-label={
                    didCopy ? "Scenario URL copied" : "Copy scenario URL"
                  }
                  onClick={() =>
                    void copyScenarioUrl(
                      {
                        forgeStep: draftForgeStep,
                        id: draftScenarioId,
                        overlays: draftOverlays,
                        persona: draftPersona,
                      },
                      setDidCopy,
                    )
                  }
                  size="icon-sm"
                  title={didCopy ? "Scenario URL copied" : "Copy scenario URL"}
                  type="button"
                  variant="secondary"
                >
                  {didCopy ? (
                    <Check aria-hidden="true" />
                  ) : (
                    <Copy aria-hidden="true" />
                  )}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      <DevToolIconButton
        active={Boolean(controller)}
        expanded={isOpen}
        label={controller ? "Synthetic data" : "Scenario Mode"}
        onClick={() => onOpenChange(!isOpen)}
      >
        <FlaskConical aria-hidden="true" className="size-4" />
        {controller ? (
          <span
            aria-hidden="true"
            className="absolute top-0.5 right-0.5 size-2 rounded-full border border-card bg-primary"
          />
        ) : null}
      </DevToolIconButton>
    </section>
  );
}

function ScenarioMetric({
  icon: Icon,
  label,
  tone = "default",
  value,
}: {
  icon: typeof Activity;
  label: string;
  tone?: "danger" | "default";
  value: string;
}) {
  return (
    <div
      className="flex min-w-0 items-center gap-2"
      title={`${label}: ${value}`}
    >
      <span className="sr-only">{label}: </span>
      <Icon
        aria-hidden="true"
        className={
          tone === "danger"
            ? "size-4 shrink-0 text-destructive"
            : "size-4 shrink-0 text-muted-foreground"
        }
      />
      <p
        className={
          tone === "danger"
            ? "truncate font-black text-destructive"
            : "truncate font-black text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}

function formatPersona(persona: string) {
  return persona
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatFeature(feature: string) {
  return feature
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function getFeatureGroups() {
  const groups = new Map<ScenarioFeature, (typeof scenarioCatalog)[number][]>();
  for (const scenario of scenarioCatalog) {
    const entries = groups.get(scenario.feature) ?? [];
    entries.push(scenario);
    groups.set(scenario.feature, entries);
  }
  return [...groups.entries()];
}

interface ScenarioDraft {
  forgeStep: string;
  id: string;
  overlays: readonly string[];
  persona: string;
}

function toggleDraftOverlay(current: readonly string[], overlay: string) {
  const values = new Set(current);
  if (values.has(overlay)) {
    values.delete(overlay);
  } else {
    values.add(overlay);
  }
  return [...values];
}

function setDraftNetworkOverlay(current: readonly string[], overlay: string) {
  const values = new Set(current);
  for (const value of values) {
    if (value.startsWith("network-")) {
      values.delete(value);
    }
  }
  if (overlay) {
    values.add(overlay);
  }
  return [...values];
}

function hasScenarioDraftChanged({
  controller,
  draftForgeStep,
  draftOverlays,
  draftPersona,
  draftScenarioId,
}: {
  controller: ReturnType<typeof getScenarioController>;
  draftForgeStep: string;
  draftOverlays: readonly string[];
  draftPersona: string;
  draftScenarioId: string;
}) {
  if (!controller) {
    return Boolean(draftScenarioId);
  }

  return (
    draftScenarioId !== controller.descriptor.id ||
    draftForgeStep !== getForgeStepForScenario(controller.descriptor.id) ||
    normalizePersona(draftPersona) !== (controller.descriptor.persona ?? "") ||
    normalizeOverlayList(draftOverlays) !==
      normalizeOverlayList(controller.descriptor.overlays)
  );
}

function normalizePersona(persona: string) {
  return persona === "default" ? "" : persona;
}

function normalizeOverlayList(overlays: readonly string[]) {
  return [...new Set(overlays)].sort().join(",");
}

function buildScenarioUrl({ forgeStep, id, overlays, persona }: ScenarioDraft) {
  const scenario = getScenarioCatalogEntry(id);
  const url = new URL(
    scenario?.route ?? window.location.pathname,
    window.location.origin,
  );
  url.searchParams.set(SCENARIO_QUERY_PARAMETER, id);

  if (scenario?.feature === "Forge" && forgeStep) {
    url.searchParams.set("step", forgeStep);
  }

  const normalizedPersona = normalizePersona(persona);
  if (normalizedPersona) {
    url.searchParams.set(SCENARIO_PERSONA_QUERY_PARAMETER, normalizedPersona);
  }
  setOverlayParameter(url, new Set(overlays));

  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.has(DEVELOPMENT_TOOLS_SHORT_QUERY_PARAMETER)) {
    url.searchParams.set(DEVELOPMENT_TOOLS_SHORT_QUERY_PARAMETER, "");
  }

  return url;
}

function getForgeStepForScenario(id: string) {
  const scenario = getScenarioCatalogEntry(id);
  if (scenario?.feature !== "Forge") {
    return "";
  }

  const currentUrl = new URL(window.location.href);
  if (currentUrl.searchParams.get(SCENARIO_QUERY_PARAMETER) === id) {
    return normalizeForgeStep(currentUrl.searchParams.get("step"));
  }

  const scenarioUrl = new URL(scenario.route, window.location.origin);
  return normalizeForgeStep(scenarioUrl.searchParams.get("step"));
}

function normalizeForgeStep(value: string | null) {
  const step = Number(value);

  return Number.isInteger(step) && step >= 1 && step <= 7 ? String(step) : "1";
}

function applyScenarioDraft(draft: ScenarioDraft) {
  window.location.assign(buildScenarioUrl(draft));
}

function setOverlayParameter(url: URL, values: Set<string>) {
  const value = [...values].sort().join(",");
  if (value) {
    url.searchParams.set(SCENARIO_OVERLAYS_QUERY_PARAMETER, value);
  } else {
    url.searchParams.delete(SCENARIO_OVERLAYS_QUERY_PARAMETER);
  }
}

function exitScenarioMode() {
  const url = new URL(window.location.href);
  url.searchParams.delete(SCENARIO_QUERY_PARAMETER);
  url.searchParams.delete(SCENARIO_PERSONA_QUERY_PARAMETER);
  url.searchParams.delete(SCENARIO_OVERLAYS_QUERY_PARAMETER);
  url.searchParams.set(DEVELOPMENT_TOOLS_SHORT_QUERY_PARAMETER, "1");
  window.location.assign(url);
}

async function copyScenarioUrl(
  draft: ScenarioDraft,
  setDidCopy: (value: boolean) => void,
) {
  const url = buildScenarioUrl(draft).href;
  try {
    await navigator.clipboard.writeText(url);
    setDidCopy(true);
    window.setTimeout(() => setDidCopy(false), 1_500);
  } catch {
    window.prompt("Copy this Scenario Mode URL", url);
  }
}
