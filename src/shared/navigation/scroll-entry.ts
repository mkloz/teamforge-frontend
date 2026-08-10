import type { HistoryLocation } from "@tanstack/history";

type ScrollHistoryAction =
  | { type: "BACK" | "FORWARD" | "PUSH" | "REPLACE" }
  | { index: number; type: "GO" };

interface ScrollEntryRecord {
  href: string;
  token: string;
}

const scrollEntries = new Map<number, ScrollEntryRecord>();
let scrollEntrySequence = 0;

export function initializeScrollEntryLedger(location: HistoryLocation) {
  const index = location.state.__TSR_index;
  if (!scrollEntries.has(index)) {
    scrollEntries.set(index, createScrollEntryRecord(location.href));
  }
}

export function recordScrollEntryNavigation(
  action: ScrollHistoryAction,
  location: HistoryLocation,
) {
  const index = location.state.__TSR_index;

  if (action.type === "PUSH") {
    for (const candidateIndex of scrollEntries.keys()) {
      if (candidateIndex >= index) scrollEntries.delete(candidateIndex);
    }
    scrollEntries.set(index, createScrollEntryRecord(location.href));
    return;
  }

  const existing = scrollEntries.get(index);
  if (action.type === "REPLACE" && existing) {
    scrollEntries.set(index, { ...existing, href: location.href });
    return;
  }

  if (!existing) {
    scrollEntries.set(index, createScrollEntryRecord(location.href));
  }
}

export function getScrollEntryToken(index: number | null, href: string) {
  if (index === null) return `scroll:href:${href}`;
  const existing = scrollEntries.get(index);
  if (existing) return existing.token;

  const record = createScrollEntryRecord(href);
  scrollEntries.set(index, record);
  return record.token;
}

export function resetScrollEntryLedgerForTests() {
  scrollEntries.clear();
  scrollEntrySequence = 0;
}

function createScrollEntryRecord(href: string): ScrollEntryRecord {
  scrollEntrySequence += 1;
  return { href, token: `scroll:entry-${scrollEntrySequence}` };
}
