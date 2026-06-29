import type { ComponentType, ReactNode } from "react";
import { Suspense } from "react";

import { RouteLoadingFallback } from "@/shared/components/loading/route-loading-fallback";

export function LazyPage({
  component: Component,
  fallback,
}: {
  component: ComponentType;
  fallback?: ReactNode;
}) {
  const suspenseFallback =
    fallback === undefined ? <RouteLoadingFallback /> : fallback;

  return (
    <Suspense fallback={suspenseFallback}>
      <Component />
    </Suspense>
  );
}
