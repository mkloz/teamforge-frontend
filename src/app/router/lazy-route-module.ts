import { type ComponentType, createElement } from "react";

type LazyRouteImport = () => Promise<{ default: ComponentType }>;
type PreloadableRouteComponent = ComponentType & {
  preload: () => Promise<{ default: ComponentType }>;
};

export interface LazyRouteModule {
  Component: PreloadableRouteComponent;
  preload: () => Promise<{ default: ComponentType }>;
}

export function createLazyRouteModule(load: LazyRouteImport): LazyRouteModule {
  let preloadPromise: Promise<{ default: ComponentType }> | null = null;
  let LoadedComponent: ComponentType | null = null;

  function preload() {
    preloadPromise ??= load().then((module) => {
      LoadedComponent = module.default;

      return module;
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
