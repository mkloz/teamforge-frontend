import { getBrowserNavigator } from "@/shared/lib/browser-environment";
import type { PushCopy, PushState } from "./types";

type PushCopyRule = {
  copy: PushCopy;
  shouldUse: (push: PushState) => boolean;
};

interface PushDeniedHelpRule {
  message: string;
  shouldUse: (userAgent: string) => boolean;
}

const PUSH_COPY_RULES: readonly PushCopyRule[] = [
  {
    shouldUse: (push) => !push.support.isSupported,
    copy: {
      title: "Alerts unavailable here",
      body: "This browser can still install Findafew, but it cannot receive push notifications.",
    },
  },
  {
    shouldUse: (push) => !push.isOnline || push.isPublicKeyNetworkError,
    copy: {
      title: "Reconnect to manage alerts",
      body: "Push settings need the network. Existing device alerts stay as they are until you are back online.",
    },
  },
  {
    shouldUse: (push) => !push.isAuthenticated,
    copy: {
      title: "Sign in for mobile alerts",
      body: "Sign in on this device to turn on group invites, messages, and plan updates.",
    },
  },
  {
    shouldUse: (push) => push.isPublicKeyLoading,
    copy: {
      title: "Checking alert support",
      body: "Findafew is checking whether this browser can receive alerts.",
    },
  },
  {
    shouldUse: (push) => !push.isWebPushEnabled,
    copy: {
      title: "Alerts not enabled yet",
      body: "You can install Findafew now, but alerts are not available yet.",
    },
  },
  {
    shouldUse: (push) => push.permission === "denied",
    copy: {
      title: "Alerts are blocked in this browser",
      body: "Notifications are blocked. Re-enable them in your site settings to receive group and plan updates.",
    },
  },
  {
    shouldUse: (push) => push.isSubscribed,
    copy: {
      title: "Alerts are on",
      body: "This device will show Findafew updates even when the app is closed.",
    },
  },
] as const;

const DEFAULT_PUSH_COPY: PushCopy = {
  title: "Turn on mobile alerts",
  body: "Allow this device to show group invites, messages, and plan reminders.",
};

const DEFAULT_PUSH_DENIED_HELP =
  "Click the lock icon in your address bar -> Notifications -> Allow.";

const PUSH_DENIED_HELP_RULES: readonly PushDeniedHelpRule[] = [
  {
    shouldUse: (userAgent) =>
      /safari/i.test(userAgent) && !/chrome|chromium/i.test(userAgent),
    message:
      "Go to Safari -> Settings for this Website -> Notifications -> Allow.",
  },
  {
    shouldUse: (userAgent) => /firefox/i.test(userAgent),
    message:
      "Click the shield icon in your address bar and disable notification blocking.",
  },
  {
    shouldUse: (userAgent) => /edg\//i.test(userAgent),
    message:
      "Click the lock icon in your address bar -> Permissions -> Notifications -> Allow.",
  },
] as const;

export function getPushDeniedHelp(): string {
  const browserNavigator = getBrowserNavigator();

  if (!browserNavigator) {
    return "Open your browser's site settings and allow notifications for Findafew.";
  }

  return getBrowserPushDeniedHelp(browserNavigator.userAgent);
}

function getBrowserPushDeniedHelp(userAgent: string) {
  return (
    PUSH_DENIED_HELP_RULES.find((rule) => rule.shouldUse(userAgent))?.message ??
    DEFAULT_PUSH_DENIED_HELP
  );
}

export function getPushCopy(push: PushState) {
  return (
    PUSH_COPY_RULES.find((rule) => rule.shouldUse(push))?.copy ??
    DEFAULT_PUSH_COPY
  );
}
