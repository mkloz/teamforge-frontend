import { useState } from "react";
import { buildAppUrl } from "@/shared/lib/app-url";
import { copyTextToClipboard } from "@/shared/lib/browser-capabilities";
import { getBrowserLocationHref } from "@/shared/lib/browser-environment";

const DOWNLOAD_PAGE_LINK_COPY_RESET_MS = 2500;

export function useDownloadPageLinkCopy() {
  const [copied, setCopied] = useState(false);

  async function copyCurrentPageUrl() {
    await copyTextToClipboard(getDownloadPageLink());
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, DOWNLOAD_PAGE_LINK_COPY_RESET_MS);
  }

  return { copied, copyCurrentPageUrl };
}

export function getDownloadPageLink() {
  return getBrowserLocationHref() || buildAppUrl("/download");
}
