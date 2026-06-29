type AppResumeReason =
  | "app foreground"
  | "network reconnect"
  | "page restore"
  | "window focus";

type AppResumeListener = (reason: AppResumeReason) => void;

export function subscribeAppResumeEvents(listener: AppResumeListener) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => undefined;
  }

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
    if (document.visibilityState === "visible") {
      listener("app foreground");
    }
  }

  window.addEventListener("focus", handleFocus);
  window.addEventListener("online", handleOnline);
  window.addEventListener("pageshow", handlePageShow);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    window.removeEventListener("focus", handleFocus);
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("pageshow", handlePageShow);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}
