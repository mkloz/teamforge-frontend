import type { ComponentType } from "react";

import { LazyPage } from "@/app/router/lazy-page";

export function createLazyPageRoute(Component: ComponentType) {
  return function LazyPageRoute() {
    return <LazyPage component={Component} />;
  };
}
