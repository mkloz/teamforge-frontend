import { useRouterState } from "@tanstack/react-router";
import { useResetScrollOnChange } from "@/shared/hooks/use-reset-scroll-on-change";

const EXPLORE_SCROLL_KEYS = [
  "access",
  "category",
  "distance",
  "from",
  "location",
  "q",
  "size",
  "sort",
  "time",
  "to",
] as const;

const PLAN_CREATION_SCROLL_KEYS = ["open", "step", "mode"] as const;
const SETTINGS_SCROLL_KEYS = ["section"] as const;

export function useAppShellScrollReset() {
  const scrollResetKey = useRouterState({
    select: (state) => {
      const location = state.resolvedLocation ?? state.location;

      return getAppShellScrollResetKey(location.pathname, location.searchStr);
    },
  });

  useResetScrollOnChange({ resetKey: scrollResetKey });
}

function getAppShellScrollResetKey(pathname: string, searchStr: string) {
  if (pathname === "/explore") {
    return `${pathname}?${getSearchSubset(searchStr, EXPLORE_SCROLL_KEYS)}`;
  }

  if (pathname === "/plans/new") {
    return `${pathname}?${getSearchSubset(searchStr, PLAN_CREATION_SCROLL_KEYS)}`;
  }

  if (pathname === "/settings") {
    return `${pathname}?${getSearchSubset(searchStr, SETTINGS_SCROLL_KEYS)}`;
  }

  return pathname;
}

function getSearchSubset(searchStr: string, keys: readonly string[]) {
  const searchParams = new URLSearchParams(searchStr);

  return keys
    .map((key) =>
      searchParams
        .getAll(key)
        .sort()
        .map((value) => `${key}=${value}`)
        .join("&"),
    )
    .filter(Boolean)
    .join("&");
}
