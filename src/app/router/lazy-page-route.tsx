import type { ComponentType, ReactNode } from "react";

import { LazyPage } from "@/app/router/lazy-page";

export function createLazyPageRoute(
  Component: ComponentType,
  fallback?: ReactNode,
) {
  return function LazyPageRoute() {
    return <LazyPage component={Component} fallback={fallback} />;
  };
}
