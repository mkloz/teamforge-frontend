import { type ExternalToast, toast } from "sonner";

import { requestAppToastHost } from "@/shared/lib/toast-host-events";

export function showAppSuccessToast(message: string, options?: ExternalToast) {
  requestAppToastHost();
  return toast.success(message, options);
}

export function showAppErrorMessageToast(
  message: string,
  options?: ExternalToast,
) {
  requestAppToastHost();
  return toast.error(message, options);
}
