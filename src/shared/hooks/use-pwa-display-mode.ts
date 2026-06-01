import { useEffect, useState } from "react";

function getIsIosStandalone() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return (
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function getIsStandaloneDisplayMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    getIsIosStandalone()
  );
}

export function usePwaDisplayMode() {
  const [isStandalone, setIsStandalone] = useState(getIsStandaloneDisplayMode);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(display-mode: standalone)");

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
