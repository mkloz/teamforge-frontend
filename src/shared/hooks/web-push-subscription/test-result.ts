import {
  showAppErrorMessageToast,
  showAppInfoToast,
  showAppSuccessToast,
} from "@/shared/lib/app-toast";
import type { WebPushTestDispatch } from "@/shared/schemas";

const WEB_PUSH_TEST_FAILURE_DESCRIPTIONS: Partial<
  Record<NonNullable<WebPushTestDispatch["issue"]>, string>
> = {
  "certificate-error":
    "The backend could not verify the push service certificate. Check local CA or proxy settings before trying again.",
  "network-error":
    "The backend could not reach the push service. Check the server network connection.",
  "push-service-error":
    "The push service rejected the test notification. Try again, then check backend logs if it repeats.",
  "subscription-expired":
    "The browser subscription is no longer valid, so Findafew disabled it. Turn push off and back on for this device.",
  "unknown-error":
    "The backend hit an unknown delivery error. Check backend logs for the safe request ID.",
  "vapid-auth-error":
    "The push service rejected the VAPID credentials. Check the backend push key configuration.",
};

export function getWebPushTestStatus(result: WebPushTestDispatch) {
  if (!result.enabled) {
    return "disabled";
  }

  if (result.sentCount > 0) {
    return "delivered";
  }

  return "not-delivered";
}

function getWebPushTestFailureDescription(result: WebPushTestDispatch) {
  const issueDescription = result.issue
    ? WEB_PUSH_TEST_FAILURE_DESCRIPTIONS[result.issue]
    : undefined;

  if (issueDescription) {
    return issueDescription;
  }

  if (result.disabledCount > 0) {
    return "The browser subscription was no longer valid, so Findafew disabled it.";
  }

  return "Try turning push off and back on for this device.";
}

export function showWebPushTestResultToast(result: WebPushTestDispatch) {
  if (!result.enabled) {
    showAppInfoToast("Push delivery is not enabled for this environment.", {
      id: "web-push-test-disabled",
    });
    return;
  }

  if (result.sentCount > 0) {
    showAppSuccessToast("Test push sent to this device.", {
      id: "web-push-test-sent",
      description: "Check your system notifications.",
    });
    return;
  }

  if (result.subscriptionCount === 0) {
    showAppInfoToast("Turn on push notifications before sending a test.", {
      id: "web-push-test-no-subscription",
    });
    return;
  }

  showAppErrorMessageToast("The test push could not be delivered.", {
    id: "web-push-test-failed",
    description: getWebPushTestFailureDescription(result),
  });
}
