import type { ComponentType, ReactNode } from "react";
import { Suspense } from "react";

import { RouteLoadingFallback } from "@/shared/components/loading/route-loading-fallback";

export function LazyPage({
  component: Component,
  fallback = <RouteLoadingFallback />,
}: {
  component: ComponentType;
  fallback?: ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
}
