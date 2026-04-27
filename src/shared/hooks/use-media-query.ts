import { useSyncExternalStore } from "react";

/**
 * Custom hook to track the state of a media query.
 * @param query The media query string to track.
 * @returns boolean indicating if the query matches.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false, // SSR fallback
  );
}
