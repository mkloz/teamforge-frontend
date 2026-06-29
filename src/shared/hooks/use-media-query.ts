import { useEffect, useState } from "react";

/**
 * Custom hook to track the state of a media query.
 * @param query The media query string to track.
 * @returns boolean indicating if the query matches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => matchesMediaQuery(query));

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      setMatches(false);
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
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
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }

  return window.matchMedia(query).matches;
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
