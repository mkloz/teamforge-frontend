import { Suspense } from "react";
import type { ComponentType } from "react";

export function LazyPage({
  component: Component,
}: {
  component: ComponentType;
}) {
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
}
