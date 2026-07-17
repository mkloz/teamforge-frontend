import { useEffect } from "react";
import { clearAdminCache } from "@/features/admin/api/admin-cache";

export function useAdminCacheLifecycle() {
  useEffect(() => {
    const clearWhenHidden = () => {
      if (document.visibilityState === "hidden") {
        clearAdminCache();
      }
    };
    const clearOnPageHide = () => {
      clearAdminCache();
    };

    document.addEventListener("visibilitychange", clearWhenHidden);
    window.addEventListener("pagehide", clearOnPageHide);

    return () => {
      document.removeEventListener("visibilitychange", clearWhenHidden);
      window.removeEventListener("pagehide", clearOnPageHide);
      clearAdminCache();
    };
  }, []);
}
