import { buildScenarioWorld } from "@/dev/scenarios/world/build-scenario-world";
import type { ScenarioWorld } from "@/dev/scenarios/world/scenario-world";
import type { ScenarioDescriptor } from "@/shared/runtime/scenario-runtime-contract";

export interface ScenarioRequestRecord {
  method: string;
  pathname: string;
  status: number;
}

export interface ScenarioRequestMatcher {
  method?: string;
  pathname?: string;
}

interface HeldScenarioRequest {
  method: string;
  pathname: string;
  resolve: () => void;
}

export class ScenarioController {
  private readonly heldRequests: HeldScenarioRequest[] = [];
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
    this.releaseHeldRequests();
    this.requests.length = 0;
    this.requestSnapshot = [];
    this.world = buildScenarioWorld(this.descriptor);
    this.emitChange();
  }

  getRequestSnapshot() {
    return this.requestSnapshot;
  }

  waitForFaultRelease({ method, pathname }: Required<ScenarioRequestMatcher>) {
    return new Promise<void>((resolve) => {
      this.heldRequests.push({ method, pathname, resolve });
    });
  }

  clearPendingRequest({ method, pathname }: Required<ScenarioRequestMatcher>) {
    let index = -1;
    for (
      let candidateIndex = this.requests.length - 1;
      candidateIndex >= 0;
      candidateIndex -= 1
    ) {
      const request = this.requests[candidateIndex];
      if (
        request.method === method &&
        request.pathname === pathname &&
        request.status === 102
      ) {
        index = candidateIndex;
        break;
      }
    }
    if (index >= 0) {
      this.requests.splice(index, 1);
      this.requestSnapshot = [...this.requests];
      this.emitChange();
    }
  }

  releaseFaults(matcher: ScenarioRequestMatcher = {}) {
    const retainedFaults = this.world.faults.filter(
      (fault) => !matchesRequest(matcher, fault),
    );
    const releasedFaultCount = this.world.faults.length - retainedFaults.length;
    this.world.faults.splice(0, this.world.faults.length, ...retainedFaults);
    const releasedRequestCount = this.releaseHeldRequests(matcher);

    return { releasedFaultCount, releasedRequestCount };
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

  private releaseHeldRequests(matcher: ScenarioRequestMatcher = {}) {
    let released = 0;
    for (let index = this.heldRequests.length - 1; index >= 0; index -= 1) {
      const request = this.heldRequests[index];
      if (!matchesRequest(matcher, request)) {
        continue;
      }
      this.heldRequests.splice(index, 1);
      request.resolve();
      released += 1;
    }
    return released;
  }
}

function matchesRequest(
  matcher: ScenarioRequestMatcher,
  candidate: ScenarioRequestMatcher,
) {
  return (
    (!matcher.method || matcher.method === candidate.method) &&
    (!matcher.pathname || matcher.pathname === candidate.pathname)
  );
}
