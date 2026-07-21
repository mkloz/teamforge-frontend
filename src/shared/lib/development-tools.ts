import { getBrowserLocation } from "@/shared/lib/browser-environment";

const DEVELOPMENT_TOOLS_SEARCH_PARAMETER = "devtools";

export function areDevelopmentToolsEnabled() {
  if (!import.meta.env.DEV) {
    return false;
  }

  const search = getBrowserLocation()?.search;

  if (!search) {
    return false;
  }

  return (
    new URLSearchParams(search).get(DEVELOPMENT_TOOLS_SEARCH_PARAMETER) === "1"
  );
}
