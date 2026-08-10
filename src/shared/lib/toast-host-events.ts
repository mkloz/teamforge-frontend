import {
  dispatchBrowserWindowEvent,
  getBrowserWindow,
} from "@/shared/lib/browser-environment";

export const APP_TOAST_HOST_REQUEST_EVENT = "findafew:toast-host-request";

export function requestAppToastHost() {
  const browserWindow = getBrowserWindow();

  if (!browserWindow) {
    return;
  }

  dispatchBrowserWindowEvent(
    new browserWindow.Event(APP_TOAST_HOST_REQUEST_EVENT),
  );
}
