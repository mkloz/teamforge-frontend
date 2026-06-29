export function loadAppShellWithNotifications() {
  return import("@/app/router/app-shell-with-notifications").then((module) => ({
    default: module.AppShellWithNotifications,
  }));
}
