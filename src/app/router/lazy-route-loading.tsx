import { type ComponentType, createElement, Suspense } from "react";

import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import { RouteLoadingFallback } from "@/shared/components/loading/route-loading-fallback";

type PageLoadingModule<Props extends PageLoadingProps> = {
  default: ComponentType<Props>;
};

export type LazyRouteLoadingComponent = ComponentType & {
  preload: () => Promise<void>;
};

export function createLazyRouteLoading<
  Props extends PageLoadingProps = PageLoadingProps,
>(load: () => Promise<PageLoadingModule<Props>>, props: Props) {
  let preloadPromise: Promise<void> | null = null;
  let LoadedComponent: ComponentType<Props> | null = null;

  function preload() {
    preloadPromise ??= load().then((module) => {
      LoadedComponent = module.default;

      return undefined;
    });

    return preloadPromise;
  }

  function LoadingContent() {
    if (LoadedComponent) {
      return createElement(LoadedComponent, props);
    }

    throw preload();
  }

  return Object.assign(
    function LazyRouteLoading() {
      return (
        <Suspense fallback={<RouteLoadingFallback />}>
          <LoadingContent />
        </Suspense>
      );
    },
    { preload },
  ) satisfies LazyRouteLoadingComponent;
}
