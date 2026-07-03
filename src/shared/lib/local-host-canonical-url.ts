import { config } from "@/config/config";
import {
  getBrowserLocation,
  replaceBrowserLocation,
} from "@/shared/lib/browser-environment";

function getApiHostname() {
  if (!config.apiUrl) {
    return null;
  }

  try {
    return new URL(config.apiUrl).hostname;
  } catch {
    return null;
  }
}

export function redirectLocalIpToLocalhost() {
  const browserLocation = getBrowserLocation();

  if (!browserLocation || browserLocation.hostname !== "127.0.0.1") {
    return false;
  }

  if (getApiHostname() !== "localhost") {
    return false;
  }

  const nextUrl = new URL(browserLocation.href);
  nextUrl.hostname = "localhost";
  replaceBrowserLocation(nextUrl);

  return true;
}
