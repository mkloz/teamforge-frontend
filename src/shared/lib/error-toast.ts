import { toast } from "sonner";

import {
  type ApiErrorMessageOptions,
  getApiErrorMessage,
} from "@/shared/lib/api-error-message";
import { requestAppToastHost } from "@/shared/lib/toast-host-events";

const DEFAULT_ERROR_TOAST_TITLE = "Something didn't go through";
const DEFAULT_ERROR_TOAST_MESSAGE =
  "That action didn't go through. Please try again.";
const APP_ERROR_TOAST_SHOWN = Symbol("app-error-toast-shown");

export interface AppErrorToastOptions {
  fallbackMessage?: string;
  id?: string;
  messageOptions?: ApiErrorMessageOptions;
  title?: string;
}

function canTrackToastState(value: unknown): value is object {
  return (
    (typeof value === "object" && value !== null) || typeof value === "function"
  );
}

function wasErrorToastShown(error: unknown) {
  if (!canTrackToastState(error)) {
    return false;
  }

  return (
    Object.getOwnPropertyDescriptor(error, APP_ERROR_TOAST_SHOWN)?.value ===
    true
  );
}

function markErrorToastShown(error: unknown) {
  if (!canTrackToastState(error)) {
    return;
  }

  if (!Object.isExtensible(error)) {
    return;
  }

  Object.defineProperty(error, APP_ERROR_TOAST_SHOWN, {
    configurable: true,
    value: true,
  });
}

export function showAppErrorToast(
  error: unknown,
  {
    fallbackMessage = DEFAULT_ERROR_TOAST_MESSAGE,
    id,
    messageOptions,
    title = DEFAULT_ERROR_TOAST_TITLE,
  }: AppErrorToastOptions = {},
) {
  if (wasErrorToastShown(error)) {
    return;
  }

  const message = getApiErrorMessage(error, fallbackMessage, messageOptions);

  requestAppToastHost();
  toast.error(title, {
    description: message,
    duration: 6000,
    id,
  });
  markErrorToastShown(error);
}
