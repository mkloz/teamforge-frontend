import { type ComponentType, createElement } from "react";

type LazyRouteImport = () => Promise<{ default: ComponentType }>;
type PreloadableRouteComponent = ComponentType & {
  preload: () => Promise<void>;
};

export interface LazyRouteModule {
  Component: PreloadableRouteComponent;
  preload: () => Promise<void>;
}

export function createLazyRouteModule(load: LazyRouteImport): LazyRouteModule {
  let preloadPromise: Promise<void> | null = null;
  let LoadedComponent: ComponentType | null = null;

  function preload() {
    preloadPromise ??= load().then((module) => {
      LoadedComponent = module.default;

      return undefined;
    });

    return preloadPromise;
  }

  const Component = Object.assign(
    function LazyRouteComponent() {
      if (LoadedComponent) {
        return createElement(LoadedComponent);
      }

      throw preload();
    },
    { preload },
  );

  return {
    Component,
    preload,
  };
}
