import { beforeEach, describe, expect, it, vi } from "vitest";

const browserState = vi.hoisted(() => ({
  connection: null as {
    effectiveType: string | null;
    saveData: boolean;
  } | null,
  isOnline: true,
  isVisible: true,
}));

vi.mock("@/shared/lib/browser-environment", () => ({
  getBrowserDocument: () => null,
  getBrowserNetworkInformation: () => browserState.connection,
  isBrowserDocumentVisible: () => browserState.isVisible,
  isBrowserOnline: () => browserState.isOnline,
}));

import {
  createRouteModuleLoader,
  getRoutePreloadBudget,
} from "@/app/router/app-routes/route-preloading";

describe("authenticated route preload policy", () => {
  beforeEach(() => {
    browserState.connection = null;
    browserState.isOnline = true;
    browserState.isVisible = true;
  });

  it("always preserves actual navigation loading", () => {
    browserState.isOnline = false;
    browserState.isVisible = false;
    browserState.connection = { effectiveType: "slow-2g", saveData: true };

    expect(getRoutePreloadBudget(false)).toBe("navigation");
  });

  it.each([
    { connection: null, online: false, visible: true },
    { connection: null, online: true, visible: false },
    {
      connection: { effectiveType: "4g", saveData: true },
      online: true,
      visible: true,
    },
    {
      connection: { effectiveType: "slow-2g", saveData: false },
      online: true,
      visible: true,
    },
    {
      connection: { effectiveType: "2g", saveData: false },
      online: true,
      visible: true,
    },
  ])("blocks constrained speculation: $connection", (state) => {
    browserState.connection = state.connection;
    browserState.isOnline = state.online;
    browserState.isVisible = state.visible;

    expect(getRoutePreloadBudget(true)).toBe("none");
  });

  it.each([
    null,
    { effectiveType: "3g", saveData: false },
    { effectiveType: "4g", saveData: false },
  ])("allows only the intended module on an eligible connection: %s", (connection) => {
    browserState.connection = connection;
    expect(getRoutePreloadBudget(true)).toBe("module-only");
  });

  it("re-reads the environment and never loads a speculative loading screen", async () => {
    const modulePreload = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const loadingPreload = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const Component = Object.assign(() => null, { preload: modulePreload });
    const Loading = Object.assign(() => null, { preload: loadingPreload });
    const loader = createRouteModuleLoader(
      { Component, preload: modulePreload },
      Loading,
    );

    await loader({ preload: true });
    expect(modulePreload).toHaveBeenCalledTimes(1);
    expect(loadingPreload).not.toHaveBeenCalled();

    browserState.connection = { effectiveType: "2g", saveData: false };
    await loader({ preload: true });
    expect(modulePreload).toHaveBeenCalledTimes(1);

    await loader({ preload: false });
    expect(modulePreload).toHaveBeenCalledTimes(2);
    expect(loadingPreload).toHaveBeenCalledTimes(1);
  });
});
