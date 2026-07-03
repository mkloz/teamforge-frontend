import {
  showAppErrorMessageToast,
  showAppSuccessToast,
} from "@/shared/lib/app-toast";
import { copyTextToClipboard } from "@/shared/lib/browser-capabilities";

export async function copyMessageContent({
  errorMessage,
  successMessage,
  text,
}: {
  errorMessage: string;
  successMessage: string;
  text: string;
}) {
  if (!text) {
    return;
  }

  if (!(await copyTextToClipboard(text))) {
    showAppErrorMessageToast(errorMessage);
    return;
  }

  showAppSuccessToast(successMessage, { id: "message-content-copied" });
}
