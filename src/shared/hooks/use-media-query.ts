import { useEffect, useState } from "react";

import { getBrowserMediaQuery } from "@/shared/lib/browser-environment";

/** Returns whether the supplied media query currently applies. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => matchesMediaQuery(query));

  useEffect(() => {
    const mediaQuery = getBrowserMediaQuery(query);

    if (!mediaQuery) {
      setMatches(false);
      return undefined;
    }

    const syncMatches = () => setMatches(mediaQuery.matches);

    syncMatches();
    addMediaQueryListener(mediaQuery, syncMatches);

    return () => {
      removeMediaQueryListener(mediaQuery, syncMatches);
    };
  }, [query]);

  return matches;
}

function matchesMediaQuery(query: string) {
  return getBrowserMediaQuery(query)?.matches ?? false;
}

function addMediaQueryListener(
  mediaQuery: MediaQueryList,
  listener: () => void,
) {
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", listener);
    return;
  }

  mediaQuery.addListener(listener);
}

function removeMediaQueryListener(
  mediaQuery: MediaQueryList,
  listener: () => void,
) {
  if (typeof mediaQuery.removeEventListener === "function") {
    mediaQuery.removeEventListener("change", listener);
    return;
  }

  mediaQuery.removeListener(listener);
}
