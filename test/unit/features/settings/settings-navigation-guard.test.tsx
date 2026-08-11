// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SettingsNavigationGuardProvider,
  useSettingsDraftGuard,
  useSettingsOverlayGuard,
  useSettingsPendingGuard,
} from "@/features/settings/components/settings-navigation-guard";

interface CapturedBlockerOptions {
  disabled: boolean;
  shouldBlockFn: (options: { action: string }) => boolean;
}

const routerBlocker = vi.hoisted(() => ({
  options: null as CapturedBlockerOptions | null,
  result: {
    proceed: vi.fn<() => void>(),
    reset: vi.fn<() => void>(),
    status: "idle" as "blocked" | "idle",
  },
}));

vi.mock("@tanstack/react-router", () => ({
  useBlocker: (options: CapturedBlockerOptions) => {
    routerBlocker.options = options;
    return routerBlocker.result;
  },
}));

describe("SettingsNavigationGuardProvider", () => {
  beforeEach(() => {
    routerBlocker.options = null;
    routerBlocker.result.status = "idle";
    routerBlocker.result.proceed.mockReset();
    routerBlocker.result.reset.mockReset();
  });

  it("allows confirmed PUSH navigation even when an overlay and draft are active", async () => {
    const closeOverlay = vi.fn<() => void>();
    renderGuard(
      <>
        <DraftProbe />
        <OverlayProbe close={closeOverlay} />
      </>,
    );

    const options = await getEnabledBlockerOptions();
    expect(options.shouldBlockFn({ action: "PUSH" })).toBe(false);
    expect(options.shouldBlockFn({ action: "REPLACE" })).toBe(false);
    expect(closeOverlay).not.toHaveBeenCalled();
  });

  it("still consumes Back at the top overlay", async () => {
    const closeOverlay = vi.fn<() => void>();
    const view = renderGuard(<OverlayProbe close={closeOverlay} />);
    const options = await getEnabledBlockerOptions();

    expect(options.shouldBlockFn({ action: "BACK" })).toBe(true);
    routerBlocker.result = {
      ...routerBlocker.result,
      status: "blocked",
    };
    view.rerender(
      <GuardShell>
        <OverlayProbe close={closeOverlay} />
      </GuardShell>,
    );

    await waitFor(() => expect(closeOverlay).toHaveBeenCalledOnce());
    expect(routerBlocker.result.reset).toHaveBeenCalledOnce();
  });

  it("uses honest copy when leaving during a pending request", async () => {
    const view = renderGuard(<PendingProbe />);
    const options = await getEnabledBlockerOptions();

    expect(options.shouldBlockFn({ action: "PUSH" })).toBe(true);
    routerBlocker.result = {
      ...routerBlocker.result,
      status: "blocked",
    };
    view.rerender(
      <GuardShell>
        <PendingProbe />
      </GuardShell>,
    );

    expect(
      await screen.findByText("Leave while an update is in progress?"),
    ).toBeVisible();
    expect(
      screen.getByText(
        "This update may still finish after you leave this settings page.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Leave page" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Discard changes" }),
    ).not.toBeInTheDocument();
  });
});

function DraftProbe() {
  useSettingsDraftGuard("test-draft", true);
  return null;
}

function OverlayProbe({ close }: { close: () => void }) {
  useSettingsOverlayGuard(true, close);
  return null;
}

function PendingProbe() {
  useSettingsPendingGuard("test-pending", true);
  return null;
}

function GuardShell({ children }: { children: ReactNode }) {
  return (
    <SettingsNavigationGuardProvider isMobile={true}>
      {children}
    </SettingsNavigationGuardProvider>
  );
}

function renderGuard(children: ReactNode) {
  return render(<GuardShell>{children}</GuardShell>);
}

async function getEnabledBlockerOptions() {
  await waitFor(() => expect(routerBlocker.options?.disabled).toBe(false));
  const options = routerBlocker.options;
  if (!options) {
    throw new Error("Expected Settings navigation blocker options");
  }
  return options;
}
