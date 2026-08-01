import { buildScenarioWorld } from "@/dev/scenarios/world/build-scenario-world";
import type { ScenarioWorld } from "@/dev/scenarios/world/scenario-world";
import type { ScenarioDescriptor } from "@/shared/runtime/scenario-runtime-contract";

export interface ScenarioRequestRecord {
  method: string;
  pathname: string;
  status: number;
}

export class ScenarioController {
  private readonly listeners = new Set<() => void>();
  private requestSnapshot: readonly ScenarioRequestRecord[] = [];
  readonly descriptor: ScenarioDescriptor;
  readonly requests: ScenarioRequestRecord[] = [];
  world: ScenarioWorld;

  constructor(descriptor: ScenarioDescriptor) {
    this.descriptor = descriptor;
    this.world = buildScenarioWorld(descriptor);
  }

  recordRequest(record: ScenarioRequestRecord) {
    this.requests.push(record);
    this.requestSnapshot = [...this.requests];
    this.emitChange();
  }

  reset() {
    this.requests.length = 0;
    this.requestSnapshot = [];
    this.world = buildScenarioWorld(this.descriptor);
    this.emitChange();
  }

  getRequestSnapshot() {
    return this.requestSnapshot;
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitChange() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
