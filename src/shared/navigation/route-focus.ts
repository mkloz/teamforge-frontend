import type { ParsedHistoryState } from "@tanstack/history";

const ROUTE_FOCUS_KEY_PATTERN = /^[a-z0-9][a-z0-9:_-]{0,159}$/i;

export interface RouteFocusReturnEntry {
  key: string;
  version: 1;
}

declare module "@tanstack/history" {
  interface HistoryState {
    findafewReturnFocus?: RouteFocusReturnEntry;
  }
}

export function createRouteFocusKey(scope: string, entityId: string) {
  const key = `${scope}:${entityId}`;

  if (!isValidRouteFocusKey(key)) {
    throw new Error("Route focus keys must be short, stable identifiers.");
  }

  return key;
}

export function withRouteFocusReturn(
  previousState: ParsedHistoryState,
  key: string,
): ParsedHistoryState {
  if (!isValidRouteFocusKey(key)) {
    return previousState;
  }

  return {
    ...previousState,
    findafewReturnFocus: {
      key,
      version: 1,
    },
  };
}

export function readRouteFocusReturn(
  state: unknown,
): RouteFocusReturnEntry | null {
  if (!isRecord(state) || !isRecord(state.findafewReturnFocus)) {
    return null;
  }

  const entry = state.findafewReturnFocus;

  return entry.version === 1 && isValidRouteFocusKey(entry.key)
    ? { key: entry.key, version: 1 }
    : null;
}

export function getRouteFocusDirection(
  fromState: unknown,
  toState: unknown,
): "back" | "forward" {
  const fromIndex = readHistoryIndex(fromState);
  const toIndex = readHistoryIndex(toState);

  return fromIndex !== null && toIndex !== null && toIndex < fromIndex
    ? "back"
    : "forward";
}

export function isValidRouteFocusKey(value: unknown): value is string {
  return typeof value === "string" && ROUTE_FOCUS_KEY_PATTERN.test(value);
}

function readHistoryIndex(state: unknown) {
  if (!isRecord(state)) {
    return null;
  }

  return typeof state.__TSR_index === "number" ? state.__TSR_index : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
