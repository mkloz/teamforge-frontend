import { useMediaQuery as useHooksMediaQuery } from "usehooks-ts";

/**
 * Custom hook to track the state of a media query.
 * @param query The media query string to track.
 * @returns boolean indicating if the query matches.
 */
export function useMediaQuery(query: string): boolean {
  return useHooksMediaQuery(query);
}
