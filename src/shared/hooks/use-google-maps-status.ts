import { useEffect, useState } from "react";

import {
  hasGoogleMapsApiKey,
  isGooglePlacesReady,
  loadGoogleMaps,
} from "@/shared/lib/maps/google-maps-loader";
import type { GoogleMapsStatus } from "@/shared/lib/maps/location.types";

interface UseGoogleMapsStatusOptions {
  loadOnMount?: boolean;
}

function getInitialGoogleMapsStatus(loadOnMount: boolean): GoogleMapsStatus {
  if (!hasGoogleMapsApiKey()) {
    return "unavailable";
  }

  if (isGooglePlacesReady()) {
    return "ready";
  }

  return loadOnMount ? "loading" : "idle";
}

export function useGoogleMapsStatus({
  loadOnMount = true,
}: UseGoogleMapsStatusOptions = {}) {
  const [mapsStatus, setMapsStatus] = useState<GoogleMapsStatus>(() =>
    getInitialGoogleMapsStatus(loadOnMount),
  );

  useEffect(() => {
    if (!loadOnMount || !hasGoogleMapsApiKey()) {
      return undefined;
    }

    let cancelled = false;

    async function syncGoogleMapsStatus() {
      try {
        await loadGoogleMaps();

        if (!cancelled) {
          setMapsStatus("ready");
        }
      } catch {
        if (!cancelled) {
          setMapsStatus("unavailable");
        }
      }
    }

    void syncGoogleMapsStatus();

    return () => {
      cancelled = true;
    };
  }, [loadOnMount]);

  async function requestGoogleMaps() {
    if (!hasGoogleMapsApiKey()) {
      setMapsStatus("unavailable");
      return false;
    }

    if (isGooglePlacesReady()) {
      setMapsStatus("ready");
      return true;
    }

    setMapsStatus("loading");

    try {
      await loadGoogleMaps();
      setMapsStatus("ready");
      return true;
    } catch {
      setMapsStatus("unavailable");
      return false;
    }
  }

  return {
    mapsStatus,
    mapsReady: mapsStatus === "ready" && isGooglePlacesReady(),
    requestGoogleMaps,
  };
}
