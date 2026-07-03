import { useEffect, useState } from "react";

import {
  getBrowserMediaQuery,
  getBrowserNavigator,
} from "@/shared/lib/browser-environment";

function getIsIosStandalone() {
  const browserNavigator = getBrowserNavigator();

  if (!browserNavigator) {
    return false;
  }

  return browserNavigator.standalone === true;
}

function getIsStandaloneDisplayMode() {
  return (
    getBrowserMediaQuery("(display-mode: standalone)")?.matches ||
    getIsIosStandalone()
  );
}

export function usePwaDisplayMode() {
  const [isStandalone, setIsStandalone] = useState(getIsStandaloneDisplayMode);

  useEffect(() => {
    const mediaQuery = getBrowserMediaQuery("(display-mode: standalone)");

    function handleDisplayModeChange() {
      setIsStandalone(getIsStandaloneDisplayMode());
    }

    mediaQuery?.addEventListener("change", handleDisplayModeChange);
    handleDisplayModeChange();

    return () => {
      mediaQuery?.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  return { isStandalone };
}
