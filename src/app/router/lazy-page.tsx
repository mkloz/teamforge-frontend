import type { ComponentType } from "react";
import { Suspense } from "react";

import { RouteLoadingFallback } from "@/app/router/route-loading-fallback";

export function LazyPage({
  component: Component,
}: {
  component: ComponentType;
}) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Component />
    </Suspense>
  );
}
