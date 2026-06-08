import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface AppRouteTransitionProps {
  children: ReactNode;
}

export function AppRouteTransition({ children }: AppRouteTransitionProps) {
  const pathname = useRouterState({
    select: (state) => (state.resolvedLocation ?? state.location).pathname,
  });
  const hasViewportFixedContent = pathname.startsWith("/activity");

  return (
    <div className={hasViewportFixedContent ? "h-0" : "min-h-screen"}>
      {children}
    </div>
  );
}
