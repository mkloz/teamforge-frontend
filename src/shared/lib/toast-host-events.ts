export const APP_TOAST_HOST_REQUEST_EVENT = "teamforge:toast-host-request";

export function requestAppToastHost() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(APP_TOAST_HOST_REQUEST_EVENT));
}
