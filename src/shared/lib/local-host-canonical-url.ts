import { config } from "@/config/config";

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
  if (window.location.hostname !== "127.0.0.1") {
    return false;
  }

  if (getApiHostname() !== "localhost") {
    return false;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.hostname = "localhost";
  window.location.replace(nextUrl);

  return true;
}
