import {
  addBrowserDocumentEventListener,
  addBrowserWindowEventListener,
  getBrowserVisibilityState,
} from "@/shared/lib/browser-environment";

type AppResumeReason =
  | "app foreground"
  | "network reconnect"
  | "page restore"
  | "window focus";

type AppResumeListener = (reason: AppResumeReason) => void;

export function subscribeAppResumeEvents(listener: AppResumeListener) {
  function handleFocus() {
    listener("window focus");
  }

  function handleOnline() {
    listener("network reconnect");
  }

  function handlePageShow(event: PageTransitionEvent) {
    if (event.persisted) {
      listener("page restore");
    }
  }

  function handleVisibilityChange() {
    if (getBrowserVisibilityState() === "visible") {
      listener("app foreground");
    }
  }

  const cleanupFocus = addBrowserWindowEventListener("focus", handleFocus);
  const cleanupOnline = addBrowserWindowEventListener("online", handleOnline);
  const cleanupPageShow = addBrowserWindowEventListener(
    "pageshow",
    handlePageShow,
  );
  const cleanupVisibilityChange = addBrowserDocumentEventListener(
    "visibilitychange",
    handleVisibilityChange,
  );

  return () => {
    cleanupFocus();
    cleanupOnline();
    cleanupPageShow();
    cleanupVisibilityChange();
  };
}
