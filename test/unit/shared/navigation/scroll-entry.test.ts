import type { HistoryLocation } from "@tanstack/history";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getScrollEntryToken,
  initializeScrollEntryLedger,
  recordScrollEntryNavigation,
  resetScrollEntryLedgerForTests,
} from "@/shared/navigation/scroll-entry";

function location(index: number, href: string): HistoryLocation {
  const url = new URL(href, "https://findafew.test");
  return {
    hash: url.hash,
    href: `${url.pathname}${url.search}${url.hash}`,
    pathname: url.pathname,
    search: url.search,
    state: { __TSR_index: index, __TSR_key: `router-${index}` },
  };
}

describe("scroll entry ledger", () => {
  beforeEach(() => resetScrollEntryLedgerForTests());

  it("keeps tokens stable across Back and Forward", () => {
    const first = location(1, "/explore");
    initializeScrollEntryLedger(first);
    const firstToken = getScrollEntryToken(1, first.href);

    const pushed = location(2, "/explore?access=OPEN");
    recordScrollEntryNavigation({ type: "PUSH" }, pushed);
    const pushedToken = getScrollEntryToken(2, pushed.href);
    expect(pushedToken).not.toBe(firstToken);

    recordScrollEntryNavigation({ type: "BACK" }, first);
    expect(getScrollEntryToken(1, first.href)).toBe(firstToken);
    recordScrollEntryNavigation({ type: "FORWARD" }, pushed);
    expect(getScrollEntryToken(2, pushed.href)).toBe(pushedToken);
  });

  it("invalidates a discarded forward branch before index reuse", () => {
    const first = location(1, "/explore");
    const discarded = location(2, "/explore?access=OPEN");
    initializeScrollEntryLedger(first);
    recordScrollEntryNavigation({ type: "PUSH" }, discarded);
    const discardedToken = getScrollEntryToken(2, discarded.href);

    recordScrollEntryNavigation({ type: "BACK" }, first);
    const replacement = location(2, "/explore?access=OPEN");
    recordScrollEntryNavigation({ type: "PUSH" }, replacement);
    expect(getScrollEntryToken(2, replacement.href)).not.toBe(discardedToken);
  });

  it("keeps a token across same-entry replacements", () => {
    const first = location(1, "/explore");
    initializeScrollEntryLedger(first);
    const token = getScrollEntryToken(1, first.href);

    const replacement = location(1, "/explore?q=social");
    recordScrollEntryNavigation({ type: "REPLACE" }, replacement);
    expect(getScrollEntryToken(1, replacement.href)).toBe(token);
  });
});
