import { useRouterState } from "@tanstack/react-router";
import { getScrollEntryToken } from "@/shared/navigation/scroll-entry";

export interface StableScrollEntry {
  href: string;
  index: number | null;
  token: string;
}

export function useScrollEntry(): StableScrollEntry {
  const location = useRouterState({
    select: (state) => state.location,
  });
  const index =
    typeof location.state.__TSR_index === "number"
      ? location.state.__TSR_index
      : null;

  return {
    href: location.href,
    index,
    token: getScrollEntryToken(index, location.href),
  };
}
