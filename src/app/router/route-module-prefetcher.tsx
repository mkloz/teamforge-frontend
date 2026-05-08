import { useEffect } from "react";

import type { LazyRouteModule } from "@/app/router/lazy-route-module";
import {
  cancelIdleTask,
  scheduleIdleTask,
} from "@/shared/lib/browser-scheduling";

interface RouteModulePrefetcherProps {
  modules: LazyRouteModule[];
}

export function RouteModulePrefetcher({ modules }: RouteModulePrefetcherProps) {
  useEffect(() => {
    if (modules.length === 0) {
      return undefined;
    }

    let cancelled = false;
    let currentTask = scheduleIdleTask(prefetchNextModule);
    let index = 0;

    function prefetchNextModule() {
      if (cancelled || index >= modules.length) {
        return;
      }

      const nextModule = modules[index];
      index += 1;

      void nextModule?.preload().finally(() => {
        if (!cancelled && index < modules.length) {
          currentTask = scheduleIdleTask(prefetchNextModule);
        }
      });
    }

    return () => {
      cancelled = true;
      cancelIdleTask(currentTask);
    };
  }, [modules]);

  return null;
}
