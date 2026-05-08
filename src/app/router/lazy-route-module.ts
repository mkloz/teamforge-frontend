import { type ComponentType, lazy } from "react";

type LazyRouteImport = () => Promise<{ default: ComponentType }>;

export interface LazyRouteModule {
  Component: ComponentType;
  preload: () => Promise<{ default: ComponentType }>;
}

export function createLazyRouteModule(load: LazyRouteImport): LazyRouteModule {
  let preloadPromise: Promise<{ default: ComponentType }> | null = null;

  function preload() {
    preloadPromise ??= load();
    return preloadPromise;
  }

  return {
    Component: lazy(preload),
    preload,
  };
}
