import { useEffect } from "react";
import { router } from "@/router";
import {
  initializeScrollEntryLedger,
  recordScrollEntryNavigation,
} from "@/shared/navigation/scroll-entry";

export function ScrollEntryRuntime() {
  useEffect(() => {
    initializeScrollEntryLedger(router.history.location);

    return router.history.subscribe(({ action, location }) => {
      recordScrollEntryNavigation(action, location);
    });
  }, []);

  return null;
}
