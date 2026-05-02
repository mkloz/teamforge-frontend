import { toast } from "sonner";

import {
  copyTextToClipboard,
  getCurrentBrowserUrl,
  shareBrowserData,
} from "@/shared/lib/browser-capabilities";

interface Data {
  title: string;
  text: string;
  url?: string;
  message?: string;
}

export const useShare = () => {
  const handleShare = async ({
    title,
    text,
    url = getCurrentBrowserUrl(),
    message = "URL has been copied to the clipboard.",
  }: Data) => {
    const shareData = {
      title,
      text,
      url,
    };

    const shareResult = await shareBrowserData(shareData);

    if (shareResult === "shared" || shareResult === "dismissed") {
      return;
    }

    if (await copyTextToClipboard(url)) {
      toast(message);
      return;
    }

    toast.error("Sharing is unavailable in this browser.");
  };

  return handleShare;
};
