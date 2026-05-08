import { useEffect, useState } from "react";

import {
  hasGoogleMapsApiKey,
  isGooglePlacesReady,
  loadGoogleMaps,
} from "@/shared/lib/maps/google-maps-loader";
import type { GoogleMapsStatus } from "@/shared/lib/maps/location.types";

export function useGoogleMapsStatus() {
  const [mapsStatus, setMapsStatus] = useState<GoogleMapsStatus>(
    hasGoogleMapsApiKey() ? "loading" : "unavailable",
  );

  useEffect(() => {
    if (!hasGoogleMapsApiKey()) {
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
  }, []);

  return {
    mapsStatus,
    mapsReady: mapsStatus === "ready" && isGooglePlacesReady(),
  };
}
