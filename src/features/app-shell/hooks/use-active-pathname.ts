import { useRouterState } from "@tanstack/react-router";

export function useActivePathname() {
  return useRouterState({
    select: (state) => state.location.pathname,
  });
}
