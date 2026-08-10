import type { ParsedHistoryState } from "@tanstack/history";

export const HISTORY_LAYER_IDS = [
  "settings-detail",
  "notifications",
  "notification-detail",
  "activity-conversation",
  "activity-panel",
  "explore-filters",
] as const;

export type HistoryLayerId = (typeof HISTORY_LAYER_IDS)[number];

export interface FindafewHistoryLayerEntry {
  id: HistoryLayerId;
  parentKey: string | null;
  version: 1;
}

declare module "@tanstack/history" {
  interface HistoryState {
    findafewHistoryLayer?: FindafewHistoryLayerEntry;
  }
}

export function withHistoryLayerEntry(
  previousState: ParsedHistoryState,
  id: HistoryLayerId,
): ParsedHistoryState {
  return {
    ...previousState,
    findafewHistoryLayer: {
      id,
      parentKey: previousState.__TSR_key ?? null,
      version: 1,
    },
  };
}

export function withoutHistoryLayerEntry(
  previousState: ParsedHistoryState,
): ParsedHistoryState {
  const { findafewHistoryLayer: _removedEntry, ...nextState } = previousState;

  return nextState;
}

export function isCurrentHistoryLayerEntry(
  state: unknown,
  id: HistoryLayerId,
): state is ParsedHistoryState & {
  findafewHistoryLayer: FindafewHistoryLayerEntry;
} {
  if (!isRecord(state)) {
    return false;
  }

  const entry = state.findafewHistoryLayer;

  return (
    isRecord(entry) &&
    entry.version === 1 &&
    entry.id === id &&
    (typeof entry.parentKey === "string" || entry.parentKey === null)
  );
}

export function resolveHistoryLayerDismissal({
  canGoBack,
  id,
  state,
}: {
  canGoBack: boolean;
  id: HistoryLayerId;
  state: unknown;
}): "back" | "replace" {
  return canGoBack && isCurrentHistoryLayerEntry(state, id)
    ? "back"
    : "replace";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
