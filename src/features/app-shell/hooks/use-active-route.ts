import { useRouterState } from "@tanstack/react-router";

/**
 * Returns the current pathname so nav items can derive their active state
 * without importing router internals directly in each component.
 */
export function useActiveRoute() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const isActive = (to: string) => pathname === to;
  const startsWith = (prefix: string) => pathname.startsWith(prefix);

  return { pathname, isActive, startsWith };
}
